import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DetailPage from "./DetailPage.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import BidModal from "../modals/BidModal.vue";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import { getAucation } from "../api/aucationApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/aucationApi");
vi.mock("../../../helpers/toolsHelper", async (orig) => ({
  ...(await orig()), showConfirmDialog: vi.fn(), showErrorDialog: vi.fn(), showSuccessDialog: vi.fn(),
}));

const base = {
  id: 1, user_id: 1, title: "Laptop", description: "desk", cover: "http://x/c.jpg", start_bid: 1000,
  closed_at: "2999-01-01 00:00:00", author: { name: "Budi" }, my_bid: null,
  bids: [
    { id: 1, bid: 2000, created_at: "2026-01-01T00:00:00Z" },
    { id: 2, bid: 3000, created_at: "2026-01-02T00:00:00Z" },
  ],
};

const setup = async ({ aucation = base, profile = { id: 1 } } = {}) => {
  getAucation.mockResolvedValue({ data: { aucation } });
  const pinia = createMockPinia();
  useUsersStore(pinia).profile = profile;
  const r = await renderWithProviders(DetailPage, { route: "/aucations/1", pinia });
  await flushPromises();
  return { ...r, store: useAucationsStore(pinia) };
};
const button = (wrapper, text) => wrapper.findAll("button").find((b) => b.text().includes(text));

describe("DetailPage", () => {
  beforeEach(() => vi.resetAllMocks());

  it("menampilkan detail & riwayat bid terurut dari yang tertinggi", async () => {
    const { wrapper } = await setup();
    expect(getAucation).toHaveBeenCalledWith("1");
    expect(wrapper.text()).toContain("Laptop");
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("Berlangsung");
    const rows = wrapper.findAll("li");
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("3.000");
  });

  it("variasi data: tanpa cover, deskripsi, penulis, bids, dan tawaran saya", async () => {
    const { wrapper } = await setup({ aucation: { ...base, cover: null, description: null, author: undefined, bids: undefined, my_bid: { bid: 4000 }, user_id: 2 } });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("Belum ada penawaran");
    expect(wrapper.text()).toContain("4.000");
  });

  it("pemilik: ubah, ganti cover, dan modal menutup", async () => {
    const { wrapper } = await setup();
    expect(button(wrapper, "Ajukan Bid")).toBeUndefined();
    await button(wrapper, "Ubah").trigger("click");
    expect(wrapper.findComponent(ChangeModal).props("show")).toBe(true);
    wrapper.findComponent(ChangeModal).vm.$emit("changed");
    await flushPromises();
    expect(getAucation).toHaveBeenCalledTimes(2);
    wrapper.findComponent(ChangeModal).vm.$emit("close");
    await button(wrapper, "Ganti Cover").trigger("click");
    expect(wrapper.findComponent(ChangeCoverModal).props("show")).toBe(true);
    wrapper.findComponent(ChangeCoverModal).vm.$emit("changed");
    await flushPromises();
    expect(getAucation).toHaveBeenCalledTimes(3);
    wrapper.findComponent(ChangeCoverModal).vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(ChangeCoverModal).props("show")).toBe(false);
  });

  it("pemilik: hapus (batal, gagal, sukses)", async () => {
    const { wrapper, store, router } = await setup();
    const spy = vi.spyOn(store, "asyncDeleteAucation");
    const push = vi.spyOn(router, "push").mockResolvedValue();

    showConfirmDialog.mockResolvedValue(false);
    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(spy).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValue(true);
    spy.mockResolvedValue(false);
    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(push).not.toHaveBeenCalled();

    spy.mockResolvedValue(true);
    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(spy).toHaveBeenLastCalledWith(1);
    expect(push).toHaveBeenCalledWith("/");
  });

  it("peserta: ajukan bid, batalkan bid", async () => {
    const { wrapper, store } = await setup({ aucation: { ...base, my_bid: { bid: 2000 } }, profile: { id: 99 } });
    expect(button(wrapper, "Ubah")).toBeUndefined();
    await button(wrapper, "Ajukan Bid").trigger("click");
    expect(wrapper.findComponent(BidModal).props("show")).toBe(true);
    wrapper.findComponent(BidModal).vm.$emit("bidded");
    await flushPromises();
    expect(getAucation).toHaveBeenCalledTimes(2);
    wrapper.findComponent(BidModal).vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(BidModal).props("show")).toBe(false);

    const spy = vi.spyOn(store, "asyncDeleteBid");
    showConfirmDialog.mockResolvedValue(false);
    await button(wrapper, "Batalkan Bid").trigger("click");
    await flushPromises();
    expect(spy).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValue(true);
    spy.mockResolvedValue(false);
    await button(wrapper, "Batalkan Bid").trigger("click");
    await flushPromises();
    expect(getAucation).toHaveBeenCalledTimes(2);

    spy.mockResolvedValue(true);
    await button(wrapper, "Batalkan Bid").trigger("click");
    await flushPromises();
    expect(getAucation).toHaveBeenCalledTimes(3);
  });

  it("lelang ditutup: tombol bid nonaktif, tanpa profil bukan pemilik", async () => {
    const { wrapper } = await setup({ aucation: { ...base, closed_at: "2000-01-01 00:00:00" }, profile: null });
    expect(wrapper.text()).toContain("Ditutup");
    expect(button(wrapper, "Ajukan Bid").attributes("disabled")).toBeDefined();
    expect(button(wrapper, "Ubah")).toBeUndefined();
  });

  it("status memuat dan tidak ditemukan", async () => {
    getAucation.mockReturnValue(new Promise(() => {}));
    const loading = await renderWithProviders(DetailPage, { route: "/aucations/1" });
    expect(loading.wrapper.text()).toContain("Memuat");

    getAucation.mockRejectedValue(new Error("x"));
    const missing = await renderWithProviders(DetailPage, { route: "/aucations/1" });
    await flushPromises();
    expect(missing.wrapper.text()).toContain("Lelang tidak ditemukan");
  });
});