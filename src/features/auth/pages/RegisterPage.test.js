import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import RegisterPage from "./RegisterPage.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";

const setup = async () => {
  const r = await renderWithProviders(RegisterPage);
  const auth = useAuthStore(r.pinia);
  const push = vi.spyOn(r.router, "push").mockResolvedValue();
  const spy = vi.spyOn(auth, "asyncRegister");
  const fill = async (v) => {
    await r.wrapper.find("#register-name-input").setValue(v.name ?? "");
    await r.wrapper.find("#register-email-input").setValue(v.email ?? "");
    await r.wrapper.find("#register-password-input").setValue(v.password ?? "");
    await r.wrapper.find("#register-confirm-input").setValue(v.confirm ?? "");
    await r.wrapper.find("form").trigger("submit");
    await flushPromises();
  };
  return { ...r, push, spy, fill };
};

describe("RegisterPage", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("validasi: kolom kosong, sandi pendek, konfirmasi tidak cocok", async () => {
    const { wrapper, fill, spy } = await setup();
    await fill({});
    expect(wrapper.text()).toContain("Semua kolom wajib diisi");
    await fill({ name: "A", email: "a@b.c", password: "123", confirm: "123" });
    expect(wrapper.text()).toContain("minimal 6 karakter");
    await fill({ name: "A", email: "a@b.c", password: "123456", confirm: "654321" });
    expect(wrapper.text()).toContain("tidak cocok");
    expect(spy).not.toHaveBeenCalled();
  });

  it("registrasi sukses mengarahkan ke login", async () => {
    const { fill, spy, push } = await setup();
    spy.mockResolvedValue(true);
    await fill({ name: "A", email: "a@b.c", password: "123456", confirm: "123456" });
    expect(spy).toHaveBeenCalledWith({ name: "A", email: "a@b.c", password: "123456" });
    expect(push).toHaveBeenCalledWith("/auth/login");
  });

  it("registrasi gagal tidak berpindah halaman", async () => {
    const { fill, spy, push } = await setup();
    spy.mockResolvedValue(false);
    await fill({ name: "A", email: "a@b.c", password: "123456", confirm: "123456" });
    expect(push).not.toHaveBeenCalled();
  });
});