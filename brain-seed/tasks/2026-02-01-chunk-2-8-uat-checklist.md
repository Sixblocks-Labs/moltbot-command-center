# Chunk 2.8 — UAT Checklist (Moltbot Command Center)

Date: 2026-02-01
Environment: Production (Vercel) — https://moltbot-command-center.vercel.app
Browser automation: CDP attach (headless) via Clawdbot `profile=clawd`

## Scope
Validate core Chat/Markdown UX and basic Brain navigation after recent UI-side sanitization (strip `[[reply_to:*]]` tags before markdown render).

---

## Checklist (PASS/FAIL)

### A) App loads + navigation
- [PASS] App loads without crash (Dashboard visible)
- [PASS] Tab navigation works: Dashboard ⇄ Chat ⇄ Brain
- [PASS] Status indicator shows Online

### B) Chat send/receive
- [PASS] Send via **Send** button delivers message + receives assistant reply
- [PASS] Send via **Ctrl+Enter** delivers message + receives assistant reply
- [PASS] Send multiline content (\n) is transmitted correctly (assistant acknowledged both lines)
- [PASS] Post-reload: hard reload / re-open and send/receive still works

### C) Run tracking (Task Tracker)
- [PASS] “Active runs” list populates on send
- [PASS] Run transitions to `done` after completion
- [PASS] Run entry shows a title derived from the user message + an id/runId

### D) Markdown rendering
- [PASS] Markdown renders (paragraphs + lists)
- [PASS] Fenced code block renders
- [PASS] Syntax highlighting present (via rehype-highlight)
- [PASS] Code block **Copy** button renders
- [PASS] Copy button is clickable (no visible UI error)

### E) Reply tag stripping (regression)
- [PASS] Assistant output does **not** display routing tags like `[[reply_to:...]]`
- [PASS] Malformed/unterminated `[[reply_to...` does not leak into rendered text

### F) Sidebar quick controls
- [FAIL] Sidebar buttons are functional:
  - New session
  - Stop task
  - Clear history
  - Refresh

### G) Message formatting fidelity
- [FAIL] User message newline preservation in transcript
  - Observed: single newlines are visually collapsed (rendered as a space) due to standard markdown behavior.
  - Note: content still arrives correctly to the assistant.

---

## Notes / Observations
- Clicking the Copy button was reliable via role-based selection in automation; aria-ref clicks occasionally timed out (tooling quirk more than product behavior).
- Sidebar “quick controls” are currently static UI (no handlers) — expected to remain FAIL until wired.

