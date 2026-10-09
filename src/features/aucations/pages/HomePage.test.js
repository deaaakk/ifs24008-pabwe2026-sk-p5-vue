import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import HomePage from "./HomePage.vue";
import AddModal from "../modals/AddModal.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { getAucations } from "../api/aucationApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/aucationApi");
vi.mock("../../../helpers/toolsHelper", async (orig) => ({
  ...(await orig()), showConfirmDialog: vi.fn(), showErrorDialog: vi.fn(), showSuccessDialog: vi.fn(),
}));

const items = [
  { id: 1, title: "Laptop Gaming", description: "RAM besar", cover: "http://x/c.jpg", start_bid: 1000, closed_at: "2999-01-01 00:00:00", author: { name: "Budi" }, bids: [{ id: 1, bid: 2000 }] },
  { id: 2, title: "Kamera", description: null, cover: null, start_bid: 500, closed_at: "2000-01-01 00:00:00", bids: [] },
];

const setup = async (route = "/") => {
  getAucations.mockResolvedValue({ data: { aucations: items } });
  const r = await renderWithProviders(HomePage, { route });
  await flushPromises();
  return { ...r, store: useAucationsStore(r.pinia) };
};
const button = (wrapper, text) => wrapper.findAll("button").find((b) => b.text().includes(text));

describe("HomePage", () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.useRealTimers());

  it("menampilkan kartu lelang beserta status", async () => {
    const { wrapper } = await setup();
    expect(getAucations).toHaveBeenCalledWith({});
    const cards = wrapper.findAll("article");
    expect(cards).toHaveLength(2);
    expect(cards[0].text()).toContain("Berlangsung");
    expect(cards[0].text()).toContain("Budi");
    expect(cards[0].find("img").exists()).toBe(true);
    expect(cards[1].text()).toContain("Ditutup");
    expect(cards[1].find("img").exists()).toBe(false);
  });

  it("menampilkan status memuat dan daftar kosong", async () => {
    getAucations.mockReturnValue(new Promise(() => {}));
    const loading = await renderWithProviders(HomePage);
    expect(loading.wrapper.text()).toContain("Memuat");
    getAucations.mockResolvedValue({ data: { aucations: [] } });
    const empty = await renderWithProviders(HomePage);
    await flushPromises();
    expect(empty.wrapper.text()).toContain("Belum ada lelang");
  });

  it("pencarian berdasarkan judul dan deskripsi", async () => {
    const { wrapper } = await setup();
    const input = wrapper.find("[aria-label='Cari lelang']");
    await input.setValue("laptop");
    expect(wrapper.findAll("article")).toHaveLength(1);
    await input.setValue("ram");
    expect(wrapper.findAll("article")).toHaveLength(1);
    await input.setValue("kamera");
    expect(wrapper.findAll("article")[0].text()).toContain("Kamera");
    await input.setValue("tidak-ada");
    expect(wrapper.findAll("article")).toHaveLength(0);
  });

  it("tab: berlangsung, ditutup, saya, semua", async () => {
    const { wrapper, router } = await setup();
    await button(wrapper, "Lelang Berlangsung").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.tab).toBe("open");
    expect(wrapper.findAll("article")).toHaveLength(1);
    expect(wrapper.findAll("article")[0].text()).toContain("Laptop");

    await button(wrapper, "Lelang Ditutup").trigger("click");
    await flushPromises();
    expect(wrapper.findAll("article")[0].text()).toContain("Kamera");

    await button(wrapper, "Lelang Saya").trigger("click");
    await flushPromises();
    expect(getAucations).toHaveBeenLastCalledWith({ is_me: 1 });

    await button(wrapper, "Semua Lelang").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.tab).toBeUndefined();
    expect(getAucations).toHaveBeenLastCalledWith({});
  });

  it("tab Lelang Saya: hapus semua (batal, gagal, sukses)", async () => {
    const { wrapper, store } = await setup("/?tab=mine");
    expect(getAucations).toHaveBeenCalledWith({ is_me: 1 });
    const spy = vi.spyOn(store, "asyncDeleteAllAucations");

    showConfirmDialog.mockResolvedValue(false);
    await button(wrapper, "Hapus Semua").trigger("click");
    await flushPromises();
    expect(spy).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValue(true);
    spy.mockResolvedValue(false);
    await button(wrapper, "Hapus Semua").trigger("click");
    await flushPromises();
    expect(getAucations).toHaveBeenCalledTimes(1);

    spy.mockResolvedValue(true);
    await button(wrapper, "Hapus Semua").trigger("click");
    await flushPromises();
    expect(getAucations).toHaveBeenCalledTimes(2);
  });

  it("tombol Hapus Semua tidak tampil di tab lain", async () => {
    const { wrapper } = await setup();
    expect(button(wrapper, "Hapus Semua")).toBeUndefined();
  });

  it("modal tambah: buka, tutup, dan muat ulang setelah ditambahkan", async () => {
    const { wrapper } = await setup();
    expect(wrapper.findComponent(AddModal).props("show")).toBe(false);
    await button(wrapper, "Tambah Lelang").trigger("click");
    expect(wrapper.findComponent(AddModal).props("show")).toBe(true);
    wrapper.findComponent(AddModal).vm.$emit("added");
    await flushPromises();
    expect(getAucations).toHaveBeenCalledTimes(2);
    wrapper.findComponent(AddModal).vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(AddModal).props("show")).toBe(false);
  });

  it("countdown diperbarui tiap detik dan timer dibersihkan saat unmount", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const { wrapper } = await setup();
    vi.advanceTimersByTime(2000);
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});