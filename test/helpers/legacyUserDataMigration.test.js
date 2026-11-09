const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { migrateLegacyUserData, MARKER } = require("../../src/helpers/legacyUserDataMigration");

function tmpAppData() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tw-migrate-"));
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

test("copies the legacy profile on first launch and leaves the original untouched", () => {
  const appData = tmpAppData();
  const legacy = path.join(appData, "OpenWhispr");
  write(path.join(legacy, ".env"), "DICTATION_KEY=F8\n");
  write(path.join(legacy, "transcriptions.db"), "db");
  write(path.join(legacy, "Local Storage", "leveldb", "000003.log"), "ls");
  write(path.join(legacy, "secure-keys", "OPENAI_API_KEY"), "enc");
  write(path.join(legacy, "Local State"), "{}");
  write(path.join(legacy, "SingletonLock"), "lock");
  write(path.join(legacy, "Cache", "data_0"), "cache");

  const target = path.join(appData, "Titanium Whisper");
  const result = migrateLegacyUserData({
    appDataDir: appData,
    targetDir: target,
    legacyNames: ["OpenWhispr", "open-whispr"],
  });

  assert.equal(result.migrated, true);
  assert.equal(fs.readFileSync(path.join(target, ".env"), "utf8"), "DICTATION_KEY=F8\n");
  assert.ok(fs.existsSync(path.join(target, "transcriptions.db")));
  assert.ok(fs.existsSync(path.join(target, "Local Storage", "leveldb", "000003.log")));
  assert.ok(fs.existsSync(path.join(target, "secure-keys", "OPENAI_API_KEY")));
  assert.ok(fs.existsSync(path.join(target, "Local State")));
  assert.ok(!fs.existsSync(path.join(target, "SingletonLock")), "locks are not copied");
  assert.ok(!fs.existsSync(path.join(target, "Cache")), "caches are not copied");
  assert.equal(JSON.parse(fs.readFileSync(path.join(target, MARKER), "utf8")).from, legacy);
  assert.ok(fs.existsSync(path.join(legacy, "SingletonLock")), "legacy folder untouched");
  assert.ok(!fs.existsSync(`${target}.migrating`));
});

test("never runs once the new profile exists", () => {
  const appData = tmpAppData();
  write(path.join(appData, "OpenWhispr", ".env"), "A=1\n");
  write(path.join(appData, "Titanium Whisper", ".env"), "B=2\n");
  const result = migrateLegacyUserData({
    appDataDir: appData,
    targetDir: path.join(appData, "Titanium Whisper"),
    legacyNames: ["OpenWhispr"],
  });
  assert.deepEqual(result, { migrated: false, reason: "target_exists" });
  assert.equal(fs.readFileSync(path.join(appData, "Titanium Whisper", ".env"), "utf8"), "B=2\n");
});

test("does nothing for a fresh install", () => {
  const appData = tmpAppData();
  const target = path.join(appData, "Titanium Whisper");
  const result = migrateLegacyUserData({
    appDataDir: appData,
    targetDir: target,
    legacyNames: ["OpenWhispr"],
  });
  assert.deepEqual(result, { migrated: false, reason: "no_legacy" });
  assert.ok(!fs.existsSync(target));
});

test("picks the most recently used legacy folder", () => {
  const appData = tmpAppData();
  write(path.join(appData, "open-whispr", ".env"), "OLD=1\n");
  write(path.join(appData, "OpenWhispr", ".env"), "NEW=1\n");
  const old = new Date(Date.now() - 86_400_000);
  fs.utimesSync(path.join(appData, "open-whispr"), old, old);
  const target = path.join(appData, "Titanium Whisper");
  migrateLegacyUserData({
    appDataDir: appData,
    targetDir: target,
    legacyNames: ["open-whispr", "OpenWhispr"],
  });
  assert.equal(fs.readFileSync(path.join(target, ".env"), "utf8"), "NEW=1\n");
});

test("a failed copy leaves no partial profile behind", () => {
  const appData = tmpAppData();
  write(path.join(appData, "OpenWhispr", ".env"), "A=1\n");
  const target = path.join(appData, "Titanium Whisper");
  const failingFs = {
    ...fs,
    cpSync: (src, dest, opts) => {
      fs.cpSync(src, dest, opts);
      throw new Error("disk full");
    },
  };
  const result = migrateLegacyUserData({
    appDataDir: appData,
    targetDir: target,
    legacyNames: ["OpenWhispr"],
    fsImpl: failingFs,
  });
  assert.equal(result.migrated, false);
  assert.equal(result.reason, "copy_failed");
  assert.ok(!fs.existsSync(target));
  assert.ok(!fs.existsSync(`${target}.migrating`));
});
