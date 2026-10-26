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
import { LEGACY_TEMPLATE_FALLBACK } from "@/types/site";
import siteDataJson from "@/data/siteData.json";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/JonathanGaming1/site-previews/main/public/sites";
const ADMIN_KEY = "yam2026";

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
  /** Replace the whole data object in React state (used by AI edit / recall). */
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
    if (
      ["apple-spatial", "whisky-obsidian", "cyber-quantum", "atelier-boutique"].includes(id)
    ) {
      return id as TemplateId;
    }
  }
  return "apple-spatial";
}

/** Fill a (possibly partial / legacy) remote JSON into a valid SiteData. */
function hydrateSite(remote: Partial<SiteData>, slug: string | null): SiteData {
  const base = clone(siteDataJson as unknown as SiteData);
  const merged = { ...base, ...clone(remote) } as SiteData;
  merged.templateId = normalizeTemplate(remote.templateId ?? base.templateId);
  if (slug) merged.slug = slug;
  return merged;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}

function stripMarkdownFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData>(() => clone(siteDataJson as unknown as SiteData));
  const initialData = useMemo(() => clone(siteDataJson as unknown as SiteData), []);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fetchedSlugRef = useRef<string | null>(null);

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

    let slug: string | null = null;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("site");
    if (fromQuery && fromQuery.trim()) {
      slug = fromQuery.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    } else {
      const match = window.location.pathname.match(/^\/p\/([a-zA-Z0-9_-]+)/);
      if (match) slug = match[1];
    }

    if (!slug) return;
    setSlug(slug);

    const isSameSlug = fetchedSlugRef.current === slug;
    fetchedSlugRef.current = slug;
    if (isSameSlug) return;

    const load = async () => {
      // 1) Same-origin /sites/{slug}.json — fast Cloudflare CDN copy first
      // 2) Raw GitHub — fresher saved content when CDN misses, cache-busted
      // 3) Bundled default data — graceful offline fallback
      try {
        const res = await fetch(`/sites/${slug}.json`, { cache: "no-store" });
        if (res.ok) {
          const remote = (await res.json()) as Partial<SiteData>;
          setData(hydrateSite(remote, slug));
          setRemoteLoaded(true);
          return;
        }
      } catch {
        /* fall through */
      }
      try {
        const res = await fetch(`${GITHUB_RAW_BASE}/${slug}.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const remote = (await res.json()) as Partial<SiteData>;
          setData(hydrateSite(remote, slug));
          setRemoteLoaded(true);
          return;
        }
      } catch {
        /* fall through */
      }
      // Unknown business: fall back to bundled default data, tagged with the slug.
      setData((prev) => ({ ...clone(prev), slug }));
      setRemoteLoaded(true);
    };
    void load();
  }, [mounted]);

  const isAdmin = mounted && adminKey === ADMIN_KEY;

  const updateValue = useCallback((path: string, value: string | number) => {
    setData((prev) => {
      const next = clone(prev);
      setByPath(next as unknown as Record<string, unknown>, path, value);
      return next;
    });
  }, []);

  const replaceData = useCallback((next: SiteData) => {
    setData(clone(next));
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
    setData((prev) => ({ ...prev, templateId: id }));
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
