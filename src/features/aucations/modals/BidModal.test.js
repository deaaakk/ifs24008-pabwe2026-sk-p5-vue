import { describe, it, expect, vi, beforeEach } from "vitest";
import BidModal from "./BidModal.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";

vi.mock("../../../helpers/toolsHelper", async (orig) => ({ ...(await orig()), showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

const aucation = { id: 9, start_bid: 1000, bids: [{ bid: 2000 }] };
const setup = async (props = { show: true, aucation }) => {
  const r = await renderWithProviders(BidModal, { props });
  return { ...r, store: useAucationsStore(r.pinia) };
};

describe("BidModal", () => {
  beforeEach(() => vi.resetAllMocks());

  it("tanpa data lelang tidak menampilkan penawaran tertinggi", async () => {
    const { wrapper } = await setup({ show: true });
    expect(wrapper.text()).not.toContain("Penawaran tertinggi");
  });

  it("menolak nominal yang tidak lebih tinggi dari tawaran tertinggi", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "asyncAddBid");
    expect(wrapper.text()).toContain("2.000");
    await wrapper.find("#bid").setValue("1500");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("harus lebih tinggi");
    expect(spy).not.toHaveBeenCalled();
  });

  it("bid valid: sukses menutup modal, gagal tidak", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "asyncAddBid").mockResolvedValue(false);
    await wrapper.find("#bid").setValue("3000");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("bidded")).toBeUndefined();
    spy.mockResolvedValue(true);
    await wrapper.find("form").trigger("submit");
    expect(spy).toHaveBeenLastCalledWith(9, 3000);
    expect(wrapper.emitted("bidded")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(wrapper.text()).not.toContain("harus lebih tinggi");
  });

  it("direset saat dibuka ulang & Batal emit close", async () => {
    const { wrapper } = await setup();
    await wrapper.find("#bid").setValue("1");
    await wrapper.find("form").trigger("submit");
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
    expect(wrapper.find("#bid").element.value).toBe("");
    expect(wrapper.text()).not.toContain("harus lebih tinggi");
    await wrapper.find("button[type=button]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("tombol X pada ModalShell emit close", async () => {
    const { wrapper } = await setup();
    await wrapper.find("[aria-label=Tutup]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});