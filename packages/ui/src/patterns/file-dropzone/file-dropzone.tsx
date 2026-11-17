"use client";

import { UploadIcon } from "lucide-react";
import { useId, useState, type DragEvent, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { formatNumber } from "../../lib/format";

export interface FileDropzoneProps {
  /** What to drop, as a call to action: "Drop a CSV here, or choose a file". */
  label: ReactNode;
  /** Accepted types and size, in words: "Account activity report, CSV, up to 5 MB". */
  description?: ReactNode;
  /** Same syntax as the input's accept attribute: ".csv,text/csv". */
  accept?: string;
  multiple?: boolean;
  /** Largest accepted file, in bytes. */
  maxSize?: number;
  disabled?: boolean;
  /** Name for the underlying input, so the zone also works inside a plain form. */
  name?: string;
  /** Called with files that passed the type and size checks. */
  onFiles?: (files: File[]) => void;
  /** An error to show from outside, such as a failed upload. */
  error?: ReactNode;
  className?: string;
}

function accepts(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .some((rule) =>
      rule.startsWith(".")
        ? name.endsWith(rule)
        : rule.endsWith("/*")
          ? file.type.startsWith(rule.slice(0, -1))
          : file.type === rule,
    );
}

/**
 * A drop target built around a real file input, so it works with a mouse,
 * a keyboard (Tab to it, Enter or Space opens the picker), and assistive tech.
 * Rejected files are explained in a polite live region instead of failing
 * silently.
 */
export function FileDropzone({
  label,
  description,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  name,
  onFiles,
  error,
  className,
}: FileDropzoneProps) {
  const inputId = useId();
  const messageId = useId();
  const [dragging, setDragging] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);

  function receive(list: FileList | null) {
    const files = Array.from(list ?? []).slice(0, multiple ? undefined : 1);
    const wrongType = files.filter((file) => !accepts(file, accept));
    const tooBig = maxSize ? files.filter((file) => file.size > maxSize) : [];
    const ok = files.filter((file) => !wrongType.includes(file) && !tooBig.includes(file));
    if (wrongType.length > 0) {
      setRejection(`${wrongType.map((f) => f.name).join(", ")} is not an accepted file type.`);
    } else if (tooBig.length > 0 && maxSize) {
      const limit = formatNumber(maxSize / 1_000_000, { precision: 1 });
      setRejection(`${tooBig.map((f) => f.name).join(", ")} is larger than ${limit} MB.`);
    } else {
      setRejection(null);
    }
    if (ok.length > 0) onFiles?.(ok);
  }

  const onDrag = (event: DragEvent<HTMLLabelElement>, over: boolean) => {
    event.preventDefault();
    if (!disabled) setDragging(over);
  };

  const message = error ?? rejection;

  return (
    <div data-slot="file-dropzone" className={cn("flex flex-col gap-xs", className)}>
      <label
        htmlFor={inputId}
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        onDragEnter={(event) => {
          onDrag(event, true);
        }}
        onDragOver={(event) => {
          onDrag(event, true);
        }}
        onDragLeave={(event) => {
          onDrag(event, false);
        }}
        onDrop={(event) => {
          onDrag(event, false);
          if (!disabled) receive(event.dataTransfer.files);
        }}
        className={cn(
          "focus-ring-within flex cursor-pointer flex-col items-center justify-center gap-sm rounded-container",
          "border border-dashed border-strong bg-surface p-inset-lg text-center",
          "transition-colors duration-(--pl-motion-duration-fast) hover:bg-hover",
          "data-[dragging]:border-(--pl-color-border-focus) data-[dragging]:bg-selected",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled",
        )}
      >
        <span
          aria-hidden
          className="flex size-empty-state-icon items-center justify-center rounded-pill bg-sunken text-subtle [&_svg]:size-icon-lg"
        >
          <UploadIcon />
        </span>
        <span className="font-label text-default">{label}</span>
        {description && <span className="text-caption text-subtle">{description}</span>}
        <input
          id={inputId}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-describedby={message ? messageId : undefined}
          className="sr-only"
          onChange={(event) => {
            receive(event.target.files);
          }}
        />
      </label>
      <p id={messageId} role="status" className="text-caption text-negative empty:hidden">
        {message}
      </p>
    </div>
  );
}
