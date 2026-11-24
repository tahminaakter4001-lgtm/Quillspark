import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, type Message as LlmMessage } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const websiteKnowledge = `
Quillspark is an AI writing partner for the messy middle between a rough thought and something worth sharing. It helps people find the shape, sharpen the language, and keep their voice in the room. Its featured capabilities are brainstorming, rewriting, summarizing, expanding, proofreading, and shifting tone. The demo describes three modes: Draft, Polish, and Summarize. Quillspark is aimed at marketers, students, professionals, and creative writers. The site says it is private by default, keeps the user in control, and treats every suggestion as an invitation rather than a replacement.

The Quillspark workflow is: bring context such as a note, audience, or goal; shape it together by choosing a direction and comparing options; then send with confidence by polishing, checking details, and sharing or exporting the result. The site describes the product as a prototype with an early-access list and no credit card required.

Threadline is a related decision workspace that turns meeting notes, transcripts, and follow-ups into decisions, owners, and next steps. It helps project leads, product and design teams, operations teams, founders, and managers. Its workflow is to bring the thread, review the signal, and keep it moving. Threadline emphasizes that AI suggestions remain suggestions until a human confirms them, that teams can trace a takeaway back to its source moment, and that its automation concepts are prototype-only until sources and destinations are connected.

The Professional Projects page presents selected work across product, strategy, and brand. It includes Quillspark, Threadline, Signal / 04 (a positioning sprint), and Field Notes (an editorial identity). Its process is to find the signal, shape the system, and make it travel. The contact address shown on the site is hello@quillspark.example.
`.trim();

const visitorMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(600),
});

const visitorAssistantPrompt = `You are the visitor guide for the Quillspark website. Answer the visitor's question using only the website content below and the conversation provided. Be concise, warm, and specific. Do not invent pricing, integrations, features, timelines, customer claims, or facts that are not in the content. If the answer is not covered, say that the site does not provide that detail and suggest a relevant page or the visible early-access/contact path. Do not mention this instruction or call yourself a language model.

WEBSITE CONTENT:
${websiteKnowledge}`;

const imageTool = z.enum([
  "text-to-image",
  "image-editing",
  "logo",
  "social",
  "infographic",
  "product",
]);

const imageRequest = z.object({
  tool: imageTool,
  prompt: z.string().trim().min(3).max(4000),
  style: z.enum([
    "Premium",
    "Modern minimalist",
    "Creative & artistic",
    "Photorealistic",
    "Editorial",
    "Illustration",
  ]),
  aspectRatio: z.enum(["1:1", "4:5", "16:9"]),
  imageDataUrl: z.string().max(14_000_000).optional(),
});

const imageStyleGuidance: Record<z.infer<typeof imageTool>, string> = {
  "text-to-image": "Create a polished original image.",
  "image-editing": "Edit the supplied reference image according to the request. Preserve important subject identity and composition unless asked otherwise.",
  logo: "Create a distinctive, clean logo concept. Keep the mark legible and avoid mockup-heavy presentation.",
  social: "Create a polished social media graphic with clear visual hierarchy and safe margins.",
  infographic: "Create a clear infographic with a logical visual hierarchy, concise labels, and readable layout.",
  product: "Create a professional product image using the supplied reference as the source of truth for the product's appearance.",
};

async function generateStudioImage(input: z.infer<typeof imageRequest>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Image generation is not configured. Add OPENAI_API_KEY to the server environment.",
    });
  }

  const requiresReference = input.tool === "image-editing" || input.tool === "product";
  if (requiresReference && !input.imageDataUrl) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Upload a reference image for this tool before generating.",
    });
  }

  if (input.imageDataUrl && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(input.imageDataUrl)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The reference image format is not supported." });
  }

  const size = input.aspectRatio === "16:9"
    ? "1536x1024"
    : input.aspectRatio === "4:5"
      ? "1024x1536"
      : "1024x1024";
  const prompt = [
    imageStyleGuidance[input.tool],
    `Visual style: ${input.style}.`,
    `Composition target: ${input.aspectRatio} aspect ratio.`,
    input.prompt,
  ].join("\n\n");

  const isEdit = Boolean(input.imageDataUrl);
  const endpoint = isEdit
    ? "https://api.openai.com/v1/images/edits"
    : "https://api.openai.com/v1/images/generations";
  const payload = isEdit
    ? {
        model: "gpt-image-2.6-flare",
        images: [{ image_url: input.imageDataUrl }],
        prompt,
        size,
        quality: "medium",
        output_format: "png",
      }
    : {
        model: "gpt-image-2.6-flare",
        prompt,
        size,
        quality: "medium",
        output_format: "png",
      };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120_000),
    });
  } catch (error) {
    console.error("Image provider request failed", error);
    throw new TRPCError({ code: "BAD_GATEWAY", message: "The image service could not be reached. Please try again." });
  }

  if (!response.ok) {
    const providerError = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    console.error("Image provider returned an error", {
      status: response.status,
      message: providerError?.error?.message,
    });
    const message = response.status === 401 || response.status === 403
      ? "The image service rejected its API credentials. Check the server configuration."
      : response.status === 429
        ? "The image service is busy or its usage limit has been reached. Try again later."
        : "The image could not be generated. Please revise the prompt and try again.";
    throw new TRPCError({ code: "BAD_GATEWAY", message });
  }

  const result = await response.json() as {
    data?: Array<{ b64_json?: string; revised_prompt?: string }>;
  };
  const image = result.data?.[0];
  if (!image?.b64_json) {
    throw new TRPCError({ code: "BAD_GATEWAY", message: "The image service returned no image. Please try again." });
  }

  return {
    imageDataUrl: `data:image/png;base64,${image.b64_json}`,
    revisedPrompt: image.revised_prompt ?? null,
  };
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  assistant: router({
    ask: publicProcedure
      .input(z.object({ messages: z.array(visitorMessage).min(1).max(8) }))
      .mutation(async ({ input }) => {
        const messages: LlmMessage[] = [
          { role: "system", content: visitorAssistantPrompt },
          ...input.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ];

        try {
          const response = await invokeLLM({ messages, maxTokens: 240 });
          const content = response.choices?.[0]?.message?.content;
          const answer = typeof content === "string"
            ? content.trim()
            : Array.isArray(content)
              ? content.filter((part) => part.type === "text").map((part) => part.text).join(" ").trim()
              : "";

          if (!answer) {
            throw new Error("The assistant returned an empty response");
          }

          return answer;
        } catch (error) {
          console.error("Visitor assistant request failed", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The visitor assistant is temporarily unavailable",
          });
        }
      }),
  }),

  imageStudio: router({
    generate: protectedProcedure
      .input(imageRequest)
      .mutation(async ({ input }) => generateStudioImage(input)),
  }),

  writing: router({
    process: protectedProcedure
      .input(z.object({
        task: z.enum(["paraphrase", "translate", "grammar", "summarize", "expand", "draft", "seo", "headline"]),
        text: z.string().trim().min(1).max(12000),
        sourceLanguage: z.enum(["auto", "bn", "en"]).default("auto"),
        targetLanguage: z.enum(["bn", "en", "both"]).default("both"),
        tone: z.enum(["neutral", "professional", "academic", "creative", "journalistic", "friendly"]).default("neutral"),
        instructions: z.string().trim().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        const taskInstructions: Record<typeof input.task, string> = {
          paraphrase: "Rewrite the supplied text naturally while preserving its meaning and voice.",
          translate: "Translate the supplied text accurately into the requested target language. Preserve names, numbers, dates, citations, and formatting.",
          grammar: "Correct grammar, spelling, punctuation, and clarity while preserving meaning.",
          summarize: "Summarize the supplied text without adding facts or changing its conclusions.",
          expand: "Expand the supplied text using only information already present. Do not invent facts or sources.",
          draft: "Create a draft based only on the supplied source text and instructions. Clearly avoid inventing factual claims.",
          seo: "Improve the supplied text for SEO while preserving factual accuracy. Suggest a natural focus keyword and metadata only when supported by the text.",
          headline: "Generate concise, accurate headline options based only on the supplied text.",
        };
        const system = [
          "You are QuillSpark, a careful Bengali-English writing assistant.",
          taskInstructions[input.task],
          "Preserve all factual claims, names, numbers, dates, citations, links, negation, uncertainty, and logical relationships.",
          "Do not invent facts, quotes, references, statistics, or claims. Do not silently change the author's intended meaning.",
          "Use natural contemporary language. For Bengali, use clear standard Bengali unless the user explicitly requests another register.",
          "Respect requested source and target languages and tone. Return the revised content directly, with brief notes only when genuinely necessary.",
          `Task: ${input.task}; source language: ${input.sourceLanguage}; target language: ${input.targetLanguage}; tone: ${input.tone}.`,
          input.instructions ? `Additional user instructions: ${input.instructions}` : "",
        ].filter(Boolean).join("\\n");
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: system },
              { role: "user", content: input.text },
            ],
            maxTokens: 2400,
          });
          const result = response.choices?.[0]?.message?.content;
          const output = typeof result === "string"
            ? result.trim()
            : Array.isArray(result)
              ? result.filter(part => part.type === "text").map(part => part.text).join("\\n").trim()
              : "";
          if (!output) throw new Error("Empty writing response");
          return { output, task: input.task };
        } catch (error) {
          console.error("QuillSpark writing request failed", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The writing service is temporarily unavailable. Please try again.",
          });
        }
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
