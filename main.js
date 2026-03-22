const products = window.KREATIV_PRODUCTS || [];

const container = document.getElementById("catalog-groups");
const catalogAnchorLinks = document.getElementById("catalog-anchor-links");

const preferredCategoryOrder = ["Presets", "Samples", "Free", "Legacy"];
const categoryLabels = {
  Presets: "Preset Packs",
  Samples: "Sample Packs",
  Free: "Free Sounds",
  Legacy: "Legacy Archive"
};
const categoryIds = {
  Presets: "catalog-presets",
  Samples: "catalog-samples",
  Free: "catalog-free",
  Legacy: "catalog-legacy"
};
const discoveredCategories = Array.from(new Set(products.map((product) => product.category)));
const categories = [
  ...preferredCategoryOrder.filter((category) => discoveredCategories.includes(category)),
  ...discoveredCategories.filter((category) => !preferredCategoryOrder.includes(category))
];

function renderCatalog() {
  container.innerHTML = "";
  let renderedSections = 0;
  let visualIndex = 0;
  categories.forEach((category) => {
    const categoryItems = products.filter((product) => product.category === category);
    if (!categoryItems.length) {
      return;
    }

    const section = document.createElement("section");
    section.className = "catalog-group";
    section.id = categoryIds[category] || `catalog-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    const heading = document.createElement("h3");
    heading.textContent = categoryLabels[category] || category;
    section.appendChild(heading);

    const grid = document.createElement("ul");
    grid.className = "product-grid";

    categoryItems.forEach((item) => {
      const listItem = document.createElement("li");
      const stack = document.createElement("div");
      stack.className = "product-card-stack";
      if (item.demo && item.demo.src) {
        stack.classList.add("product-card-shell");
      }

      const link = document.createElement("a");
      link.className = "product-card";
      link.dataset.track = "product_card_click";
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

      if (item.badge) {
        const badge = document.createElement("span");
        badge.className = "product-badge";
        badge.textContent = item.badge;
        if (item.badge.toLowerCase() === "new") {
          badge.classList.add("is-new");
        }
        if (item.badge.toLowerCase() === "updated") {
          badge.classList.add("is-updated");
        }
        link.appendChild(badge);
      }

      const meta = document.createElement("span");
      meta.className = "product-meta";
      meta.textContent = item.format + " | " + item.count;

      const useCase = document.createElement("span");
      useCase.className = "product-use";
      useCase.textContent = item.useCase;

      const cta = document.createElement("span");
      cta.className = "product-cta";
      if (item.category === "Free") {
        cta.textContent = "Get Free Sounds";
      } else if (item.category === "Legacy") {
        cta.textContent = "Open Archive";
      } else {
        cta.textContent = "Buy Now";
      }

      link.appendChild(img);
      link.appendChild(title);
      link.appendChild(meta);
      link.appendChild(useCase);
      link.appendChild(cta);

      stack.appendChild(link);

      if (item.detailsUrl) {
        const detailsLink = document.createElement("a");
        detailsLink.className = "product-detail-link";
        detailsLink.href = item.detailsUrl;
        detailsLink.textContent = "Details";
        stack.appendChild(detailsLink);
      }

      if (item.demo && item.demo.src) {
        const demo = document.createElement("div");
        demo.className = "product-demo";

        const demoLabel = document.createElement("span");
        demoLabel.className = "product-demo-label";
        demoLabel.textContent = item.demo.label || "Demo";

        const audio = document.createElement("audio");
        audio.className = "product-demo-player";
        audio.controls = true;
        audio.preload = "none";
        audio.src = item.demo.src;
        if (item.demo.type) {
          audio.setAttribute("type", item.demo.type);
        }
        audio.load();

        demo.appendChild(demoLabel);
        demo.appendChild(audio);
        stack.appendChild(demo);
      }

      listItem.appendChild(stack);
      grid.appendChild(listItem);
      visualIndex += 1;
    });

    section.appendChild(grid);
    container.appendChild(section);
    renderedSections += 1;
  });

  if (catalogAnchorLinks) {
    catalogAnchorLinks.hidden = renderedSections === 0;
  }
}

renderCatalog();
