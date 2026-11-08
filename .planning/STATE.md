---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: "Titanium Whisper on Titanium servers"
project_code: TIWH
current_phase: 1
current_phase_name: "Fork CI & sync runbook"
status: milestone_active
last_updated: "2026-11-08"
last_activity: 2026-11-08
last_activity_desc: "Project initialized from gap analysis; roadmap 7 phases, 36 requirements"
progress:
  total_phases: 7
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-11-08)

**Core value:** A user installs Titanium Whisper, signs in with their Titanium account, and dictates through our servers with no API keys and no OpenWhispr-hosted service.
**Current focus:** Phase 1 — Fork CI & sync runbook

## Current Position

Phase: 1 of 7 (not planned)
Next: `/gsd-plan-phase 1`

## Blockers / External dependencies

- Phase 7 needs titanium-licensing v3.5 Phase 32 (IDP-32 stable account id) merged.
- Phase 4 needs a stable DNS name for stt-api (Cloudflare/Coolify).
- Phase 6 needs our own Google/Microsoft/Slack/Linear OAuth apps and a web-search provider key.
- Woodpecker API access is failing (401) — not needed by this roadmap (GitHub Actions is the fork's CI).

## Decisions

See PROJECT.md Key Decisions.
