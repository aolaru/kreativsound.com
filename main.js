const products = window.KREATIV_PRODUCTS || [];

document.getElementById("year").textContent = new Date().getFullYear();

const themeToggle = document.getElementById("theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const container = document.getElementById("catalog-groups");
const emailForm = document.getElementById("email-form");
const emailInput = document.getElementById("email-input");

const preferredCategoryOrder = ["Presets", "Samples", "Free"];
const discoveredCategories = Array.from(new Set(products.map((product) => product.category)));
const categories = [
  ...preferredCategoryOrder.filter((category) => discoveredCategories.includes(category)),
  ...discoveredCategories.filter((category) => !preferredCategoryOrder.includes(category))
];

function getCurrentTheme() {
  const activeTheme = document.documentElement.getAttribute("data-theme");
  return activeTheme === "light" ? "light" : "dark";
}

function applyThemeUi(theme) {
  if (!themeToggle || !themeColorMeta) {
    return;
  }
  const isLight = theme === "light";
  themeToggle.textContent = isLight ? "Dark Theme" : "Light Theme";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeColorMeta.setAttribute("content", isLight ? "#f8e9e9" : "#0f1526");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyThemeUi(nextTheme);
  });
}

if (emailForm && emailInput) {
  emailForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }
    const email = emailInput.value.trim();
    const subject = encodeURIComponent("Kreativ Sound release updates");
    const body = encodeURIComponent(
      "Please add this email to Kreativ Sound updates:\n\n" + email + "\n\nSent from kreativsound.com"
    );
    window.location.href = "mailto:andrei.olaru@gmail.com?subject=" + subject + "&body=" + body;
    emailForm.reset();
  });
}

function renderCatalog() {
  container.innerHTML = "";
  let visualIndex = 0;
  categories.forEach((category) => {
    const categoryItems = products.filter((product) => product.category === category);
    if (!categoryItems.length) {
      return;
    }

    const section = document.createElement("section");
    section.className = "catalog-group";

    const heading = document.createElement("h3");
    heading.textContent = category;
    section.appendChild(heading);

    const grid = document.createElement("ul");
    grid.className = "product-grid";

    categoryItems.forEach((item) => {
      const listItem = document.createElement("li");

      const link = document.createElement("a");
      link.className = "product-card";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", item.title);

      const img = document.createElement("img");
      img.className = "product-thumb";
      img.src = item.thumbnail || "logo-128.svg";
      img.alt = item.title + " thumbnail";
      img.width = 128;
      img.height = 128;
      img.loading = "eager";
      img.decoding = "async";
      img.fetchPriority = visualIndex < 6 ? "high" : "auto";

      const title = document.createElement("span");
      title.className = "product-title";
      title.textContent = item.title;

      const meta = document.createElement("span");
      meta.className = "product-meta";
      meta.textContent = item.format + " | " + item.count;

      const useCase = document.createElement("span");
      useCase.className = "product-use";
      useCase.textContent = item.useCase;

      link.appendChild(img);
      link.appendChild(title);
      link.appendChild(meta);
      link.appendChild(useCase);

      listItem.appendChild(link);
      grid.appendChild(listItem);
      visualIndex += 1;
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

applyThemeUi(getCurrentTheme());
renderCatalog();
