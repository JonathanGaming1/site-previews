/**
 * Fire-and-forget POST to an n8n webhook or a Discord webhook.
 * Never blocks rendering or interaction.
 * localhost / plain-HTTP targets are skipped entirely: they always fail from
 * an HTTPS page (mixed content) and only surface as console "Failed to fetch".
 */

export interface PostResult {
  ok: boolean;
  error?: string;
  skipped?: boolean;
}

function isUnreachable(url: URL): boolean {
  const isLocal =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "0.0.0.0" ||
    url.hostname === "[::1]" ||
    url.hostname.endsWith(".local");
  return isLocal || url.protocol !== "https:";
}

export function isUsableHttpsWebhook(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    return !isUnreachable(new URL(url));
  } catch {
    return false;
  }
}

/** Generic webhook POST (n8n). Uses no-cors so endpoints without CORS
 * headers still receive the request. */
export async function postToWebhook(
  url: string,
  payload: Record<string, unknown>,
): Promise<PostResult> {
  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "Webhook URL is not configured", skipped: true };
  }
  if (isUnreachable(parsed)) {
    // Not reachable from the browser — silently skip.
    return { ok: false, error: "local/insecure webhook skipped", skipped: true };
  }
  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}

/** Discord webhook POST. Discord serves `Access-Control-Allow-Origin: *` for
 * webhooks, so a normal CORS POST with JSON content type is delivered
 * reliably from the browser (unlike no-cors, whose opaque response can
 * swallow real validation errors). */
export async function postToDiscord(
  url: string,
  payload: {
    content?: string;
    embeds?: Array<{
      title?: string;
      description?: string;
      color?: number;
      fields?: { name: string; value: string; inline?: boolean }[];
      timestamp?: string;
    }>;
  },
): Promise<PostResult> {
  if (!isUsableHttpsWebhook(url)) {
    return { ok: false, error: "Discord webhook URL is not configured", skipped: true };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return { ok: res.ok, error: res.ok ? undefined : `Discord API (${res.status})` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}
