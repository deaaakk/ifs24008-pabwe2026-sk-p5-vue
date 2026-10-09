import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "./aucationsStore";
import * as api from "../api/aucationApi";

vi.mock("../api/aucationApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

describe("aucationsStore", () => {
  let store;
  beforeEach(() => { vi.resetAllMocks(); createMockPinia(); store = useAucationsStore(); });

  it("mengambil daftar & detail", async () => {
    api.getAucations.mockResolvedValue({ data: { aucations: [{ id: 1 }] } });
    await store.asyncGetAucations({ is_me: 1 });
    expect(store.aucations).toEqual([{ id: 1 }]);
    api.getAucation.mockResolvedValue({ data: { aucation: { id: 2 } } });
    expect(await store.asyncGetAucation(2)).toBe(true);
    expect(store.aucation.id).toBe(2);
    api.getAucation.mockRejectedValue(new Error("x"));
    expect(await store.asyncGetAucation(3)).toBe(false);
    expect(store.aucation).toBeNull();
    api.getAucations.mockRejectedValue(new Error("x"));
    await store.asyncGetAucations();
    expect(store.aucations).toEqual([{ id: 1 }]);
  });

  it("mutasi sukses menyetel flag done", async () => {
    const ok = { message: "ok" };
    api.postAucation.mockResolvedValue(ok); api.putAucation.mockResolvedValue(ok);
    api.postCover.mockResolvedValue(ok); api.deleteAucation.mockResolvedValue(ok);
    api.postBid.mockResolvedValue(ok); api.deleteBid.mockResolvedValue(ok); api.deleteAllAucations.mockResolvedValue(ok);
    expect(await store.asyncAddAucation({})).toBe(true);
    expect(await store.asyncChangeAucation(1, {})).toBe(true);
    expect(await store.asyncChangeCover(1, {})).toBe(true);
    expect(await store.asyncDeleteAucation(1)).toBe(true);
    expect(await store.asyncAddBid(1, 5)).toBe(true);
    expect(await store.asyncDeleteBid(1)).toBe(true);
    expect(await store.asyncDeleteAllAucations()).toBe(true);
    expect(store.isAucationAdded && store.isBidAdded && store.isAucationDeletedAll).toBe(true);
  });

  it("mutasi gagal mengembalikan false", async () => {
    api.postBid.mockRejectedValue(new Error("gagal"));
    expect(await store.asyncAddBid(1, 5)).toBe(false);
    expect(store.isBidAdded).toBe(false);
    expect(store.isBidAdd).toBe(false);
  });
});
