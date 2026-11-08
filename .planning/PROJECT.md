# Titanium Whisper

## What This Is

Titanium Whisper is Titanium Labs' Windows build of the open-source OpenWhispr dictation app
(fork `finedesignz/openwhispr`). It keeps OpenWhispr's local dictation, notes, meetings and
assistant, but every hosted service it talks to is ours: sign-in and entitlement through
Titanium licensing, transcription and cleanup through our `openwhispr-stt-api`, and our own
endpoints for web search and OAuth relays. Phase 1a (merged, PR #8) already removed the
dependency on the OpenWhispr cloud; this milestone replaces what that removal switched off.

## Core Value

A user installs Titanium Whisper, signs in with their Titanium account, and dictates through
our servers with no API keys, no OpenWhispr account and no OpenWhispr-hosted service involved.

## Business Context

- **Customer**: Titanium Labs users (internal first, then clients) on Windows
- **Revenue model**: Titanium licensing plans (Keygen policy + Stripe via stripe-sync)
- **Success metric**: a fresh install reaches a working dictation through stt-api after sign-in, with zero manual configuration
- **Strategy notes**: gap analysis https://claude.ai/artifact/XtuxrApjs3KME96u1x6CEw (Nov 8, 2026)

## Requirements

### Validated

- ✓ Runs with OpenWhispr cloud disabled: `CLOUD_ENABLED` gate, fork config seam (`src/config/fork.config.json`, `forkConfig.js`, `forkRuntime.ts`, `forkKeys.js`) — Phase 1a, PR #8
- ✓ Default transcription provider is Custom, pointed at stt-api (`DEFAULT_STT`) — Phase 1a
- ✓ Signed Windows build (Azure Trusted Signing, Titanium Labs LLC) and updater feed on `finedesignz/openwhispr` — PR #7, FORK-BUILD.md
- ✓ stt-api exposes `POST /v1/audio/transcriptions` OpenAI-compatible alias — stt-api PR #25
- ✓ Upstream OpenWhispr feature set (dictation, local models, notes, meetings, agent) — existing

### Active

See `.planning/REQUIREMENTS.md` (CI, BRAND, AUTH, STT, FEAT, OPS).

### Out of Scope

- macOS and Linux builds — owner chose Windows only (Nov 8, 2026); later milestone
- OIDC sign-in — Titanium v3.6 (OIDC provider) not built; use Titanium's exchange flow
- OpenWhispr cloud features we won't rebuild: notes cloud sync/backup, cloud note search, referral, leaderboard, enterprise admin console, mobile companion sync, hosted API/MCP/CLI developer integrations — no backend of ours; hidden, recorded as dropped
- Mobile app (`openwhispr-mobile/`) — not shipped by the fork

## Context

- Brownfield Electron 41 / React 19 app; Node 24 pinned (`.nvmrc`); huge upstream codebase (see repo `CLAUDE.md`).
- Fork carries a 53-file diff on hot files; upstream sync must stay feasible.
- Titanium licensing (`finedesignz/titanium-licensing`): portal `license.titaniumlabs.us` / `auth.titaniumlabs.us`, exchange `POST /api/exchange {act}` → `{licenseKey, email, appSlug}`; desktop guide `docs/consumer-integration/tauri.md`; SDK `@titanium-labs/license-client` (offline Ed25519 key verify; blocklist via Redis). Shared portal may return `licenseKey: null` (AUTH_ONLY) — must be handled.
- Titanium v3.5 Phase 32 (IDP-32 stable account id) is NOT merged; connectors keyed per account depend on it.
- stt-api (`finedesignz/openwhispr-stt-api`) on Coolify: shared bearer `STT_API_TOKEN` today (`api/config.js:143`, `api/app.js:172`, `api/streamRoute.js:196`); WS `/v1/transcriptions/stream`; diarization (ERes2Net); Claude-OAuth cleanup.
- CI: fork runs upstream workflows unchanged; release/build defaults point at `auth.openwhispr.com`; winget job targets `OpenWhispr.OpenWhispr`.

## Constraints

- **Security**: desktop clients never receive Redis or server secrets; revocation enforced server-side. No secret ships in the installer.
- **Compatibility**: new appId means a fresh install; user data migrates from the old `OpenWhispr` userData on first launch.
- **Process**: never skip/disable tests to get green; Node 24 for lockfile; all UI strings via i18n in all locales.
- **Cross-repo**: stt-api and titanium-licensing changes land as PRs in their own repos.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Product name "Titanium Whisper" | Owner, Nov 8, 2026 | — Pending |
| Change appId / AppUserModelID | Owner accepts reinstall; build userData migration | — Pending |
| Sign-in through Titanium licensing, not OpenWhispr cloud | "Our own servers" — owner, Nov 8, 2026 | — Pending |
| Host our own web search, gated by Titanium sign-in | Owner, Nov 8, 2026 | — Pending |
| Windows only this milestone | Owner, Nov 8, 2026 | — Pending |
| Desktop omits Redis blocklist; servers enforce revocation | Redis credentials can't ship to clients | — Pending |
| License key is the bearer for our servers (stt-api, search) | One credential, offline-verifiable server-side | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-08 after initialization*
