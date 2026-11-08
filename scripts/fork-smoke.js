#!/usr/bin/env node
// Fork release smoke check (CI-05). Run after `npm run build:renderer`: reads the
// runtime-env.json snapshot the packaged app will ship with and fails if the build
// would start with the OpenWhispr hosted cloud enabled, or if the default
// transcription endpoint is not the fork's STT API.
const path = require("path");
const { resolveForkConfig, loadRuntimeEnv } = require("../src/config/forkConfig");

const HOSTED = /(^|\.)(openwhispr\.com|gizmovoice\.ai|gizmolabs\.[a-z]+)$/i;

function checkForkBuild(runtimeEnv) {
  const problems = [];
  // Only the packaged snapshot counts: process env is not shipped with the app.
  const config = resolveForkConfig({}, runtimeEnv);
  if (config.CLOUD_ENABLED) {
    problems.push(`hosted cloud enabled (API_URL=${config.API_URL}, AUTH_URL=${config.AUTH_URL})`);
  }
  for (const [key, value] of Object.entries(runtimeEnv)) {
    if (!value) continue;
    let host = "";
    try {
      host = new URL(value).hostname;
    } catch {
      continue;
    }
    if (HOSTED.test(host)) problems.push(`${key} points at an OpenWhispr-hosted host (${host})`);
  }
  const stt = config.DEFAULT_STT || {};
  let sttHost = "";
  try {
    sttHost = new URL(stt.baseUrl).hostname;
  } catch {
    problems.push(`DEFAULT_STT.baseUrl is not a URL (${stt.baseUrl})`);
  }
  if (sttHost && HOSTED.test(sttHost)) problems.push(`DEFAULT_STT points at ${sttHost}`);
  if (!stt.model) problems.push("DEFAULT_STT.model is empty");
  return problems;
}

if (require.main === module) {
  const envPath = process.argv[2] || path.join(__dirname, "..", "src", "dist", "runtime-env.json");
  const problems = checkForkBuild(loadRuntimeEnv(envPath));
  if (problems.length) {
    console.error(`fork smoke check failed for ${envPath}:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`fork smoke check passed (${envPath}): cloud disabled, default STT on the fork API`);
}

module.exports = { checkForkBuild };
