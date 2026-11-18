import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, type Message as LlmMessage } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
