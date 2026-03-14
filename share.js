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

  setShareLabel(defaultLabel);

  shareButton.addEventListener("click", async () => {
    const url = window.location.href;
    const title = document.title.replace(/\s*\|\s*Kreativ Sound$/, "");

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      if (await copyLink(url)) {
        setShareLabel(successLabel);
        clearTimeout(labelTimer);
        labelTimer = window.setTimeout(() => setShareLabel(defaultLabel), 1600);
        return;
      }

      window.prompt("Copy this link:", url);
    } catch (error) {
      if (error && error.name === "AbortError") {
        return;
      }
      window.prompt("Copy this link:", url);
    }
  });
}
