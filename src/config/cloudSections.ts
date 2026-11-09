// Settings sections that only make sense with a hosted account backend.
export const CLOUD_ONLY_SECTIONS: readonly string[] = ["account", "plansBilling", "workspace"];

/** Falls back to "general" when a cloud-only section is requested (deep link,
 * stale persisted state) while the hosted cloud is disabled. */
// Sections that replace the cloud account when the fork runs on Titanium instead.
export const CLOUD_DISABLED_ONLY_SECTIONS: readonly string[] = ["titaniumAccount"];

export function gateSettingsSection<T extends string>(
  section: T,
  cloudEnabled: boolean
): T | "general" {
  if (!cloudEnabled && CLOUD_ONLY_SECTIONS.includes(section)) return "general";
  if (cloudEnabled && CLOUD_DISABLED_ONLY_SECTIONS.includes(section)) return "general";
  return section;
}
