/**
 * /api/auth — the only place the admin password exists outside Cloudflare.
 *
 *   POST   { password }  verifies it in constant time against env.ADMIN_KEY and
 *                        sets `admin_jwt` (HttpOnly; Secure; SameSite=Strict; Path=/)
 *   GET                   verifies the cookie signature + expiry on the server
 *   DELETE                clears the cookie (logout)
 *
 * The token is a standard `header.payload.signature` JWT signed with
 * HMAC-SHA256 through the Web Crypto API, expiring after 12 hours. The browser
 * can neither read it (HttpOnly) nor forge it (the key never leaves the edge),
 * and the password itself never appears in any URL, bundle or localStorage.
 */

const COOKIE_NAME = "admin_jwt";
const TTL_SECONDS = 12 * 60 * 60;
const ATTEMPT_LIMIT = 8;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

/** Best-effort per-isolate brute-force throttle. */
const attempts = new Map();
const encoder = new TextEncoder();

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function b64urlFromBytes(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlFromString(text) {
  return b64urlFromBytes(encoder.encode(text));
}

function b64urlToBytes(value) {
  const b64 = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function b64urlToString(value) {
  return new TextDecoder().decode(b64urlToBytes(value));
}

/** Constant-time comparison so password checks leak no timing information. */
function safeEqual(a, b) {
  const left = encoder.encode(String(a ?? ""));
  const right = encoder.encode(String(b ?? ""));
  if (left.byteLength !== right.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < left.byteLength; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

function attemptAllowed(ip) {
  const now = Date.now();
  if (attempts.size > 5000) attempts.clear();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return true;
  }
  if (entry.count >= ATTEMPT_LIMIT) return false;
  entry.count += 1;
  return true;
}

async function signingKey(env) {
  if (!env.ADMIN_KEY) return null;
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(env.ADMIN_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Sign a 12-hour HS256 session token. */
export async function signAdminJwt(env) {
  const key = await signingKey(env);
  if (!key) return null;
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlFromString(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64urlFromString(
    JSON.stringify({
      sub: "admin",
      iss: "site-previews",
      iat: now,
      exp: now + TTL_SECONDS,
    }),
  );
  const data = `${header}.${payload}`;
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return `${data}.${b64urlFromBytes(new Uint8Array(signature))}`;
}

export function readAdminCookie(request) {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === COOKIE_NAME) {
      return part.slice(index + 1).trim();
    }
  }
  return null;
}

/**
 * Server-side verification used by /api/admin, /api/site and /api/track:
 * signature must match ADMIN_KEY and the expiry must be in the future.
 */
export async function verifyAdminJwt(request, env) {
  const token = readAdminCookie(request);
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const key = await signingKey(env);
    if (!key) return false;
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlToBytes(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`),
    );
    if (!valid) return false;
    const claims = JSON.parse(b64urlToString(parts[1]));
    if (!claims || claims.iss !== "site-previews" || claims.sub !== "admin") {
      return false;
    }
    if (typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL_SECONDS}`;
}

function clearedCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  if (method === "POST") {
    if (!env.ADMIN_KEY) {
      return json(
        {
          ok: false,
          authenticated: false,
          error: "admin_not_configured",
          hint: "גדירו ADMIN_KEY כ-Environment Variable בפרויקט Cloudflare Pages.",
        },
        503,
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, authenticated: false, error: "invalid_json" }, 400);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (!attemptAllowed(ip)) {
      return json(
        { ok: false, authenticated: false, error: "rate_limited" },
        429,
      );
    }

    const password = body && typeof body.password === "string" ? body.password : "";
    if (!password || !safeEqual(password, env.ADMIN_KEY)) {
      return json({ ok: false, authenticated: false, error: "forbidden" }, 401);
    }

    const token = await signAdminJwt(env);
    if (!token) {
      return json({ ok: false, authenticated: false, error: "admin_not_configured" }, 503);
    }
    const response = json({ ok: true, authenticated: true });
    response.headers.append("Set-Cookie", sessionCookie(token));
    return response;
  }

  if (method === "GET") {
    const authenticated = await verifyAdminJwt(request, env);
    return json({ ok: true, authenticated });
  }

  if (method === "DELETE") {
    const response = json({ ok: true, authenticated: false });
    response.headers.append("Set-Cookie", clearedCookie());
    return response;
  }

  return json({ ok: false, error: "method_not_allowed" }, 405);
}