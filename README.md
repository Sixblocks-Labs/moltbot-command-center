# Moltbot Command Center

All-in-one dashboard for managing your working relationship with Peter 💾.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- TypeScript

## Modules

- **Chat**: WebSocket chat client (token auth) + markdown + code copy
- **Brain**: browse/search/edit markdown docs in `~/clawdbot-brain/`
- **Mission Control**: brief + action items (scaffold)
- **Tool Output**: right panel shows tool-ish events received over the gateway socket

## Environment variables

Set these in Vercel (or `.env.local`):

- `NEXT_PUBLIC_CLAWDBOT_GATEWAY_URL` (default: `ws://100.102.236.81:18789`)
- `NEXT_PUBLIC_CLAWDBOT_GATEWAY_TOKEN` (required)

Optional:
- `BRAIN_ROOT` (server-side) default: `~/clawdbot-brain`

## Important note about Vercel + local filesystem

The Brain module reads/writes files on the **server filesystem** (e.g. your VPS at `/home/clawdbot/clawdbot-brain`).

If you deploy to Vercel-hosted infrastructure, it will not have access to your VPS disk. For full functionality you have two options:

1) **Run this app on your VPS** (recommended for Brain editing)
2) Expose a small authenticated file API on the VPS and point the app at it (future work)

## Local dev

```bash
npm install
npm run dev
```
