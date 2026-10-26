// Fork-owned configuration seam (main process). Values come from fork.config.json;
// the API/auth URLs may be overridden by env or the packaged runtime-env.json.
// Empty API_URL or AUTH_URL means the hosted cloud is disabled: no request is
// ever issued to a hosted backend and cloud-only UI is hidden.
const fs = require("fs");
const path = require("path");
const fork = require("./fork.config.json");

const strip = (value) => (value || "").replace(/\/+$/, "");

// Vite only inlines VITE_* vars into the renderer bundle, so packaged builds read
// the runtime-env.json the Vite build writes to src/dist/.
function loadRuntimeEnv(envPath = path.join(__dirname, "..", "dist", "runtime-env.json")) {
  try {
    if (fs.existsSync(envPath)) return JSON.parse(fs.readFileSync(envPath, "utf8"));
  } catch {}
  return {};
}

function resolveForkConfig(env = {}, runtimeEnv = {}) {
  const apiUrl = strip(
    env.OPENWHISPR_API_URL ||
      env.VITE_OPENWHISPR_API_URL ||
      runtimeEnv.VITE_OPENWHISPR_API_URL ||
      fork.API_URL
  );
  const authUrl = strip(
    env.AUTH_URL || env.VITE_AUTH_URL || runtimeEnv.VITE_AUTH_URL || fork.AUTH_URL
  );
  return { ...fork, API_URL: apiUrl, AUTH_URL: authUrl, CLOUD_ENABLED: Boolean(apiUrl && authUrl) };
}

const current = () => resolveForkConfig(process.env, loadRuntimeEnv());

module.exports = {
  ...current(),
  fork,
  resolveForkConfig,
  loadRuntimeEnv,
  getApiUrl: () => current().API_URL,
  getAuthUrl: () => current().AUTH_URL,
};
