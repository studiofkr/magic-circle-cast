const LABEL_ZONA: Record<string, string> = {
  "Asia/Jakarta": "WIB",
  "Asia/Pontianak": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
};

export function labelZona(zona: string) {
  return LABEL_ZONA[zona] ?? zona;
}

function bagian(iso: string, zona: string, opsi: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: zona, ...opsi }).format(
    new Date(iso),
  );
}

/** "Jumat, 27 Nov 2026" */
export function tanggalPanjang(iso: string, zona: string) {
  return bagian(iso, zona, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "Jum, 27 Nov" */
export function tanggalPendek(iso: string, zona: string) {
  return bagian(iso, zona, { weekday: "short", day: "numeric", month: "short" });
}

/** { hari: "27", bulan: "Nov" } untuk kotak tanggal */
export function kotakTanggal(iso: string, zona: string) {
  return {
    hari: bagian(iso, zona, { day: "numeric" }),
    bulan: bagian(iso, zona, { month: "short" }).replace(".", ""),
  };
}

/** "08.00–10.00 WIB" */
export function rentangJam(mulai: string, selesai: string | null, zona: string) {
  const jam = (iso: string) =>
    bagian(iso, zona, { hour: "2-digit", minute: "2-digit", hour12: false });
  const teks = selesai ? `${jam(mulai)}–${jam(selesai)}` : jam(mulai);
  return `${teks} ${labelZona(zona)}`;
}

/** Kunci pengelompokan per hari, mis. "2026-11-27" */
export function kunciHari(iso: string, zona: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zona }).format(new Date(iso));
}

/** Jarak dua titik dalam km (rumus haversine). */
export function jarakKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
