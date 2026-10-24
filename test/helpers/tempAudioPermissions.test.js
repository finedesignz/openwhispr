const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

// ipcHandlers.js needs Electron to load, so pin the privacy contract on the
// source: every recording written under os.tmpdir() is owner-only (0o600).
const source = fs.readFileSync(path.join(__dirname, "../../src/helpers/ipcHandlers.js"), "utf8");

test("temp audio files are created owner-only", () => {
  const writes = [
    /createWriteStream\(meetingDiarizationPath,\s*\{\s*mode:\s*0o600\s*\}\)/,
    /createWriteStream\(meetingMicDiarizationPath,\s*\{\s*mode:\s*0o600,?\s*\}\)/,
    /writeFileSync\(tmpInputPath,\s*buffer,\s*\{\s*mode:\s*0o600\s*\}\)/,
    /writeFileSync\(tempPath,\s*Buffer\.from\(buffer\),\s*\{\s*mode:\s*0o600\s*\}\)/,
  ];
  for (const re of writes) assert.match(source, re);
});
