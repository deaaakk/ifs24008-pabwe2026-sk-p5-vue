import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPinia } from "../../../test-utils";
import { useAuthStore } from "./authStore";
import { postLogin, postRegister, postLogout } from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

describe("authStore", () => {
  let store;
  beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); createMockPinia(); store = useAuthStore(); });

  it("state awal membaca token dari localStorage", () => {
    putAccessToken("abc");
    createMockPinia();
    expect(useAuthStore().token).toBe("abc");
  });

  it("login sukses menyimpan token", async () => {
    postLogin.mockResolvedValue({ data: { token: "tok" } });
    expect(await store.asyncLogin({ email: "a", password: "b" })).toBe(true);
    expect(store.token).toBe("tok");
    expect(getAccessToken()).toBe("tok");
    expect(store.isAuthLogin).toBe(true);
  });

  it("login gagal menampilkan error", async () => {
    postLogin.mockRejectedValue(new Error("salah"));
    expect(await store.asyncLogin({})).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("salah");
    expect(store.isAuthLogin).toBe(false);
  });

  it("register sukses & gagal", async () => {
    postRegister.mockResolvedValue({ message: "ok" });
    expect(await store.asyncRegister({})).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith("ok");
    postRegister.mockRejectedValue(new Error("x"));
    expect(await store.asyncRegister({})).toBe(false);
    expect(store.isAuthRegister).toBe(false);
  });

  it("logout menghapus token, meski request gagal", async () => {
    putAccessToken("tok");
    postLogout.mockResolvedValue({ message: "ok" });
    expect(await store.asyncLogout()).toBe(true);
    expect(getAccessToken()).toBeNull();
    expect(store.isAuthLogout).toBe(true);

    putAccessToken("tok");
    postLogout.mockRejectedValue(new Error("offline"));
    await store.asyncLogout();
    expect(getAccessToken()).toBeNull();
  });
});