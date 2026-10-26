"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { useSite } from "@/components/SiteProvider";
import { isUsableHttpsWebhook, postToDiscord } from "@/lib/webhook";

/* ------------------------------------------------------------------ */
/* Production credentials — hardcoded defaults so tracking always      */
/* works, even when siteData doesn't specify its own endpoints.        */
/* ------------------------------------------------------------------ */

const DEFAULT_DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1563231187646947397/6GlOTjlvAzjFbHjBkHegPCjptCQZiUGwTFbib4jEWzeffaHcQ8Y15RDv-BIxyXG_JkZV";
const DEFAULT_POSTHOG_KEY = "phc_AkDuMC253gZyg4HHGWyvGi63zYRSdZEoF5taihDvehV9";
const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

interface TrackerEndpoint {
  posthogKey: string;
  posthogHost: string;
  discordUrl: string;
}

/** siteData may override the endpoints; anything invalid falls back to the
 * hardcoded production defaults above. */
function resolveEndpoint(data: {
  posthogKey?: string;
  posthogHost?: string;
  trackingWebhookUrl?: string;
}): TrackerEndpoint {
  return {
    posthogKey: (data.posthogKey || DEFAULT_POSTHOG_KEY).trim(),
    posthogHost: (data.posthogHost || DEFAULT_POSTHOG_HOST).trim(),
    discordUrl: isUsableHttpsWebhook(data.trackingWebhookUrl)
      ? (data.trackingWebhookUrl as string).trim()
      : DEFAULT_DISCORD_WEBHOOK_URL,
  };
}

let posthogInitialized = false;

function initPostHog(key: string, host: string): void {
  if (posthogInitialized || typeof window === "undefined") return;
  try {
    posthog.init(key, {
      api_host: host,
      person_profiles: "always",
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: false,
    });
    posthogInitialized = true;
  } catch {
    /* analytics must never break the page */
  }
}

const EMBED_BLUE = 0x5c7cfa;

interface DiscordPing {
  header: string;
  lines?: [string, string][];
  timestamp: string;
}

function sendDiscord(ping: DiscordPing, discordUrl: string): void {
  const fields = (ping.lines ?? []).map(([name, value]) => ({
    name,
    value,
    inline: true,
  }));
  void postToDiscord(discordUrl, {
    content: ping.header,
    embeds: [
      {
        color: EMBED_BLUE,
        fields,
        timestamp: ping.timestamp,
      },
    ],
  });
}

function shortUa(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  return ua.slice(0, 40);
}

/**
 * `ViewTracker` — mounts in the ROOT layout (src/app/layout.tsx) once, so it
 * runs on every page load, including /checkout. Responsibilities:
 *  1) Initializes PostHog (autocapture + session recording + pageview/leave).
 *  2) Fires a Discord webhook on every page load.
 *  3) Fires throttled Discord pings on user interactions (clicks).
 * Everything is passive/ref-based and non-blocking.
 */
export function ViewTracker() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const endpoint = resolveEndpoint({});
    initPostHog(endpoint.posthogKey, endpoint.posthogHost);

    const pageLoad = () => {
      const path =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      const referrer =
        typeof document !== "undefined" && document.referrer
          ? (() => {
              try {
                return new URL(document.referrer).hostname;
              } catch {
                return "unknown";
              }
            })()
          : "חדש / ישירות";
      sendDiscord(
        {
          header: "👀 גישה חדשה לאתר",
          lines: [
            ["עמוד", path.slice(0, 120)],
            ["מקור ההפניה", referrer],
            ["מכשיר", shortUa()],
          ],
          timestamp: new Date().toISOString(),
        },
        endpoint.discordUrl,
      );
    };

    // 1) Page-load notification (fire immediately, never await).
    pageLoad();

    // 2) Interaction notifications — throttled so clicks never flood Discord.
    let lastPing = 0;
    const pendedRaf = { current: 0 };
    const onInteraction = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastPing < 2000) return;
      lastPing = now;
      if (pendedRaf.current) cancelAnimationFrame(pendedRaf.current);
      pendedRaf.current = requestAnimationFrame(() => {
        pendedRaf.current = 0;
        const el = e.target as HTMLElement | null;
        const text = (el?.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
        const path = window.location.pathname;
        sendDiscord(
          {
            header: "🖱️ אינטראקציה משתמש",
            lines: [
              ["אלמנט", text || el?.tagName?.slice(0, 40) || "—"].slice(0, 2) as [string, string],
              ["עמוד", path],
            ],
            timestamp: new Date().toISOString(),
          },
          endpoint.discordUrl,
        );
      });
    };
    document.addEventListener("click", onInteraction, { capture: true, passive: true });

    return () => {
      document.removeEventListener("click", onInteraction, { capture: true });
    };
  }, []);

  return null;
}

/**
 * `DemoVisitPing` — business-aware live view radar, mounted inside
 * SiteExperience (where `useSite` context exists). Sent in addition to the
 * generic page-load ping above; skipped for admins (secret key visits).
 */
export function DemoVisitPing() {
  const { data, isAdmin, mounted } = useSite();
  const sentRef = useRef(false);

  useEffect(() => {
    if (!mounted || isAdmin || sentRef.current) return;
    sentRef.current = true;

    const endpoint = resolveEndpoint({
      trackingWebhookUrl: data.trackingWebhookUrl,
    });

    // PostHog identity: group events under this demo business.
    try {
      if (posthogInitialized && data.businessId) {
        posthog.register_once({ demoBusiness: data.businessId });
      }
    } catch {
      /* noop */
    }

    sendDiscord(
      {
        header: `📺 פתיחת הדגמה — ${data.businessInfo.name}`,
        lines: [
          ["עסק", data.businessInfo.name],
          ["קטגוריה", data.businessInfo.category],
          ["Business ID", `\`${data.businessId}\``],
          ["תבנית", data.templateId],
          ["מכשיר", shortUa()],
        ],
        timestamp: new Date().toISOString(),
      },
      endpoint.discordUrl,
    );

    // Legacy n8n view-radar payload, still delivered when configured.
    if (isUsableHttpsWebhook(data.trackingWebhookUrl)) {
      void fetch(data.trackingWebhookUrl as string, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: data.businessId,
          businessName: data.businessInfo.name,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
        keepalive: true,
      }).catch(() => undefined);
    }
  }, [mounted, isAdmin, data]);

  return null;
}
