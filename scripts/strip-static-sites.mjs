/**
 * postbuild — keep the private site store out of the static bundle.
 *
 * `public/sites/*.json` is the GitHub storage path (the edge reads it through
 * /api/site with GITHUB_TOKEN), but Next's static export copies everything in
 * `public/` into `out/`, which Cloudflare Pages then serves to anyone who
 * requests `/sites/{slug}.json` — initialBackup, checkpoints and legacy webhook
 * fields included. That silently bypasses the proxy's key stripping.
 *
 * So after every export we delete the copies: on the deployed site the only
 * way to read a site is GET /api/site. During `next dev` nothing is stripped,
 * so the local fallback keeps working.
 */

import { rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const exported = join(root, "out", "sites");

try {
  const info = await stat(exported);
  if (info.isDirectory()) {
    await rm(exported, { recursive: true, force: true });
    console.log("[strip-static-sites] removed out/sites from the public bundle");
  }
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}