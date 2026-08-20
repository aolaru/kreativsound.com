import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const defaultKeyPath = path.join(rootDir, "private/preset-mutator-license-private-key.jwk");
const PRODUCT = "preset-mutator-pro";

function argValue(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1] || fallback;
}

function base64Url(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function printHelp() {
  console.log("Usage: npm run license:preset-mutator-legacy-pro -- --email customer@example.com --order ORDER-ID [--expires YYYY-MM-DD]");
}

const email = argValue("--email");
const orderId = argValue("--order");
const expiresAt = argValue("--expires");
const keyPath = path.resolve(rootDir, argValue("--key", defaultKeyPath));

if (process.argv.includes("--help") || !email || !orderId) {
  printHelp();
  process.exit(process.argv.includes("--help") ? 0 : 1);
}

const privateJwk = JSON.parse(await readFile(keyPath, "utf8"));
const privateKey = await webcrypto.subtle.importKey(
  "jwk",
  privateJwk,
  { name: "ECDSA", namedCurve: "P-256" },
  false,
  ["sign"],
);
const payload = {
  product: PRODUCT,
  version: 1,
  email,
  orderId,
  issuedAt: new Date().toISOString(),
};

if (expiresAt) {
  payload.expiresAt = new Date(`${expiresAt}T23:59:59.999Z`).toISOString();
}

const encodedPayload = base64Url(new TextEncoder().encode(JSON.stringify(payload)));
const signature = await webcrypto.subtle.sign(
  { name: "ECDSA", hash: "SHA-256" },
  privateKey,
  new TextEncoder().encode(encodedPayload),
);

console.log(`${encodedPayload}.${base64Url(new Uint8Array(signature))}`);
