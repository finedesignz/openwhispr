# Roadmap: Titanium Whisper v1.0

**Milestone:** v1.0 "Titanium Whisper on Titanium servers" (code TIWH)
**Granularity:** standard · **Platform:** Windows only

## Phases

- [ ] **Phase 1: Fork CI & sync runbook** — CI builds are cloud-disabled, upstream-only jobs off, one green Windows build+test job
- [ ] **Phase 2: Titanium Whisper rebrand** — name, identity, icons, links, userData migration
- [ ] **Phase 3: Titanium sign-in** — browser login → deep link → exchange → offline license in Electron main
- [ ] **Phase 4: stt-api on Titanium auth** — license-key bearer on stt-api, stable domain, app sends key, language guard
- [ ] **Phase 5: Self-hosted transcription parity** — WS streaming client, diarization/timestamps, cleanup via stt-api
- [ ] **Phase 6: Hosted services** — web search endpoint, Slack/Linear OAuth relay, calendar OAuth clients
- [ ] **Phase 7: Connectors on Titanium accounts** — connectors keyed to Titanium account id; capability text; dropped features hidden

## Phase Details

### Phase 1: Fork CI & sync runbook
**Goal:** The fork's CI can never produce a cloud-enabled build, and every PR gets a real Windows build + full test run.
**Depends on:** nothing
**Requirements:** CI-01, CI-02, CI-03, CI-04, CI-05, OPS-01
**Success criteria:**
1. `grep` finds no OpenWhispr-hosted default in `.github/workflows/`
2. winget/nix/canary/mobile/notarize workflows do not trigger in the fork
3. A Windows workflow passes on a PR with the full suite (no skips added)
4. Smoke test asserts the default route is stt-api with cloud disabled
5. `docs/UPSTREAM-SYNC.md` exists with hotspots and checklist

### Phase 2: Titanium Whisper rebrand
**Goal:** The installed app is Titanium Whisper everywhere a user looks, and existing OpenWhispr users keep their data.
**Depends on:** Phase 1 (CI catches regressions)
**Requirements:** BRAND-01..BRAND-07
**Success criteria:**
1. Built installer and window titles read "Titanium Whisper"; appId `com.titaniumlabs.titaniumwhisper`
2. First launch with an existing `OpenWhispr` userData copies settings, history, notes and models (tested)
3. Guard test: no runtime reference to OpenWhispr-hosted domains
4. i18n check passes in all locales

### Phase 3: Titanium sign-in
**Goal:** Users sign in with their Titanium account and the app holds a verified license offline.
**Depends on:** Phase 2 (deep-link scheme and appId are final)
**Requirements:** AUTH-01..AUTH-06
**Cross-repo:** titanium-licensing (provision slug, allow `titaniumwhisper://auth`)
**Success criteria:**
1. Sign-in round trip works end to end against the live portal
2. Restart offline keeps the user signed in within hard TTL
3. `licenseKey: null` shows the no-license state
4. Sign out clears the cache

### Phase 4: stt-api on Titanium auth
**Goal:** Each signed-in user transcribes through stt-api with their own license; nothing secret ships in the installer.
**Depends on:** Phase 3
**Requirements:** STT-01..STT-04
**Cross-repo:** openwhispr-stt-api (license bearer), Coolify/Cloudflare (stable domain)
**Success criteria:**
1. stt-api accepts a valid license key, rejects tampered/expired/blocklisted/wrong-product keys (tests)
2. Fresh install → sign in → dictation succeeds with no manual configuration
3. Default STT URL is the stable domain

### Phase 5: Self-hosted transcription parity
**Goal:** Meetings, live preview, uploads and cleanup work on our servers without BYOK keys.
**Depends on:** Phase 4
**Requirements:** STT-05, STT-06, STT-07
**Success criteria:**
1. A meeting records with live transcript from stt-api WS
2. An uploaded file gets timestamps and speaker labels
3. Cleanup runs via stt-api by default when signed in

### Phase 6: Hosted services
**Goal:** Web search, Slack/Linear OAuth and calendars work on our infrastructure.
**Depends on:** Phase 3
**Requirements:** FEAT-01, FEAT-02, FEAT-03
**Success criteria:**
1. `web_search` returns results for a signed-in user via our endpoint
2. Slack/Linear connect completes through our relay
3. Google/Microsoft calendar connect works in a fork build

### Phase 7: Connectors on Titanium accounts
**Goal:** Connectors and capability messaging work on Titanium accounts; dropped features leave no dead ends.
**Depends on:** Phase 6; titanium-licensing v3.5 Phase 32 (IDP-32) merged
**Requirements:** FEAT-04, FEAT-05, FEAT-06
**Success criteria:**
1. Connector logins stored under the Titanium account id
2. No UI or assistant text tells users to sign in to OpenWhispr
3. No entry point to a dropped feature remains

## Progress

| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 1 | ○ | 0/0 | 0% |
| 2 | ○ | 0/0 | 0% |
| 3 | ○ | 0/0 | 0% |
| 4 | ○ | 0/0 | 0% |
| 5 | ○ | 0/0 | 0% |
| 6 | ○ | 0/0 | 0% |
| 7 | ○ | 0/0 | 0% |
