const test = require("node:test");
const assert = require("node:assert/strict");

test("cloud disabled: defaults to Custom provider on the fork STT API, never openwhispr", async () => {
  const { resolveForkDefaults } = await import("../../src/config/forkDefaults.ts");
  const stt = { baseUrl: "https://stt.example/v1", model: "m1" };
  const d = resolveForkDefaults(false, stt);
  assert.equal(d.inferenceMode, "providers");
  assert.equal(d.cloudMode, "byok");
  assert.equal(d.transcriptionProvider, "custom");
  assert.equal(d.transcriptionBaseUrl, stt.baseUrl);
  assert.equal(d.transcriptionModel, "m1");
  assert.equal(d.coerceInferenceMode("openwhispr"), "providers");
  assert.equal(d.coerceInferenceMode("local"), "local");
  assert.equal(d.coerceCloudMode("openwhispr"), "byok");
});

test("cloud enabled: upstream defaults preserved", async () => {
  const { resolveForkDefaults } = await import("../../src/config/forkDefaults.ts");
  const d = resolveForkDefaults(true);
  assert.equal(d.inferenceMode, "openwhispr");
  assert.equal(d.transcriptionProvider, null);
  assert.equal(d.coerceInferenceMode("openwhispr"), "openwhispr");
});

test("cloud-disabled defaults resolve to a valid http-batch custom route", async () => {
  const { resolveForkDefaults } = await import("../../src/config/forkDefaults.ts");
  const { resolveTranscriptionRoute } = await import("../../src/helpers/transcriptionRoute.ts");
  const d = resolveForkDefaults(false, { baseUrl: "https://stt.example/v1", model: "m1" });
  const route = resolveTranscriptionRoute({
    settings: {
      transcriptionMode: d.inferenceMode,
      cloudTranscriptionProvider: d.transcriptionProvider,
      cloudTranscriptionModel: d.transcriptionModel,
      cloudTranscriptionBaseUrl: d.transcriptionBaseUrl,
    },
    providers: [],
  });
  assert.equal(route.transport, "http-batch");
  assert.equal(route.provider, "custom");
  assert.equal(route.model, "m1");
  assert.match(route.endpoint, /^https:\/\/stt\.example\/v1\//);
});
