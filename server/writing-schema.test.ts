import { describe, expect, it } from "vitest";
import { writingInputSchema } from "./writing-schema";

describe("writingInputSchema", () => {
  it("accepts a Bengali paraphrase request and applies safe defaults", () => {
    const result = writingInputSchema.safeParse({ task: "paraphrase", text: "  একটি নমুনা লেখা  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("একটি নমুনা লেখা");
      expect(result.data.sourceLanguage).toBe("auto");
      expect(result.data.targetLanguage).toBe("both");
      expect(result.data.tone).toBe("neutral");
    }
  });

  it("accepts every supported task", () => {
    const tasks = ["paraphrase", "translate", "grammar", "summarize", "expand", "draft", "seo", "headline", "terminology-audit"];
    for (const task of tasks) {
      expect(writingInputSchema.safeParse({ task, text: "Valid source text" }).success).toBe(true);
    }
  });

  it("rejects empty, whitespace-only, and over-limit source text", () => {
    expect(writingInputSchema.safeParse({ task: "grammar", text: "" }).success).toBe(false);
    expect(writingInputSchema.safeParse({ task: "grammar", text: "   " }).success).toBe(false);
    expect(writingInputSchema.safeParse({ task: "grammar", text: "x".repeat(12001) }).success).toBe(false);
  });

  it("rejects unsupported language, tone, and task values", () => {
    expect(writingInputSchema.safeParse({ task: "unknown", text: "Text" }).success).toBe(false);
    expect(writingInputSchema.safeParse({ task: "translate", text: "Text", targetLanguage: "fr" }).success).toBe(false);
    expect(writingInputSchema.safeParse({ task: "grammar", text: "Text", tone: "hostile" }).success).toBe(false);
  });

  it("limits optional instructions", () => {
    expect(writingInputSchema.safeParse({ task: "draft", text: "Text", instructions: "x".repeat(2001) }).success).toBe(false);
    expect(writingInputSchema.safeParse({ task: "draft", text: "Text", instructions: "Use concise language" }).success).toBe(true);
  });
});
