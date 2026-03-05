(function () {
  function track(eventName, props) {
    if (typeof window.plausible !== "function") {
      return;
    }
    if (props && Object.keys(props).length > 0) {
      window.plausible(eventName, { props: props });
      return;
    }
    window.plausible(eventName);
  }

  window.kreativTrack = track;

  document.addEventListener("click", function (event) {
    var tracked = event.target && event.target.closest ? event.target.closest("[data-track]") : null;
    if (tracked) {
      track(tracked.getAttribute("data-track"), {
        href: tracked.getAttribute("href") || "",
        label: (tracked.textContent || "").trim().slice(0, 80)
      });
      return;
    }

    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) {
      return;
    }

    var href = link.getAttribute("href") || "";
    if (!/^https?:\/\//i.test(href)) {
      return;
    }

    var destination;
    try {
      destination = new URL(href, window.location.href);
    } catch (error) {
      return;
    }

    if (destination.hostname === window.location.hostname) {
      return;
    }

    track("outbound_click", {
      host: destination.hostname,
      href: href
    });
  });
})();
