import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPinia } from "../../../test-utils";
import { useUsersStore } from "./usersStore";
import * as api from "../api/userApi";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

describe("usersStore", () => {
  let store;
  beforeEach(() => { vi.resetAllMocks(); createMockPinia(); store = useUsersStore(); });

  it("asyncGetUsers", async () => {
    api.getUsers.mockResolvedValue({ data: { users: [{ id: 1 }] } });
    await store.asyncGetUsers();
    expect(store.users).toEqual([{ id: 1 }]);
    api.getUsers.mockRejectedValue(new Error("x"));
    await store.asyncGetUsers();
    expect(store.users).toEqual([{ id: 1 }]);
  });

  it("asyncGetProfile", async () => {
    api.getMe.mockResolvedValue({ data: { user: { id: 2 } } });
    expect(await store.asyncGetProfile()).toBe(true);
    expect(store.profile).toEqual({ id: 2 });
    api.getMe.mockRejectedValue(new Error("x"));
    expect(await store.asyncGetProfile()).toBe(false);
  });

  it("asyncChangeProfile & asyncChangePhoto memuat ulang profil jika sukses", async () => {
    api.getMe.mockResolvedValue({ data: { user: { id: 3 } } });
    api.putMe.mockResolvedValue({ message: "ok" });
    api.postPhoto.mockResolvedValue({ message: "ok" });
    expect(await store.asyncChangeProfile({})).toBe(true);
    expect(await store.asyncChangePhoto({})).toBe(true);
    expect(api.getMe).toHaveBeenCalledTimes(2);
    api.putMe.mockRejectedValue(new Error("x"));
    api.postPhoto.mockRejectedValue(new Error("x"));
    expect(await store.asyncChangeProfile({})).toBe(false);
    expect(await store.asyncChangePhoto({})).toBe(false);
    expect(api.getMe).toHaveBeenCalledTimes(2);
  });

  it("asyncChangePassword", async () => {
    api.putPassword.mockResolvedValue({ message: "ok" });
    expect(await store.asyncChangePassword({})).toBe(true);
    api.putPassword.mockRejectedValue(new Error("x"));
    expect(await store.asyncChangePassword({})).toBe(false);
  });
});