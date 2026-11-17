# Threadline — Product Concept & Feature Specification

## Product concept

Threadline is an AI meeting-to-plan assistant that turns the messy material around a meeting—transcripts, notes, chat follow-ups, and scattered context—into a decision record people can actually use. It separates what was decided from what was merely discussed, surfaces open questions, assigns owners with confirmation, and keeps next steps visible after the call ends.

Threadline is for teams that do not need another transcript archive. They need the thread to hold: the decision, the why, the owner, and the next move.

## Positioning

> **Turn the talk into a thread worth following.**

Threadline is different from a generic meeting summarizer because it is organized around accountability and continuity rather than a wall of text. It helps teams move from conversation to coordinated action while keeping humans in control of what becomes official.

## Primary audiences

- **Project leads** who need a reliable decision log and clear owners after working sessions.
- **Product and design teams** who want the rationale behind choices to stay connected to the work.
- **Operations teams** who coordinate recurring meetings, handoffs, and cross-functional follow-through.
- **Founders and managers** who need a lightweight memory for commitments without creating more admin.

## Product principles

1. **Decisions over transcripts:** prioritize what changes the work.
2. **Traceable, not magical:** let people inspect the source context behind each takeaway.
3. **Human-confirmed ownership:** suggest owners, but never silently assign accountability.
4. **Momentum after the meeting:** make the next step easier to see and act on.

## Core workflow

1. **Bring the thread** — connect a transcript, paste notes, or drop in a follow-up message.
2. **Threadline sorts the signal** — separate decisions, open questions, owners, and next steps.
3. **Review the record** — inspect source context, edit language, confirm people, and dismiss noise.
4. **Keep the work moving** — share the decision record or export tasks to the team’s existing tools.

## Feature specification

### MVP: decision workspace

**Input and context**

- Paste meeting notes or transcript text into a guided capture field.
- Add meeting title, date, participants, and project context.
- Preserve the original source text alongside structured outputs.

**Structured outputs**

- Decisions with concise rationale.
- Open questions that still need an answer.
- Suggested owners and due dates for confirmation.
- Next steps with status and editable wording.
- “Needs review” flags for ambiguous or low-confidence items.

**Review controls**

- Switch between Decisions, Owners, and Next steps views.
- Expand an item to inspect its source excerpt.
- Confirm, edit, or dismiss an AI suggestion.
- Mark an item as verified by a human.
- Copy/share a clean decision record.

**Output actions**

- Export a concise meeting record as Markdown or plain text.
- Copy individual decisions or the full follow-up.
- Share a read-only summary link in the future roadmap.

### Automation layer: user-authored signal watches

Threadline should let users describe an automation in their own words, then turn that description into an inspectable schedule before anything is enabled. A user can specify the source or topic to watch, the signal to summarize, the cadence, the timezone, and the destination. The builder should show a plain-language preview of what will happen and require confirmation before saving.

The first automation concept is a keyword-trend watch: monitor a connected source for terms such as “activation,” “import flow,” or “setup time,” compare the latest period with the previous one, and surface meaningful changes in a compact dashboard. The dashboard should show the last refresh, whether auto-refresh is on, the trend direction, and the source scope. It should not imply real-time monitoring when the source is polled or unavailable.

Users can optionally route a reviewed digest to Slack every morning at 8:00 AM in the selected timezone. The digest should contain the strongest trend shifts, the source window, and items that need human review. Slack delivery requires an authorized workspace and channel connection; the product must show connection state and never claim delivery from a local configuration alone.

### Trust, privacy, and responsible use

- Threadline should clearly label suggestions as AI-assisted until a person confirms them.
- Every structured item should retain a visible path back to the source context.
- Owner suggestions require human confirmation and should never trigger an external task automatically in the MVP. Scheduled digests are a separate, explicitly configured automation and should show their destination, cadence, timezone, and enabled state.
- Product messaging should explain data handling in plain language and avoid unsupported security claims.
- Sensitive or high-stakes decisions should remain subject to human review and organizational policy.

### Growth roadmap

- Calendar and meeting-platform integrations.
- Connectors for project trackers and team chat.
- Recurring decision memory for projects and working groups.
- Custom taxonomy for risks, dependencies, and approvals.
- Team-level search across verified decision records.
- User-authored automation specifications with schedule preview and edit history.
- Keyword-trend monitoring with bounded refresh cadence and source scope.
- Authorized Slack digests, beginning with a daily 8:00 AM summary.

## Success measures

- Time from meeting end to a confirmed decision record.
- Percentage of suggested items confirmed, edited, or dismissed.
- Follow-up completion rate for confirmed next steps.
- Weekly return rate for recurring teams.
- User-reported confidence that important decisions did not get lost.
- Automation setup completion and schedule-edit rate.
- Digest open/action rate and percentage of trend summaries that lead to a reviewed next step.
