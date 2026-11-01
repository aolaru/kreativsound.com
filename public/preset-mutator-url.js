(() => {
  const url = new URL(window.location.href);
  const match = url.pathname.match(/^\/(preset-mutator(?:-pro)?)(?:\/(audio|mutate|changelog|scratch))?(?:\/index\.html|\/)?$/);
  if (!match) return;

  const mode = match[2] && match[2] !== "scratch" ? `${match[2]}/` : "";
  const pathname = `/${match[1]}/${mode}`;
  if (url.pathname === pathname) return;

  // Keep existing bookmarks and campaign parameters without reloading the app.
  window.history.replaceState(window.history.state, "", `${pathname}${url.search}${url.hash}`);
})();
