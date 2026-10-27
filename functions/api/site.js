/**
 * GET /api/site?site={slug} — private GitHub proxy for dynamic site data.
 *
 * The repository is private, so the browser can no longer read
 * `public/sites/{slug}.json` from raw GitHub. The edge reads it with
 * env.GITHUB_TOKEN and answers the visitor:
 *
 *   - public visitors get the site stripped of every private/backup key
 *     (initialBackup, checkpoints, anything webhook/token/secret shaped);
 *   - a request carrying a valid `admin_jwt` cookie additionally receives the
 *     checkpoint metadata (id / label / timestamp) needed by the Recall panel.
 *
 * No GitHub token, no backup payload and no internal URL ever reaches DevTools.
 */

import { verifyAdminJwt } from "./auth.js";

const DEFAULT_OWNER = "JonathanGaming1";
const DEFAULT_REPO = "site-previews";
const DEFAULT_BRANCH = "main";
const SITES_DIR = "public/sites";

/** Keys that must never leave the edge. */
const PRIVATE_KEY = /(webhook|token|secret|password|passwd|api[-_]?key|n8n|authorization)/i;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function b64Decode(value) {
  const binary = atob(String(value).replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function sanitizeSegment(value) {
  const clean = String(value ?? "").trim();
  return /^[A-Za-z0-9._-]{1,80}$/.test(clean) ? clean : "";
}

/** Recursively drop platform-private fields from the outgoing site JSON. */
function stripPrivate(value) {
  if (Array.isArray(value)) return value.map(stripPrivate);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, entry] of Object.entries(value)) {
      if (key === "initialBackup" || key === "checkpoints") continue;
      if (PRIVATE_KEY.test(key)) continue;
      out[key] = stripPrivate(entry);
    }
    return out;
  }
  return value;
}

/** Admin view: full content, but checkpoints reduced to listable metadata. */
function forAdmin(site) {
  const publicView = stripPrivate(site);
  const checkpoints = Array.isArray(site.checkpoints) ? site.checkpoints : [];
  return {
    ...publicView,
    checkpoints: checkpoints
      .filter(Boolean)
      .map((entry) => ({
        id: String(entry.id ?? ""),
        label: String(entry.label ?? ""),
        timestamp: String(entry.timestamp ?? ""),
      })),
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const slug =
    sanitizeSegment(url.searchParams.get("site")) ||
    sanitizeSegment(url.searchParams.get("slug"));
  if (!slug) return json({ ok: false, error: "invalid_slug" }, 400);

  if (!env.GITHUB_TOKEN) {
    return json(
      {
        ok: false,
        error: "missing_env",
        missing: ["GITHUB_TOKEN"],
        hint: "הוסיפו GITHUB_TOKEN כ-Environment Variable בפרויקט Cloudflare Pages.",
      },
      500,
    );
  }

  const owner = sanitizeSegment(env.GITHUB_OWNER || DEFAULT_OWNER);
  const repo = sanitizeSegment(env.GITHUB_REPO || DEFAULT_REPO);
  const branch = String(env.GITHUB_BRANCH || DEFAULT_BRANCH);
  const path = `${SITES_DIR}/${slug}.json`;

  const readUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;

  let payload;
  try {
    const res = await fetch(readUrl, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "user-agent": "site-previews-site-proxy",
        "x-github-api-version": "2022-11-28",
      },
      cache: "no-store",
    });
    if (res.status === 404) return json({ ok: false, error: "site_not_found" }, 404);
    if (!res.ok) {
      const detail = await res.text();
      return json(
        { ok: false, error: `github_read_${res.status}:${detail.slice(0, 160)}` },
        502,
      );
    }
    payload = await res.json();
  } catch {
    return json({ ok: false, error: "github_unreachable" }, 502);
  }

  let site;
  try {
    site = JSON.parse(b64Decode(payload.content));
  } catch {
    return json({ ok: false, error: "invalid_site_json" }, 502);
  }
  if (!site || typeof site !== "object" || Array.isArray(site)) {
    return json({ ok: false, error: "invalid_site_json" }, 502);
  }

  const isAdmin = await verifyAdminJwt(request, env);

  return json({
    ok: true,
    admin: isAdmin,
    site: isAdmin ? forAdmin(site) : stripPrivate(site),
    sha: payload.sha,
  });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ ok: false, error: "method_not_allowed" }, 405);
}