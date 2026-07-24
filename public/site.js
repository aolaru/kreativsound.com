const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const navMenuToggle = document.getElementById("nav-menu-toggle");
const siteNav = navMenuToggle?.closest(".site-nav");

function setNavMenu(open) {
  if (!navMenuToggle || !siteNav) return;
  siteNav.dataset.menuOpen = String(open);
  navMenuToggle.setAttribute("aria-expanded", String(open));
  navMenuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

if (navMenuToggle && siteNav) {
  setNavMenu(false);
  navMenuToggle.addEventListener("click", () => {
    setNavMenu(navMenuToggle.getAttribute("aria-expanded") !== "true");
  });

  siteNav.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenuToggle.getAttribute("aria-expanded") === "true") {
      setNavMenu(false);
      navMenuToggle.focus();
    }
  });

  siteNav.querySelectorAll(".nav-group-right a").forEach((link) => {
    link.addEventListener("click", () => setNavMenu(false));
  });
}

const themeToggle = document.getElementById("theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function syncThemeUi(theme) {
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", theme === "dark" ? "#0d1018" : "#f8e9e9");
  }

  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.dataset.icon = isDark ? "sun" : "moon";
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeToggle.setAttribute("aria-pressed", String(isDark));
  }
}

syncThemeUi(getCurrentTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    syncThemeUi(nextTheme);
  });
}

const siteSearchForm = document.querySelector(".site-search");
const siteSearchInput = siteSearchForm?.querySelector(".site-search-input");

let searchIndexPromise;

function getSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = fetch("/search-index.json")
      .then((response) => (response.ok ? response.json() : []))
      .catch(() => []);
  }
  return searchIndexPromise;
}

function normalizeQuery(value) {
  return (value || "").trim().toLowerCase();
}

function scoreSearchEntry(entry, query) {
  const title = normalizeQuery(entry.title);
  const description = normalizeQuery(entry.description);
  const type = normalizeQuery(entry.type);
  const words = query.split(/\s+/).filter(Boolean);
  if (!title && !description && !type) return -1;
  if (title === query) return 100;
  if (title.startsWith(query)) return 80;
  if (title.includes(query)) return 60;
  if (type === query) return 45;
  if (type.includes(query)) return 40;
  if (description.includes(query)) return 30;
  if (words.length > 1 && words.every((word) => title.includes(word) || description.includes(word) || type.includes(word))) return 20;
  return -1;
}

function buildSearchDropdown() {
  if (!siteSearchForm || !siteSearchInput) return null;
  let dropdown = siteSearchForm.querySelector(".site-search-results");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "site-search-results";
    dropdown.className = "site-search-results";
    dropdown.hidden = true;
    dropdown.setAttribute("role", "listbox");
    siteSearchForm.appendChild(dropdown);
  }
  return dropdown;
}

function hideSearchDropdown() {
  const dropdown = siteSearchForm?.querySelector(".site-search-results");
  if (!dropdown) return;
  dropdown.hidden = true;
  dropdown.innerHTML = "";
  siteSearchInput?.removeAttribute("aria-activedescendant");
}

function renderSearchResults(results, query) {
  const dropdown = buildSearchDropdown();
  if (!dropdown || !siteSearchInput) return;

  if (!query) {
    hideSearchDropdown();
    siteSearchInput.setAttribute("aria-expanded", "false");
    return;
  }

  dropdown.innerHTML = "";
  if (!results.length) {
    const empty = document.createElement("p");
    empty.className = "site-search-empty";
    empty.setAttribute("role", "status");
    empty.textContent = "No quick matches. Press Enter to search the full catalog.";
    dropdown.appendChild(empty);
    dropdown.hidden = false;
    siteSearchInput.setAttribute("aria-expanded", "true");
    return;
  }

  results.forEach((result, index) => {
    const item = document.createElement("a");
    item.className = "site-search-result";
    item.href = result.url;
    item.id = `site-search-result-${index}`;
    item.setAttribute("role", "option");
    item.dataset.index = String(index);
    item.innerHTML = `
      <img class="site-search-result-thumb" src="${result.thumbnail || "/logo-128.svg"}" alt="" width="48" height="48" loading="lazy" decoding="async" />
      <span class="site-search-result-copy">
        <span class="site-search-result-meta">${result.type}</span>
        <span class="site-search-result-title">${result.title}</span>
        <span class="site-search-result-description">${result.description || ""}</span>
      </span>
    `;
    dropdown.appendChild(item);
  });

  dropdown.hidden = false;
  siteSearchInput.setAttribute("aria-expanded", "true");
}

async function getRankedResults(query) {
  const searchIndex = await getSearchIndex();
  return searchIndex
    .map((entry) => ({ ...entry, score: scoreSearchEntry(entry, query) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 6);
}

if (siteSearchForm && siteSearchInput) {
  let activeIndex = -1;

  siteSearchInput.setAttribute("autocomplete", "off");
  siteSearchInput.setAttribute("aria-autocomplete", "list");
  siteSearchInput.setAttribute("aria-expanded", "false");

  siteSearchInput.addEventListener("input", async () => {
    activeIndex = -1;
    const query = normalizeQuery(siteSearchInput.value);
    if (query.length < 2) {
      hideSearchDropdown();
      siteSearchInput.setAttribute("aria-expanded", "false");
      return;
    }
    renderSearchResults(await getRankedResults(query), query);
  });

  siteSearchInput.addEventListener("keydown", async (event) => {
    const dropdown = buildSearchDropdown();
    const items = dropdown ? Array.from(dropdown.querySelectorAll(".site-search-result")) : [];

    if (event.key === "Escape") {
      hideSearchDropdown();
      siteSearchInput.setAttribute("aria-expanded", "false");
      activeIndex = -1;
      return;
    }

    if (!items.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      items[activeIndex].click();
      return;
    } else {
      return;
    }

    items.forEach((item, index) => {
      item.classList.toggle("is-active", index === activeIndex);
      if (index === activeIndex) {
        siteSearchInput.setAttribute("aria-activedescendant", item.id);
      }
    });
  });

  siteSearchForm.addEventListener("submit", async (event) => {
    const query = normalizeQuery(siteSearchInput.value);
    if (!query) {
      event.preventDefault();
    }
  });

  document.addEventListener("click", (event) => {
    if (!siteSearchForm.contains(event.target)) {
      hideSearchDropdown();
      siteSearchInput.setAttribute("aria-expanded", "false");
    }
  });

  siteSearchForm.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!siteSearchForm.contains(document.activeElement)) {
        hideSearchDropdown();
        siteSearchInput.setAttribute("aria-expanded", "false");
      }
    }, 50);
  });
}

const catalog = document.querySelector("[data-product-catalog]");

if (catalog) {
  const queryInput = catalog.querySelector("[data-catalog-query]");
  const categoryButtons = Array.from(catalog.querySelectorAll("[data-catalog-category]"));
  const catalogItems = Array.from(catalog.querySelectorAll("[data-catalog-item]"));
  const catalogSections = Array.from(catalog.querySelectorAll("[data-catalog-section]"));
  const status = catalog.querySelector("[data-catalog-status]");
  let activeCategory = "all";

  function applyCatalogFilters() {
    const query = normalizeQuery(queryInput?.value);
    let visibleCount = 0;

    catalogItems.forEach((item) => {
      const categoryMatch = activeCategory === "all" || item.dataset.category === activeCategory;
      const queryMatch = !query || normalizeQuery(item.dataset.searchText).includes(query);
      const visible = categoryMatch && queryMatch;
      item.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    catalogSections.forEach((section) => {
      section.hidden = !section.querySelector("[data-catalog-item]:not([hidden])");
    });

    if (status) {
      status.textContent = `${visibleCount} ${visibleCount === 1 ? "product" : "products"} shown`;
    }
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.catalogCategory || "all";
      categoryButtons.forEach((candidate) => {
        const selected = candidate === button;
        candidate.classList.toggle("is-active", selected);
        candidate.setAttribute("aria-pressed", String(selected));
      });
      applyCatalogFilters();
    });
  });

  queryInput?.addEventListener("input", applyCatalogFilters);
  applyCatalogFilters();
}

const searchPage = document.querySelector("[data-search-page]");

if (searchPage) {
  const query = normalizeQuery(new URLSearchParams(window.location.search).get("q"));
  const input = searchPage.querySelector("[data-search-page-input]");
  const status = searchPage.querySelector("[data-search-page-status]");
  const resultsRoot = searchPage.querySelector("[data-search-page-results]");

  if (input) input.value = new URLSearchParams(window.location.search).get("q") || "";

  getSearchIndex().then((entries) => {
    const ranked = entries
      .map((entry) => ({ ...entry, score: scoreSearchEntry(entry, query) }))
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

    if (!query) {
      if (status) status.textContent = "Enter a product, album, artist, synth, format, guide, or tool.";
      return;
    }

    if (status) {
      status.textContent = ranked.length
        ? `${ranked.length} ${ranked.length === 1 ? "result" : "results"} for "${query}"`
        : `No results for "${query}"`;
    }

    if (!resultsRoot) return;
    resultsRoot.innerHTML = "";

    if (!ranked.length) {
      const empty = document.createElement("div");
      empty.className = "search-page-empty";
      const title = document.createElement("h2");
      title.textContent = "Nothing matched that search";
      const copy = document.createElement("p");
      copy.textContent = "Try a synth name such as Vital, FM8, Pigments, or JUN-6 V, or browse the complete sound catalog.";
      const link = document.createElement("a");
      link.className = "button primary";
      link.href = "/sounds/";
      link.textContent = "Browse all sounds";
      empty.append(title, copy, link);
      resultsRoot.appendChild(empty);
      return;
    }

    ranked.forEach((result) => {
      const item = document.createElement("a");
      item.className = "search-page-result";
      item.href = result.url;

      const image = document.createElement("img");
      image.src = result.thumbnail || "/logo-128.svg";
      image.alt = "";
      image.width = 72;
      image.height = 72;
      image.loading = "lazy";

      const copy = document.createElement("span");
      copy.className = "search-page-result-copy";
      const meta = document.createElement("span");
      meta.className = "site-search-result-meta";
      meta.textContent = result.type;
      const title = document.createElement("strong");
      title.textContent = result.title;
      const description = document.createElement("span");
      description.textContent = result.description;
      copy.append(meta, title, description);
      item.append(image, copy);
      resultsRoot.appendChild(item);
    });
  });
}

const consentPanel = document.querySelector("[data-privacy-consent]");
const consentAccept = consentPanel?.querySelector("[data-analytics-accept]");
const consentDecline = consentPanel?.querySelector("[data-analytics-decline]");
const privacySettingsButtons = document.querySelectorAll("[data-privacy-settings]");
const analyticsConsentKey = "kreativ-analytics-consent";

function getAnalyticsConsent() {
  try {
    const stored = localStorage.getItem(analyticsConsentKey);
    if (stored) return stored;
  } catch {}
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${analyticsConsentKey}=`));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

function showPrivacySettings() {
  if (!consentPanel) return;
  consentPanel.hidden = false;
  consentAccept?.focus();
}

function saveAnalyticsConsent(value) {
  let storedLocally = false;
  try {
    localStorage.setItem(analyticsConsentKey, value);
    storedLocally = true;
  } catch {}
  if (!storedLocally) {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${analyticsConsentKey}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
  }
  if (consentPanel) consentPanel.hidden = true;
  if (value === "accepted") {
    window.__loadKreativAnalytics?.();
  }
}

if (consentPanel && !getAnalyticsConsent()) {
  consentPanel.hidden = false;
}

consentAccept?.addEventListener("click", () => saveAnalyticsConsent("accepted"));
consentDecline?.addEventListener("click", () => saveAnalyticsConsent("declined"));
privacySettingsButtons.forEach((button) => button.addEventListener("click", showPrivacySettings));
