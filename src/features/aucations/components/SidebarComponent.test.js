import { describe, it, expect } from "vitest";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

describe("SidebarComponent", () => {
  it("menampilkan semua menu", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: false } });
    ["Dashboard Lelang", "Lelang Saya", "Daftar Pengguna", "Profil Saya"].forEach((t) => expect(wrapper.text()).toContain(t));
    expect(wrapper.find(".fixed.inset-0").exists()).toBe(false);
    expect(wrapper.find("aside").classes()).not.toContain("translate-x-0");
  });

  it("emit close saat overlay atau menu diklik ketika terbuka", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    expect(wrapper.find("aside").classes()).toContain("translate-x-0");
    await wrapper.find(".fixed.inset-0").trigger("click");
    await wrapper.find("a").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});