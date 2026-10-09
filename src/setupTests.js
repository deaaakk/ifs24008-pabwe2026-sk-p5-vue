import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

globalThis.DELCOM_BASEURL = "https://open-api.delcom.org/api/v1";

// Tunggu semua import() dinamis (lazy-load Toast UI) selesai sebelum environment dibongkar
afterEach(async () => {
  await vi.dynamicImportSettled();
});

// Mock DOM method yang tidak ada di jsdom
window.scrollTo = vi.fn();
window.matchMedia =
  window.matchMedia ||
  ((query) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
URL.createObjectURL = vi.fn(() => "blob:mock");
URL.revokeObjectURL = vi.fn();

// Mock Toast UI Editor (butuh DOM penuh yang tidak ada di jsdom)
vi.mock("@toast-ui/editor", () => {
  class Editor {
    constructor(options) {
      this.options = options;
      this.destroyed = false;
      Editor.last = this;
    }
    getMarkdown() { return "markdown"; }
    setMarkdown(value) { this.markdown = value; }
    destroy() { this.destroyed = true; }
    static factory(options) { return new Editor(options); }
  }
  return { default: Editor };
});