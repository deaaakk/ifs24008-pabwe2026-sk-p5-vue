import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import App from "./App.vue";
import { renderWithProviders } from "./test-utils";

describe("App", () => {
  it("merender halaman login pada /auth/login", async () => {
    const { wrapper } = await renderWithProviders(App, { route: "/auth/login" });
    await flushPromises();
    expect(wrapper.text()).toContain("Masuk Sekarang");
  });

  it("merender halaman 404 pada rute tak dikenal", async () => {
    const { wrapper } = await renderWithProviders(App, { route: "/tidak-ada" });
    await flushPromises();
    expect(wrapper.text()).toContain("404");
  });
});