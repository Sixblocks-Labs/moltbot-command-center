# Security + Reliability Guardrails (Command Center)

These guardrails exist to keep the Command Center predictable, safe, and debuggable as we add more “paste arbitrary text” workflows (job cards, logs, appenders, automations).

## 1) Treat all user-provided text as untrusted input
- Assume any pasted content could contain:
  - prompt injection attempts (e.g., “ignore previous instructions”)
  - social engineering (“install this”, “run this command”, “DM me”)
  - secrets accidentally included
- **Rule:** Don’t rely on text filtering or “instruction ignoring” as your defense.
- **Preferred defense:** capability isolation + allowlists.

## 2) Capability isolation beats sanitization
When implementing a workflow, explicitly define what it can do.

**Good pattern:**
- “Append-only logger” routes can only append to one file.
- “Reader” routes can only read from one file.
- “Brain doc” routes can only write `.md` documents under an allowlisted prefix.

**Avoid:**
- single “general purpose” route that can read/write arbitrary paths
- routing pasted text into any execution surface (shell, eval, tool router) without strict constraints

## 3) Append-only logs are canonical
For accretive logs (e.g., ARG inspiration / infra):
- Source of truth is the append-only file.
- Never mutate historical entries except for explicit, user-approved corrections.
- Each entry must include a timestamp header.
- Capture `Tag:` if present; use it for weekly synthesis grouping.

## 4) Keep domains separate (no accidental synthesis)
- Inspiration and infrastructure are separate streams.
- Weekly syntheses must never combine them.
- If you must reference the other domain, do so as a link only (no synthesis), and only with explicit approval.

## 5) “Success” must be observable
A user should never have to guess whether an action worked.

**UI requirements:**
- Show explicit success/failure on:
  - “Hire” (sending job prompt)
  - “Send” (sending arbitrary messages)
- When possible, surface the failing component:
  - gateway offline vs request rejected vs server error

**Back-end requirements:**
- Return actionable error messages (status + short reason) for debugging.

## 6) Prefer idempotency + traceability
- Use idempotency keys for sends/runs.
- Include run IDs in UI tasks.
- When troubleshooting, you should be able to correlate:
  - UI action → request → runId → resulting log entry.

## 7) Supply chain posture: minimize and audit dependencies
- Treat third-party skills/plugins/packages as untrusted.
- Keep a short allowlist of what we actually use.
- Before adding a new skill/tool dependency:
  - review code or provenance
  - confirm it does not expand capabilities unexpectedly

## 8) Network allowlists for automation routines
- For scheduled heartbeats (e.g., Moltbook):
  - hard-allowlist the domain(s) permitted
  - do not follow external links found in content
  - log all outbound requests (method, URL, status, auth header used)

## 9) Cache-busting and stale UI protection
- Dashboard data endpoints should send `Cache-Control: no-store`.
- When verifying updates, use a cachebust query param in manual checks.
- Build UI to handle empty states gracefully but distinctly from error states.

## 10) Always keep an “escape hatch”
- If automation fails, we can always:
  - append manually with a “Backfill” tag
  - publish docs via `/api/brain/doc` directly
  - keep progress moving while debugging root cause

---

## Checklist for adding a new workflow/job card
- [ ] What is the minimal capability set?
- [ ] What is the canonical storage (append log vs brain doc)?
- [ ] How is success confirmed (toast + UI state)?
- [ ] What is the failure mode and how is it surfaced?
- [ ] What’s the separation boundary (avoid cross-domain synthesis)?
- [ ] Any new dependencies? If yes, why and how audited?

