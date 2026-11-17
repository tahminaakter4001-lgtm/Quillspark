# Threadline prototype plan

## Product and page approach

Threadline will be added as a separate `/threadline` route in the bound Webdev project so the existing Quillspark landing page remains unchanged. The page will be a static React prototype with local state only: a meeting-to-plan workspace, tabbed output views, confirmed-owner styling, a before/after comparison, and a prototype early-access modal.

## Design direction: Signal Ledger

A calm editorial operations aesthetic: warm paper, deep ink, signal orange, and a cool mint accent. The page should feel like a well-kept working document rather than a noisy productivity dashboard.

The prototype includes an automation layer: a user-authored schedule builder, a keyword-trend signal watch with auto-refresh state, and a Slack morning-digest preview. These are local UI demonstrations only. A production version would use an application-owned scheduler or approved trigger mechanism, connected source discovery, timezone-aware schedule validation, Slack authorization, idempotent delivery, and execution history.

Core principles: make the hierarchy visible, make accountability feel human, use restrained motion, and keep evidence close to every AI suggestion. The layout uses asymmetric editorial sections, ruled dividers, ledger-like cards, and a compact mono label system. Typography pairs a sharp serif display face with a practical monospace UI voice.

Brand essence: the meeting memory that keeps work moving. Personality: clear, grounded, quietly insistent.

## Project structure

- `client/src/pages/Threadline.tsx`: Threadline route and local prototype interactions.
- `client/src/index.css`: shared base styles plus `threadline-*` visual system.
- `client/public/manus-routes.json`: declares `/` and `/threadline`.
- `THREADLINE_PRODUCT_CONCEPT.md`: concept and feature specification.
- `THREADLINE_TODO.md`: acceptance outcomes for the prototype.

## Assumptions

The landing page uses clearly labeled prototype content and does not claim real customers, integrations, security certifications, or live AI processing. External services, authentication, persistence, real exports, live keyword polling, and actual Slack delivery are deferred. The landing page labels these states instead of implying that a local UI action created a remote automation.
