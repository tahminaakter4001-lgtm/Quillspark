# ChatGPTBox local integration

QuillSpark exposes a small OpenAI-compatible API for local use with ChatGPTBox.

## Requirements

- Node.js supported by the repository and pnpm 10.18.
- The QuillSpark project environment must already be configured, including its existing LLM upstream settings: `MANUS_API_URL` and `MANUS_API_KEY`.
- ChatGPTBox installed in a desktop browser that can reach a local HTTP API.

## 1. Configure a local API token

Create a random secret with at least 32 characters. For example:

```bash
openssl rand -hex 32
```

Add the generated value to the repository-root `.env` file. Do not commit this file:

```dotenv
HOST=127.0.0.1
PORT=3000
QUILLSPARK_API_KEY=PASTE_YOUR_RANDOM_SECRET_HERE
```

Keep the existing QuillSpark environment variables in the same file. Never put `QUILLSPARK_API_KEY`, `MANUS_API_KEY`, or other server secrets in client-side code, Vite variables, screenshots, or Git commits.

## 2. Start QuillSpark locally

From the repository root:

```bash
pnpm install
pnpm check
pnpm dev
```

The API should be available at:

- Base URL: `http://127.0.0.1:3000/v1`
- Chat completions: `http://127.0.0.1:3000/v1/chat/completions`
- Models: `http://127.0.0.1:3000/v1/models`

Keep the terminal running while ChatGPTBox uses the API. If your local setup uses a different port, update both the `.env` value and the ChatGPTBox base URL.

## 3. Configure ChatGPTBox

In ChatGPTBox, add a custom OpenAI-compatible provider. The exact labels can vary by extension version:

| Setting | Value |
| --- | --- |
| Provider name | QuillSpark AI |
| API format / provider type | OpenAI-compatible |
| Base URL | `http://127.0.0.1:3000/v1` |
| API key | The value of `QUILLSPARK_API_KEY` from your local `.env` |
| Model | `quillspark-writing` |

If the extension asks for a full endpoint rather than a base URL, use `http://127.0.0.1:3000/v1/chat/completions`.

Do not enter the upstream `MANUS_API_KEY` in ChatGPTBox. ChatGPTBox only receives the dedicated local QuillSpark API token.

## 4. Verify the connection

In a second terminal, replace the placeholder with the same local token:

```bash
curl http://127.0.0.1:3000/v1/models \
  -H "Authorization: Bearer YOUR_QUILLSPARK_API_KEY"
```

Then test a chat request:

```bash
curl http://127.0.0.1:3000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_QUILLSPARK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "quillspark-writing",
    "messages": [
      { "role": "system", "content": "You are QuillSpark, a concise writing assistant." },
      { "role": "user", "content": "Improve this sentence while preserving its meaning: I have an pen." }
    ],
    "max_tokens": 300
  }'
```

A successful response has the OpenAI Chat Completions shape with `choices[0].message.content`.

## Supported scope and current limitations

- Text messages with `system`, `user`, and `assistant` roles.
- Non-streaming JSON chat completions.
- Basic SSE framing when the client sends `"stream": true`. The current QuillSpark LLM helper waits for the upstream completion first, so this is not token-by-token live generation.
- One model identifier: `quillspark-writing`.
- Maximum 50 messages, 20,000 characters per message, 100,000 combined message characters, 1 MB JSON body, and 4,096 requested output tokens.
- Basic in-memory rate limit: 60 requests per minute per client IP. The counter resets when the server restarts.
- Tool calls, multimodal message content, and advanced OpenAI parameters are not implemented by this adapter.

## Local security notes

This API is intended for a local development workflow. Keep `HOST=127.0.0.1`; do not expose the port to a public network or forward it from your router. The API uses a separate bearer token and does not expose the upstream LLM key. CORS is enabled for browser-extension requests, so the bearer token remains the access control. If the token is exposed, rotate it in `.env` and restart QuillSpark.

This adapter does not make the upstream LLM service available offline: the local QuillSpark server still needs network access to its configured LLM provider.
