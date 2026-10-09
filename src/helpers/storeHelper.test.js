import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { runAction } from "./storeHelper";
import { showErrorDialog, showSuccessDialog } from "./toolsHelper";

vi.mock("./toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

describe("runAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menampilkan dialog sukses dan mengatur flag busy", async () => {
    const busy = ref(false);
    const result = await runAction(busy, async () => ({ message: "ok" }), { success: true });
    expect(result).toEqual({ message: "ok" });
    expect(showSuccessDialog).toHaveBeenCalledWith("ok");
    expect(busy.value).toBe(false);
  });

  it("tidak menampilkan dialog jika success=false atau tanpa message", async () => {
    const busy = ref(false);
    await runAction(busy, async () => ({ message: "ok" }));
    expect(await runAction(busy, async () => undefined, { success: true })).toBe(true);
    expect(await runAction(busy, async () => ({}), { success: true })).toEqual({});
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it("menampilkan dialog error dan mengembalikan false", async () => {
    const busy = ref(false);
    expect(await runAction(busy, async () => { throw new Error("gagal"); })).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("gagal");
    expect(busy.value).toBe(false);
  });
});