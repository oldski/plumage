import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "../src/patterns/markdown/markdown";

describe("Markdown", () => {
  it("renders headings, lists, and bold with Plumage type styles", () => {
    render(<Markdown>{"# Title\n\n## Summary\n\n1. **First**\n2. Second"}</Markdown>);
    // A level-1 heading in the content still renders as a section heading.
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Title",
      "Summary",
    ]);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("First").tagName).toBe("STRONG");
  });

  it("unwraps links, images, code, and raw HTML to text", () => {
    const { container } = render(
      <Markdown>
        {
          "[Click](https://example.com) `code` ![alt](https://example.com/a.png) <b>bold</b>\n\n| a |\n|---|\n| b |"
        }
      </Markdown>,
    );
    expect(container.querySelector("a, img, code, b, table")).toBeNull();
    expect(screen.getByText(/Click/)).toBeInTheDocument();
  });
});
