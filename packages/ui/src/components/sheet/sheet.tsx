"use client";

// Ported from shadcn/ui (new-york-v4) sheet, restyled with Plumage tokens.
// Built on Radix Dialog, so focus trapping and Escape behave like Dialog.
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../provider/plumage-provider";
import { Button } from "../button/button";

/**
 * A panel that slides in from an edge. Use for secondary tasks that need
 * more room than a dialog, such as filters or details, while keeping the
 * page in view. Every sheet needs a SheetTitle.
 */
export function Sheet(props: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(props: ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(props: ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal(props: ComponentProps<typeof SheetPrimitive.Portal>) {
  const container = usePortalContainer();
  return <SheetPrimitive.Portal data-slot="sheet-portal" container={container} {...props} />;
}

function SheetOverlay({ className, ...props }: ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-overlay",
        "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
        className,
      )}
      {...props}
    />
  );
}

const sheetVariants = cva(
  "fixed z-50 flex flex-col gap-md border-default bg-raised text-default shadow-modal outline-none",
  {
    variants: {
      side: {
        right: [
          "inset-y-0 right-0 h-full w-sheet max-w-[calc(100%-var(--pl-space-2xl))] border-l",
          "data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right",
        ],
        left: [
          "inset-y-0 left-0 h-full w-sheet max-w-[calc(100%-var(--pl-space-2xl))] border-r",
          "data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left",
        ],
        top: [
          "inset-x-0 top-0 h-auto border-b",
          "data-[state=open]:animate-slide-in-top data-[state=closed]:animate-slide-out-top",
        ],
        bottom: [
          "inset-x-0 bottom-0 h-auto border-t",
          "data-[state=open]:animate-slide-in-bottom data-[state=closed]:animate-slide-out-bottom",
        ],
      },
    },
    defaultVariants: { side: "right" },
  },
);

export function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants> & {
    /** Show the corner close button. Escape and the overlay close the sheet either way. */
    showCloseButton?: boolean;
  }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              className="absolute top-sm right-sm text-subtle"
            >
              <XIcon aria-hidden />
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-2xs p-sheet pr-2xl", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-sm p-sheet", className)}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-title font-heading", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-body text-muted", className)}
      {...props}
    />
  );
}
