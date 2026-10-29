const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { RUNTIME_ENV_KEYS, URL_KEYS, OVERRIDE_KEYS } = require("../../src/config/forkKeys");
const { resolveForkConfig } = require("../../src/config/forkConfig");

const root = path.join(__dirname, "..", "..");

test("vite writeBundle snapshots exactly the fork keys, from forkKeys", () => {
  const vite = fs.readFileSync(path.join(root, "src", "vite.config.mjs"), "utf8");
  assert.match(vite, /RUNTIME_ENV_KEYS\.map/);
  assert.doesNotMatch(vite, /VITE_OPENWHISPR_API_URL/);
});

test("forkConfig reads every key in forkKeys and nothing else", () => {
  const seen = RUNTIME_ENV_KEYS.map((key) => `${key}`);
  const runtimeEnv = Object.fromEntries(seen.map((k) => [k, `https://${k.toLowerCase()}.example`]));
  const cfg = resolveForkConfig({}, runtimeEnv);
  assert.equal(cfg.CLOUD_ENABLED, true);
  for (const key of OVERRIDE_KEYS) {
    assert.ok(String(cfg[key]).includes(`vite_${key}`.toLowerCase()), key);
  }
  assert.deepEqual(
    RUNTIME_ENV_KEYS.slice(0, URL_KEYS.length),
    URL_KEYS.map((k) => `VITE_${k}`)
  );
  const src = fs.readFileSync(path.join(root, "src", "config", "forkConfig.js"), "utf8");
  assert.equal(
    src.match(/VITE_[A-Z_]+/g)?.every((k) => RUNTIME_ENV_KEYS.includes(k)),
    true
  );
});

test("with empty config main and renderer both report cloud disabled", () => {
  assert.equal(resolveForkConfig({}, {}).CLOUD_ENABLED, false);
  const env = { ...process.env };
  for (const key of RUNTIME_ENV_KEYS) delete env[key];
  const out = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "-e",
      'import("./src/config/forkRuntime.ts").then(m=>console.log(JSON.stringify(m.CLOUD_ENABLED)))',
    ],
    { cwd: root, env, encoding: "utf8", timeout: 60000 }
  );
  assert.equal(out.stdout.trim(), "false", out.stderr);
});
