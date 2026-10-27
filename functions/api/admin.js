/**
 * POST /api/admin — server-side GitHub save, AI edit and recall.
 *
 * Runs on Cloudflare Pages Functions against the PRIVATE repository. GitHub and
 * Groq credentials live only in `context.env` (GITHUB_TOKEN, GROQ_API_KEY), so
 * no token is ever shipped to the browser. No n8n, no popups, no key in a URL.
 *
 * Authorization: every request must carry a valid `admin_jwt` cookie — the
 * HS256 token /api/auth signs after checking the password server-side.
 * Anything else receives 401 immediately.
 */


import { verifyAdminJwt } from "./auth.js";

const DEFAULT_OWNER = "JonathanGaming1";
const DEFAULT_REPO = "site-previews";
const DEFAULT_BRANCH = "main";
const SITES_DIR = "public/sites";
const MAX_CHECKPOINTS = 20;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const TEMPLATE_IDS = [
  "forge-automotive",
  "apple-spatial",
  "horology-chrono",
  "kinetic-monolith",
  "swiss-editorial",
];

const LEGACY_TEMPLATE_FALLBACK = {
  "whisky-obsidian": "forge-automotive",
  "luxury-dark": "forge-automotive",
  "modern-clean": "apple-spatial",
  "cyber-quantum": "kinetic-monolith",
  "atelier-boutique": "swiss-editorial",
  "warm-boutique": "swiss-editorial",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function b64Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function b64Decode(value) {
  const binary = atob(String(value).replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** A browser POST to our own origin always carries a matching Origin. */
function isSameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  if (origin === "null") return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeTemplate(id, fallback = "apple-spatial") {
  if (typeof id !== "string") return fallback;
  if (TEMPLATE_IDS.includes(id)) return id;
  const legacy = LEGACY_TEMPLATE_FALLBACK[id];
  return legacy ?? fallback;
}

function sanitizeSegment(value, maxLength = 80) {
  const clean = String(value ?? "").trim();
  return /^[A-Za-z0-9._-]{1,80}$/.test(clean)
    ? clean.slice(0, maxLength)
    : "";
}

/** Content fields the AI is allowed to rewrite; platform meta stays locked. */
function withEnforcedMeta(base, incoming) {
  const merged = {
    ...clone(base),
    ...(isPlainObject(incoming) ? clone(incoming) : {}),
    slug: base.slug,
    businessId: base.businessId,
    isDemo: base.isDemo,
    // Legacy bridge fields are dead ends: blank them on every save so an
    // internal webhook can never be re-published with the site JSON.
    n8nEditWebhookUrl: "",
    checkoutUrl: base.checkoutUrl ?? "/checkout",
    trackingWebhookUrl: "",
    checkpoints: Array.isArray(base.checkpoints) ? base.checkpoints : [],
    initialBackup: base.initialBackup,
  };
  merged.templateId = normalizeTemplate(
    incoming?.templateId ?? base.templateId,
    normalizeTemplate(base.templateId),
  );
  merged.theme = {
    primaryColor: merged.theme?.primaryColor ?? base.theme?.primaryColor ?? "#0B0B0B",
    accentColor: merged.theme?.accentColor ?? base.theme?.accentColor ?? "#C9A227",
  };
  return merged;
}

function stripHeavy(site) {
  const next = clone(site);
  delete next.checkpoints;
  delete next.initialBackup;
  delete next.initialData;
  return next;
}

function pushCheckpoint(site, label) {
  const checkpoints = Array.isArray(site.checkpoints) ? site.checkpoints : [];
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    timestamp: new Date().toISOString(),
    data: stripHeavy(site),
  };
  return {
    ...site,
    checkpoints: [...checkpoints, entry].slice(-MAX_CHECKPOINTS),
  };
}

function stamp(label) {
  const now = new Date();
  const stampText = now.toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });
  return `${label} — ${stampText}`;
}

function ghHeaders(env) {
  return {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "content-type": "application/json",
    "user-agent": "site-previews-admin",
    "x-github-api-version": "2022-11-28",
  };
}

async function readSite(env, owner, repo, path, branch) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: ghHeaders(env),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`github_read_${res.status}:${detail.slice(0, 160)}`);
  }
  const payload = await res.json();
  const parsed = JSON.parse(b64Decode(payload.content));
  return { sha: payload.sha, data: parsed };
}

async function writeSite(env, owner, repo, path, data, sha, branch, message) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const body = {
    message,
    content: b64Encode(`${JSON.stringify(data, null, 2)}\n`),
    branch,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(url, {
    method: "PUT",
    headers: ghHeaders(env),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`github_write_${res.status}:${detail.slice(0, 200)}`);
  }
  const payload = await res.json();
  return payload?.commit?.sha ?? null;
}

/**
 * Read → mutate → PUT, retrying once against a concurrent edit (GitHub returns
 * 409 when the blob sha moved).
 */
async function mutateAndCommit(env, target, mutate) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const current = await readSite(
      env,
      target.owner,
      target.repo,
      target.path,
      target.branch,
    );
    if (!current) {
      const error = new Error("site_not_found");
      error.status = 404;
      throw error;
    }
    const next = mutate(current.data);
    try {
      const commit = await writeSite(
        env,
        target.owner,
        target.repo,
        target.path,
        next,
        current.sha,
        target.branch,
        target.message,
      );
      return { data: next, commit };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("github_write_failed");
}

/* ------------------------------------------------------------------ */
/* Groq — server-side AI rewrite                                      */
/* ------------------------------------------------------------------ */

const AI_SYSTEM_PROMPT = [
  "אתה קופירייטר ומעצב תוכן עברי בכיר לסוכנות דיגיטלית יוקרתית.",
  "המשימה: לערוך את ה-JSON של אתר עסקי לפי הוראת המשתמש, ולשמור על מבנה זהה לחלוטין.",
  "כללים מחייבים:",
  "1. החזר אובייקט JSON תקין בלבד, עם אותם מפתחות בדיוק שקיבלת (אפשר להשמיט מפתח שלא השתנה).",
  "2. אל תשנה slug, businessId, isDemo, templateId, theme, checkpoints או initialBackup.",
  "3. עברית טבעית, יוקרתית ומדויקת — בלי אימוג'ים, בלי כוכבים, בלי סימני קריאה מוגזמים.",
  "4. בכל כותרת או כותרת משנה: לעולם אל תחבר שתי מילים בלי רווח.",
  "5. שמור על אורך דומה לשדות המקוריים, אלא אם המשתמש ביקש אחרת.",
  "6. services, benefits, reviews, faq ו-processTimeline נשארים באותו מספר פריטים ואותו סדר.",
  "7. אל תמציא מחירים, טלפונים, כתובות או הבטחות חדשות שלא הופיעו במקור.",
].join("\n");

function buildAiPrompt(instruction, site) {
  return [
    "ההוראה של הלקוח:",
    instruction,
    "",
    "ה-JSON הנוכחי של האתר:",
    JSON.stringify(stripHeavy(site), null, 2),
    "",
    "החזר JSON בלבד.",
  ].join("\n");
}

async function runAiEdit(env, site, instruction) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.GROQ_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.65,
      max_tokens: 6000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        { role: "user", content: buildAiPrompt(instruction, site) },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    const error = new Error(`groq_${res.status}:${detail.slice(0, 200)}`);
    error.status = 502;
    throw error;
  }

  const payload = await res.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    const error = new Error("groq_empty_response");
    error.status = 502;
    throw error;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end <= start) {
      const error = new Error("groq_invalid_json");
      error.status = 502;
      throw error;
    }
    parsed = JSON.parse(content.slice(start, end + 1));
  }

  if (!isPlainObject(parsed)) {
    const error = new Error("groq_not_an_object");
    error.status = 502;
    throw error;
  }

  const hasContent = ["businessInfo", "hero", "services", "benefits", "faq"].some(
    (key) => key in parsed,
  );
  if (!hasContent) {
    const error = new Error("groq_missing_content");
    error.status = 502;
    throw error;
  }

  return parsed;
}

/* ------------------------------------------------------------------ */

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!isPlainObject(body)) {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  // Strict server-side gate: only a valid admin_jwt cookie (HS256 signed with
  // ADMIN_KEY by /api/auth) may write to the private repository.
  if (!(await verifyAdminJwt(request, env))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  if (!env.ADMIN_KEY) {
    return json(
      {
        ok: false,
        error: "admin_not_configured",
        hint: "גדירו ADMIN_KEY כ-Environment Variable בפרויקט Cloudflare Pages.",
      },
      503,
    );
  }

  if (!isSameOrigin(request)) {
    return json({ ok: false, error: "bad_origin" }, 403);
  }

  const action = String(body.action || "");

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

  const slug = sanitizeSegment(body.slug);
  if (!slug) {
    return json({ ok: false, error: "invalid_slug" }, 400);
  }

  const owner = sanitizeSegment(env.GITHUB_OWNER || DEFAULT_OWNER);
  const repo = sanitizeSegment(body.repo || env.GITHUB_REPO || DEFAULT_REPO);
  const branch = String(env.GITHUB_BRANCH || DEFAULT_BRANCH);
  if (!owner || !repo) {
    return json({ ok: false, error: "invalid_repo" }, 400);
  }

  const path = `${SITES_DIR}/${slug}.json`;
  const target = {
    owner,
    repo,
    branch,
    path,
    message: `Admin ${action}: ${slug}`,
  };

  try {
    if (action === "manual_save") {
      if (!isPlainObject(body.updatedData)) {
        return json({ ok: false, error: "invalid_site_data" }, 400);
      }
      const label = stamp("שמירה ידנית");
      const result = await mutateAndCommit(env, target, (current) => {
        const merged = withEnforcedMeta(current, body.updatedData);
        return pushCheckpoint(merged, label);
      });
      return json({ ok: true, updatedData: result.data, commit: result.commit });
    }

    if (action === "ai_edit") {
      const instruction = String(body.prompt ?? "").trim();
      if (!instruction) {
        return json({ ok: false, error: "empty_prompt" }, 400);
      }
      if (!env.GROQ_API_KEY) {
        return json(
          {
            ok: false,
            error: "missing_env",
            missing: ["GROQ_API_KEY"],
            hint: "הוסיפו GROQ_API_KEY כ-Environment Variable בפרויקט Cloudflare Pages.",
          },
          500,
        );
      }

      const current = await readSite(env, owner, repo, path, branch);
      if (!current) {
        return json({ ok: false, error: "site_not_found" }, 404);
      }

      const aiSite = await runAiEdit(env, current.data, instruction);
      const label = stamp("עריכת AI");
      const result = await mutateAndCommit(env, target, (latest) => {
        const merged = withEnforcedMeta(latest, aiSite);
        return pushCheckpoint(merged, label);
      });
      return json({ ok: true, updatedData: result.data, commit: result.commit });
    }

    if (action === "recall") {
      const current = await readSite(env, owner, repo, path, branch);
      if (!current) {
        return json({ ok: false, error: "site_not_found" }, 404);
      }

      let restored = null;
      if (body.target === "initial") {
        restored = current.data.initialBackup ?? null;
      } else if (body.checkpointId) {
        const match = (current.data.checkpoints ?? []).find(
          (cp) => cp && cp.id === body.checkpointId,
        );
        restored = match?.data ?? null;
      } else if (isPlainObject(body.restoredData)) {
        restored = body.restoredData;
      }

      if (!isPlainObject(restored)) {
        return json({ ok: false, error: "restore_target_missing" }, 400);
      }

      const result = await mutateAndCommit(env, target, (latest) => {
        const merged = withEnforcedMeta(latest, restored);
        merged.checkpoints = Array.isArray(latest.checkpoints)
          ? latest.checkpoints
          : [];
        return merged;
      });
      return json({ ok: true, updatedData: result.data, commit: result.commit });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (error) {
    const status = Number(error?.status) || 500;
    return json(
      {
        ok: false,
        error: String(error?.message ?? "admin_failed").slice(0, 300),
      },
      status === 404 ? 404 : status === 502 ? 502 : 500,
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
