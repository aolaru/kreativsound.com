const LICENSE_STORAGE_KEY = "preset-mutator-pro-license";
const LEGACY_UNLOCK_KEYS = [
  "kreativ-sound-tools-unlocked",
  "preset-mutator-pro-preview-unlocked",
];
const LICENSE_PRODUCT = "preset-mutator-pro";
const LICENSE_PUBLIC_KEY = {
  kty: "EC",
  x: "c5RUK0LbcIkxe1wgnoSp4FOJiv1tVY1tYY4ngti4Lfs",
  y: "Qq2Gb5rx3DFu9dlPDJcH-VcL9ozoF7KHe8cz_QmQ9YM",
  crv: "P-256",
  ext: true,
  key_ops: ["verify"],
};

let importedPublicKeyPromise = null;

function normalizeToken(token) {
  return String(token || "").replace(/\s+/g, "");
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function decodePayload(encodedPayload) {
  const bytes = base64UrlToBytes(encodedPayload);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function encodedMessage(encodedPayload) {
  return new TextEncoder().encode(encodedPayload);
}

function publicKey() {
  if (!importedPublicKeyPromise) {
    importedPublicKeyPromise = window.crypto.subtle.importKey(
      "jwk",
      LICENSE_PUBLIC_KEY,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
  }
  return importedPublicKeyPromise;
}

export function getStoredLicenseToken() {
  return normalizeToken(window.localStorage.getItem(LICENSE_STORAGE_KEY));
}

export function saveLicenseToken(token) {
  window.localStorage.setItem(LICENSE_STORAGE_KEY, normalizeToken(token));
  for (const key of LEGACY_UNLOCK_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export function clearLicenseToken() {
  window.localStorage.removeItem(LICENSE_STORAGE_KEY);
}

export function hasLegacyUnlock() {
  return LEGACY_UNLOCK_KEYS.some((key) => window.localStorage.getItem(key) === "1");
}

export function clearLegacyUnlocks() {
  for (const key of LEGACY_UNLOCK_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export async function verifyLicenseToken(token) {
  const normalized = normalizeToken(token);
  const [encodedPayload, encodedSignature] = normalized.split(".");
  if (!encodedPayload || !encodedSignature) {
    return { valid: false, reason: "format" };
  }

  try {
    const payload = decodePayload(encodedPayload);
    if (payload.product !== LICENSE_PRODUCT) {
      return { valid: false, reason: "product" };
    }

    const now = Date.now();
    if (payload.notBefore && now < Date.parse(payload.notBefore)) {
      return { valid: false, reason: "not_before" };
    }
    if (payload.expiresAt && now > Date.parse(payload.expiresAt)) {
      return { valid: false, reason: "expired" };
    }

    const valid = await window.crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      await publicKey(),
      base64UrlToBytes(encodedSignature),
      encodedMessage(encodedPayload),
    );

    return valid ? { valid: true, payload } : { valid: false, reason: "signature" };
  } catch (error) {
    return { valid: false, reason: "invalid" };
  }
}

export function licenseOwnerLabel(payload) {
  if (!payload) {
    return "";
  }
  if (payload.email) {
    return payload.email;
  }
  if (payload.orderId) {
    return payload.orderId;
  }
  return "licensed customer";
}
