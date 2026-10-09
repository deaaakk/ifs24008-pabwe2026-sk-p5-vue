import Swal from "sweetalert2";

export const showSuccessDialog = (text, title = "Berhasil") =>
  Swal.fire({ icon: "success", title, text, timer: 1500, showConfirmButton: false });

export const showErrorDialog = (text, title = "Gagal") =>
  Swal.fire({ icon: "error", title, text });

export const showConfirmDialog = async (text, title = "Apakah kamu yakin?") => {
  const result = await Swal.fire({
    icon: "warning", title, text,
    showCancelButton: true, confirmButtonText: "Ya", cancelButtonText: "Batal",
    confirmButtonColor: "#4f46e5",
  });
  return result.isConfirmed;
};

export const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(String(value).includes("T") ? value : String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

/** "2026-12-31T23:59" (datetime-local) -> "2026-12-31 23:59:00" (API) */
export const toApiDate = (value) => (value ? value.replace("T", " ") + (value.length === 16 ? ":00" : "") : "");
/** "2026-12-31 23:59:00" (API) -> "2026-12-31T23:59" (datetime-local) */
export const toInputDate = (value) => (value ? String(value).replace(" ", "T").slice(0, 16) : "");

export const photoUrl = (photo) => {
  if (!photo) return "";
  if (/^https?:\/\//.test(photo)) return photo;
  return `${new URL(DELCOM_BASEURL).origin}/${photo.replace(/^\//, "")}`;
};

export const isClosed = (aucation, now = Date.now()) =>
  new Date(String(aucation.closed_at).replace(" ", "T")).getTime() <= now;

export const highestBid = (aucation) =>
  Math.max(
    Number(aucation.start_bid) || 0,
    ...(aucation.bids || []).map((b) => (typeof b === "object" ? Number(b.bid) || 0 : 0))
  );

export const countdownText = (closedAt, now = Date.now()) => {
  const diff = new Date(String(closedAt).replace(" ", "T")).getTime() - now;
  if (diff <= 0) return "Ditutup";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return d > 0 ? `${d}h ${h}j ${m}m` : `${h}j ${m}m ${s}d`;
};
