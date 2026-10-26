// Fork-owned defaults, applied only where no stored user setting exists.
// With the hosted cloud disabled, nothing may default to an "openwhispr" route:
// transcription defaults to the Custom provider pointing at our STT API.
import { CLOUD_ENABLED, DEFAULT_STT } from "./forkRuntime.ts";

export function resolveForkDefaults(cloudEnabled: boolean, stt = DEFAULT_STT) {
  return {
    inferenceMode: cloudEnabled ? "openwhispr" : "providers",
    cloudMode: cloudEnabled ? "openwhispr" : "byok",
    transcriptionProvider: cloudEnabled ? null : "custom",
    transcriptionModel: cloudEnabled ? null : stt.model,
    transcriptionBaseUrl: cloudEnabled ? null : stt.baseUrl,
    // A stored "openwhispr" route cannot work without a backend.
    coerceInferenceMode: (value: string) =>
      !cloudEnabled && value === "openwhispr" ? "providers" : value,
    coerceCloudMode: (value: string) => (!cloudEnabled && value === "openwhispr" ? "byok" : value),
  };
}

export const FORK_DEFAULTS = resolveForkDefaults(CLOUD_ENABLED);
