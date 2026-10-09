import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (orig) => ({ ...(await orig()), showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

const setup = async () => {
  const r = await renderWithProviders(ChangeCoverModal, { props: { show: true, aucation: { id: 5 } } });
  return { ...r, store: useAucationsStore(r.pinia) };
};
const pick = async (wrapper, files) => {
  const input = wrapper.find("input[type=file]");
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
  await input.trigger("change");
};

describe("ChangeCoverModal", () => {
  beforeEach(() => vi.resetAllMocks());

  it("menampilkan pratinjau, menghapusnya saat file dikosongkan", async () => {
    URL.createObjectURL.mockReturnValue("blob:preview");
    const { wrapper } = await setup();
    expect(wrapper.find("img").exists()).toBe(false);
    await pick(wrapper, [new File(["x"], "c.png")]);
    expect(wrapper.find("img").attributes("src")).toBe("blob:preview");
    await pick(wrapper, []);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("menolak submit tanpa file", async () => {
    const { wrapper, store } = await setup();
    const spy = vi.spyOn(store, "asyncChangeCover");
    await wrapper.find("form").trigger("submit");
    expect(showErrorDialog).toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });

  it("submit sukses & gagal", async () => {
    const { wrapper, store } = await setup();
    const file = new File(["x"], "c.png");
    await pick(wrapper, [file]);
    const spy = vi.spyOn(store, "asyncChangeCover").mockResolvedValue(false);
    await wrapper.find("form").trigger("submit");
    expect(wrapper.emitted("changed")).toBeUndefined();
    spy.mockResolvedValue(true);
    await wrapper.find("form").trigger("submit");
    expect(spy).toHaveBeenLastCalledWith(5, file);
    expect(wrapper.emitted("changed")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("mereset pratinjau saat ditutup, revoke saat unmount, dan Batal emit close", async () => {
    URL.createObjectURL.mockReturnValue("blob:p");
    const { wrapper } = await setup();
    await pick(wrapper, [new File(["x"], "c.png")]);
    await wrapper.setProps({ show: false });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:p");
    await wrapper.setProps({ show: true });
    expect(wrapper.find("img").exists()).toBe(false);
    await wrapper.find("button[type=button]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
    await pick(wrapper, [new File(["y"], "d.png")]);
    wrapper.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("tombol X pada ModalShell emit close", async () => {
    const { wrapper } = await setup();
    await wrapper.find("[aria-label=Tutup]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});