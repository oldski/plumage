"use client";

import { MenuIcon } from "lucide-react";
import { Slot } from "radix-ui";
import {
  createContext,
  use,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Button } from "../../components/button/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../../components/sheet/sheet";
import { cn } from "../../lib/cn";

const AppShellContext = createContext<{ closeNav: () => void }>({ closeNav: () => undefined });

export interface AppShellProps extends Omit<ComponentProps<"div">, "children"> {
  /** Product mark and name, at the top of the sidebar. */
  brand: ReactNode;
  /** Usually an <AppShellNav>. */
  nav: ReactNode;
  /** Accessible name for the navigation landmark. */
  navLabel?: string;
  /** Pinned to the bottom of the sidebar: account status, version. */
  sidebarFooter?: ReactNode;
  /** Header content after the mobile menu button: page context on the left, actions on the right. */
  header?: ReactNode;
  /** id of the main region; the skip link targets it. */
  mainId?: string;
  /** Page content, rendered inside <main>. */
  children: ReactNode;
}

function SidebarContent({
  brand,
  nav,
  navLabel,
  sidebarFooter,
}: Pick<AppShellProps, "brand" | "nav" | "navLabel" | "sidebarFooter">) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-app-shell-header shrink-0 items-center px-inset-md">{brand}</div>
      <nav aria-label={navLabel} className="flex-1 overflow-y-auto px-sm py-sm">
        {nav}
      </nav>
      {sidebarFooter && (
        <div className="border-t border-default p-inset-sm text-caption text-subtle">
          {sidebarFooter}
        </div>
      )}
    </div>
  );
}

/**
 * The application frame: a sidebar with the product's navigation, a sticky
 * header, and the main region. Below the md breakpoint the sidebar moves into
 * a sheet behind a menu button. Includes a skip link to the main content.
 */
export function AppShell({
  brand,
  nav,
  navLabel = "Main",
  sidebarFooter,
  header,
  mainId = "main",
  children,
  className,
  ...props
}: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const sidebar = { brand, nav, navLabel, sidebarFooter };

  return (
    <AppShellContext
      value={{
        closeNav: () => {
          setNavOpen(false);
        },
      }}
    >
      <div
        data-slot="app-shell"
        className={cn(
          "min-h-dvh bg-canvas text-default",
          "md:grid md:grid-cols-[var(--pl-app-shell-sidebar-width)_minmax(0,1fr)]",
          className,
        )}
        {...props}
      >
        <a
          href={`#${mainId}`}
          className="focus-ring sr-only rounded-control bg-raised px-control-md py-xs text-body text-default shadow-overlay focus:not-sr-only focus:fixed focus:top-sm focus:left-sm focus:z-50"
        >
          Skip to main content
        </a>

        <aside className="sticky top-0 hidden h-dvh border-r border-default bg-surface md:block">
          <SidebarContent {...sidebar} />
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-40 flex h-app-shell-header shrink-0 items-center gap-sm border-b border-default bg-surface px-inset-md">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation"
                  className="-ml-xs md:hidden"
                >
                  <MenuIcon aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                aria-describedby={undefined}
                className="w-app-shell-sidebar gap-0 bg-surface"
              >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent {...sidebar} />
              </SheetContent>
            </Sheet>
            {header}
          </header>

          <main id={mainId} tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
        </div>
      </div>
    </AppShellContext>
  );
}

/** The list of destinations in the sidebar. */
export function AppShellNav({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul data-slot="app-shell-nav" className={cn("flex flex-col gap-2xs", className)} {...props} />
  );
}

export interface AppShellNavItemProps extends ComponentProps<"a"> {
  /** Marks the current page (aria-current="page"). */
  current?: boolean;
  /** Decorative icon before the label. */
  icon?: ReactNode;
  /** Render your router's link component instead of <a>. Put any icon inside the child. */
  asChild?: boolean;
}

/**
 * One destination. Pass current for the active page; it is marked with
 * aria-current, a selected background, and a heavier weight, not color alone.
 * Closes the mobile navigation sheet on click.
 */
export function AppShellNavItem({
  current = false,
  icon,
  asChild = false,
  className,
  children,
  onClick,
  ...props
}: AppShellNavItemProps) {
  const { closeNav } = use(AppShellContext);
  const Comp = asChild ? Slot.Root : "a";
  return (
    <li>
      <Comp
        data-slot="app-shell-nav-item"
        aria-current={current ? "page" : undefined}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          closeNav();
        }}
        className={cn(
          "focus-ring flex h-control-md items-center gap-sm rounded-control px-sm text-body text-muted",
          "transition-colors duration-(--pl-motion-duration-fast) hover:bg-hover hover:text-default",
          "aria-[current=page]:bg-selected aria-[current=page]:font-label aria-[current=page]:text-default",
          "[&_svg]:size-icon-md [&_svg]:shrink-0",
          className,
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon && (
              <span aria-hidden className="contents">
                {icon}
              </span>
            )}
            {children}
          </>
        )}
      </Comp>
    </li>
  );
}
