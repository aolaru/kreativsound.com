import { verifyLicenseToken as verifyOnlineLicense, clearLicenseToken as clearOnlineLicense } from "./license.js";
export * from "./license.js";

const LICENSE_PRODUCT = "preset-mutator-pro";
const VERIFIED_LICENSE_STORAGE_KEY = "preset-mutator-pro-verified-license";
const OFFLINE_GRACE_MS = 30 * 24 * 60 * 60 * 1000;

function clearVerifiedLicense() {
  window.localStorage.removeItem(VERIFIED_LICENSE_STORAGE_KEY);
}

export function clearLicenseToken() {
  clearOnlineLicense();
  clearVerifiedLicense();
}

function offlineLicense(key) {
  try {
    const receipt = JSON.parse(window.localStorage.getItem(VERIFIED_LICENSE_STORAGE_KEY));
    const age = Date.now() - receipt.verifiedAt;
    if (receipt.key !== key || receipt.payload?.product !== LICENSE_PRODUCT
      || !Number.isFinite(age) || age < 0 || age > OFFLINE_GRACE_MS) return null;
    return { valid: true, payload: { ...receipt.payload, offline: true }, offline: true };
  } catch { return null; }
}

function rememberVerifiedLicense(key, payload) {
  try {
    window.localStorage.setItem(VERIFIED_LICENSE_STORAGE_KEY, JSON.stringify({
      key, verifiedAt: Date.now(), payload: {
        product: payload.product, email: payload.email, orderId: payload.orderId,
      },
    }));
  } catch {
    // A valid online activation still works if browser storage is unavailable.
  }
}

export async function verifyLicenseToken(token) {
  const normalized = String(token || "").replace(/\s+/g, "");
  if (normalized.includes(".")) return verifyOnlineLicense(normalized);
  const key = normalized.toUpperCase();
  if (!key) return { valid: false, reason: "format" };
  const cached = offlineLicense(key);
  if (window.navigator?.onLine === false && cached) return cached;
  const result = await verifyOnlineLicense(key);
  if (result.valid) rememberVerifiedLicense(key, result.payload);
  else if (result.reason === "network") return cached || result;
  else clearVerifiedLicense();
  return result;
}
