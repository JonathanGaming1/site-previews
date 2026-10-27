/**
 * POST /api/track — server-side demo-entry alert.
 *
 * The Discord webhook URL lives ONLY in the Cloudflare Pages environment
 * (context.env.DISCORD_WEBHOOK_URL). It is never bundled into client JS and
 * never appears in the browser's Network tab.
 *
 * Rules:
 *  - one alert per IP + slug per 30 minutes (in-memory edge cache)
 *  - no alert when the request carries a valid admin_jwt session
 *  - no alert when the visitor already received one this session
 */

import { verifyAdminJwt } from "./auth.js";

const COOLDOWN_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 5000;

/** ip_slug -> last alerted timestamp. Reset on isolate recycle; the 30-minute
 * client guard is the durable backstop. */
const lastAlertAt = new Map();

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function prune(now) {
  if (lastAlertAt.size < 200) return;
  for (const [key, timestamp] of lastAlertAt) {
    if (now - timestamp > COOLDOWN_MS) lastAlertAt.delete(key);
  }
  // Hard ceiling: drop the oldest insertions if a burst outlives the TTL pass.
  while (lastAlertAt.size > MAX_ENTRIES) {
    const oldest = lastAlertAt.keys().next().value;
    if (oldest === undefined) break;
    lastAlertAt.delete(oldest);
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

  const slug = clean(body.slug, 80) || "default";
  const templateId = clean(body.templateId, 60) || "unknown";
  const device = clean(body.device, 40) || "Desktop";
  const businessName = clean(body.businessName, 120) || slug;
  const url = safeUrl(body.url);

  // Admin previews never notify.
  if (body.isAdmin === true) {
    return json({ ok: true, skipped: "admin" });
  }

  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  const cacheKey = `${clientIp}_${slug}`;
  const now = Date.now();
  prune(now);

  const previous = lastAlertAt.get(cacheKey);
  if (previous && now - previous < COOLDOWN_MS) {
    return json({ ok: true, skipped: "cooldown" });
  }
  // Record before the network hop so parallel loads cannot double-send.
  lastAlertAt.set(cacheKey, now);

  const webhook = env?.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return json({ ok: true, skipped: "no_webhook_configured" });
  }

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
      lastAlertAt.delete(cacheKey);
      return json({ ok: false, error: `discord_${res.status}` }, 502);
    }
  } catch {
    lastAlertAt.delete(cacheKey);
    return json({ ok: false, error: "discord_unreachable" }, 502);
  }

  return json({ ok: true });
}

/** Anything other than POST is a no-op (keeps the endpoint unprobeable). */
export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
