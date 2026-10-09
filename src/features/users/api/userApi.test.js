import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUsers, getMe, putMe, postPhoto, putPassword } from "./userApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper");

describe("userApi", () => {
  beforeEach(() => { vi.resetAllMocks(); apiFetch.mockResolvedValue({ status: "success" }); });

  it("getUsers & getMe", async () => {
    await getUsers();
    expect(apiFetch).toHaveBeenCalledWith("/users");
    await getMe();
    expect(apiFetch).toHaveBeenCalledWith("/users/me");
  });
  it("putMe", async () => {
    await putMe({ name: "A", email: "a@b.c", extra: 1 });
    expect(apiFetch).toHaveBeenCalledWith("/users/me", { method: "PUT", body: { name: "A", email: "a@b.c" } });
  });
  it("postPhoto mengirim FormData", async () => {
    const file = new File(["x"], "p.png", { type: "image/png" });
    await postPhoto(file);
    const [path, opt] = apiFetch.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(opt.method).toBe("POST");
    expect(opt.body.get("photo")).toBe(file);
  });
  it("putPassword", async () => {
    const p = { password: "a", new_password: "b", new_password_confirmation: "b" };
    await putPassword({ ...p, extra: 1 });
    expect(apiFetch).toHaveBeenCalledWith("/users/password", { method: "PUT", body: p });
  });
});