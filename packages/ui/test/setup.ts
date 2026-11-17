// jsdom gaps that Radix primitives rely on, plus jest-dom matchers.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

const hasDom = typeof window !== "undefined";

/** Define a property only where jsdom lacks it (some it declares but leaves undefined). */
function polyfill(target: object, key: string, value: unknown) {
  if ((target as Record<string, unknown>)[key] === undefined) {
    Object.defineProperty(target, key, { value, configurable: true, writable: true });
  }
}

if (hasDom) {
  polyfill(
    globalThis,
    "ResizeObserver",
    class {
      observe = () => undefined;
      unobserve = () => undefined;
      disconnect = () => undefined;
    },
  );
  polyfill(Element.prototype, "scrollIntoView", () => undefined);
  polyfill(Element.prototype, "hasPointerCapture", () => false);
  polyfill(Element.prototype, "setPointerCapture", () => undefined);
  polyfill(Element.prototype, "releasePointerCapture", () => undefined);
  polyfill(window, "matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

afterEach(() => {
  if (!hasDom) return;
  cleanup();
  for (const key of ["brand", "theme", "density"]) {
    Reflect.deleteProperty(document.documentElement.dataset, key);
  }
});
