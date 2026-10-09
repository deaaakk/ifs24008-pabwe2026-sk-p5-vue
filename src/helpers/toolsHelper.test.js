import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import * as t from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("dialog success & error memanggil Swal", () => {
    t.showSuccessDialog("ok");
    t.showErrorDialog("bad");
    expect(Swal.fire).toHaveBeenCalledTimes(2);
  });

  it("showConfirmDialog mengembalikan isConfirmed", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    expect(await t.showConfirmDialog("x")).toBe(true);
  });

  it("formatRupiah & formatDate", () => {
    expect(t.formatRupiah(10000)).toContain("10.000");
    expect(t.formatRupiah("abc")).toContain("0");
    expect(t.formatDate("")).toBe("-");
    expect(t.formatDate("bukan-tanggal")).toBe("-");
    expect(t.formatDate("2026-12-31 23:59:00")).toContain("2026");
    expect(t.formatDate("2026-06-15T12:00:00Z")).toContain("2026");
  });

  it("konversi tanggal API <-> input", () => {
    expect(t.toApiDate("2026-12-31T23:59")).toBe("2026-12-31 23:59:00");
    expect(t.toApiDate("2026-12-31T23:59:30")).toBe("2026-12-31 23:59:30");
    expect(t.toApiDate("")).toBe("");
    expect(t.toInputDate("2026-12-31 23:59:00")).toBe("2026-12-31T23:59");
    expect(t.toInputDate("")).toBe("");
  });

  it("photoUrl", () => {
    expect(t.photoUrl("")).toBe("");
    expect(t.photoUrl("http://x/y.png")).toBe("http://x/y.png");
    expect(t.photoUrl("/img/a.png")).toBe("https://open-api.delcom.org/img/a.png");
  });

  it("isClosed, highestBid, countdownText", () => {
    const now = new Date("2026-01-01T00:00:00").getTime();
    expect(t.isClosed({ closed_at: "2025-12-31 00:00:00" }, now)).toBe(true);
    expect(t.isClosed({ closed_at: "2026-01-02 00:00:00" }, now)).toBe(false);
    expect(t.highestBid({ start_bid: 100 })).toBe(100);
    expect(t.highestBid({ start_bid: "x", bids: [2, { bid: 500 }, { bid: "z" }] })).toBe(500);
    expect(t.countdownText("2025-01-01 00:00:00", now)).toBe("Ditutup");
    expect(t.countdownText("2026-01-03 01:02:03", now)).toBe("2h 1j 2m");
    expect(t.countdownText("2026-01-01 01:02:03", now)).toBe("1j 2m 3d");
  });
});
