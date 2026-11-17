import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BirdIcon,
  FileUpIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  NotebookPenIcon,
  RefreshCwIcon,
  SettingsIcon,
} from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Badge } from "../../components/badge/badge";
import { Button } from "../../components/button/button";
import { formatNumber } from "../../lib/format";
import { portfolioTotal } from "../../stories/sample-data";
import { EXIT_TIMEOUT, storyCanvas } from "../../stories/story-canvas";
import { Delta } from "../delta/delta";
import { PageHeader } from "../page-header/page-header";
import { StatCard } from "../stat-card/stat-card";
import { AppShell, AppShellNav, AppShellNavItem } from "./app-shell";

const meta = {
  title: "Patterns/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The application frame: sidebar navigation, a sticky header, and the main region. Below the \`md\` breakpoint the sidebar moves into a sheet behind a menu button.

**Do**
- Mark the active page with \`current\`; it sets \`aria-current="page"\`.
- Use \`asChild\` to render your router's link component.
- Keep the header for page context and global actions; page actions belong in \`PageHeader\`.

**Don't**
- Nest an AppShell, or put a second \`<main>\` inside it.

**Accessibility**
- A "Skip to main content" link is the first focusable element.
- Landmarks: \`<nav>\` named by \`navLabel\`, \`<header>\`, and \`<main>\` (focusable, so the skip link moves focus there).
- The current page is marked with \`aria-current\`, a selected background, and a heavier weight, never color alone.
- On small screens the navigation sheet traps focus, closes on Escape, and closes when a link is chosen.
`,
      },
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj;

const nav = (
  <AppShellNav>
    <AppShellNavItem href="#dashboard" current icon={<LayoutDashboardIcon />}>
      Dashboard
    </AppShellNavItem>
    <AppShellNavItem href="#history" icon={<HistoryIcon />}>
      History
    </AppShellNavItem>
    <AppShellNavItem href="#notes" icon={<NotebookPenIcon />}>
      Notes
    </AppShellNavItem>
    <AppShellNavItem href="#import" icon={<FileUpIcon />}>
      Import
    </AppShellNavItem>
    <AppShellNavItem href="#settings" icon={<SettingsIcon />}>
      Settings
    </AppShellNavItem>
  </AppShellNav>
);

const brand = (
  <span className="flex items-center gap-sm font-display text-title font-heading">
    <BirdIcon aria-hidden className="size-icon-lg text-accent" />
    Product
  </span>
);

function Example() {
  return (
    <AppShell
      brand={brand}
      nav={nav}
      sidebarFooter="Data as of 2 minutes ago"
      header={
        <div className="flex flex-1 items-center justify-between gap-sm">
          <span className="text-label text-subtle">Watch closely. Decide yourself.</span>
          <Badge tone="positive">Connected</Badge>
        </div>
      }
    >
      <div className="flex flex-col gap-lg p-inset-lg">
        <PageHeader
          title="Dashboard"
          description="Holdings across every connected source, as of the last snapshot."
          actions={
            <Button variant="secondary">
              <RefreshCwIcon aria-hidden /> Refresh
            </Button>
          }
        />
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total value"
            value={formatNumber(portfolioTotal, { format: "currency" })}
            delta={<Delta value={0.0124} period="today" />}
          />
          <StatCard
            label="Day change"
            value={formatNumber(312.4, { format: "currency", sign: "always" })}
            delta={<Delta value={312.4} format="currency" period="today" />}
          />
          <StatCard
            label="Cash"
            value={formatNumber(4210.55, { format: "currency" })}
            description="12% of portfolio"
          />
        </div>
      </div>
    </AppShell>
  );
}

export const Default: Story = {
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await expect(canvas.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
      "href",
      "#main",
    );
    await expect(canvas.getByRole("main")).toHaveAttribute("id", "main");
    // hidden: true so this holds at any width (the sidebar is display:none below md).
    await expect(canvas.getByRole("link", { name: "Dashboard", hidden: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};

export const Mobile: Story = {
  render: () => <Example />,
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open navigation" }));
    const sheet = await within(document.body).findByRole("dialog", { name: "Navigation" });
    await userEvent.click(within(sheet).getByRole("link", { name: "History" }));
    await waitFor(
      () => expect(within(document.body).queryByRole("dialog")).toBeNull(),
      EXIT_TIMEOUT,
    );
  },
};
