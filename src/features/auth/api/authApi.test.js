import { describe, it, expect, vi, beforeEach } from "vitest";
import { postLogin, postRegister, postLogout } from "./authApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper");

describe("authApi", () => {
  beforeEach(() => { vi.resetAllMocks(); apiFetch.mockResolvedValue({ status: "success" }); });

  it("postLogin", async () => {
    await postLogin({ email: "a@b.c", password: "123456" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/login", { method: "POST", body: { email: "a@b.c", password: "123456" }, auth: false });
  });
  it("postRegister", async () => {
    await postRegister({ name: "A", email: "a@b.c", password: "123456" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/register", { method: "POST", body: { name: "A", email: "a@b.c", password: "123456" }, auth: false });
  });
  it("postLogout", async () => {
    await postLogout();
    expect(apiFetch).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});