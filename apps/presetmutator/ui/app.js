const state = {
  seeds: [],
  selectedSeed: null,
};

const elements = {
  seedList: document.querySelector("#seed-list"),
  seedCount: document.querySelector("#seed-count"),
  selectedSeed: document.querySelector("#selected-seed"),
  amountRange: document.querySelector("#amount-range"),
  amountValue: document.querySelector("#amount-value"),
  maxParametersRange: document.querySelector("#max-parameters-range"),
  maxParametersValue: document.querySelector("#max-parameters-value"),
  randomSeed: document.querySelector("#random-seed"),
  generateButton: document.querySelector("#generate-button"),
  refreshButton: document.querySelector("#refresh-button"),
  resultEmpty: document.querySelector("#result-empty"),
  resultPanel: document.querySelector("#result-panel"),
  resultFile: document.querySelector("#result-file"),
  resultPath: document.querySelector("#result-path"),
  resultSample: document.querySelector("#result-sample"),
  resultModulations: document.querySelector("#result-modulations"),
  resultWavetables: document.querySelector("#result-wavetables"),
  changedParameters: document.querySelector("#changed-parameters"),
  template: document.querySelector("#seed-item-template"),
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

function renderSeeds() {
  elements.seedList.innerHTML = "";
  elements.seedCount.textContent = `${state.seeds.length} seeds`;

  for (const seed of state.seeds) {
    const node = elements.template.content.firstElementChild.cloneNode(true);
    node.querySelector(".seed-item-name").textContent = seed.file.replace(/\.vital$/, "");
    node.querySelector(".seed-item-style").textContent = seed.preset_style || "Vital";
    node.querySelector(".seed-item-comments").textContent = seed.comments || "No description";
    node.querySelector(".seed-item-author").textContent = seed.author || "Unknown author";
    node.querySelector(".seed-item-sample").textContent = `Sample: ${seed.summary.sample_name || "None"}`;
    if (state.selectedSeed?.file === seed.file) {
      node.classList.add("selected");
    }
    node.addEventListener("click", () => {
      state.selectedSeed = seed;
      elements.selectedSeed.value = seed.file;
      renderSeeds();
    });
    elements.seedList.appendChild(node);
  }

  if (!state.selectedSeed && state.seeds[0]) {
    state.selectedSeed = state.seeds[0];
    elements.selectedSeed.value = state.selectedSeed.file;
    renderSeeds();
  }
}

function renderSliderValues() {
  elements.amountValue.textContent = Number(elements.amountRange.value).toFixed(2);
  elements.maxParametersValue.textContent = elements.maxParametersRange.value;
}

function renderResult(result) {
  elements.resultEmpty.classList.add("hidden");
  elements.resultPanel.classList.remove("hidden");
  elements.resultFile.textContent = result.file;
  elements.resultPath.textContent = result.path;
  elements.resultSample.textContent = result.summary.sample_name || "None";
  elements.resultModulations.textContent = String(result.summary.modulation_count);
  elements.resultWavetables.textContent = String(result.summary.wavetable_count);
  elements.changedParameters.innerHTML = "";
  for (const parameter of result.changed_parameters) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = parameter;
    elements.changedParameters.appendChild(chip);
  }
}

async function loadSeeds() {
  const payload = await fetchJson("/api/vital/seeds");
  state.seeds = payload.items;
  if (state.selectedSeed) {
    state.selectedSeed = state.seeds.find((seed) => seed.file === state.selectedSeed.file) || state.seeds[0] || null;
  }
  renderSeeds();
}

async function generateVariant() {
  if (!state.selectedSeed) {
    alert("Select a Vital seed first.");
    return;
  }

  elements.generateButton.disabled = true;
  elements.generateButton.textContent = "Generating...";
  try {
    const payload = await fetchJson("/api/vital/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seed_file: state.selectedSeed.file,
        amount: Number(elements.amountRange.value),
        max_parameters: Number(elements.maxParametersRange.value),
        seed: elements.randomSeed.value === "" ? null : Number(elements.randomSeed.value),
      }),
    });
    renderResult(payload);
  } catch (error) {
    alert(error.message);
  } finally {
    elements.generateButton.disabled = false;
    elements.generateButton.textContent = "Generate Variant";
  }
}

elements.amountRange.addEventListener("input", renderSliderValues);
elements.maxParametersRange.addEventListener("input", renderSliderValues);
elements.generateButton.addEventListener("click", generateVariant);
elements.refreshButton.addEventListener("click", loadSeeds);

renderSliderValues();
loadSeeds().catch((error) => {
  elements.seedList.innerHTML = `<p class="empty-state">${error.message}</p>`;
});
