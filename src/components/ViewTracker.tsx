"use client";

import { useEffect, useRef } from "react";
import { useSite } from "@/components/SiteProvider";
import { postToWebhook } from "@/lib/webhook";

/**
 * Live View Radar — non-blocking POST on first load for regular visitors
 * (no ?key=) so n8n can ping Discord when a prospect opens the demo.
 */
export function ViewTracker() {
  const { data, isAdmin, mounted } = useSite();
  const sentRef = useRef(false);

  useEffect(() => {
    if (!mounted || isAdmin || sentRef.current) return;
    sentRef.current = true;

    const payload = {
      businessId: data.businessId,
      businessName: data.businessInfo.name,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    // Fire and forget — never blocks rendering or fetch errors bubble to UI.
    void postToWebhook(data.trackingWebhookUrl, payload);
  }, [mounted, isAdmin, data.businessId, data.businessInfo.name, data.trackingWebhookUrl]);

  return null;
}
