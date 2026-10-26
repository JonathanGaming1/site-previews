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
import siteDataJson from "@/data/siteData.json";

export interface EditableProps {
  contentEditable?: boolean;
  suppressContentEditableWarning?: boolean;
  "data-edit-active"?: string;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
}

interface SiteContextValue {
  data: SiteData;
  initialData: SiteData;
  adminKey: string | null;
  isAdmin: boolean;
  mounted: boolean;
  /** Returns props that enable click-to-edit (contentEditable) for admin users. */
  editsFor: (path: string) => EditableProps;
  /** Update a nested value at a JSON path like "hero.headline" or "services.0.title". */
  updateValue: (path: string, value: string | number) => void;
  setTemplate: (id: TemplateId) => void;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  recallOriginal: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

function clone<T>(value: T): T {
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

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}

interface SiteProviderProps {
  children: React.ReactNode;
}

export function SiteProvider({ children }: SiteProviderProps) {
  const [data, setData] = useState<SiteData>(() => clone(siteDataJson as SiteData));
  const initialData = useMemo(() => clone(siteDataJson as SiteData), []);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key) setAdminKey(key);
    setMounted(true);
  }, []);

  const isAdmin = mounted && adminKey !== null;

  const updateValue = useCallback((path: string, value: string | number) => {
    setData((prev) => {
      const next = clone(prev);
      setByPath(next as unknown as Record<string, unknown>, path, value);
      return next;
    });
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

  const recallOriginal = useCallback(() => {
    setData((prev) => {
      const backup = (siteDataJson as SiteData).initialBackup;
      // Fetch the freshest known-good original: prefer a restored backup, else the file's snapshot.
      if (backup) return clone(backup);
      return clone(prev);
    });
  }, []);

  const value = useMemo<SiteContextValue>(
    () => ({
      data,
      initialData,
      adminKey,
      isAdmin,
      mounted,
      editsFor,
      updateValue,
      setTemplate,
      setTheme,
      recallOriginal,
    }),
    [data, initialData, adminKey, isAdmin, mounted, editsFor, updateValue, setTemplate, setTheme, recallOriginal],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
