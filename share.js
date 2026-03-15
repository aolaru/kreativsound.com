const shareButton = document.getElementById("share-button");

function setShareLabel(label) {
  if (!shareButton) {
    return;
  }
  shareButton.setAttribute("aria-label", label);
  shareButton.title = label;
}

async function copyLink(url) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(url);
    return true;
  }
  return false;
}

if (shareButton) {
  const defaultLabel = "Share this page";
  const successLabel = "Link copied";
  let labelTimer = null;
  let shareMenu = null;

  function currentShareData() {
    const url = window.location.href;
    const title = document.title.replace(/\s*\|\s*Kreativ Sound$/, "");
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    return {
      url,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
    };
  }

  function closeMenu() {
    if (!shareMenu) {
      return;
    }
    shareMenu.hidden = true;
    shareButton.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    if (!shareMenu) {
      return;
    }
    shareMenu.hidden = false;
    shareButton.setAttribute("aria-expanded", "true");
  }

  function buildMenu() {
    if (shareMenu) {
      return shareMenu;
    }

    shareMenu = document.createElement("div");
    shareMenu.className = "share-menu";
    shareMenu.hidden = true;

    const data = currentShareData();
    const items = [
      { href: data.x, icon: "fa-brands fa-x-twitter", label: "Share on X" },
      { href: data.facebook, icon: "fa-brands fa-facebook-f", label: "Share on Facebook" },
      { href: data.linkedin, icon: "fa-brands fa-linkedin-in", label: "Share on LinkedIn" },
      { href: data.email, icon: "fa-regular fa-envelope", label: "Share by email" }
    ];

    items.forEach((item) => {
      const link = document.createElement("a");
      link.className = "share-menu-item";
      link.href = item.href;
      if (!item.href.startsWith("mailto:")) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      link.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i><span>${item.label}</span>`;
      shareMenu.appendChild(link);
    });

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "share-menu-item";
    copyButton.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i><span>Copy link</span>';
    copyButton.addEventListener("click", async () => {
      if (await copyLink(data.url)) {
        setShareLabel(successLabel);
        clearTimeout(labelTimer);
        labelTimer = window.setTimeout(() => setShareLabel(defaultLabel), 1600);
        closeMenu();
        return;
      }
      window.prompt("Copy this link:", data.url);
    });
    shareMenu.appendChild(copyButton);

    shareButton.parentElement.appendChild(shareMenu);
    return shareMenu;
  }

  setShareLabel(defaultLabel);
  shareButton.setAttribute("aria-haspopup", "true");
  shareButton.setAttribute("aria-expanded", "false");

  shareButton.addEventListener("click", () => {
    buildMenu();
    if (shareMenu.hidden) {
      openMenu();
      return;
    }
    closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!shareMenu || shareMenu.hidden) {
      return;
    }
    if (shareButton.contains(event.target) || shareMenu.contains(event.target)) {
      return;
    }
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}
