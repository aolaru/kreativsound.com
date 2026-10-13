import {
  clearLegacyUnlocks,
  clearLicenseToken,
  getStoredLicenseToken,
  hasLegacyUnlock,
  licenseOwnerLabel,
  saveLicenseToken,
  verifyLicenseToken,
} from "./engine/license.js";

const elements = {
  panel: document.querySelector("#pro-license-panel"),
  checking: document.querySelector("#pro-license-checking"),
  form: document.querySelector("#pro-license-form"),
  key: document.querySelector("#pro-license-key"),
  activate: document.querySelector("#pro-license-activate"),
  note: document.querySelector("#pro-license-note"),
  active: document.querySelector("#pro-license-active"),
  owner: document.querySelector("#pro-license-owner"),
  workspaces: document.querySelectorAll("[data-pro-workspace]"),
};

function setLicenseState(status, payload = null) {
  document.body.dataset.licenseState = status;
  const unlocked = status === "unlocked";
  elements.checking.hidden = status !== "checking";
  elements.form.hidden = status !== "locked";
  elements.active.hidden = !unlocked;
  elements.workspaces.forEach((workspace) => {
    workspace.inert = !unlocked;
  });

  if (unlocked) {
    elements.owner.textContent = `Shared Pro access verified for ${licenseOwnerLabel(payload)}.`;
    window.dispatchEvent(new CustomEvent("wave-mutator-pro-license-change", {
      detail: { unlocked: true, payload },
    }));
    window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }
}

async function verifyAndUnlock(token, options = {}) {
  const normalized = String(token || "").trim();
  if (!normalized) {
    setLicenseState("locked");
    elements.note.textContent = "Enter the Gumroad key from your Preset Mutator Pro receipt or an earlier signed token.";
    return false;
  }

  elements.activate.disabled = true;
  elements.note.textContent = options.restoring
    ? "Checking saved Pro access..."
    : "Checking the Preset Mutator Pro license...";
  const result = await verifyLicenseToken(normalized);
  elements.activate.disabled = false;

  if (!result.valid) {
    setLicenseState("locked");
    elements.note.textContent = result.reason === "network"
      ? "License verification is temporarily unavailable. Check your connection and try again."
      : "This Preset Mutator Pro license could not be verified.";
    if (options.restoring && result.reason !== "network") {
      clearLicenseToken();
    }
    return false;
  }

  saveLicenseToken(normalized);
  clearLegacyUnlocks();
  elements.key.value = "";
  setLicenseState("unlocked", result.payload);
  return true;
}

async function restoreLicense() {
  const storedToken = getStoredLicenseToken();
  if (storedToken && await verifyAndUnlock(storedToken, { restoring: true })) {
    return;
  }
  if (hasLegacyUnlock()) {
    clearLegacyUnlocks();
  }
  setLicenseState("locked");
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await verifyAndUnlock(elements.key.value);
});

window.addEventListener("storage", (event) => {
  if (event.key === "preset-mutator-pro-license" && event.newValue) {
    setLicenseState("checking");
    verifyAndUnlock(event.newValue, { restoring: true });
  }
});

await restoreLicense();

window.waveMutatorProLicense = {
  restoreLicense,
  verifyAndUnlock,
};
