import registry from "../models/modelRegistryData.json";
import { forkSttLanguageMismatch } from "./forkDefaults";

type ParakeetEntry = { language?: string };
const parakeet =
  (registry as { parakeetModels?: Record<string, ParakeetEntry> }).parakeetModels ?? {};

/** True when the chosen dictation language can't work on the fork's STT model (STT-04). */
export function showForkSttLanguageWarning(
  settings: Parameters<typeof forkSttLanguageMismatch>[0]
): boolean {
  return forkSttLanguageMismatch(settings, (model) => parakeet[model]?.language);
}
