/** Fire-and-forget POST to an n8n webhook. Never blocks rendering. */
export async function postToWebhook(
  url: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  if (!url) return { ok: false, error: "Webhook URL is not configured" };
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
