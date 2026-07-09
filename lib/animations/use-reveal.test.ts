import { describe, it, expect } from "vitest";
import { splitIntoWords } from "@/lib/animations/use-reveal";

describe("splitIntoWords", () => {
  it("wraps each word and preserves text content", () => {
    const el = document.createElement("h1");
    el.textContent = "Arwin Gerard Miclat";
    splitIntoWords(el);
    expect(el.querySelectorAll(".wa-word").length).toBe(3);
    expect(el.textContent).toBe("Arwin Gerard Miclat");
  });

  it("preserves multiple spaces and single words", () => {
    const el = document.createElement("span");
    el.textContent = "Hello";
    splitIntoWords(el);
    expect(el.querySelectorAll(".wa-word").length).toBe(1);
    expect(el.textContent).toBe("Hello");
  });
});
