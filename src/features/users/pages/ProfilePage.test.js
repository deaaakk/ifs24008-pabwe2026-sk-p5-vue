import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ProfilePage from "./ProfilePage.vue";
import { renderWithProviders } from "../../../test-utils";
import { useUsersStore } from "../states/usersStore";
import { getMe } from "../api/userApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (orig) => ({ ...(await orig()), showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

const profile = { id: 1, name: "Budi", email: "b@x.id", photo: "img/p.png" };

const setup = async () => {
  getMe.mockResolvedValue({ data: { user: profile } });
  const r = await renderWithProviders(ProfilePage);
  await flushPromises();
  return { ...r, store: useUsersStore(r.pinia) };
};

describe("ProfilePage", () => {
  beforeEach(() => vi.resetAllMocks());

  it("mengisi form dari profil, dan menampilkan foto kosong saat belum dimuat", async () => {
    getMe.mockReturnValue(new Promise(() => {}));
    const pending = await renderWithProviders(ProfilePage);
    expect(pending.wrapper.find("img").attributes("src")).toBe("");
    const { wrapper } = await setup();
    expect(wrapper.find("#name").element.value).toBe("Budi");
    expect(wrapper.find("#email").element.value).toBe("b@x.id");
  });

  it("menyimpan profil", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "asyncChangeProfile").mockResolvedValue(true);
    await wrapper.find("#name").setValue("Baru");
    await wrapper.find("#email").setValue("baru@x.id");
    await wrapper.findAll("form")[0].trigger("submit");
    expect(spy).toHaveBeenCalledWith({ name: "Baru", email: "baru@x.id" });
  });

  it("mengganti foto hanya jika ada file", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "asyncChangePhoto").mockResolvedValue(true);
    const input = wrapper.find("#photo");
    Object.defineProperty(input.element, "files", { value: [], configurable: true });
    await input.trigger("change");
    expect(spy).not.toHaveBeenCalled();
    const file = new File(["x"], "p.png");
    Object.defineProperty(input.element, "files", { value: [file], configurable: true });
    await input.trigger("change");
    expect(spy).toHaveBeenCalledWith(file);
  });

  it("ubah kata sandi: tidak cocok, gagal, sukses", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "asyncChangePassword");
    const fill = async (n, c) => {
      await wrapper.find("#old").setValue("lama");
      await wrapper.find("#new").setValue(n);
      await wrapper.find("#confirm").setValue(c);
      await wrapper.findAll("form")[1].trigger("submit");
      await flushPromises();
    };
    await fill("baru123", "beda");
    expect(showErrorDialog).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok");
    expect(spy).not.toHaveBeenCalled();

    spy.mockResolvedValue(false);
    await fill("baru123", "baru123");
    expect(wrapper.find("#old").element.value).toBe("lama");

    spy.mockResolvedValue(true);
    await fill("baru123", "baru123");
    expect(spy).toHaveBeenLastCalledWith({ password: "lama", new_password: "baru123", new_password_confirmation: "baru123" });
    expect(wrapper.find("#old").element.value).toBe("");
  });
});