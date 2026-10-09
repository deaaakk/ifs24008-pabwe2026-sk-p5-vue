import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import LoginPage from "./LoginPage.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";

const setup = async () => {
  const r = await renderWithProviders(LoginPage);
  const auth = useAuthStore(r.pinia);
  const push = vi.spyOn(r.router, "push").mockResolvedValue();
  return { ...r, auth, push };
};

describe("LoginPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("menampilkan error jika form kosong", async () => {
    const { wrapper, auth } = await setup();
    const spy = vi.spyOn(auth, "asyncLogin");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Email dan kata sandi wajib diisi");
    expect(spy).not.toHaveBeenCalled();
  });

  it("login sukses mengarahkan ke beranda", async () => {
    const { wrapper, auth, push } = await setup();
    const spy = vi.spyOn(auth, "asyncLogin").mockResolvedValue(true);
    await wrapper.find("#login-email-input").setValue("a@b.c");
    await wrapper.find("#login-password-input").setValue("123456");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(spy).toHaveBeenCalledWith({ email: "a@b.c", password: "123456" });
    expect(push).toHaveBeenCalledWith("/");
  });

  it("login gagal tidak berpindah halaman", async () => {
    const { wrapper, auth, push } = await setup();
    vi.spyOn(auth, "asyncLogin").mockResolvedValue(false);
    await wrapper.find("#login-email-input").setValue("a@b.c");
    await wrapper.find("#login-password-input").setValue("x");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(push).not.toHaveBeenCalled();
  });
});