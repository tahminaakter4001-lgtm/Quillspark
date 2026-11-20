# Quillspark — AI Writing Assistant

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

## Image Creation Studio

The authenticated dashboard includes an Image Creation Studio at `/dashboard/images`. It supports text-to-image, image editing, logo concepts, social graphics, infographics, and product-image workflows.

To enable image generation, configure `OPENAI_API_KEY` as a **server-side environment variable** in your deployment environment. Do not add the key to client-side Vite variables or commit it to the repository. The studio uses the OpenAI GPT Image API; generated images are returned to the current session and can be downloaded as PNG files. This implementation does not yet persist generated images to a user library.

Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.
