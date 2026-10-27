"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { useSite } from "@/components/SiteProvider";
import { postToDiscord } from "@/lib/webhook";

/* ------------------------------------------------------------------ */
/* Production credentials — hardcoded defaults so analytics always     */
/* works, even when a business JSON does not specify its own endpoint. */
/* ------------------------------------------------------------------ */

const DEFAULT_DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1563231187646947397/6GlOTjlvAzjFbHjBkHegPCjptCQZiUGwTFbib4jEWzeffaHcQ8Y15RDv-BIxyXG_JkZV";
const DEFAULT_POSTHOG_KEY = "phc_AkDuMC253gZyg4HHGWyvGi63zYRSdZEoF5taihDvehV9";
const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const ADMIN_KEY = "yam2026";
const ADMIN_FLAG = "agency_is_admin";

interface TrackerEndpoint {
  posthogKey: string;
  posthogHost: string;
  discordUrl: string;
}

/** PostHog may be overridden per business; the Discord destination is always
 * the single production entry webhook. */
function resolveEndpoint(data: {
  posthogKey?: string;
  posthogHost?: string;
}): TrackerEndpoint {
  return {
    posthogKey: (data.posthogKey || DEFAULT_POSTHOG_KEY).trim(),
    posthogHost: (data.posthogHost || DEFAULT_POSTHOG_HOST).trim(),
    discordUrl: DEFAULT_DISCORD_WEBHOOK_URL,
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

/** Stamp the admin flag as early as possible when the secret key is present. */
function stampAdminFlag(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const key = params.get("key");
  if (key === ADMIN_KEY) {
    try {
      localStorage.setItem(ADMIN_FLAG, "true");
    } catch {
      /* private mode */
    }
  }
  return Boolean(key);
}

function deviceLabel(): string {
  if (typeof navigator === "undefined") return "Desktop";
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  return "Desktop";
}

/**
 * PostHog bootstrap — mounted once in the ROOT layout so every route,
 * including /checkout, is captured (pageviews, autocapture, session replay).
 */
export function AnalyticsBootstrap() {
  useEffect(() => {
    stampAdminFlag();
    const endpoint = resolveEndpoint({});
    initPostHog(endpoint.posthogKey, endpoint.posthogHost);
  }, []);
  return null;
}

/**
 * `ViewTracker` — mounted inside the site provider. PostHog owns every click
 * and interaction. Discord receives exactly ONE quiet entry alert per demo
 * session, and never for the admin / ?key= previews.
 */
export function ViewTracker() {
  const { data, isAdmin, mounted, slug, remoteLoaded } = useSite();
  const sentRef = useRef(false);

  useEffect(() => {
    // Wait for the real business JSON so the Discord alert never names the
    // bundled fallback instead of the visitor's actual demo.
    if (!mounted || !remoteLoaded || isAdmin || sentRef.current) return;

    const params = new URLSearchParams(window.location.search);

    // Admin previews never message Discord. The flag persists per browser.
    const hasKey = stampAdminFlag();
    if (hasKey) return;
    try {
      if (localStorage.getItem(ADMIN_FLAG) === "true") return;
    } catch {
      /* private mode */
    }

    const storeSlug = slug ?? data.slug ?? "default";
    const visitKey = `visited_${storeSlug}`;

    try {
      if (sessionStorage.getItem(visitKey)) return;
    } catch {
      /* private mode */
    }

    sentRef.current = true;
    try {
      sessionStorage.setItem(visitKey, "1");
    } catch {
      /* best effort */
    }

    const endpoint = resolveEndpoint({});
    // Guarantee PostHog is live even if the layout bootstrap effect has not
    // run yet; the module-level guard makes this idempotent.
    initPostHog(endpoint.posthogKey, endpoint.posthogHost);

    // Group every PostHog event under this demo business.
    try {
      if (posthogInitialized) {
        posthog.register_once({
          demo_business: data.businessId || storeSlug,
          demo_template: data.templateId,
        });
      }
    } catch {
      /* noop */
    }

    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    const content = [
      "**כניסה חדשה לאתר הדגמה**",
      `עסק: ${data.businessInfo.name} (${storeSlug})`,
      `תבנית: ${data.templateId} | מכשיר: ${deviceLabel()}`,
      `קישור: ${currentUrl}`,
    ].join("\n");

    void postToDiscord(endpoint.discordUrl, { content });
  }, [data, isAdmin, mounted, remoteLoaded, slug]);

  return null;
}
