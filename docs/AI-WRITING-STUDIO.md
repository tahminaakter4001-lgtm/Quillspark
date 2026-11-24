# QuillSpark AI Writing Studio

## Implemented on the feature branch

The authenticated dashboard exposes the writing studio at `/dashboard/writing`. The tRPC endpoint is `writing.process` and is protected by the existing `protectedProcedure` middleware.

Supported tasks:
- AI paraphrasing
- Bengali-English translation
- Grammar and clarity correction
- Summarization and expansion
- Draft assistance
- SEO refinement
- Headline generation

The endpoint validates task, text length, source/target language, tone, and optional instructions with Zod. It uses the existing server-side LLM adapter; provider credentials remain in the server environment and are not exposed to the browser.


## AI writing request protection

The writing endpoint applies an authenticated per-user in-process limit: up to 5 accepted requests per rolling 60 seconds and no more than 2 concurrent requests. The limiter rejects excess requests with tRPC `TOO_MANY_REQUESTS` before the LLM provider is invoked. This is a single-process safeguard; deployments with multiple application instances or serverless workers must replace the in-memory store with a shared atomic Redis/database limiter before relying on a global quota.

## Existing capabilities retained

- Image Creation Studio remains at `/dashboard/images`.
- Its existing tools include text-to-image, image editing, logo concepts, social graphics, infographics, and product visuals.
- Existing OAuth, protected tRPC middleware, public visitor assistant, and project routes are unchanged by this feature branch.

## Operational requirements

- Configure the existing platform LLM environment on the server.
- For Image Creation, configure `OPENAI_API_KEY` only as a server-side secret.
- Do not commit API keys, OAuth secrets, session tokens, or database credentials.
- Run `pnpm check`, `pnpm test`, and `pnpm build` in the project environment before merge/deployment.

## Follow-up work

- Add a reviewed, versioned Bengali IT terminology glossary and a structured terminology-audit report.
- Add persistence and export/history only after storage and retention requirements are confirmed.
- Connect live billing only through the platform's approved payment capability.
- Verify provider model compatibility and image API request shape against the deployed provider before enabling production traffic.

## Current validation status

The source changes were committed to `feature/quillspark-full-platform-upgrade`. This environment did not execute the repository's package scripts, so type-check, unit tests, build, live provider calls, and deployment remain unverified.
