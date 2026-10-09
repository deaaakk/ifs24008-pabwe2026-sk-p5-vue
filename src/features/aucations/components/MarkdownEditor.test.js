import { describe, it, expect, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import Editor from "@toast-ui/editor";
import MarkdownEditor from "./MarkdownEditor.vue";

const loaded = async () => {
  await vi.dynamicImportSettled();
  await flushPromises();
};

describe("MarkdownEditor", () => {
  it("menginisialisasi Editor, emit perubahan, dan destroy saat unmount", async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: "halo" } });
    await loaded();
    const editor = Editor.last;
    expect(editor.options.initialValue).toBe("halo");
    expect(editor.options.height).toBe("260px");
    editor.options.events.change();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["markdown"]);
    wrapper.unmount();
    expect(editor.destroyed).toBe(true);
  });

  it("memakai nilai awal kosong secara default", async () => {
    mount(MarkdownEditor);
    await loaded();
    expect(Editor.last.options.initialValue).toBe("");
  });

  it("tidak membuat editor jika di-unmount sebelum modul termuat", async () => {
    Editor.last = undefined;
    const wrapper = mount(MarkdownEditor);
    wrapper.unmount();
    await loaded();
    expect(Editor.last).toBeUndefined();
  });
});