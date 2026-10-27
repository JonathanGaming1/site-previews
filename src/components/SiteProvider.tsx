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
const ADMIN_KEY = "yam2026";

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
  adminKey: string | null;
  isAdmin: boolean;
  mounted: boolean;
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

  if (applyOverride && typeof window !== "undefined") {
    const storeSlug = slug ?? merged.slug ?? "default";
    try {
      const raw = localStorage.getItem(SITE_OVERRIDE_PREFIX + storeSlug);
      if (raw) {
        const local = JSON.parse(raw) as Partial<SiteData>;
        const mergedLocal = { ...merged, ...clone(local) } as SiteData;
        mergedLocal.templateId = normalizeTemplate(
          local.templateId ?? merged.templateId,
        );
        mergedLocal.n8nEditWebhookUrl = "";
        mergedLocal.trackingWebhookUrl = "";
        mergedLocal.checkpoints = mergedLocal.checkpoints ?? merged.checkpoints;
        if (!mergedLocal.initialBackup) {
          mergedLocal.initialBackup = merged.initialBackup;
        }
        return mergedLocal;
      }
    } catch {
      /* corrupt local override — fall back to the remote JSON */
    }
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
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fetchedSlugRef = useRef<string | null>(null);

  const initialData = useMemo(() => seedSite(), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key) setAdminKey(key);
    setMounted(true);
  }, []);

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
      const isAdminVisit = params.get("key") === ADMIN_KEY;
      setData((prev) => hydrateSite(prev, null, isAdminVisit));
      setRemoteLoaded(true);
      return;
    }

    setSlug(resolvedSlug);

    const isSameSlug = fetchedSlugRef.current === resolvedSlug;
    fetchedSlugRef.current = resolvedSlug;
    if (isSameSlug) return;

    const isAdminVisit = params.get("key") === ADMIN_KEY;

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
  }, [mounted]);

  const isAdmin = mounted && adminKey === ADMIN_KEY;

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
      adminKey,
      isAdmin,
      mounted,
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
      adminKey,
      isAdmin,
      mounted,
      replaceData,
      editsFor,
      updateValue,
      setTemplate,
      setTheme,
    ],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
