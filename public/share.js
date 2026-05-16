(() => {
  const buttons = document.querySelectorAll(".share-button");
  if (!buttons.length) return;

  function pageDetails() {
    return {
      title: document.title || "Kreativ Sound",
      text: "Open this Kreativ Sound page.",
      url: window.location.href,
    };
  }

  function closeMenus(except) {
    document.querySelectorAll(".share-menu").forEach((menu) => {
      if (menu !== except) {
        menu.hidden = true;
      }
    });
  }

  async function copyLink(button) {
    const details = pageDetails();
    try {
      await navigator.clipboard.writeText(details.url);
      button.setAttribute("aria-label", "Link copied");
      setTimeout(() => button.setAttribute("aria-label", "Share this page"), 1200);
    } catch {
      window.prompt("Copy this link", details.url);
    }
  }

  function buildMenu(button) {
    const parent = button.parentElement;
    if (!parent) return null;

    parent.style.position = "relative";

    const menu = document.createElement("div");
    menu.className = "share-menu";
    menu.hidden = true;
    menu.setAttribute("role", "menu");

    const nativeShare = document.createElement("button");
    nativeShare.className = "share-menu-item";
    nativeShare.type = "button";
    nativeShare.setAttribute("role", "menuitem");
    nativeShare.innerHTML = '<i class="fa-solid fa-share-nodes" aria-hidden="true"></i><span>Share page</span>';
    nativeShare.addEventListener("click", async () => {
      const details = pageDetails();
      if (navigator.share) {
        await navigator.share(details).catch(() => {});
      } else {
        await copyLink(button);
      }
      menu.hidden = true;
    });

    const copy = document.createElement("button");
    copy.className = "share-menu-item";
    copy.type = "button";
    copy.setAttribute("role", "menuitem");
    copy.innerHTML = '<i class="fa-solid fa-link" aria-hidden="true"></i><span>Copy link</span>';
    copy.addEventListener("click", async () => {
      await copyLink(button);
      menu.hidden = true;
    });

    const email = document.createElement("a");
    email.className = "share-menu-item";
    email.setAttribute("role", "menuitem");
    const details = pageDetails();
    email.href = `mailto:?subject=${encodeURIComponent(details.title)}&body=${encodeURIComponent(details.url)}`;
    email.innerHTML = '<i class="fa-solid fa-envelope" aria-hidden="true"></i><span>Email link</span>';

    menu.append(nativeShare, copy, email);
    parent.appendChild(menu);
    return menu;
  }

  buttons.forEach((button) => {
    const menu = buildMenu(button);
    if (!menu) return;

    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share(pageDetails()).catch(() => {});
        return;
      }
      const nextHidden = !menu.hidden;
      closeMenus(menu);
      menu.hidden = nextHidden;
    });
  });

  document.addEventListener("click", () => closeMenus());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenus();
  });
})();
