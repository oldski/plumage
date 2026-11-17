"use client";

import { brandDefaults, type Brand, type Density, type Mode } from "@plumage/tokens";
import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";

export type ModePreference = Mode | "system";

export interface PlumageContextValue {
  brand: Brand;
  /** The requested mode, possibly "system". */
  mode: ModePreference;
  /** The mode actually applied. */
  resolvedMode: Mode;
  density: Density;
  scope: "root" | "local";
  /** Element overlays portal into; null means document.body. */
  portalContainer: HTMLElement | null;
}

const PlumageContext = createContext<PlumageContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToColorScheme(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function usePrefersDark(): boolean {
  return useSyncExternalStore(
    subscribeToColorScheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface PlumageProviderProps {
  /** Product brand. Required on the outermost provider; nested providers inherit it. */
  brand?: Brand;
  /** "system" follows prefers-color-scheme. Nested providers inherit the parent's preference. */
  mode?: ModePreference;
  /** Defaults to the brand's own default: compact for Finch, comfortable for the others. */
  density?: Density;
  /**
   * "root" sets the attributes on <html>, so the whole document, including
   * portaled overlays, is themed. "local" renders a scoped <div> and portals
   * overlays into it, for side-by-side previews and embedded surfaces.
   */
  scope?: "root" | "local";
  /** Class names for the scope element. Local scope only. */
  className?: string;
  children?: ReactNode;
}

/**
 * Sets brand, mode, and density for everything inside it by writing the
 * data-brand, data-theme, and data-density attributes that @plumage/tokens
 * CSS is scoped by. All three are always written together; see ADR 0003.
 */
export function PlumageProvider({
  brand: brandProp,
  mode: modeProp,
  density: densityProp,
  scope = "root",
  className,
  children,
}: PlumageProviderProps) {
  const parent = use(PlumageContext);
  const prefersDark = usePrefersDark();
  const [scopeElement, setScopeElement] = useState<HTMLDivElement | null>(null);

  const brand = brandProp ?? parent?.brand;
  const mode = modeProp ?? parent?.mode ?? "system";
  const resolvedMode: Mode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
  const density = densityProp ?? (brand ? brandDefaults[brand].density : "comfortable");

  useIsomorphicLayoutEffect(() => {
    if (scope !== "root" || !brand) return;
    const { dataset } = document.documentElement;
    const previous = { brand: dataset.brand, theme: dataset.theme, density: dataset.density };
    dataset.brand = brand;
    // Read the media query here too: while hydrating, resolvedMode still holds
    // the server's guess (light), and writing it would flash a dark page light.
    dataset.theme =
      mode === "system" ? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light") : resolvedMode;
    dataset.density = density;
    return () => {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) Reflect.deleteProperty(dataset, key);
        else dataset[key] = value;
      }
    };
  }, [scope, brand, mode, resolvedMode, density]);

  const value = useMemo<PlumageContextValue | null>(
    () =>
      brand
        ? {
            brand,
            mode,
            resolvedMode,
            density,
            scope,
            portalContainer: scope === "local" ? scopeElement : null,
          }
        : null,
    [brand, mode, resolvedMode, density, scope, scopeElement],
  );

  if (!value) {
    throw new Error("PlumageProvider needs a brand, or a parent PlumageProvider to inherit one.");
  }

  return (
    <PlumageContext value={value}>
      {scope === "local" ? (
        <div
          ref={setScopeElement}
          data-brand={value.brand}
          data-theme={value.resolvedMode}
          data-density={value.density}
          className={cn("bg-canvas text-default", className)}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </PlumageContext>
  );
}

/** Current brand, mode, and density. Throws outside a PlumageProvider. */
export function usePlumage(): PlumageContextValue {
  const context = use(PlumageContext);
  if (!context) throw new Error("usePlumage must be used inside a PlumageProvider.");
  return context;
}

/** Current Plumage context, or null outside a provider. */
export function useOptionalPlumage(): PlumageContextValue | null {
  return use(PlumageContext);
}

/** Where overlays portal to: the nearest local scope, or document.body. */
export function usePortalContainer(): HTMLElement | undefined {
  return use(PlumageContext)?.portalContainer ?? undefined;
}
