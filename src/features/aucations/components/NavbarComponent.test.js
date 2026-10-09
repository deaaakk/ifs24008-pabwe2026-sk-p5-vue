import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import NavbarComponent from "./NavbarComponent.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (orig) => ({ ...(await orig()), showConfirmDialog: vi.fn() }));

describe("NavbarComponent", () => {
  beforeEach(() => vi.resetAllMocks());

  it("tanpa profil: tidak menampilkan identitas, tombol menu emit toggle", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    expect(wrapper.find("img").exists()).toBe(false);
    await wrapper.find("[aria-label=Menu]").trigger("click");
    expect(wrapper.emitted("toggle")).toHaveLength(1);
  });

  it("menampilkan identitas akun aktif", async () => {
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent);
    useUsersStore(pinia).profile = { name: "Budi", email: "budi@x.id", photo: "img/p.png" };
    await flushPromises();
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("budi@x.id");
  });

  it("logout: dibatalkan, lalu dikonfirmasi", async () => {
    const { wrapper, pinia, router } = await renderWithProviders(NavbarComponent);
    const logout = vi.spyOn(useAuthStore(pinia), "asyncLogout").mockResolvedValue(true);
    const push = vi.spyOn(router, "push").mockResolvedValue();
    const btn = wrapper.findAll("button").find((b) => b.text().includes("Keluar"));

    showConfirmDialog.mockResolvedValue(false);
    await btn.trigger("click");
    await flushPromises();
    expect(logout).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValue(true);
    await btn.trigger("click");
    await flushPromises();
    expect(logout).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/auth/login");
  });
});