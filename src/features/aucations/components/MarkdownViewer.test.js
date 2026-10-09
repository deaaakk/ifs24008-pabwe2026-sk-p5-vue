import { describe, it, expect, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import Editor from "@toast-ui/editor";
import MarkdownViewer from "./MarkdownViewer.vue";

const loaded = async () => {
  await vi.dynamicImportSettled();
  await flushPromises();
};

describe("MarkdownViewer", () => {
  it("membuat viewer dan memperbarui isi saat prop berubah", async () => {
    const wrapper = mount(MarkdownViewer, { props: { value: "# Judul" } });
    await loaded();
    const viewer = Editor.last;
    expect(viewer.options.viewer).toBe(true);
    expect(viewer.options.initialValue).toBe("# Judul");
    await wrapper.setProps({ value: "baru" });
    expect(viewer.markdown).toBe("baru");
  });

  it("memakai nilai kosong secara default", async () => {
    mount(MarkdownViewer);
    await loaded();
    expect(Editor.last.options.initialValue).toBe("");
  });

  it("tidak membuat viewer jika di-unmount sebelum modul termuat", async () => {
    Editor.last = undefined;
    const wrapper = mount(MarkdownViewer);
    wrapper.unmount();
    await loaded();
    expect(Editor.last).toBeUndefined();
  });
});