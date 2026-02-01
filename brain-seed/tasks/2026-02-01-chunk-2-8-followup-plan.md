# Chunk 2.8 — Follow-up Chunk Plan

Date: 2026-02-01
Repo: https://github.com/Sixblocks-Labs/moltbot-command-center

## Goal
Close the two UAT failures from Chunk 2.8:
1) Wire up Sidebar quick controls (New session / Stop task / Clear history / Refresh)
2) Preserve user message newlines in the transcript display (without changing gateway)

> Constraint: Do not touch gateway behavior. All changes in Command Center UI/client.

---

## Work items

### 1) Wire up Sidebar quick controls
**Current state**
- `src/components/app/sidebar-tasks.tsx` renders buttons with no `onClick`.
- Chat state + tasks state live in `useGatewayChat()` (`src/lib/gateway/client.ts`).

**Proposed wiring (minimal, no gateway changes)**
- **Refresh**
  - Option A (UI-only): trigger a reconnect by calling `client.stop()` then `client.start()` inside `useGatewayChat()` and re-fetch/handshake.
  - Option B (simple): `window.location.reload()`.
  - Recommendation: start with B for reliability, then evolve to A when session/history syncing exists.

- **Clear history**
  - Clears local UI arrays:
    - `messages` (chat transcript)
    - `tasks` (task tracker)
    - `toolEvents` (if used)
  - Should not call gateway; purely resets client-side state.

- **New session**
  - If gateway supports a "new session" method (uncertain): call it.
  - Otherwise (UI-only): generate a new `sessionKey` client-side and re-init `useGatewayChat({ sessionKey })` so subsequent sends are isolated.
  - Deliverable: a session selector + ability to create a new session entry in sidebar; set active session.

- **Stop task**
  - If gateway supports cancellation by runId: call it (e.g., `runs.stop` / `sessions.stop` style).
  - If not available: UI-only stop would be misleading.
  - Recommendation: implement as **disabled** until we confirm an API to stop a run; or implement "Stop task" = stop websocket stream + mark latest active run as `error/idle` locally.

**Acceptance criteria**
- Buttons do something observable:
  - Refresh reloads (or reconnects) and retains Online state.
  - Clear history empties transcript + task list in UI.
  - New session creates/selects a new sessionKey and isolates subsequent messages.
  - Stop task behavior is explicitly correct (either real cancel or clearly disabled).

---

### 2) Preserve user message newlines in transcript
**Current state**
- User messages are rendered via `Markdown` component (`src/components/chat/markdown.tsx`) and markdown collapses single newlines.

**Options**
- **Option A (recommended): render user messages with newline-friendly styling**
  - For role === 'user': render as plain text with CSS `white-space: pre-wrap` (and maybe `font-family` inherit), bypassing markdown.
  - For role === 'assistant': keep markdown renderer.

- **Option B: keep markdown but enable soft-breaks**
  - Add `remark-breaks` plugin for user messages (or globally).
  - Downside: could change assistant formatting expectations.

**Acceptance criteria**
- A message containing `line 1\nline 2` renders as two lines (not a single collapsed line) in the transcript.
- Assistant markdown rendering remains unchanged.

---

## Suggested implementation sequence (when we start)
1) Add a small UI state/actions layer in Chat page to pass handlers into `SidebarTasks` (e.g., `onClearHistory`, `onRefresh`, `onNewSession`, `onStopTask`).
2) Implement Clear history (UI-only) first.
3) Implement Refresh (page reload or WS reconnect).
4) Implement New session (client sessionKey switching) + session list update.
5) Decide Stop task: real cancel only if gateway method exists; otherwise disabled with tooltip.
6) Implement newline preservation (user-only render path).

