// First-launch migration from an existing OpenWhispr install (BRAND-03).
//
// Titanium Whisper has its own app id, so Electron gives it a new userData folder and
// an OpenWhispr user would start from scratch. On the first launch (the new folder
// does not exist yet) we copy the newest legacy folder into place: settings (.env and
// localStorage), history and notes (SQLite), encrypted keys (secure-keys plus the
// "Local State" file holding their safeStorage key), connector logins and downloads
// that live under userData. The legacy folder is never modified, so OpenWhispr keeps
// working side by side. Models live in ~/.cache/openwhispr and need no copy.
const fs = require("fs");
const path = require("path");

const MARKER = ".migrated-from.json";
const PENDING_SUFFIX = ".migration-pending";

// Chromium/Electron runtime state that must not be copied: singleton locks of a
// possibly running OpenWhispr, and caches that are rebuilt on demand.
const SKIP_NAMES = new Set([
  "SingletonLock",
  "SingletonSocket",
  "SingletonCookie",
  "lockfile",
  "Cache",
  "Code Cache",
  "GPUCache",
  "DawnCache",
  "DawnGraphiteCache",
  "DawnWebGPUCache",
  "GrShaderCache",
  "ShaderCache",
  "Crashpad",
  "logs",
]);

function newestLegacyDir(appDataDir, legacyNames, fsImpl) {
  let best = null;
  for (const name of legacyNames || []) {
    const dir = path.join(appDataDir, name);
    let stat;
    try {
      stat = fsImpl.statSync(dir);
    } catch {
      continue;
    }
    if (!stat.isDirectory()) continue;
    if (!best || stat.mtimeMs > best.mtimeMs) best = { dir, name, mtimeMs: stat.mtimeMs };
  }
  return best;
}

/**
 * Copy the newest legacy userData folder into `targetDir` when `targetDir` does not exist.
 * Returns { migrated: boolean, from?: string, reason?: string }. Never throws: a failed
 * copy removes the partial target so the next launch retries, and the app starts fresh.
 */
function migrateLegacyUserData({
  appDataDir,
  targetDir,
  legacyNames,
  fsImpl = fs,
  now = () => new Date(),
}) {
  if (!appDataDir || !targetDir) return { migrated: false, reason: "no_paths" };
  const pendingFlag = `${targetDir}${PENDING_SUFFIX}`;
  if (fsImpl.existsSync(targetDir)) {
    // A previous launch's copy failed and the app then started with a fresh profile.
    // Retry: set that fresh profile aside (never delete it) and migrate again.
    if (!fsImpl.existsSync(pendingFlag) || fsImpl.existsSync(path.join(targetDir, MARKER))) {
      return { migrated: false, reason: "target_exists" };
    }
    try {
      fsImpl.renameSync(targetDir, `${targetDir}.unmigrated-${now().getTime()}`);
    } catch (error) {
      return { migrated: false, reason: "copy_failed", error: error?.message };
    }
  }

  const legacy = newestLegacyDir(appDataDir, legacyNames, fsImpl);
  if (!legacy) return { migrated: false, reason: "no_legacy" };
  if (path.resolve(legacy.dir) === path.resolve(targetDir)) {
    return { migrated: false, reason: "same_dir" };
  }

  const staging = `${targetDir}.migrating`;
  try {
    fsImpl.rmSync(staging, { recursive: true, force: true });
    fsImpl.cpSync(legacy.dir, staging, {
      recursive: true,
      errorOnExist: false,
      force: true,
      filter: (src) => !SKIP_NAMES.has(path.basename(src)),
    });
    fsImpl.writeFileSync(
      path.join(staging, MARKER),
      JSON.stringify({ from: legacy.dir, at: now().toISOString() }, null, 2)
    );
    // Rename last, so a crash mid-copy never leaves a half-migrated profile in place.
    fsImpl.renameSync(staging, targetDir);
    try {
      fsImpl.rmSync(pendingFlag, { force: true });
    } catch {}
    return { migrated: true, from: legacy.dir };
  } catch (error) {
    try {
      fsImpl.rmSync(staging, { recursive: true, force: true });
    } catch {}
    // Remember the failure so the next launch retries, even though this launch
    // goes on to create a fresh profile at targetDir.
    try {
      fsImpl.writeFileSync(
        pendingFlag,
        JSON.stringify({ from: legacy.dir, error: error?.message })
      );
    } catch {}
    return { migrated: false, reason: "copy_failed", error: error?.message };
  }
}

module.exports = { migrateLegacyUserData, MARKER, SKIP_NAMES, PENDING_SUFFIX };
