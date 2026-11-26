# QuillSpark–ChatGPTBox Staging Integration Plan

Status: preparation only. No production deployment or release is authorized.

## Repository evidence inspected

- `README.md` documents an existing OpenAI-compatible ChatGPTBox API.
- `docs/CHATGPTBOX_LOCAL_SETUP.md` documents local configuration.
- `server/_core/openaiCompatible.ts` registers `GET /v1/models` and `POST /v1/chat/completions`.
- `server/_core/index.ts` registers the OpenAI-compatible routes alongside OAuth and tRPC.
- `server/_core/context.ts` resolves the existing application session into `ctx.user`.
- `server/_core/oauth.ts` creates the application session cookie after OAuth.
- `drizzle/schema.ts` currently defines the user table and has a TODO for additional tables.
- `drizzle.config.ts` configures the schema for MySQL, not PostgreSQL.
- The documented local adapter uses `QUILLSPARK_API_KEY`, a static bearer token, rather than the user's browser session.

## Architecture decision

Extend the existing OpenAI-compatible adapter and add a separate authenticated research-import API. Do not pass the ChatGPTBox/OpenRouter credential to QuillSpark. Do not expose `QUILLSPARK_API_KEY`, `MANUS_API_KEY`, or session signing secrets in extension code.

The requested existing-session authentication needs a deliberate bridge: the extension must obtain an authenticated QuillSpark session through a user-initiated pairing/authorization flow and send only a scoped, short-lived credential or same-origin session-backed request. The existing static local bearer-token adapter is not itself session-based and must not be represented as such.

## Proposed data model

Research record fields:
- id
- ownerUserId (foreign key to the authenticated QuillSpark user)
- title
- sourceUrl
- sourceDomain
- selectedText (nullable)
- sourceText (nullable; bounded and explicitly user-submitted)
- aiSummary (nullable; clearly marked as generated)
- sourceLanguage (nullable)
- createdAt
- updatedAt

Preserve original submitted material separately from generated summaries. Treat all imported webpage content as untrusted data.

## Proposed API surface

- `POST /api/integrations/chatgptbox/research` — authenticated import.
- `GET /api/research` — list only the authenticated user's records.
- `GET /api/research/:id` — retrieve an owned record.
- `DELETE /api/research/:id` — delete an owned record.
- `POST /api/research/:id/draft` — create a draft through existing writing services.

Use request validation, strict payload limits, URL validation, CSRF protection where cookie-authenticated, rate limiting, and ownership checks. Avoid permissive credentialed CORS.

## Six delivery phases

1. Authentication/API foundation: resolve session integration, add schema/migration, validation, ownership and tests.
2. ChatGPTBox extension: add explicit Send to QuillSpark action, pairing/configuration, bounded payload and error handling.
3. Research Library: list, view, search, filter and delete owned research records.
4. Writing integration: create editable drafts with source attribution and provenance.
5. Translation/grammar: connect existing QuillSpark writing services and preserve protected tokens.
6. Terminology audit/QA: use approved glossary states, human review, regression/security tests and Edge staging verification.

## Blockers before implementation

1. The Manus frontend project source/export has not yet been supplied or located in the connected GitHub repositories.
2. The user's separate writable ChatGPTBox repository URL is not yet identified in the connected GitHub account.
3. Confirm whether the intended deployment database is MySQL (as configured in the checked-in Drizzle schema) or another service. Do not assume PostgreSQL.
4. Confirm the current session cookie domain/origin and supported platform session contract before designing cross-origin extension authentication.

## Staging-only controls

- Work only on `integration/chatgptbox-staging`.
- Use isolated staging credentials and test accounts.
- Keep the extension unpacked/unpublished during development.
- Do not merge to `main`, publish an extension, change production secrets, or deploy production resources.
- Require tests and explicit review before any staging deployment.
