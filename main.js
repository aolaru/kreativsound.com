const products = window.KREATIV_PRODUCTS || [];

document.getElementById("year").textContent = new Date().getFullYear();

const container = document.getElementById("catalog-groups");

const preferredCategoryOrder = ["Presets", "Samples", "Free"];
const discoveredCategories = Array.from(new Set(products.map((product) => product.category)));
const categories = [
  ...preferredCategoryOrder.filter((category) => discoveredCategories.includes(category)),
  ...discoveredCategories.filter((category) => !preferredCategoryOrder.includes(category))
];

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

renderCatalog();
