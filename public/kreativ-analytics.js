(() => {
  const consentKey = "kreativ-analytics-consent";
  const measurementId = "G-QRTJS1KZD9";
  const pendingEvents = [];

  function getConsent() {
    try {
      const stored = localStorage.getItem(consentKey);
      if (stored) return stored;
    } catch {}

    const cookie = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${consentKey}=`));
    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
  }

  function saveConsent(value) {
    let storedLocally = false;
    try {
      localStorage.setItem(consentKey, value);
      storedLocally = true;
    } catch {}

    if (!storedLocally) {
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${consentKey}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    }
  }

  function loadAnalytics() {
    if (window.__kreativAnalyticsLoaded) return;

    window.__kreativAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

    const google = document.createElement("script");
    google.async = true;
    google.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(google);

    window.gtag("js", new Date());
    window.gtag("config", measurementId);
    pendingEvents.splice(0).forEach(([name, parameters]) => window.gtag("event", name, parameters));

    const cloudflare = document.createElement("script");
    cloudflare.type = "module";
    cloudflare.src = "https://static.cloudflareinsights.com/beacon.min.js";
    cloudflare.dataset.cfBeacon = '{"token":"4d2ef2573cb8456282aa65a1d9defd9d"}';
    document.head.appendChild(cloudflare);
  }

  function scheduleAnalytics() {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 2500 });
    } else {
      window.setTimeout(loadAnalytics, 1400);
    }
  }

  function addConsentStyles() {
    if (document.getElementById("kreativ-analytics-styles")) return;

    const style = document.createElement("style");
    style.id = "kreativ-analytics-styles";
    style.textContent = `
      .analytics-consent { position: fixed; right: 1rem; bottom: 1rem; z-index: 100; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1rem; width: min(44rem, calc(100vw - 2rem)); padding: 1rem; color: var(--text, #1b1b1b); background: var(--panel-strong, #fff); border: 1px solid var(--panel-border, #b8b8b8); box-shadow: var(--shadow-card, 0 16px 36px rgba(0, 0, 0, 0.18)); }
      .analytics-consent h2, .analytics-consent p { margin: 0; }
      .analytics-consent h2 { font-size: 1rem; }
      .analytics-consent p { margin-top: 0.3rem; color: var(--muted, #555); font-size: 0.85rem; line-height: 1.45; }
      .analytics-consent-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.55rem; flex-wrap: wrap; }
      .analytics-consent-actions button, .analytics-consent-actions a, .analytics-settings { min-height: 2.5rem; padding: 0.55rem 0.75rem; color: var(--text, #1b1b1b); background: transparent; border: 1px solid var(--panel-border, #b8b8b8); border-radius: 0.35rem; font: inherit; font-size: 0.82rem; font-weight: 700; text-decoration: none; cursor: pointer; }
      .analytics-consent-actions button:first-child { color: #fff; background: var(--accent, #a91410); border-color: var(--accent, #a91410); }
      .analytics-consent-actions a { border-color: transparent; text-decoration: underline; }
      .analytics-settings { position: fixed; left: 1rem; bottom: 1rem; z-index: 99; background: var(--panel-strong, #fff); box-shadow: var(--shadow-soft, 0 8px 20px rgba(0, 0, 0, 0.14)); }
      @media (max-width: 560px) { .analytics-consent { grid-template-columns: 1fr; } .analytics-consent-actions { justify-content: flex-start; } }
    `;
    document.head.appendChild(style);
  }

  function mountConsentPanel(force = false) {
    if ((!force && getConsent()) || document.querySelector(".analytics-consent")) return;

    addConsentStyles();
    const panel = document.createElement("section");
    panel.className = "analytics-consent";
    panel.setAttribute("aria-labelledby", "analytics-consent-title");
    panel.innerHTML = `
      <div>
        <h2 id="analytics-consent-title">Optional analytics</h2>
        <p>Help improve Kreativ Sound with Google Analytics and Cloudflare Web Analytics. This page works without them.</p>
      </div>
      <div class="analytics-consent-actions">
        <button type="button" data-analytics-accept>Accept analytics</button>
        <button type="button" data-analytics-decline>Decline</button>
        <a href="/privacy/">Privacy details</a>
      </div>
    `;

    panel.querySelector("[data-analytics-accept]")?.addEventListener("click", () => {
      saveConsent("accepted");
      panel.remove();
      scheduleAnalytics();
    });
    panel.querySelector("[data-analytics-decline]")?.addEventListener("click", () => {
      saveConsent("declined");
      panel.remove();
    });
    document.body.appendChild(panel);
    panel.querySelector("[data-analytics-accept]")?.focus();
  }

  function addSettingsButton() {
    if (document.querySelector("[data-privacy-consent]") || document.querySelector("[data-analytics-settings]")) return;

    addConsentStyles();
    const button = document.createElement("button");
    button.className = "analytics-settings";
    button.type = "button";
    button.dataset.analyticsSettings = "";
    button.textContent = "Privacy settings";
    document.body.appendChild(button);
  }

  window.__trackKreativEvent = (name, parameters = {}) => {
    if (!name) return;
    if (window.__kreativAnalyticsLoaded && typeof window.gtag === "function") {
      window.gtag("event", name, parameters);
      return;
    }
    pendingEvents.push([name, parameters]);
  };
  window.__loadKreativAnalytics = scheduleAnalytics;
  window.__showKreativAnalyticsSettings = () => mountConsentPanel(true);

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const settingsButton = event.target.closest("[data-analytics-settings]");
    if (!settingsButton) return;
    event.preventDefault();
    mountConsentPanel(true);
  });

  function initialize() {
    if (getConsent() === "accepted") scheduleAnalytics();
    if (!document.querySelector("[data-privacy-consent]")) {
      addSettingsButton();
      mountConsentPanel();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
