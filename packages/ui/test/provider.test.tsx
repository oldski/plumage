import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../src/components/dialog/dialog";
import { PlumageProvider, usePlumage } from "../src/provider/plumage-provider";

function Probe() {
  const { brand, mode, resolvedMode, density } = usePlumage();
  return <output>{`${brand} ${mode} ${resolvedMode} ${density}`}</output>;
}

const html = () => document.documentElement;

describe("PlumageProvider", () => {
  it("stamps all three attributes on <html> in root scope, and restores them on unmount", () => {
    const { unmount } = render(
      <PlumageProvider brand="finch" mode="dark">
        <Probe />
      </PlumageProvider>,
    );
    expect(html()).toHaveAttribute("data-brand", "finch");
    expect(html()).toHaveAttribute("data-theme", "dark");
    expect(html()).toHaveAttribute("data-density", "compact");
    unmount();
    expect(html()).not.toHaveAttribute("data-brand");
  });

  it("defaults density per brand", () => {
    render(
      <PlumageProvider brand="sparrow" mode="light">
        <Probe />
      </PlumageProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("sparrow light light comfortable");
  });

  it("resolves system mode from prefers-color-scheme", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: query === "(prefers-color-scheme: dark)",
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList,
    );
    render(
      <PlumageProvider brand="finch">
        <Probe />
      </PlumageProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("finch system dark compact");
    matchMedia.mockRestore();
  });

  it("renders a scoped element in local scope and leaves <html> alone", () => {
    render(
      <PlumageProvider brand="sparrow" mode="dark" density="compact" scope="local">
        <Probe />
      </PlumageProvider>,
    );
    const scope = screen.getByRole("status").parentElement;
    expect(scope).toHaveAttribute("data-brand", "sparrow");
    expect(scope).toHaveAttribute("data-theme", "dark");
    expect(scope).toHaveAttribute("data-density", "compact");
    expect(html()).not.toHaveAttribute("data-brand");
  });

  it("lets nested providers inherit brand and mode", () => {
    render(
      <PlumageProvider brand="finch" mode="dark">
        <PlumageProvider scope="local" density="comfortable">
          <Probe />
        </PlumageProvider>
      </PlumageProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("finch dark dark comfortable");
  });

  it("portals overlays into the nearest local scope", async () => {
    render(
      <PlumageProvider brand="sparrow" mode="dark" scope="local">
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Scoped</DialogTitle>
          </DialogContent>
        </Dialog>
      </PlumageProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog", { name: "Scoped" });
    expect(dialog.closest("[data-brand]")).toHaveAttribute("data-brand", "sparrow");
  });

  it("throws a helpful error without a brand", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<PlumageProvider>x</PlumageProvider>)).toThrow(/needs a brand/);
  });

  it("usePlumage throws outside a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(/inside a PlumageProvider/);
  });
});
