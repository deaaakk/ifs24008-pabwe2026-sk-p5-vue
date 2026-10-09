import { describe, it, expect } from "vitest";
import AuthLayout from "./AuthLayout.vue";
import { renderWithProviders, stubPage } from "../../../test-utils";

describe("AuthLayout", () => {
  it("menampilkan banner, tab, dan konten rute anak", async () => {
    const routes = [{ path: "/auth", component: AuthLayout, children: [{ path: "login", component: stubPage("isi-login") }] }];
    const { wrapper } = await renderWithProviders(AuthLayout, { route: "/auth/login", routes });
    expect(wrapper.text()).toContain("Delcom Auction");
    expect(wrapper.text()).toContain("Masuk Akun");
    expect(wrapper.text()).toContain("Daftar Baru");
    expect(wrapper.text()).toContain("isi-login");
  });
});