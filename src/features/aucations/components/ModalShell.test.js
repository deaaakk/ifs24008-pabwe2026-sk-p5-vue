import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ModalShell from "./ModalShell.vue";

describe("ModalShell", () => {
  it("tidak merender apa pun saat show=false", () => {
    expect(mount(ModalShell, { props: { show: false, title: "T" } }).html()).toBe("<!--v-if-->");
  });

  it("merender judul & slot, emit close dari tombol X dan klik overlay", async () => {
    const wrapper = mount(ModalShell, { props: { show: true, title: "Judul" }, slots: { default: "<p>isi</p>" } });
    expect(wrapper.text()).toContain("Judul");
    expect(wrapper.text()).toContain("isi");
    await wrapper.find("[aria-label=Tutup]").trigger("click");
    await wrapper.find(".fixed").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});