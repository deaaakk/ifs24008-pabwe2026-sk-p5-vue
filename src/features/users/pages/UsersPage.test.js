import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import UsersPage from "./UsersPage.vue";
import { renderWithProviders } from "../../../test-utils";
import { useUsersStore } from "../states/usersStore";
import { getUsers } from "../api/userApi";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (orig) => ({ ...(await orig()), showErrorDialog: vi.fn() }));

describe("UsersPage", () => {
  beforeEach(() => vi.resetAllMocks());

  it("menampilkan daftar pengguna", async () => {
    getUsers.mockResolvedValue({ data: { users: [
      { id: 1, name: "Budi", email: "b@x.id", photo: "img/p.png" },
      { id: 2, name: "Sari", email: "s@x.id", photo: "http://x/s.png" },
    ] } });
    const { wrapper } = await renderWithProviders(UsersPage);
    await flushPromises();
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("s@x.id");
    expect(wrapper.findAll("img")).toHaveLength(2);
    expect(wrapper.text()).not.toContain("Memuat");
  });

  it("menampilkan status memuat", async () => {
    getUsers.mockReturnValue(new Promise(() => {}));
    const { wrapper, pinia } = await renderWithProviders(UsersPage);
    expect(useUsersStore(pinia).isUsers).toBe(true);
    expect(wrapper.text()).toContain("Memuat");
  });
});