import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "./aucationApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper");

const payload = { title: "T", description: "D", start_bid: 1, closed_at: "2026-12-31 23:59:00" };

describe("aucationApi", () => {
  beforeEach(() => { vi.resetAllMocks(); apiFetch.mockResolvedValue({ status: "success" }); });

  it("getAucations dengan & tanpa params", async () => {
    await api.getAucations();
    expect(apiFetch).toHaveBeenCalledWith("/aucations", { params: {} });
    await api.getAucations({ is_me: 1 });
    expect(apiFetch).toHaveBeenCalledWith("/aucations", { params: { is_me: 1 } });
  });
  it("getAucation", async () => {
    await api.getAucation(3);
    expect(apiFetch).toHaveBeenCalledWith("/aucations/3");
  });
  it("postAucation & putAucation", async () => {
    await api.postAucation({ ...payload, x: 1 });
    expect(apiFetch).toHaveBeenCalledWith("/aucations", { method: "POST", body: payload });
    await api.putAucation(3, { ...payload, x: 1 });
    expect(apiFetch).toHaveBeenCalledWith("/aucations/3", { method: "PUT", body: payload });
  });
  it("postCover mengirim FormData", async () => {
    const file = new File(["x"], "c.png");
    await api.postCover(3, file);
    const [path, opt] = apiFetch.mock.calls[0];
    expect(path).toBe("/aucations/3/cover");
    expect(opt.body.get("cover")).toBe(file);
  });
  it("delete & bid", async () => {
    await api.deleteAucation(3);
    expect(apiFetch).toHaveBeenCalledWith("/aucations/3", { method: "DELETE" });
    await api.postBid(3, 5000);
    expect(apiFetch).toHaveBeenCalledWith("/aucations/3/bids", { method: "POST", body: { bid: 5000 } });
    await api.deleteBid(3);
    expect(apiFetch).toHaveBeenCalledWith("/aucations/3/bids", { method: "DELETE" });
    await api.deleteAllAucations();
    expect(apiFetch).toHaveBeenCalledWith("/aucations", { method: "DELETE" });
  });
});