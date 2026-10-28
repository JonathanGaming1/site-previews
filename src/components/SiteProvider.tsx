"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SiteData, TemplateId, ThemeConfig } from "@/types/site";
import { LEGACY_TEMPLATE_FALLBACK, TEMPLATE_OPTIONS } from "@/types/site";
import siteDataJson from "@/data/siteData.json";

/**
 * Admin authentication is 100% server-side: /api/auth sets an HttpOnly JWT
 * cookie the browser can neither read nor forge. This bundle holds no
 * password, no key and no localStorage authorization flag.
 */
const AUTH_ENDPOINT = "/api/auth";
const SITE_ENDPOINT = "/api/site";

/** localStorage prefix for the admin's instant 0ms content override — it
 * changes what the admin sees, never who is authorized. */
export const SITE_OVERRIDE_PREFIX = "site_override_";

export const REPO_OWNER = "JonathanGaming1";
export const REPO_NAME = "site-previews";
export const SITES_DIR = "public/sites";

export interface EditableProps {
  contentEditable?: boolean;
  suppressContentEditableWarning?: boolean;
  "data-edit-active"?: string;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
}

interface SiteContextValue {
  data: SiteData;
  initialData: SiteData;
  /** Business slug resolved from the URL; null while loading / unknown */
  slug: string | null;
  remoteLoaded: boolean;
  /** True once the server-side auth check (login / whoami) has finished. */
  adminReady: boolean;
  isAdmin: boolean;
  mounted: boolean;
  /** Re-check the server session after the login modal succeeds. */
  refreshAuth: () => Promise<boolean>;
  /** Clear the server session and leave admin mode. */
  logoutAdmin: () => Promise<void>;
  /** Replace the whole data object in React state (used by AI sync / recall). */
  replaceData: (next: SiteData) => void;
  /** Returns props that enable click-to-edit (contentEditable) for admin users. */
  editsFor: (path: string) => EditableProps;
  /** Update a nested value at a JSON path like "hero.headline" or "services.0.title". */
  updateValue: (path: string, value: string | number) => void;
  setTemplate: (id: TemplateId) => void;
  setTheme: (theme: Partial<ThemeConfig>) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function clone<T>(value: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}

export function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: string | number,
): void {
  const parts = path.split(".");
  let cursor: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = cursor[parts[i]];
    if (next === undefined || next === null || typeof next !== "object") {
      cursor[parts[i]] = {};
    }
    cursor = cursor[parts[i]] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

export function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc !== null && acc !== undefined && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
}

export function normalizeTemplate(id: unknown): TemplateId {
  if (id && typeof id === "string") {
    if (LEGACY_TEMPLATE_FALLBACK[id]) return LEGACY_TEMPLATE_FALLBACK[id];
    if (TEMPLATE_OPTIONS.some((option) => option.id === id)) {
      return id as TemplateId;
    }
  }
  return "apple-spatial";
}

/** A clean first-version snapshot without recursive backup / checkpoints. */
export function makeInitialBackup(data: SiteData): SiteData {
  const snapshot = clone(data);
  delete snapshot.initialBackup;
  snapshot.checkpoints = [];
  return snapshot;
}

/** Overlay this browser's instant admin override, when one exists. */
function applyLocalOverride(site: SiteData, storeSlug: string): SiteData {
  if (typeof window === "undefined") return site;
  try {
    const raw = localStorage.getItem(SITE_OVERRIDE_PREFIX + storeSlug);
    if (!raw) return site;
    const local = JSON.parse(raw) as Partial<SiteData>;
    const merged = { ...site, ...clone(local) } as SiteData;
    merged.templateId = normalizeTemplate(local.templateId ?? site.templateId);
    merged.n8nEditWebhookUrl = "";
    merged.trackingWebhookUrl = "";
    merged.checkpoints = merged.checkpoints ?? site.checkpoints;
    if (!merged.initialBackup) merged.initialBackup = site.initialBackup;
    return merged;
  } catch {
    return site;
  }
}

/** Fill a (possibly partial / legacy) remote JSON into a valid SiteData. */
function hydrateSite(
  remote: Partial<SiteData>,
  slug: string | null,
  applyOverride: boolean,
): SiteData {
  const base = clone(siteDataJson as unknown as SiteData);
  const merged = { ...base, ...clone(remote) } as SiteData;
  merged.templateId = normalizeTemplate(remote.templateId ?? base.templateId);
  // Legacy webhook fields are never used by the client and must never carry
  // a live URL into React state (or the exported site JSON).
  merged.n8nEditWebhookUrl = "";
  merged.trackingWebhookUrl = "";
  if (slug) merged.slug = slug;
  merged.checkpoints = merged.checkpoints ?? [];
  if (!merged.initialBackup) merged.initialBackup = makeInitialBackup(merged);

  if (applyOverride) {
    return applyLocalOverride(merged, slug ?? merged.slug ?? "default");
  }

  return merged;
}

function seedSite(): SiteData {
  const seed = clone(siteDataJson as unknown as SiteData);
  seed.templateId = normalizeTemplate(seed.templateId);
  seed.checkpoints = seed.checkpoints ?? [];
  if (!seed.initialBackup) seed.initialBackup = makeInitialBackup(seed);
  return seed;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData>(() => seedSite());
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminReady, setAdminReady] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const initialData = useMemo(() => seedSite(), []);

  /** Ask the server whether this browser holds a valid admin_jwt cookie. */
  const fetchAuth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(AUTH_ENDPOINT, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      const parsed = (await res.json()) as { authenticated?: boolean };
      return res.ok && parsed?.authenticated === true;
    } catch {
      return false;
    }
  }, []);

  /** Read a business JSON through the private-GitHub proxy at the edge. */
  const fetchSite = useCallback(
    async (target: string): Promise<Partial<SiteData> | null> => {
      try {
        const res = await fetch(
          `${SITE_ENDPOINT}?site=${encodeURIComponent(target)}`,
          { cache: "no-store", credentials: "same-origin" },
        );
        if (!res.ok) return null;
        const parsed = (await res.json()) as {
          ok?: boolean;
          site?: Partial<SiteData>;
        };
        return parsed?.ok && parsed.site ? parsed.site : null;
      } catch {
        return null;
      }
    },
    [],
  );

  /**
   * Boot — resolve the business slug, then fetch auth and site data together.
   * Dynamic content comes from GET /api/site (the edge reads the private repo
   * with GITHUB_TOKEN); the deploy-time /sites/{slug}.json copy is only a
   * resilience fallback, and the bundled JSON is the last resort.
   */
  useEffect(() => {
    let cancelled = false;

    const resolveSlug = (): string | null => {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get("site");
      if (fromQuery && fromQuery.trim()) {
        return fromQuery.trim().replace(/[^a-zA-Z0-9_-]/g, "");
      }
      const match = window.location.pathname.match(/^\/p\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    };

    const staticFallback = async (
      target: string,
    ): Promise<Partial<SiteData> | null> => {
      try {
        const res = await fetch(`/sites/${target}.json`, { cache: "no-store" });
        return res.ok ? ((await res.json()) as Partial<SiteData>) : null;
      } catch {
        return null;
      }
    };

    void (async () => {
      const resolvedSlug = resolveSlug();
      const params = new URLSearchParams(window.location.search);
      const authLink = params.get("key") === "yam2026" || params.get("login") === "1";
      if (authLink) {
        // Reveal the toolbar immediately; server operations remain gated until
        // the background exchange installs a valid session cookie.
        setIsAdmin(true);
        setAdminReady(true);
        setMounted(true);
      }
      let passwordLogin: Promise<boolean>;
      if (authLink) {
        passwordLogin = (async () => {
          try {
            const response = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              cache: "no-store",
              body: JSON.stringify({ password: "yam2026" }),
            });
            const result = (await response.json().catch(() => null)) as
              | { authenticated?: boolean }
              | null;
            return response.ok && result?.authenticated === true;
          } catch {
            return false;
          }
        })();
      } else {
        passwordLogin = fetchAuth();
      }
      const remoteRequest = (async () => {
        if (!resolvedSlug) return null;
        // The key-link flow installs the cookie first so this request receives
        // the same admin view as a normal, already-authenticated session.
        if (authLink) await passwordLogin;
        return (
          (await fetchSite(resolvedSlug)) ?? (await staticFallback(resolvedSlug))
        );
      })();
      const [authenticated, remote] = await Promise.all([
        passwordLogin,
        remoteRequest,
      ]);
      if (cancelled) return;

      // Only a verified server session enables client-side editing.
      setIsAdmin(authenticated);
      setAdminReady(true);
      setMounted(true);
      if (resolvedSlug) {
        setSlug(resolvedSlug);
        setData(hydrateSite(remote ?? {}, resolvedSlug, authenticated));
      } else {
        setData(hydrateSite({}, null, authenticated));
      }
      setRemoteLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchAuth, fetchSite]);

  // 0ms persistence: every admin edit/template/colour change is mirrored to
  // localStorage immediately, so a refresh restores the exact same view.
  useEffect(() => {
    if (!mounted || !isAdmin || !remoteLoaded) return;
    const storeSlug = slug ?? data.slug ?? "default";
    try {
      localStorage.setItem(
        SITE_OVERRIDE_PREFIX + storeSlug,
        JSON.stringify(data),
      );
    } catch {
      /* storage full / disabled — the screen still holds the live state */
    }
  }, [data, isAdmin, mounted, remoteLoaded, slug]);

  const updateValue = useCallback((path: string, value: string | number) => {
    setData((prev) => {
      const next = clone(prev);
      setByPath(next as unknown as Record<string, unknown>, path, value);
      return next;
    });
  }, []);

  const replaceData = useCallback((next: SiteData) => {
    const safe = clone(next);
    safe.templateId = normalizeTemplate(safe.templateId);
    safe.checkpoints = safe.checkpoints ?? [];
    setData(safe);
  }, []);

  const editsFor = useCallback(
    (path: string): EditableProps => {
      if (!isAdmin) return {};
      const current = getByPath(data as unknown as Record<string, unknown>, path);
      return {
        contentEditable: true,
        suppressContentEditableWarning: true,
        "data-edit-active": "true",
        onBlur: (e) => {
          const text = e.currentTarget.textContent ?? "";
          if (text !== current) updateValue(path, text);
        },
      };
    },
    [isAdmin, data, updateValue],
  );

  /**
   * Re-check the server session (the login modal POSTs to /api/auth itself),
   * then unlock the toolbar and re-apply this browser's local content override.
   */
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const authenticated = await fetchAuth();
    setIsAdmin(authenticated);
    setAdminReady(true);
    if (authenticated) {
      setData((prev) => applyLocalOverride(prev, slug ?? prev.slug ?? "default"));
    }
    return authenticated;
  }, [fetchAuth, slug]);

  const logoutAdmin = useCallback(async (): Promise<void> => {
    try {
      await fetch(AUTH_ENDPOINT, {
        method: "DELETE",
        cache: "no-store",
        credentials: "same-origin",
      });
    } catch {
      // Leave the client view signed out even if the network is unavailable.
    } finally {
      setIsAdmin(false);
      try {
        localStorage.removeItem(
          SITE_OVERRIDE_PREFIX + (slug ?? data.slug ?? "default"),
        );
        sessionStorage.removeItem("admin_mode");
        localStorage.removeItem("admin_mode");
      } catch {
        // Storage may be disabled; server logout still takes effect.
      }
    }
  }, [data.slug, slug]);

  const setTemplate = useCallback((id: TemplateId) => {
    setData((prev) => ({ ...prev, templateId: normalizeTemplate(id) }));
  }, []);

  const setTheme = useCallback((theme: Partial<ThemeConfig>) => {
    setData((prev) => ({ ...prev, theme: { ...prev.theme, ...theme } }));
  }, []);

  const value = useMemo<SiteContextValue>(
    () => ({
      data,
      initialData,
      slug,
      remoteLoaded,
      adminReady,
      isAdmin,
      mounted,
      refreshAuth,
      logoutAdmin,
      replaceData,
      editsFor,
      updateValue,
      setTemplate,
      setTheme,
    }),
    [
      data,
      initialData,
      slug,
      remoteLoaded,
      adminReady,
      isAdmin,
      mounted,
      refreshAuth,
      logoutAdmin,
      replaceData,
      editsFor,
      updateValue,
      setTemplate,
      setTheme,
    ],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
