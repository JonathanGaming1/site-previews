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
const ADMIN_FLAG = "agency_is_admin";
const LAST_VISIT_PREFIX = "last_visit_";
const VISIT_WINDOW_MS = 30 * 60 * 1000;

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

/**
 * The admin flag is written by SiteProvider only AFTER the server accepts the
 * key, so this bundle never compares — or stores — a secret itself.
 */
function adminFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ADMIN_FLAG) === "true";
  } catch {
    return false;
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
 * a single quiet entry alert per demo, sent by `/api/track` on the server with
 * a per-IP 30-minute cooldown. No webhook URL exists in this bundle.
 */
export function ViewTracker() {
  const { data, isAdmin, mounted, slug, remoteLoaded } = useSite();
  const sentRef = useRef(false);

  useEffect(() => {
    // Wait for the real business JSON so the alert never names the bundled
    // fallback instead of the visitor's actual demo.
    if (!mounted || !remoteLoaded || isAdmin || sentRef.current) return;

    // Admin previews never notify Discord. The flag persists per browser.
    if (adminFlag()) return;

    const storeSlug = slug ?? data.slug ?? "default";
    const visitKey = LAST_VISIT_PREFIX + storeSlug;

    // Client-side 30-minute guard: no request at all for repeat visitors.
    try {
      const lastVisit = Number(localStorage.getItem(visitKey));
      if (Number.isFinite(lastVisit) && lastVisit > 0) {
        if (Date.now() - lastVisit < VISIT_WINDOW_MS) return;
      }
    } catch {
      /* private mode — fall through and let the edge cooldown decide */
    }

    sentRef.current = true;
    try {
      localStorage.setItem(visitKey, String(Date.now()));
    } catch {
      /* best effort */
    }

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
          isAdmin: false,
        }),
      });
    } catch {
      /* the alert is best-effort and must never affect the page */
    }
  }, [data, isAdmin, mounted, remoteLoaded, slug]);

  return null;
}
