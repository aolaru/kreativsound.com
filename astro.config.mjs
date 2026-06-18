import { defineConfig } from "astro/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function presetMutatorDevRoutes() {
  const appHtmlRoutes = new Map([
    ["/preset-mutator/", "index.html"],
    ["/preset-mutator/scratch/", "scratch/index.html"],
    ["/preset-mutator/mutate/", "mutate/index.html"],
    ["/preset-mutator/audio/", "audio/index.html"]
  ]);
  const legacyRedirects = new Map([
    ["/apps/preset-mutator/ui", "/preset-mutator/"],
    ["/apps/preset-mutator/ui/", "/preset-mutator/"],
    ["/apps/preset-mutator/ui/scratch", "/preset-mutator/scratch/"],
    ["/apps/preset-mutator/ui/scratch/", "/preset-mutator/scratch/"],
    ["/apps/preset-mutator/ui/mutate", "/preset-mutator/mutate/"],
    ["/apps/preset-mutator/ui/mutate/", "/preset-mutator/mutate/"],
    ["/apps/preset-mutator/ui/audio", "/preset-mutator/audio/"],
    ["/apps/preset-mutator/ui/audio/", "/preset-mutator/audio/"]
  ]);

  return {
    name: "preset-mutator-dev-routes",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url || "/", "http://localhost").pathname;
        const redirectTarget = legacyRedirects.get(pathname);
        if (redirectTarget) {
          response.statusCode = 302;
          response.setHeader("Location", redirectTarget);
          response.end();
          return;
        }

        const appHtmlPath = appHtmlRoutes.get(pathname);
        if (!appHtmlPath) {
          if (pathname === "/tools/kreativ-sample-prep" || pathname === "/tools/kreativ-sample-prep/") {
            response.statusCode = 302;
            response.setHeader("Location", "/tools/wave-mutator/");
            response.end();
            return;
          }

          if (pathname === "/tools/wave-mutator" || pathname === "/tools/wave-mutator/") {
            fs.readFile(path.join(rootDir, "public/tools/wave-mutator/index.html"), "utf8", (error, html) => {
              if (error) {
                next(error);
                return;
              }
              response.statusCode = 200;
              response.setHeader("Content-Type", "text/html; charset=utf-8");
              response.end(html);
            });
            return;
          }

          next();
          return;
        }

        fs.readFile(path.join(rootDir, "apps/preset-mutator/public", appHtmlPath), "utf8", (error, html) => {
          if (error) {
            next(error);
            return;
          }
          response.statusCode = 200;
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.end(html);
        });
      });
    }
  };
}

export default defineConfig({
  site: "https://kreativsound.com",
  output: "static",
  trailingSlash: "ignore",
  vite: {
    plugins: [presetMutatorDevRoutes()]
  }
});
