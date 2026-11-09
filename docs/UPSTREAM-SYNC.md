# Syncing upstream OpenWhispr into the fork

The fork (`finedesignz/openwhispr`, shipped as Titanium Whisper) merges upstream
`OpenWhispr/openwhispr` `main` on a schedule. Previous syncs: v1.10.3 (PR #2), v1.10.4
(PR #9, merge commit `8922b6b`).

## When

- Every upstream release tag (`v*.*.*`), within a week of its release.
- Immediately for an upstream security fix (CVE, advisory, `npm audit` high/critical).
- Never in the middle of a fork phase; land or park the phase PR first.

## How

1. Use Node 24 (`.nvmrc`). Any other major rewrites `package-lock.json` incompatibly.
2. Branch from fork `main`: `git checkout -b chore/sync-upstream-vX.Y.Z origin/main`.
3. `git fetch https://github.com/OpenWhispr/openwhispr.git main` and merge `FETCH_HEAD`
   with a merge commit (never rebase or squash: the merge parent records the sync point).
   Message: `chore: sync upstream OpenWhispr main (vX.Y.Z)`.
4. Resolve conflicts using the hotspot rules below.
5. `npm ci`, then run the checklist. Open a PR titled like the commit.

## Conflict hotspots

Files the fork changes. Upstream edits to these conflict most often.

| Area             | Files                                                                                                                                                                                                                                                                                                                         | Rule when resolving                                                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fork config seam | `src/config/fork.config.json`, `forkConfig.js`, `forkKeys.js`, `forkRuntime.ts`, `forkDefaults.ts`                                                                                                                                                                                                                            | Fork-only files. Keep ours. If upstream adds a hosted URL constant elsewhere, route it through `forkKeys.js` instead of hardcoding.                                    |
| Hosted URLs      | `src/config/constants.ts`, `src/helpers/ipcHandlers.js`, `main.js`, `src/helpers/menuManager.js`, `src/helpers/productHelp.js`, `src/helpers/sessionHeaders.js`, `src/helpers/orukeetProtocol.js`, `src/helpers/connectors/slackAuth.js`, `linearAuth.js`, `src/helpers/oauthLoopbackFlow.js`                                 | Take upstream logic, then re-apply the fork's indirection: no literal `openwhispr.com` / `gizmovoice.ai` URL survives.                                                 |
| Cloud gate       | `src/hooks/useAuth.ts`, `src/lib/auth.ts`, `src/stores/policyStore.ts`, `policyRules.ts`, `settingsStore.ts`, `src/config/cloudSections.ts`                                                                                                                                                                                   | Keep every `CLOUD_ENABLED` branch. A new upstream cloud feature must be gated or hidden in the same PR.                                                                |
| UI gating        | `ControlPanel.tsx`, `SettingsModal.tsx`, `SettingsPage.tsx`, `OnboardingFlow.tsx`, `onboarding/flow.ts`, `onboarding/SetupChoiceStep.tsx`, `OnboardingShell.tsx`, `IntegrationsView.tsx`, `integrations/*`, `LeaderboardShareDialog.tsx`, `EnterpriseCheckoutDialog.tsx`, `ui/SupportDropdown.tsx`, `notes/shareNoteRules.ts` | Same as the cloud gate.                                                                                                                                                |
| Build and update | `package.json`, `electron-builder.fork.json`, `src/updater.js`, `src/vite.config.mjs`, `FORK-BUILD.md`                                                                                                                                                                                                                        | Keep fork `publish`, appId and updater feed. Take upstream dependency bumps.                                                                                           |
| CI               | `.github/workflows/*`                                                                                                                                                                                                                                                                                                         | Keep the `github.repository == 'OpenWhispr/openwhispr'` guards and the absence of hosted `\|\|` defaults. `test/config/forkWorkflows.test.js` fails if either is lost. |

## Checklist (all must pass before merge)

- [ ] `npm run quality-check` and `npm run i18n:check`
- [ ] `npm audit --audit-level=high`
- [ ] `npm test` (full suite; never skip or disable a test to get green)
- [ ] `grep -rnE "https?://[a-z0-9.-]*(openwhispr\.com|gizmovoice\.ai)" main.js preload.js src --include=*.js --include=*.ts --include=*.tsx | grep -v locales` shows nothing new
- [ ] New upstream workflows reviewed: upstream-only jobs guarded, and listed in `test/config/forkWorkflows.test.js`
- [ ] New upstream cloud features (search `getApiUrl`, `AUTH_URL`, `isSignedIn`) are gated or hidden
- [ ] Windows build job in CI is green, including the fork smoke check (`scripts/fork-smoke.js`)
- [ ] `.planning/STATE.md` notes the new upstream version
