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
      const hasActionRow = Boolean(item.detailsUrl || item.extraAction);
      if ((item.demo && item.demo.src) || hasActionRow) {
        stack.classList.add("product-card-shell");
      }

      const card = document.createElement(hasActionRow ? "div" : "a");
      card.className = "product-card";

      if (hasActionRow) {
        card.classList.add("product-card-static");
      } else {
        card.dataset.track = "product_card_click";
        card.href = item.url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute("aria-label", item.title);
      }

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
        card.appendChild(badge);
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

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(useCase);
      if (!hasActionRow) {
        card.appendChild(cta);
      }

      stack.appendChild(card);

      if (hasActionRow) {
        const actions = document.createElement("div");
        actions.className = "product-action-row";

        if (item.detailsUrl) {
          const detailsLink = document.createElement("a");
          detailsLink.className = "product-action-link";
          detailsLink.href = item.detailsUrl;
          detailsLink.textContent = "Details";
          actions.appendChild(detailsLink);
        }

        const buyLink = document.createElement("a");
        buyLink.className = "product-action-link is-primary";
        buyLink.dataset.track = "product_card_click";
        buyLink.href = item.url;
        buyLink.target = "_blank";
        buyLink.rel = "noopener noreferrer";
        buyLink.textContent = item.category === "Free" ? "Get Free Sounds" : item.category === "Legacy" ? "Open Archive" : "Buy Now";
        actions.appendChild(buyLink);

        if (item.extraAction && item.extraAction.url) {
          const extraLink = document.createElement("a");
          extraLink.className = "product-action-link";
          extraLink.href = item.extraAction.url;
          extraLink.textContent = item.extraAction.label || "More";
          actions.appendChild(extraLink);
        }

        stack.appendChild(actions);
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
