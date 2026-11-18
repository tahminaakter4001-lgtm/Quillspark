# Quillspark visitor assistant and accessibility plan

## Implementation approach

Add a site-wide visitor assistant mounted from `client/src/App.tsx`, so it is available on the Quillspark home page, Threadline page, projects page, and fallback routes without duplicating page-level UI. The assistant will use a public tRPC mutation backed by the managed server-side LLM helper. The server will prepend a compact, curated knowledge base from the current website copy and instruct the model to answer only from that content, clearly say when the site does not provide an answer, and point visitors to the visible contact/early-access paths when appropriate. The browser will send only recent user/assistant turns, with bounded input sizes.

Update the assistant UI for keyboard and screen-reader use: a labelled disclosure button, a named non-modal dialog panel, focus restoration, Escape-to-close, visible focus styles, a live message region, native form controls, and suggested-question buttons. Keep the existing Quillspark visual language: paper surfaces, cobalt actions, Newsreader display type, and DM Mono utility labels.

Apply accessibility fixes across the existing experience by adding or improving image alternative text, restoring missing Threadline custom properties, replacing very light secondary text with readable tones, increasing control target/focus visibility, adding labels/pressed or selected state where controls need it, and adding Escape/focus behavior to the existing early-access dialogs. Keep the current routes and prototype content intact.

## Project structure

- `client/src/App.tsx`: route shell and global assistant mount.
- `client/src/components/VisitorAssistant.tsx`: visitor-facing chat disclosure, messages, focus behavior, and tRPC mutation integration.
- `server/routers.ts`: public `assistant.ask` procedure and website-grounded prompt.
- `client/src/index.css`: assistant styling, contrast tokens, focus states, and shared accessibility refinements.
- `client/src/pages/Home.tsx`, `Threadline.tsx`, `Projects.tsx`: page-level labels, dialog semantics, and keyboard-friendly control state.
- `client/src/components/ManusDialog.tsx`: descriptive image alternative text.
- `client/public/manus-routes.json`: preserved route manifest for the existing routes.
- `TODO.md`: acceptance outcomes and implementation status.

## Authentication and dashboard extension

Enable the Webdev server and managed MySQL database capabilities so the existing Manus OAuth implementation can create and validate application sessions against the `users` table. Keep the starter’s fixed `webdev_app_session` cookie contract, CSRF-bound OAuth state, and protected tRPC procedure pattern. Apply the checked-in users migration before serving authenticated requests.

Add `/dashboard` as a protected application route rendered through the prepared `DashboardLayout`. The layout should show a real sign-in state when unauthenticated, the authenticated user identity and sign-out action when logged in, and Quillspark-specific navigation instead of placeholder menu labels. The first dashboard surface is an authenticated workspace overview with recent-work links, activity context, sample workspace metrics, and a writing-desk CTA; it is intentionally honest about sample content and does not invent persisted analytics.

The public Quillspark and Threadline sign-in controls should launch Manus OAuth, while the primary “Open workspace”/“Start writing” action should send users to `/dashboard`. The route manifest must include `/dashboard`. Server-backed publishing uses the existing `Dockerfile`, `/api/health`, and `pnpm build`/`pnpm start` path now that server capability is enabled; static-only preview is no longer sufficient for auth verification.

## Design direction

- **Design movement:** Editorial product studio with hand-marked paper artifacts.
- **Core principles:** Calm and legible; human-in-control; tactile but not decorative at the expense of clarity; generous focus and interaction states.
- **Color philosophy:** Keep cobalt as the owned action color, use ink for primary text, and move all secondary copy toward dependable dark slate tones instead of washed-out gray. Yellow remains an accent, never the only carrier of meaning.
- **Layout paradigm:** A persistent, lower-corner assistant disclosure that opens into a compact reading-and-response panel without obscuring the page’s primary narrative.
- **Signature elements:** Cobalt spark mark, paper-card surfaces, and mono utility labels.
- **Interaction philosophy:** Every action remains native and predictable; the assistant feels like an invitation, not an interruption. Keyboard users get the same routes through the feature as pointer users.
- **Animation:** Retain small lift/rotation transitions, but never make state changes depend on motion; respect reduced-motion preferences.
- **Typography system:** Newsreader for narrative content and headings, DM Mono for controls, labels, and status text. Keep body copy at readable sizes with stronger contrast.
- **Brand essence:** A thoughtful AI writing and decision-work companion for people who want clearer work without giving up their voice. Personality: editorial, warm, precise.
- **Brand voice:** Clear, observant, quietly confident. Example lines: “Ask about Quillspark, Threadline, or the work behind the site.” / “I can only answer from what this site explains.”
