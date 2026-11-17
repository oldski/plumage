import ReactMarkdown, { type Components } from "react-markdown";
import { cn } from "../../lib/cn";

// Headings, paragraphs, lists, and emphasis only. Anything else (links, tables,
// code, images, raw HTML) is unwrapped to its text, so the content can never
// render markup or send the reader somewhere.
const ALLOWED = ["h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "br"];

const components: Components = {
  // A top-level heading in the content is still a section of the page.
  h1: ({ children }) => <h2 className="text-title font-heading text-default">{children}</h2>,
  h2: ({ children }) => <h2 className="text-title font-heading text-default">{children}</h2>,
  h3: ({ children }) => <h3 className="text-body font-label text-default">{children}</h3>,
  h4: ({ children }) => <h4 className="text-body font-label text-default">{children}</h4>,
  p: ({ children }) => <p className="text-body text-default">{children}</p>,
  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-2xs pl-md text-body text-default">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="flex list-decimal flex-col gap-2xs pl-md text-body text-default">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-2xs">{children}</li>,
  strong: ({ children }) => <strong className="font-label">{children}</strong>,
};

export interface MarkdownProps {
  /** The Markdown source. */
  children: string;
  className?: string;
}

/**
 * Markdown from a source you do not control, such as an AI-written note,
 * rendered with Plumage's type styles and a strict element allowlist. Works on
 * the server and the client.
 */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("flex max-w-overlay-lg flex-col gap-sm", className)}>
      <ReactMarkdown allowedElements={ALLOWED} unwrapDisallowed components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
