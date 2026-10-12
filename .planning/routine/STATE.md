# STATE
- Last run: 2026-10-12 (Privacy review: logging clean; fixed temp audio perms 0600 on PR #1; i18n audit clean). Prior: 2026-10-11 bootstrap. Fork synced: origin/main == upstream/main (5f9a88b).
- Open routine PR: dead-ipc cleanup (branch routine/openwhispr-20261011-dead-ipc).
- Focus last run: Cleanup (orphaned IPC), i18n audit. Overdue next: Bug hunt (streaming-commit fallback, meeting seams), UI/UX, Optimize, Gaps.
- Env notes: sandbox node is v22; Node 24 via `npx --yes node@24` binary symlinked to /tmp/n24. Use `npm ci --ignore-scripts`, tests via `node --import tsx --test`. Electron binary absent -> 44 test files fail environmentally (not bugs). Build: `npm run build:renderer`.
- memlog: claim needs `session` arg; works.
- needs-owner: none.
## Unreported errors
- none
