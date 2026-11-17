// Ported from shadcn/ui (new-york-v4) input, restyled with Plumage tokens.
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export type InputProps = ComponentProps<"input">;

/**
 * Single-line text entry. Always pair with a visible Label. Mark invalid
 * values with aria-invalid and point aria-describedby at the error message.
 */
export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "focus-ring h-control-md w-full min-w-0 rounded-input border border-strong bg-surface px-control-md",
        "text-body text-default placeholder:text-subtle selection:bg-accent-subtle",
        "transition-colors duration-(--pl-motion-duration-fast)",
        "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled",
        "aria-invalid:border-negative",
        "file:mr-sm file:border-0 file:bg-transparent file:text-label file:font-label file:text-default",
        className,
      )}
      {...props}
    />
  );
}
