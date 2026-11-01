import { COMPONENTS, normalizeVariationOptions } from "./engine/variation-controls.js";

export function mountProVariationControls() {
  const host = document.querySelector("[data-pro-variation-controls]");
  if (!host) return { read: () => normalizeVariationOptions() };
  const storageKey = "preset-mutator-pro-variation-controls-v1";
  let options;
  try { options = normalizeVariationOptions(JSON.parse(localStorage.getItem(storageKey)) || {}); }
  catch { options = normalizeVariationOptions(); }
  host.innerHTML = `
    <fieldset class="variation-directions">
      <legend>Variation direction</legend>
      <div class="variation-direction-options">
        <label title="Subtle variations that retain the source architecture and use a narrower variation range."><input type="radio" name="variation-direction" value="stay-close"><span>Stay close</span></label>
        <label title="Balanced variation across layers, tone, motion, and space."><input type="radio" name="variation-direction" value="explore"><span>Explore</span></label>
        <label title="Rebalance sound layers and reshape envelopes with a wider variation range."><input type="radio" name="variation-direction" value="reimagine"><span>Reimagine</span></label>
      </div>
    </fieldset>
    <fieldset class="component-locks">
      <legend>Component locks</legend>
      <div class="component-lock-options">
        ${COMPONENTS.map((key) => `<label title="${key[0].toUpperCase() + key.slice(1)}: preserve the loaded preset component, or hold the current intent/audio baseline in generated modes."><input type="checkbox" data-component-lock="${key}"><i class="fa-solid fa-lock" aria-hidden="true"></i><span>${key[0].toUpperCase() + key.slice(1)}</span></label>`).join("")}
      </div>
    </fieldset>`;
  const directionInputs = [...host.querySelectorAll('[name="variation-direction"]')];
  const lockInputs = [...host.querySelectorAll("[data-component-lock]")];
  for (const input of directionInputs) input.checked = input.value === options.direction;
  for (const input of lockInputs) input.checked = options.locks[input.dataset.componentLock];
  const read = () => normalizeVariationOptions({
    direction: directionInputs.find((input) => input.checked)?.value,
    locks: Object.fromEntries(lockInputs.map((input) => [input.dataset.componentLock, input.checked])),
  });
  host.addEventListener("change", () => {
    options = read();
    try { localStorage.setItem(storageKey, JSON.stringify(options)); } catch {}
  });
  return { read };
}
