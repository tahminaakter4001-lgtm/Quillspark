# Quillspark prototype checklist

## Product concept and feature specification

- [x] Create a product concept for Quillspark as an AI writing assistant that helps people move from rough ideas to polished, confident writing.
- [x] Define the MVP workflow, target audiences, core capabilities, trust principles, and growth roadmap in a feature specification.

## Landing page prototype

- [x] Create a hero section with Quillspark’s value proposition, concise supporting copy, and a prominent primary call to action.
- [x] Create an interactive-looking writing assistant prototype showing a user prompt, generated draft, and refinement controls.
- [x] Create a product benefits section focused on drafting faster, improving clarity, adapting tone, and overcoming writer’s block.
- [x] Create a core capabilities showcase for brainstorming, rewriting, summarizing, expanding, proofreading, and tone adjustment.
- [x] Create a simple three-step workflow explaining how users provide context, collaborate with the assistant, and export polished copy.
- [x] Create use-case examples for marketers, students, professionals, and creative writers.
- [x] Create a before-and-after writing comparison demonstrating Quillspark’s practical impact.
- [x] Create trust-building content covering user control, privacy-minded messaging, and responsible AI assistance.
- [x] Create a concise testimonial/social-proof section using clearly presented prototype content.
- [x] Create a final conversion section with repeated call to action and a compact footer with essential navigation.
- [x] Add responsive behavior, accessible labels, route manifest, and preview-ready styling.

## Visitor assistant and accessibility improvements

- [ ] Add an AI assistant that answers visitor questions using the website’s Quillspark, Threadline, and professional-projects content; keep answers grounded in that content and acknowledge when the site does not provide an answer.
- [ ] Make the assistant available site-wide from a labelled disclosure button and accessible panel with keyboard navigation, visible focus, Escape-to-close, focus restoration, a live message region, and usable suggested prompts.
- [ ] Add meaningful alternative text to image elements, or explicitly mark decorative imagery as decorative where no information is conveyed.
- [ ] Fix low-contrast secondary text, status labels, borders, controls, and Threadline theme tokens while preserving the existing visual direction.
- [ ] Make every interactive control usable with a keyboard, including tabbed/filter controls, mobile menus, copy/refresh controls, and early-access dialogs; expose selected/expanded state to assistive technology where applicable.

## Authentication and dashboard

- [x] Enable the Webdev server and managed database capabilities required for Manus OAuth sessions and authenticated application data.
- [x] Apply the checked-in users-table migration to the managed database.
- [x] Add a `/dashboard` route rendered through the prepared authenticated dashboard layout; show a real sign-in state when unauthenticated and the current user identity/sign-out action when authenticated.
- [x] Replace placeholder dashboard navigation labels with Quillspark workspace navigation for Overview, Projects, and Public site.
- [x] Add a responsive workspace overview with recent-work links, activity context, sample workspace metrics, and a writing-desk CTA without presenting sample values as persisted analytics.
- [x] Connect public Quillspark and Threadline sign-in controls to Manus OAuth and route primary workspace CTAs to `/dashboard`.
- [x] Add `/dashboard` to the route manifest and verify the server-backed preview/build path.

## Custom notification center

- [x] Add a site-wide Signals trigger with an unread badge and an accessible notification panel.
- [x] Add contextual Quillspark and Threadline notices that link to the existing `/threadline#automations-threadline` and `/dashboard` destinations.
- [x] Add read, mark-all-read, Escape-to-close, outside-click dismissal, and browser-local persistence behavior.
- [x] Label the behavior as custom in-app notifications and keep it backend/provider-free for the prototype.
- [x] Add responsive styling that avoids the existing visitor-assistant control and preserves the Quillspark visual system.
