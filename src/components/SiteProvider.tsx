"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SiteData, TemplateId, ThemeConfig } from "@/types/site";
import { LEGACY_TEMPLATE_FALLBACK, TEMPLATE_OPTIONS } from "@/types/site";
import siteDataJson from "@/data/siteData.json";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/JonathanGaming1/site-previews/main/public/sites";
/**
 * The admin key NEVER lives in this bundle. The browser only holds markers
 * that the SERVER set after a successful `login` exchange with /api/admin,
 * which returns an HttpOnly session cookie the JS can neither read nor forge.
 */
export const ADMIN_SESSION_MARKER = "agency_admin_session";
export const ADMIN_FLAG = "agency_is_admin";

/** localStorage prefix for the admin's instant, 0ms local override. */
export const SITE_OVERRIDE_PREFIX = "site_override_";

/** Raw GitHub JSON base kept for emergency read-only re-syncs. */
export const SITES_RAW_BASE = GITHUB_RAW_BASE;

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
  /** Exchange an admin key with the server for an HttpOnly session cookie. */
  login: (key: string) => Promise<boolean>;
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
  const fetchedSlugRef = useRef<string | null>(null);

  const initialData = useMemo(() => seedSite(), []);

  const callAuth = useCallback(
    async (payload: Record<string, unknown>): Promise<boolean> => {
      try {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          credentials: "same-origin",
          body: JSON.stringify(payload),
        });
        const parsed = (await res.json()) as {
          ok?: boolean;
          authenticated?: boolean;
        };
        return res.ok && parsed?.ok === true && parsed?.authenticated === true;
      } catch {
        return false;
      }
    },
    [],
  );

  /**
   * Admin authentication is decided by the server, never by a string in the
   * bundle: `?key=` is exchanged once for an HttpOnly session cookie, and a
   * returning browser is confirmed with `whoami` before any data loads.
   */
  useEffect(() => {
    let cancelled = false;

    const finish = (authenticated: boolean) => {
      if (cancelled) return;
      try {
        if (authenticated) {
          sessionStorage.setItem(ADMIN_SESSION_MARKER, "true");
          localStorage.setItem(ADMIN_FLAG, "true");
        } else {
          sessionStorage.removeItem(ADMIN_SESSION_MARKER);
          localStorage.removeItem(ADMIN_FLAG);
        }
      } catch {
        /* storage disabled — the server cookie still decides */
      }
      setIsAdmin(authenticated);
      setAdminReady(true);
      setMounted(true);
    };

    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");

    if (key) {
      void (async () => {
        const authenticated = await callAuth({ action: "login", key });
        if (authenticated && !cancelled) {
          // Strip the secret from the address bar and history immediately.
          params.delete("key");
          const query = params.toString();
          window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
          );
        }
        finish(authenticated);
      })();
      return () => {
        cancelled = true;
      };
    }

    let marked = false;
    try {
      marked = sessionStorage.getItem(ADMIN_SESSION_MARKER) === "true";
    } catch {
      marked = false;
    }

    if (marked) {
      void (async () => {
        finish(await callAuth({ action: "whoami" }));
      })();
      return () => {
        cancelled = true;
      };
    }

    finish(false);
    return () => {
      cancelled = true;
    };
  }, [callAuth]);

  // Resolve the business slug from /p/{slug} or ?site={slug} and
  // dynamically load that business's JSON so each business has a
  // permanent unique URL and admin edits appear instantly on refresh.
  useEffect(() => {
    if (!mounted) return;

    let resolvedSlug: string | null = null;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("site");
    if (fromQuery && fromQuery.trim()) {
      resolvedSlug = fromQuery.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    } else {
      const match = window.location.pathname.match(/^\/p\/([a-zA-Z0-9_-]+)/);
      if (match) resolvedSlug = match[1];
    }

    if (!resolvedSlug) {
      const isAdminVisit = isAdmin;
      setData((prev) => hydrateSite(prev, null, isAdminVisit));
      setRemoteLoaded(true);
      return;
    }

    setSlug(resolvedSlug);

    const isSameSlug = fetchedSlugRef.current === resolvedSlug;
    fetchedSlugRef.current = resolvedSlug;
    if (isSameSlug) return;

    const isAdminVisit = isAdmin;

    const load = async () => {
      // 1) Same-origin /sites/{slug}.json — fast Cloudflare CDN copy first
      // 2) Raw GitHub — fresher saved content when CDN misses, cache-busted
      // 3) Bundled default data — graceful offline fallback
      try {
        const res = await fetch(`/sites/${resolvedSlug}.json`, {
          cache: "no-store",
        });
        if (res.ok) {
          const remote = (await res.json()) as Partial<SiteData>;
          setData(hydrateSite(remote, resolvedSlug, isAdminVisit));
          setRemoteLoaded(true);
          return;
        }
      } catch {
        /* fall through */
      }
      try {
        const res = await fetch(
          `${GITHUB_RAW_BASE}/${resolvedSlug}.json?t=${Date.now()}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const remote = (await res.json()) as Partial<SiteData>;
          setData(hydrateSite(remote, resolvedSlug, isAdminVisit));
          setRemoteLoaded(true);
          return;
        }
      } catch {
        /* fall through */
      }
      // Unknown business: fall back to bundled default data, tagged with the slug.
      setData((prev) => hydrateSite(prev, resolvedSlug, isAdminVisit));
      setRemoteLoaded(true);
    };
    void load();
  }, [mounted, isAdmin]);

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

  /** Exchange an admin key for a server session, then unlock this browser. */
  const login = useCallback(
    async (key: string): Promise<boolean> => {
      if (!(await callAuth({ action: "login", key }))) return false;
      try {
        sessionStorage.setItem(ADMIN_SESSION_MARKER, "true");
        localStorage.setItem(ADMIN_FLAG, "true");
      } catch {
        /* storage disabled — the cookie still carries the session */
      }
      setIsAdmin(true);
      setAdminReady(true);
      setData((prev) => applyLocalOverride(prev, slug ?? prev.slug ?? "default"));
      return true;
    },
    [callAuth, slug],
  );

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
      login,
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
      login,
      replaceData,
      editsFor,
      updateValue,
      setTemplate,
      setTheme,
    ],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
