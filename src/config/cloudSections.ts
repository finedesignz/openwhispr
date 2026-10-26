// Settings sections that only make sense with a hosted account backend.
export const CLOUD_ONLY_SECTIONS: readonly string[] = ["account", "plansBilling", "workspace"];

/** Falls back to "general" when a cloud-only section is requested (deep link,
 * stale persisted state) while the hosted cloud is disabled. */
export function gateSettingsSection<T extends string>(
  section: T,
  cloudEnabled: boolean
): T | "general" {
  return !cloudEnabled && CLOUD_ONLY_SECTIONS.includes(section) ? "general" : section;
}
