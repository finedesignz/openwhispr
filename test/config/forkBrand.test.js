// Titanium Whisper identity (BRAND-01, BRAND-02, BRAND-05): the build config, the runtime
// fork config and the runtime code must agree, and runtime code must not call or link
// OpenWhispr-hosted services directly.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "..");
const fork = require("../../src/config/fork.config.json");
const builder = require("../../electron-builder.fork.json");
const unsigned = require("../../electron-builder.fork-unsigned.json");

test("electron-builder fork config matches the runtime identity", () => {
  assert.equal(builder.appId, fork.APP_ID);
  assert.equal(builder.productName, fork.BRAND_NAME);
  assert.deepEqual(builder.protocols.schemes, [fork.URL_SCHEME]);
  assert.equal(fork.USER_DATA_DIR, fork.BRAND_NAME);
  assert.notEqual(fork.APP_ID, "com.gizmolabs.openwhispr");
  assert.match(
    fork.WINDOWS_TRAY_GUID,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  );
  assert.notEqual(fork.WINDOWS_TRAY_GUID, "9afd9bd5-53da-42ef-8334-6e2b494c66fe");
});

test("the unsigned fork config keeps the identity and only drops signing", () => {
  assert.equal(unsigned.extends, "./electron-builder.fork.json");
  assert.equal(unsigned.extraMetadata.windowsTrayIdentity, false);
  assert.equal(unsigned.win.azureSignOptions, null);
  assert.equal(unsigned.win.forceCodeSigning, false);
  assert.equal(unsigned.appId, undefined, "inherits appId from the fork config");
});

test("main.js takes app id, URL scheme and userData folder from the fork config", () => {
  const main = fs.readFileSync(path.join(ROOT, "main.js"), "utf8");
  assert.match(main, /BASE_WINDOWS_APP_ID = FORK_IDENTITY\.APP_ID/);
  assert.match(main, /production: FORK_IDENTITY\.URL_SCHEME/);
  assert.match(main, /FORK_IDENTITY\.USER_DATA_DIR/);
  assert.doesNotMatch(main, /com\.gizmolabs\.openwhispr/);
});

test("the NSIS uninstaller only removes this product's startup entries and firewall rule", () => {
  const nsh = fs.readFileSync(path.join(ROOT, "resources", "nsis", "installer.nsh"), "utf8");
  assert.doesNotMatch(nsh, /com\.gizmolabs\.openwhispr/);
  assert.match(nsh, /DeleteAutoStartEntry "\$\{APP_ID\}"/);
  assert.match(nsh, /SHERPA_FIREWALL_RULE "\$\{PRODUCT_NAME\}/);
});

const HOSTED_URL = /https?:\/\/[a-z0-9.-]*(openwhispr\.com|gizmovoice\.ai)/i;

function* sourceFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["locales", "dist", "node_modules"].includes(entry.name)) continue;
      yield* sourceFiles(full);
    } else if (/\.(c|m)?(j|t)sx?$/.test(entry.name)) {
      yield full;
    }
  }
}

test("runtime code has no OpenWhispr-hosted URL (fork config is the only place for hosts)", () => {
  const offenders = [];
  for (const file of [
    path.join(ROOT, "main.js"),
    path.join(ROOT, "preload.js"),
    ...sourceFiles(path.join(ROOT, "src")),
  ]) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      if (HOSTED_URL.test(line)) offenders.push(`${path.relative(ROOT, file)}:${index + 1}`);
    });
  }
  assert.deepEqual(offenders, []);
});

test("locale strings use the brand variable, not a hardcoded product name", () => {
  const dir = path.join(ROOT, "src", "locales");
  for (const lang of fs.readdirSync(dir)) {
    const file = path.join(dir, lang, "translation.json");
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(text, /OpenWhispr(?![A-Za-z])/, `${lang} still names OpenWhispr`);
    assert.doesNotMatch(text, /support@openwhispr\.com/, `${lang} has the upstream support email`);
  }
});
