const test = require("node:test");
const assert = require("node:assert/strict");

const STT = { baseUrl: "https://stt.example/v1", model: "parakeet-unified-en-0.6b" };
const registry = {
  "parakeet-unified-en-0.6b": "en",
  "parakeet-tdt-0.6b-v3": "multilingual",
};
const lang = (m) => registry[m];
const base = {
  cloudTranscriptionProvider: "custom",
  cloudTranscriptionBaseUrl: "https://stt.example/v1",
  cloudTranscriptionModel: "parakeet-unified-en-0.6b",
};

test("warns for a non-English language on our English-only STT model", async () => {
  const { forkSttLanguageMismatch } = await import("../../src/config/forkDefaults.ts");
  assert.equal(forkSttLanguageMismatch({ ...base, preferredLanguage: "de" }, lang, STT), true);
  assert.equal(forkSttLanguageMismatch({ ...base, preferredLanguage: "en" }, lang, STT), false);
  assert.equal(forkSttLanguageMismatch({ ...base, preferredLanguage: "auto" }, lang, STT), false);
});

test("stays quiet for multilingual models, other hosts, other providers and local mode", async () => {
  const { forkSttLanguageMismatch } = await import("../../src/config/forkDefaults.ts");
  const de = { ...base, preferredLanguage: "de" };
  assert.equal(
    forkSttLanguageMismatch({ ...de, cloudTranscriptionModel: "parakeet-tdt-0.6b-v3" }, lang, STT),
    false
  );
  assert.equal(
    forkSttLanguageMismatch(
      { ...de, cloudTranscriptionBaseUrl: "https://other.example/v1" },
      lang,
      STT
    ),
    false
  );
  assert.equal(
    forkSttLanguageMismatch({ ...de, cloudTranscriptionProvider: "openai" }, lang, STT),
    false
  );
  assert.equal(forkSttLanguageMismatch({ ...de, useLocalWhisper: true }, lang, STT), false);
});
