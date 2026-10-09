import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (orig) => ({ ...(await orig()), showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

const setup = async (props = { show: true }) => {
  const r = await renderWithProviders(AddModal, { props });
  return { ...r, store: useAucationsStore(r.pinia) };
};
const fill = async (wrapper, { title = "Laptop", bid = "1000", close = "2026-12-31T23:59" } = {}) => {
  await wrapper.find("#a-title").setValue(title);
  wrapper.findComponent(MarkdownEditor).vm.$emit("update:modelValue", "**desk**");
  await wrapper.find("#a-bid").setValue(bid);
  await wrapper.find("#a-close").setValue(close);
};

describe("AddModal", () => {
  beforeEach(() => vi.resetAllMocks());

  it("tidak merender form saat show=false", async () => {
    const { wrapper } = await setup({ show: false });
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("validasi kolom wajib", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "asyncAddAucation");
    await wrapper.find("form").trigger("submit");
    expect(showErrorDialog).toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });

  it("submit sukses mengirim data dan emit added + close", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "asyncAddAucation").mockResolvedValue(true);
    await fill(wrapper);
    await wrapper.find("form").trigger("submit");
    expect(spy).toHaveBeenCalledWith({ title: "Laptop", description: "**desk**", start_bid: 1000, closed_at: "2026-12-31 23:59:00" });
    expect(wrapper.emitted("added")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("submit gagal tidak menutup modal", async () => {
    const { wrapper, store } = await setup();
    vi.spyOn(store, "asyncAddAucation").mockResolvedValue(false);
    await fill(wrapper);
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("added")).toBeUndefined();
  });

  it("tombol Batal emit close", async () => {
    const { wrapper } = await setup();
    await wrapper.find("button[type=button]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("form direset saat modal dibuka ulang", async () => {
    const { wrapper } = await setup();
    await fill(wrapper);
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
    expect(wrapper.find("#a-title").element.value).toBe("");
    expect(wrapper.find("#a-bid").element.value).toBe("");
  });

  it("tombol X pada ModalShell emit close", async () => {
    const { wrapper } = await setup();
    await wrapper.find("[aria-label=Tutup]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});