import { timingSafeEqual } from "node:crypto";
import type { Express, NextFunction, Request, Response } from "express";
import { invokeLLM, type Message } from "./llm";

const MODEL_ID = "quillspark-writing";
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const MAX_BODY_BYTES = 1_000_000;
const MAX_MESSAGES = 50;
const MAX_MESSAGE_CHARS = 20_000;
const MAX_TOTAL_CHARS = 100_000;

type ChatRequest = {
  model?: string;
  messages?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  max_tokens?: number;
  stream?: boolean;
};

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function sendError(res: Response, status: number, message: string, type = "invalid_request_error") {
  return res.status(status).json({ error: { message, type } });
}

function configuredApiKey(): string | undefined {
  const key = process.env.QUILLSPARK_API_KEY?.trim();
  return key && key.length >= 32 ? key : undefined;
}

function authorized(req: Request, expected: string): boolean {
  const supplied = req.header("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(supplied);
  if (!match) return false;
  const candidate = Buffer.from(match[1], "utf8");
  const secret = Buffer.from(expected, "utf8");
  return candidate.length === secret.length && timingSafeEqual(candidate, secret);
}

function allowRequest(req: Request): boolean {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const current = requestCounts.get(key);
  if (!current || current.resetAt <= now) {
    requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  if (requestCounts.size > 10_000) {
    for (const [ip, entry] of requestCounts) {
      if (entry.resetAt <= now) requestCounts.delete(ip);
    }
  }
  return true;
}

function validateChatRequest(body: unknown): { value?: ChatRequest; error?: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object." };
  }
  const value = body as ChatRequest;
  if (!Array.isArray(value.messages) || value.messages.length < 1 || value.messages.length > MAX_MESSAGES) {
    return { error: `messages must contain between 1 and ${MAX_MESSAGES} items.` };
  }
  let totalChars = 0;
  for (const [index, message] of value.messages.entries()) {
    if (!message || !["system", "user", "assistant"].includes(message.role)) {
      return { error: `messages[${index}].role must be system, user, or assistant.` };
    }
    if (typeof message.content !== "string" || !message.content.trim()) {
      return { error: `messages[${index}].content must be a non-empty string.` };
    }
    if (message.content.length > MAX_MESSAGE_CHARS) {
      return { error: `messages[${index}].content exceeds the ${MAX_MESSAGE_CHARS}-character limit.` };
    }
    totalChars += message.content.length;
  }
  if (totalChars > MAX_TOTAL_CHARS) return { error: "Combined message content is too large." };
  if (value.model && value.model !== MODEL_ID && value.model !== "auto") {
    return { error: `Unknown model '${value.model}'. Use '${MODEL_ID}'.` };
  }
  if (value.max_tokens !== undefined && (!Number.isInteger(value.max_tokens) || value.max_tokens < 1 || value.max_tokens > 4096)) {
    return { error: "max_tokens must be an integer between 1 and 4096." };
  }
  if (value.stream !== undefined && typeof value.stream !== "boolean") {
    return { error: "stream must be a boolean." };
  }
  return { value };
}

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((part): part is { type: "text"; text: string } =>
        Boolean(part && typeof part === "object" && (part as { type?: string }).type === "text" && typeof (part as { text?: unknown }).text === "string"))
      .map(part => part.text)
      .join("");
  }
  return "";
}

function sendStream(res: Response, id: string, model: string, content: string) {
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  const write = (data: unknown) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  write({ id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }] });
  if (content) {
    write({ id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: { content }, finish_reason: null }] });
  }
  write({ id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
  res.write("data: [DONE]\n\n");
  res.end();
}

export function registerOpenAICompatibleRoutes(app: Express) {
  const cors = (_req: Request, res: Response, next: NextFunction) => {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "600",
    });
    next();
  };

  app.use("/v1", cors);
  app.options("/v1/chat/completions", (_req, res) => res.sendStatus(204));
  app.options("/v1/models", (_req, res) => res.sendStatus(204));

  app.get("/v1/models", (req, res) => {
    const key = configuredApiKey();
    if (!key) return sendError(res, 503, "API is not configured. Set QUILLSPARK_API_KEY to a random secret of at least 32 characters.", "server_error");
    if (!authorized(req, key)) return sendError(res, 401, "Invalid or missing API key.", "authentication_error");
    return res.json({
      object: "list",
      data: [{ id: MODEL_ID, object: "model", created: 0, owned_by: "quillspark" }],
    });
  });

  app.post("/v1/chat/completions", async (req, res) => {
    const key = configuredApiKey();
    if (!key) return sendError(res, 503, "API is not configured. Set QUILLSPARK_API_KEY to a random secret of at least 32 characters.", "server_error");
    if (!authorized(req, key)) return sendError(res, 401, "Invalid or missing API key.", "authentication_error");
    if (!allowRequest(req)) return sendError(res, 429, "Rate limit exceeded. Try again in one minute.", "rate_limit_error");
    const contentLength = Number(req.header("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return sendError(res, 413, "Request body exceeds the 1 MB limit.");
    }

    if (Buffer.byteLength(JSON.stringify(req.body ?? null), "utf8") > MAX_BODY_BYTES) {
      return sendError(res, 413, "Request body exceeds the 1 MB limit.");
    }

    const parsed = validateChatRequest(req.body);
    if (!parsed.value) return sendError(res, 400, parsed.error ?? "Invalid request.");
    const input = parsed.value;
    const messages: Message[] = input.messages!.map(message => ({
      role: message.role,
      content: message.content,
    }));

    try {
      const result = await invokeLLM({
        messages,
        maxTokens: input.max_tokens ?? 1024,
      });
      const answer = extractText(result.choices?.[0]?.message?.content);
      if (!answer) return sendError(res, 502, "The writing engine returned an empty response.", "upstream_error");

      const id = result.id || `chatcmpl-${Date.now()}`;
      const model = MODEL_ID;
      if (input.stream) return sendStream(res, id, model, answer);

      return res.json({
        id,
        object: "chat.completion",
        created: result.created || Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, message: { role: "assistant", content: answer }, finish_reason: "stop" }],
        ...(result.usage ? { usage: result.usage } : {}),
      });
    } catch (error) {
      console.error("OpenAI-compatible chat request failed:", error instanceof Error ? error.message : "unknown error");
      return sendError(res, 502, "The QuillSpark writing engine is temporarily unavailable.", "upstream_error");
    }
  });
}
