// Ported from shadcn/ui (new-york-v4) textarea, restyled with Plumage tokens.
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export type TextareaProps = ComponentProps<"textarea">;

/**
 * Multi-line text entry that grows with its content. Always pair with a
 * visible Label. Mark invalid values with aria-invalid and point
 * aria-describedby at the error message.
 */
export function Textarea({ className, rows = 3, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      data-slot="textarea"
      className={cn(
        "focus-ring field-sizing-content w-full min-w-0 resize-y rounded-input border border-strong bg-surface px-control-md py-xs",
        "text-body text-default placeholder:text-subtle selection:bg-accent-subtle",
        "transition-colors duration-(--pl-motion-duration-fast)",
        "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled",
        "aria-invalid:border-negative",
        className,
      )}
      {...props}
    />
  );
}
