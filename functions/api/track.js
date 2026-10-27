/**
 * POST /api/track — server-side demo-entry alert with a strict 5-minute
 * per-device anti-spam cooldown.
 *
 * The Discord webhook URL lives ONLY in the Cloudflare Pages environment
 * (context.env.DISCORD_WEBHOOK_URL). It is never bundled into client JS and
 * never appears in the browser's Network tab.
 *
 * Rules:
 *  - one alert per device per 5 minutes (300s), where a "device" is the
 *    HttpOnly `track_cooldown_{slug}` cookie OR the IP + User-Agent fingerprint
 *    held in the in-memory edge Map
 *  - re-entering or refreshing inside the window is still a visit: it refreshes
 *    the window and returns { ok: true, skipped: "5min_cooldown" } with no
 *    Discord call at all
 *  - no alert when the request carries a valid admin_jwt session
 */

import { verifyAdminJwt } from "./auth.js";

const COOLDOWN_MS = 5 * 60 * 1000; // 300 seconds
const COOKIE_MAX_AGE = 300;
const COOKIE_PREFIX = "track_cooldown_";
const MAX_ENTRIES = 5000;

/** fingerprint_slug -> last visit timestamp. Reset on isolate recycle; the
 * HttpOnly cookie and the client localStorage guard are the durable backstops. */
const lastVisitAt = new Map();

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

/** Cookie names cannot carry arbitrary characters, so derive a safe key. */
function cookieSlug(slug) {
  return (slug.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40) || "default");
}

function cookieName(slug) {
  return `${COOKIE_PREFIX}${cookieSlug(slug)}`;
}

function cooldownCookie(name) {
  return `${name}=1; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax; Path=/`;
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return null;
}

function prune(now) {
  if (lastVisitAt.size < 200) return;
  for (const [key, timestamp] of lastVisitAt) {
    if (now - timestamp > COOLDOWN_MS) lastVisitAt.delete(key);
  }
  // Hard ceiling: drop the oldest insertions if a burst outlives the TTL pass.
  while (lastVisitAt.size > MAX_ENTRIES) {
    const oldest = lastVisitAt.keys().next().value;
    if (oldest === undefined) break;
    lastVisitAt.delete(oldest);
  }
}

/**
 * Keep Discord markdown and mentions from being injected through business
 * names: strip formatting characters, every `@` (so `@everyone` / `@role` can
 * never be constructed) and collapse whitespace.
 */
function clean(value, maxLength = 160) {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/[*_`~|@]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function safeUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href.slice(0, 500)
      : "";
  } catch {
    return "";
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // An admin session (valid admin_jwt cookie) never notifies Discord.
  if (await verifyAdminJwt(request, env)) {
    return json({ ok: true, skipped: "admin" });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (!body || typeof body !== "object") {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  // Admin previews never notify.
  if (body.isAdmin === true) {
    return json({ ok: true, skipped: "admin" });
  }

  const slug = clean(body.slug, 80) || "default";
  const name = cookieName(slug);
  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  const userAgent = clean(request.headers.get("User-Agent"), 140) || "unknown";
  const fingerprint = `${clientIp}::${userAgent}`;
  const visitKey = `${fingerprint}::${slug}`;

  const now = Date.now();
  prune(now);

  const hasCookie = readCookie(request, name) !== null;
  const previous = lastVisitAt.get(visitKey);
  const withinWindow =
    previous !== undefined && now - previous < COOLDOWN_MS;

  if (hasCookie || withinWindow) {
    // Still a visit — push the window forward so a refreshing visitor never
    // accumulates alerts, then answer without touching Discord.
    lastVisitAt.set(visitKey, now);
    return json({ ok: true, skipped: "5min_cooldown" }, 200, {
      "set-cookie": cooldownCookie(name),
    });
  }

  // Record before the network hop so parallel loads cannot double-send.
  lastVisitAt.set(visitKey, now);

  const webhook = env?.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return json({ ok: true, skipped: "no_webhook_configured" }, 200, {
      "set-cookie": cooldownCookie(name),
    });
  }

  const templateId = clean(body.templateId, 60) || "unknown";
  const device = clean(body.device, 40) || "Desktop";
  const businessName = clean(body.businessName, 120) || slug;
  const url = safeUrl(body.url);

  const content = [
    "**כניסה חדשה לאתר הדגמה**",
    `עסק: ${businessName} (${slug})`,
    `תבנית: ${templateId} | מכשיר: ${device}`,
    `קישור: ${url}`,
  ].join("\n");

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content,
        allowed_mentions: { parse: [] },
      }),
    });

    if (!res.ok) {
      // Do not keep the cooldown when delivery failed — allow a retry.
      lastVisitAt.delete(visitKey);
      return json({ ok: false, error: `discord_${res.status}` }, 502);
    }
  } catch {
    lastVisitAt.delete(visitKey);
    return json({ ok: false, error: "discord_unreachable" }, 502);
  }

  // Genuine new visit: stamp the HttpOnly cooldown cookie for this slug.
  return json({ ok: true }, 200, { "set-cookie": cooldownCookie(name) });
}

/** Anything other than POST is a no-op (keeps the endpoint unprobeable). */
export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
