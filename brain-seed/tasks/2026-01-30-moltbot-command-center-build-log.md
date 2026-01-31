# 2026-01-30 — Moltbot Command Center — Build Log

## Summary
Built initial "Moltbot Command Center" (Next.js 14 + Tailwind + shadcn/ui + TS) with Dashboard/Chat/Brain tabs, task sidebar, and tool output panel. Deployed to Vercel.

## Key URLs
- Repo: https://github.com/Sixblocks-Labs/moltbot-command-center
- Live (Vercel): https://moltbot-command-center.vercel.app

## Chunks completed (today)
### Chunk 1 — Scaffold + layout
- Created project in `~/projects/moltbot-command-center`
- Added dark-mode default, deep navy/slate theme, header tabs, left sidebar, right collapsible panel
- Pushed repo (default branch: main)

Commit history (high level):
- `00c8157` feat: moltbot command center v1

### Chunk 2 — Chat tab
- WebSocket client targeting `ws://100.102.236.81:18789`
- Markdown rendering with highlighted code blocks + copy button
- Keyboard shortcut: Cmd/Ctrl+Enter to send

Commit:
- `6301735` feat(chat): cmd/ctrl+enter send shortcut

### Chunk 3 — Brain tab
- Brain folder structure created on VPS: `~/clawdbot-brain/{journal,notes,ideas,research,tasks}`
- File browser for markdown docs + search + sort
- Color-coded tags: Journal=blue, Ideas=purple, Notes=green, Research=orange

Commit:
- `c3b724e` feat(brain): add ideas folder, tag colors, search+sort

### Chunk 4 — Dashboard tab + deploy
- Dashboard: morning brief scaffold + session list + token usage estimate
- Header: connection status indicator
- Vercel env var added: `CLAWDBOT_GATEWAY_TOKEN` (production)
- Deployed to Vercel

Commit:
- `b08930a` feat(dashboard): mission control + session + usage; server env token

### Fix — client-side crash
- The deployed site initially threw a client-side exception due to mixed-content WebSocket (`ws://` from `https://`).
- Patched the WebSocket constructor to fail gracefully instead of crashing the app.

Commit:
- `4b51a47` fix(ws): avoid client crash when WebSocket constructor throws

## Notes / Known issues
- Site shows "Offline" because browser blocks `ws://` from an `https://` site (mixed content). Needs `wss://` (TLS) or an HTTPS proxy.
- Vercel Git integration auto-connect failed for org repo; deployments were done via CLI.
