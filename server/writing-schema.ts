import { z } from "zod";

export const writingTaskSchema = z.enum([
  "paraphrase",
  "translate",
  "grammar",
  "summarize",
  "expand",
  "draft",
  "seo",
  "headline",
  "terminology-audit",
]);

export const writingInputSchema = z.object({
  task: writingTaskSchema,
  text: z.string().trim().min(1).max(12000),
  sourceLanguage: z.enum(["auto", "bn", "en"]).default("auto"),
  targetLanguage: z.enum(["bn", "en", "both"]).default("both"),
  tone: z.enum(["neutral", "professional", "academic", "creative", "journalistic", "friendly"]).default("neutral"),
  instructions: z.string().trim().max(2000).optional(),
});
