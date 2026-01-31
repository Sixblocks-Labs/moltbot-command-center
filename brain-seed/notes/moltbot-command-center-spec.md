# Moltbot Command Center — Spec (living)

## Purpose
Daily driver dashboard for working with Peter 💾.

## Tabs
- Dashboard (Mission Control)
- Chat
- Brain

## Chat
- WS gateway connection
- Markdown rendering, syntax-highlighted code blocks
- Copy button for code blocks
- Shortcuts: Cmd/Ctrl+Enter to send

## Brain
- Filesystem-backed markdown docs under `~/clawdbot-brain/`
- Subfolders: journal, notes, ideas, research, tasks
- Search + sort + tag badges

## Layout
- Desktop: 3 columns (left tasks, center main, right tool output)
- Tablet: 2 columns
- Mobile: 1 column; side panels via Sheet drawers

## Known issues / tech debt
- WebSocket token security: should not be public client-side.
- Upgrade Next.js to patched 14.x.
