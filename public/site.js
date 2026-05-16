const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
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
  if (!title && !description) return -1;
  if (title === query) return 100;
  if (title.startsWith(query)) return 80;
  if (title.includes(query)) return 60;
  if (description.includes(query)) return 30;
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

  if (!query || !results.length) {
    hideSearchDropdown();
    siteSearchInput.setAttribute("aria-expanded", "false");
    return;
  }

  dropdown.innerHTML = "";
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
      if (event.key === "Enter") {
        const query = normalizeQuery(siteSearchInput.value);
        if (!query) return;
        event.preventDefault();
        const [first] = await getRankedResults(query);
        if (first) {
          window.location.href = first.url;
        } else {
          siteSearchForm.submit();
        }
      }
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
      return;
    }

    const [first] = await getRankedResults(query);
    if (first) {
      event.preventDefault();
      window.location.href = first.url;
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
