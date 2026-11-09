---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: "Titanium Whisper on Titanium servers"
project_code: TIWH
current_phase: 5
current_phase_name: "Self-hosted transcription parity"
status: milestone_active
last_updated: "2026-11-09"
last_activity: 2026-11-09
last_activity_desc: "Phase 1 merged (PR #10). Phases 2-4 in review; AUTH-01 and STT-03 owner-blocked"
progress:
  total_phases: 7
  completed_phases: 1
  total_plans: 0
  completed_plans: 0
  percent: 14
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-11-08)

**Core value:** A user installs Titanium Whisper, signs in with their Titanium account, and dictates through our servers with no API keys and no OpenWhispr-hosted service.
**Current focus:** Phases 2-4 in review; Phase 5 next

## Current Position

- Phase 1 (Fork CI) MERGED: PR #10 (merge d59b37c, 2026-11-09). Quality, Windows build, smoke check green.
- Phases 2-4 (rebrand, Titanium sign-in, app side of stt-api auth) on one PR from `claude/sharp-heisenberg-u5ih9x`.
- stt-api license-key auth (STT-01) on its own PR in finedesignz/openwhispr-stt-api.

## Owner actions needed

1. Provision `titanium-whisper` in Titanium (`POST /v1/apps/provision` or admin-ui) and allow `titaniumwhisper://auth` as a return origin; put the Keygen product id in `src/config/fork.config.json` `TITANIUM.keygenProductId` and stt-api env `TITANIUM_KEYGEN_PRODUCT_ID`. Until then keys report "unconfigured".
2. stt-api Coolify env: `TITANIUM_KEYGEN_PRODUCT_ID`, `TITANIUM_KEYGEN_PUBLIC_KEY`, optional `BLOCKLIST_REDIS_URL` (redis://).
3. Stable DNS name for stt-api (STT-03), then update `DEFAULT_STT.baseUrl`.

## Blockers / External dependencies

- Phase 7 needs titanium-licensing v3.5 Phase 32 (IDP-32 stable account id) merged.
- Phase 4 needs a stable DNS name for stt-api (Cloudflare/Coolify).
- Phase 6 needs our own Google/Microsoft/Slack/Linear OAuth apps and a web-search provider key.
- Woodpecker API access is failing (401) — not needed by this roadmap (GitHub Actions is the fork's CI).

## Decisions

See PROJECT.md Key Decisions.
