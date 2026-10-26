// Upstream-derived tests exercise the hosted-cloud code paths. The shipped fork config
// leaves every hosted URL empty (cloud disabled), so the suite opts in through env.
// Cloud-disabled behavior is covered by the pure policy tests (forkConfig, forkDefaults).
const defaults = {
  VITE_OPENWHISPR_API_URL: "https://api.test.invalid",
  VITE_AUTH_URL: "https://auth.test.invalid",
  VITE_SITE_URL: "https://openwhispr.com",
  VITE_DOCS_URL: "https://docs.openwhispr.com",
  VITE_MCP_URL: "https://mcp.openwhispr.com/mcp",
  VITE_SHARE_VIEWER_URL: "https://notes.openwhispr.com",
  VITE_SUPPORT_EMAIL: "support@openwhispr.com",
  VITE_ORUKEET_BASE_URL: "https://orukeet.gizmovoice.ai",
};
for (const [key, value] of Object.entries(defaults)) process.env[key] ||= value;
