// Ported from shadcn/ui (new-york-v4) button, restyled with Plumage tokens.
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export const buttonVariants = cva(
  [
    "focus-ring inline-flex shrink-0 cursor-pointer items-center justify-center gap-xs",
    "rounded-button font-button whitespace-nowrap select-none",
    "transition-colors duration-(--pl-motion-duration-fast) ease-standard",
    "disabled:pointer-events-none disabled:opacity-disabled",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon-md",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active",
        secondary: "interactive border border-strong bg-surface text-default",
        ghost: "interactive text-default",
        destructive: "interactive bg-negative text-on-solid",
        link: "text-link hover:underline",
      },
      size: {
        sm: "h-control-sm px-control-sm text-label",
        md: "h-control-md px-control-md text-body",
        lg: "h-control-lg px-control-lg text-body",
        "icon-sm": "size-control-sm",
        icon: "size-control-md",
        "icon-lg": "size-control-lg",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto p-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (for example a link) with button styling. */
    asChild?: boolean;
  };

/**
 * Triggers an action. Use one primary button per view for the main action;
 * secondary and ghost for everything else. Icon-only buttons need an
 * aria-label.
 */
export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      // Native buttons default to type="submit"; make submitting explicit.
      type={asChild ? type : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
