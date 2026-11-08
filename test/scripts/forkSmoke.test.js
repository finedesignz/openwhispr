const test = require("node:test");
const assert = require("node:assert/strict");
const { checkForkBuild } = require("../../scripts/fork-smoke.js");

test("passes for the shipped cloud-disabled snapshot", () => {
  assert.deepEqual(checkForkBuild({ VITE_AUTH_URL: "", VITE_OPENWHISPR_API_URL: "" }), []);
});

test("fails when the snapshot turns the hosted cloud on", () => {
  const problems = checkForkBuild({
    VITE_AUTH_URL: "https://auth.openwhispr.com",
    VITE_OPENWHISPR_API_URL: "https://api.openwhispr.com",
  });
  assert.ok(problems.some((p) => p.includes("hosted cloud enabled")));
  assert.ok(problems.some((p) => p.includes("auth.openwhispr.com")));
});

test("fails when any override points at an OpenWhispr-hosted host", () => {
  const problems = checkForkBuild({ VITE_DOCS_URL: "https://docs.openwhispr.com" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /VITE_DOCS_URL/);
});

test("does not flag look-alike hosts", () => {
  assert.deepEqual(checkForkBuild({ VITE_SITE_URL: "https://notopenwhispr.com.example" }), []);
});
