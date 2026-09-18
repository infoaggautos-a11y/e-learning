import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, ".output");
const dist = resolve(root, "dist");

if (!existsSync(resolve(output, "server", "index.mjs"))) {
  throw new Error("Nitro did not produce .output/server/index.mjs");
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(resolve(output, "server"), resolve(dist, "server"), { recursive: true });
cpSync(resolve(output, "public"), resolve(dist, "client"), { recursive: true });
cpSync(resolve(output, "server", "index.mjs"), resolve(dist, "server", "index.js"));
