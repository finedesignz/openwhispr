# STATE
- Run 2026-10-20: opened PR #4 (computeChunkStats odd-offset crash, test fails-before/passes-after). Meeting seams (holdback/gate/reducer) otherwise reviewed, no further bug. Upstream is 59 commits ahead of fork main (2bb0241); merge was clean locally but `git push origin HEAD:refs/heads/main` was blocked-by-classifier: push to fork main, Merge Without Review. Not retried. needs-owner: sync fork main to upstream 2bb0241 (or allow it). PR #4 branch is cut from the old fork main so its diff is one commit. Did not run npm ci/build (Node 22 sandbox); only targeted node --test. No CI to merge on; PR #4 left open for next run.
- Last run: 2026-10-14 (merged upstream 2516e6e into fork main as b9b608c, a merge commit because the fork carries squash commit e1810a5; clean, 0 conflicts). Bug hunt: streaming-commit stop/fallback path reviewed (ipcHandlers stop-dictation-preview, audioManager processWithLocalParakeet): empty/truncated/rejected stream all fall back to full decode, no bug. i18n parity: 0 missing keys in 8 locales.
- Open routine PR: none.
- Focus last run: Cleanup (orphaned IPC), i18n audit. Overdue next: Bug hunt (streaming-commit fallback, meeting seams), UI/UX, Optimize, Gaps.
- Env notes: sandbox node is v22; Node 24 via `npx --yes node@24` binary symlinked to /tmp/n24. Use `npm ci --ignore-scripts`, tests via `node --import tsx --test`. Electron binary absent -> 44 test files fail environmentally (not bugs). Build: `npm run build:renderer`.
- memlog: claim needs `session` arg; works.
- needs-owner: none.
## Unreported errors
- none
- Sync note: use `git fetch https://github.com/OpenWhispr/openwhispr main` then `git push origin <sha>:refs/heads/main`.
- Run 10-13 was light: no new bug-hunt PR (temp-file cleanup in audio/diarize paths reviewed: finally-unlinks present). Next: Bug hunt streaming-commit fallback, meeting seams, UI/UX.
- Sync note 10-14: upstream may not be an ancestor of fork main; use `git merge <upstream sha>` then push HEAD:refs/heads/main.
