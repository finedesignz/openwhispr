const test = require("node:test");
const assert = require("node:assert/strict");

const { installElectronStub } = require("./harness/electronStub.js");

installElectronStub();
const AudioStorageManager = require("../../src/helpers/audioStorage.js");

// Saved audio is named after the dictation's wall clock, so the name has to be
// read in the user's zone. transcriptions.timestamp comes in two shapes: the
// bare SQLite CURRENT_TIMESTAMP form, which is UTC with no designator, and the
// zoned form saveTranscription now writes. Only the second is unambiguous to
// `new Date`, so the first has to be pinned to UTC before it is read.
function filenameFor(timestamp) {
  return Object.create(AudioStorageManager.prototype)._buildFilename(42, timestamp);
}

test("names saved audio in local time whether or not the timestamp carries a zone", (t) => {
  const original = process.env.TZ;
  process.env.TZ = "America/Los_Angeles";
  t.after(() => {
    process.env.TZ = original;
  });

  // 12:00 UTC is 05:00 in Los Angeles. Both spellings name the same instant, so
  // both must produce the same name.
  assert.equal(
    filenameFor("2026-09-10 12:00:00.000Z"),
    "EdgeAssistant-2026-09-10-05-00-00-42.webm"
  );
  assert.equal(filenameFor("2026-09-10 12:00:00"), "EdgeAssistant-2026-09-10-05-00-00-42.webm");
});

test("falls back to the bare name when the timestamp is unusable", () => {
  assert.equal(filenameFor(null), "EdgeAssistant-42.webm");
  assert.equal(filenameFor("not a date"), "EdgeAssistant-42.webm");
});

test("cleanup still finds and unlinks legacy OpenWhispr- files and new brand files by id", () => {
  const fs = require("node:fs");
  const os = require("node:os");
  const path = require("node:path");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "audio-prefix-"));
  const names = ["OpenWhispr-2026-01-01-00-00-00-7.webm", "EdgeAssistant-8.webm", "9.webm"];
  const old = new Date(Date.now() - 10 * 86400000);
  for (const n of names) {
    fs.writeFileSync(path.join(dir, n), "x");
    fs.utimesSync(path.join(dir, n), old, old);
  }
  const mgr = Object.create(AudioStorageManager.prototype);
  mgr.audioDir = dir;
  let cleared = [];
  const result = mgr.cleanupExpiredAudio(1, { clearAudioFlags: (ids) => (cleared = ids) });
  assert.equal(result.deleted, 3);
  assert.deepEqual(cleared.sort(), ["7", "8", "9"]);
  assert.deepEqual(fs.readdirSync(dir), []);
  fs.rmSync(dir, { recursive: true, force: true });
});
