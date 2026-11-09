// Offline verification of a Titanium (Keygen CE) license key, `key/<payload>.<sig>`.
//
// Port of parseAndVerifyLicenseKey from @titanium-labs/license-client 1.3.0
// (finedesignz/titanium-licensing packages/license-client/src/validator.ts). The SDK
// is only published to GitHub Packages and pulls in ioredis for its blocklist step,
// which a desktop client must not hold credentials for, so the desktop runs these
// steps itself and revocation is enforced by our servers (stt-api, search) instead.
// Order is the SDK's and must not change:
//   1. structural parse  2. Ed25519 verify (before trusting the payload)
//   3. decode payload    4. product match   5. expiry
const { createPublicKey, verify } = require("crypto");

// DER SubjectPublicKeyInfo prefix for a raw 32-byte Ed25519 key.
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const HEX_ED25519_RE = /^[0-9a-fA-F]{64}$/;

class LicenseKeyError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "LicenseKeyError";
    this.code = code; // "tampered" | "audience_mismatch" | "expired" | "unconfigured"
  }
}

const keyCache = new Map();

function loadPublicKey(publicKey) {
  const trimmed = String(publicKey || "").trim();
  if (keyCache.has(trimmed)) return keyCache.get(trimmed);
  let key;
  if (HEX_ED25519_RE.test(trimmed)) {
    key = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(trimmed, "hex")]),
      format: "der",
      type: "spki",
    });
  } else if (trimmed.includes("-----BEGIN PUBLIC KEY-----")) {
    key = createPublicKey(trimmed.replace(/\\n/g, "\n"));
  } else {
    throw new LicenseKeyError("unconfigured", "Titanium public key is not configured");
  }
  keyCache.set(trimmed, key);
  return key;
}

function base64urlDecode(value) {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/**
 * Verify a license key offline. Returns the decoded payload
 * ({ account, product, policy, user, license }) or throws LicenseKeyError.
 */
function parseAndVerifyLicenseKey(licenseKey, { publicKey, productId, now = Date.now }) {
  if (!productId) throw new LicenseKeyError("unconfigured", "Titanium product id is not set");

  // 1. Structural parse: split on the FIRST dot.
  if (typeof licenseKey !== "string" || !licenseKey.startsWith("key/")) {
    throw new LicenseKeyError("tampered", "malformed license key (missing key/ prefix)");
  }
  const dot = licenseKey.indexOf(".");
  if (dot < 0) throw new LicenseKeyError("tampered", "malformed license key (no signature)");
  const signingInput = licenseKey.slice(0, dot);
  const sigB64 = licenseKey.slice(dot + 1);
  const payloadB64 = signingInput.slice(4);
  if (!payloadB64 || !sigB64) {
    throw new LicenseKeyError("tampered", "malformed license key (empty payload or signature)");
  }

  // 2. Signature over the ASCII bytes of "key/<payload>", before trusting the payload.
  const signature = base64urlDecode(sigB64);
  if (signature.length !== 64) {
    throw new LicenseKeyError("tampered", `signature is ${signature.length} bytes, expected 64`);
  }
  let verified = false;
  try {
    verified = verify(
      null,
      Buffer.from(signingInput, "ascii"),
      loadPublicKey(publicKey),
      signature
    );
  } catch (error) {
    if (error instanceof LicenseKeyError) throw error;
    throw new LicenseKeyError("tampered", error?.message || "signature verification error");
  }
  if (!verified) throw new LicenseKeyError("tampered", "Ed25519 signature verification failed");

  // 3. Decode.
  let payload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString("utf8"));
  } catch {
    throw new LicenseKeyError("tampered", "payload not JSON");
  }
  if (!payload?.product?.id || !payload?.license?.id) {
    throw new LicenseKeyError("tampered", "payload missing required fields");
  }

  // 4. Product match: a key for another Titanium app is not ours.
  if (payload.product.id !== productId) {
    throw new LicenseKeyError("audience_mismatch", "license key is for another product");
  }

  // 5. Expiry: null is perpetual; a key expiring exactly now is expired.
  if (payload.license.expiry != null) {
    const expiry = new Date(payload.license.expiry);
    if (Number.isNaN(expiry.getTime())) {
      throw new LicenseKeyError("tampered", "license.expiry is not a valid date");
    }
    if (expiry.getTime() <= now()) throw new LicenseKeyError("expired", "license has expired");
  }

  return payload;
}

module.exports = { parseAndVerifyLicenseKey, LicenseKeyError };
