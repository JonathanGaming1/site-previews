"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { useSite } from "@/components/SiteProvider";

/* ------------------------------------------------------------------ */
/* PostHog — public project key only. Every webhook secret now lives   */
/* in the Cloudflare Pages environment, never in this bundle.          */
/* ------------------------------------------------------------------ */

const DEFAULT_POSTHOG_KEY = "phc_AkDuMC253gZyg4HHGWyvGi63zYRSdZEoF5taihDvehV9";
const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
/** Per-device visit stamp. Refreshing or re-entering resets this, so a
 * visitor who keeps coming back never re-triggers a Discord alert. */
const VISIT_TS_PREFIX = "visit_ts_";
const VISIT_WINDOW_MS = 5 * 60 * 1000; // 300 seconds

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
    initPostHog(DEFAULT_POSTHOG_KEY, DEFAULT_POSTHOG_HOST);
  }, []);
  return null;
}

/**
 * `ViewTracker` — PostHog owns every click and interaction. Discord receives
 * at most one quiet entry alert per device per 5 minutes, sent by `/api/track`
 * on the server (HttpOnly cookie + IP/User-Agent fingerprint cooldown). No
 * webhook URL exists in this bundle.
 */
export function ViewTracker() {
  const { data, isAdmin, mounted, slug, remoteLoaded } = useSite();
  const sentRef = useRef(false);

  useEffect(() => {
    // Wait for the real business JSON so the alert never names the bundled
    // fallback instead of the visitor's actual demo.
    if (!mounted || !remoteLoaded || isAdmin || sentRef.current) return;


    const storeSlug = slug ?? data.slug ?? "default";
    const visitKey = VISIT_TS_PREFIX + storeSlug;
    const now = Date.now();

    // Strict 5-minute per-device guard. A refresh or a quick re-entry is still
    // a visit, so it updates the stamp (resetting the timer) and never reaches
    // /api/track at all. The edge enforces the same window by itself, with an
    // HttpOnly cookie plus an IP + User-Agent fingerprint.
    let recentVisit = false;
    try {
      const lastVisit = Number(localStorage.getItem(visitKey));
      recentVisit =
        Number.isFinite(lastVisit) && lastVisit > 0 && now - lastVisit < VISIT_WINDOW_MS;
    } catch {
      /* private mode — fall through and let the edge cooldown decide */
    }
    try {
      localStorage.setItem(visitKey, String(now));
    } catch {
      /* best effort */
    }
    if (recentVisit) return;

    sentRef.current = true;

    initPostHog(DEFAULT_POSTHOG_KEY, DEFAULT_POSTHOG_HOST);

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

    try {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        keepalive: true,
        body: JSON.stringify({
          slug: storeSlug,
          businessName: data.businessInfo?.name ?? "",
          templateId: data.templateId,
          device: deviceLabel(),
          url: window.location.href,
          // The server also skips when a valid admin_jwt cookie arrives.
          isAdmin: false,
        }),
      });
    } catch {
      /* the alert is best-effort and must never affect the page */
    }
  }, [data, isAdmin, mounted, remoteLoaded, slug]);

  return null;
}
