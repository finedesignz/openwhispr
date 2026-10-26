// Fork-owned configuration seam (renderer). Mirrors forkConfig.js (main process).
// Empty API_URL or AUTH_URL means the hosted cloud is disabled.
import fork from "./fork.config.json";

const env = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ??
  {}) as Record<string, string | undefined>;

const strip = (value: string) => value.replace(/\/+$/, "");

export const API_URL = strip(env.VITE_OPENWHISPR_API_URL || fork.API_URL || "");
export const AUTH_URL = strip(env.VITE_AUTH_URL || fork.AUTH_URL || "");
export const ADMIN_URL = strip(env.VITE_ADMIN_URL || fork.ADMIN_URL || "");
export const SITE_URL = strip(fork.SITE_URL || "");
export const DOCS_URL = strip(fork.DOCS_URL || "");
export const SUPPORT_EMAIL = fork.SUPPORT_EMAIL || "";
export const SHARE_VIEWER_URL = strip(fork.SHARE_VIEWER_URL || "");
export const MCP_URL = fork.MCP_URL || "";
export const BRAND_NAME = fork.BRAND_NAME;
export const DEFAULT_STT = fork.DEFAULT_STT;
export const CLOUD_ENABLED = Boolean(API_URL && AUTH_URL);
export const REPO_URL = strip(fork.REPO_URL || "");
export const COMMUNITY_URL = strip(fork.COMMUNITY_URL || "");
