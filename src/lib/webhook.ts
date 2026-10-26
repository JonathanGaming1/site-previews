/**
 * Fire-and-forget POST to an n8n webhook. Never blocks rendering.
 * localhost / plain-HTTP targets are skipped entirely: they always fail from
 * an HTTPS page (mixed content) and only surface as console "Failed to fetch".
 */
export async function postToWebhook(
  url: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "Webhook URL is not configured", skipped: true };
  }
  const isLocal =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "0.0.0.0" ||
    parsed.hostname === "[::1]" ||
    parsed.hostname.endsWith(".local");
  if (isLocal || parsed.protocol !== "https:") {
    // Not reachable from the browser — silently skip.
    return { ok: false, error: "local/insecure webhook skipped", skipped: true };
  }
  try {
    // no-cors: n8n webhooks usually have no CORS headers for this origin.
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
