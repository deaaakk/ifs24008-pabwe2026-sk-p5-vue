import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (orig) => ({ ...(await orig()), showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

const aucation = { id: 7, title: "Laptop", description: "desk", start_bid: 1000, closed_at: "2026-12-31 23:59:00" };

const setup = async (props = {}) => {
  const r = await renderWithProviders(ChangeModal, { props: { show: false, aucation, ...props } });
  return { ...r, store: useAucationsStore(r.pinia) };
};

describe("ChangeModal", () => {
  beforeEach(() => vi.resetAllMocks());

  it("mengisi form dari data lelang saat dibuka", async () => {
    const { wrapper } = await setup();
    await wrapper.setProps({ show: true });
    expect(wrapper.find("#c-title").element.value).toBe("Laptop");
    expect(wrapper.find("#c-bid").element.value).toBe("1000");
    expect(wrapper.find("#c-close").element.value).toBe("2026-12-31T23:59");
    expect(wrapper.findComponent(MarkdownEditor).props("modelValue")).toBe("desk");
  });

  it("deskripsi kosong, aucation kosong, dan penutupan modal tidak mengisi form", async () => {
    const { wrapper } = await setup({ aucation: { ...aucation, description: null } });
    await wrapper.setProps({ show: true });
    expect(wrapper.findComponent(MarkdownEditor).props("modelValue")).toBe("");
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ aucation: null });
    await wrapper.setProps({ show: true });
    expect(wrapper.find("#c-title").element.value).toBe("Laptop");
  });

  it("validasi kolom wajib", async () => {
    const { wrapper, store } = await setup();
    await wrapper.setProps({ show: true });
    const spy = vi.spyOn(store, "asyncChangeAucation");
    await wrapper.find("#c-title").setValue("");
    await wrapper.find("form").trigger("submit");
    expect(showErrorDialog).toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });

  it("submit sukses & gagal", async () => {
    const { wrapper, store } = await setup();
    await wrapper.setProps({ show: true });
    const spy = vi.spyOn(store, "asyncChangeAucation").mockResolvedValue(false);
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("changed")).toBeUndefined();

    spy.mockResolvedValue(true);
    await wrapper.find("#c-title").setValue("Baru");
    wrapper.findComponent(MarkdownEditor).vm.$emit("update:modelValue", "deskripsi baru");
    await wrapper.find("#c-bid").setValue("2000");
    await wrapper.find("#c-close").setValue("2027-01-01T10:00");
    await wrapper.find("form").trigger("submit");
    expect(spy).toHaveBeenLastCalledWith(7, { title: "Baru", description: "deskripsi baru", start_bid: 2000, closed_at: "2027-01-01 10:00:00" });
    expect(wrapper.emitted("changed")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("tombol Batal emit close", async () => {
    const { wrapper } = await setup({ show: true });
    await wrapper.find("button[type=button]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("tombol X pada ModalShell emit close", async () => {
    const { wrapper } = await setup({ show: true });
    await wrapper.find("[aria-label=Tutup]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});