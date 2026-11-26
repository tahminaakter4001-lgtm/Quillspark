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


## Manus ZIP source inspection (uploaded `quillspark.zip`)

The uploaded archive was readable and contains 129 entries. It is a Manus starter application, not a ChatGPTBox extension source tree.

### Observed frontend

- React 19, TypeScript, Vite 7, Wouter, Tailwind CSS 4 and shadcn-style UI components.
- `client/src/App.tsx` currently routes only `/` to `Home` and `/404` to `NotFound`.
- `client/src/pages/Home.tsx` is explicitly a placeholder/example page (spinner, “Example Page”, sample markdown and button).
- `client/src/components/DashboardLayout.tsx` is a generic authenticated dashboard shell with placeholder menu items (“Page 1”, “Page 2”).
- No Research Library, writing, translation, terminology-audit or ChatGPTBox integration page/file is present in the archive.

### Observed backend and identity

- Express 4 with tRPC 11; server entry is `server/_core/index.ts`.
- `server/_core/context.ts` resolves the existing platform session using `sdk.authenticateRequest(req)` and exposes `ctx.user`.
- OAuth callback in `server/_core/oauth.ts` creates the session cookie.
- The user table in `drizzle/schema.ts` uses Drizzle MySQL Core and currently contains only the `users` table.
- `server/routers.ts` currently registers only `system` and `auth` routers; feature routers are TODO.
- `server/db.ts` uses `drizzle-orm/mysql2`; do not apply PostgreSQL-specific schema or migration assumptions to this app.
- `package.json` scripts include `pnpm check`, `pnpm test`, `pnpm build`, `pnpm db:push` and `pnpm db:migrate`.

### Revised architecture decision

Treat the uploaded Manus ZIP as the frontend/dashboard application source and as a distinct codebase from the previously inspected GitHub QuillSpark API repository. Do not assume the two share a runtime, database, session cookie, or user ID namespace until their platform configuration and deployment origins are verified.

For the Manus app, prefer feature routers using its existing tRPC context and authenticated `ctx.user`, plus MySQL-compatible Drizzle schema/migrations. Cross-app session reuse is not automatically safe across origins. Implement an explicit, narrowly scoped authorization bridge only after confirming cookie domain, SameSite/Secure settings, allowed origins and the Manus session contract. Do not copy signing secrets or static service tokens into ChatGPTBox.

### Remaining inputs and blockers

1. User's writable ChatGPTBox repository URL is still required; the archive does not contain ChatGPTBox source.
2. Confirm whether this uploaded Manus starter is the intended QuillSpark frontend project despite its placeholder Home page and generic navigation.
3. Confirm whether the separate GitHub QuillSpark API repository is the backend to retain, replace, or integrate with this Manus app.
4. Confirm staging origins and database provisioning before cross-origin auth or migration work.

No application code, database schema, extension source, deployment, or production configuration was changed by this inspection.
