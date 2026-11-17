"use client";

// Ported from shadcn/ui (new-york-v4) sonner, which replaced shadcn's older
// Radix-based toast. Sonner runs unstyled here; every class is a Plumage token,
// and its light or dark theme follows the nearest PlumageProvider.
import {
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "../../lib/cn";
import { useOptionalPlumage } from "../../provider/plumage-provider";
import { buttonVariants } from "../button/button";

export { toast } from "sonner";
export type { ToasterProps };

/**
 * Renders toasts raised with toast(). Mount once per app, inside the
 * PlumageProvider. Toasts are announced politely to screen readers; keep them
 * short, never put the only copy of important information in one, and give
 * any action a text label.
 */
export function Toaster({ toastOptions, ...props }: ToasterProps) {
  const plumage = useOptionalPlumage();
  return (
    <Sonner
      theme={plumage?.resolvedMode ?? "light"}
      className="toaster group"
      style={{ "--width": "var(--pl-toast-width)" } as CSSProperties}
      icons={{
        success: <CircleCheckIcon aria-hidden className="text-positive" />,
        info: <InfoIcon aria-hidden className="text-info" />,
        warning: <TriangleAlertIcon aria-hidden className="text-warning" />,
        error: <OctagonXIcon aria-hidden className="text-negative" />,
        loading: <LoaderCircleIcon aria-hidden className="animate-spin text-subtle" />,
      }}
      toastOptions={{
        ...toastOptions,
        unstyled: true,
        classNames: {
          toast: cn(
            "flex w-(--width) items-start gap-sm rounded-toast border border-default bg-raised p-inset-sm",
            "text-body text-default shadow-overlay",
          ),
          icon: "mt-2xs flex size-icon-md shrink-0 [&_svg]:size-icon-md",
          content: "flex flex-1 flex-col gap-2xs",
          title: "font-strong",
          description: "text-muted",
          actionButton: buttonVariants({ size: "sm" }),
          cancelButton: buttonVariants({ variant: "ghost", size: "sm" }),
          closeButton: buttonVariants({ variant: "ghost", size: "icon-sm" }),
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}
