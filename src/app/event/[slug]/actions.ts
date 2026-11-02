"use server";

import { sql } from "@/lib/db";

export type HasilRsvp =
  | { tahap: "awal" }
  | { tahap: "gagal"; pesan: string }
  | {
      tahap: "berhasil";
      status: "terdaftar" | "waitlist" | "hadir";
      kode: string;
      posisi?: number | null;
      sudahTerdaftar?: boolean;
      nama: string;
    };

/**
 * Mengirim RSVP. Semua aturan (kuota, waitlist, email dobel, event harus
 * berstatus rsvp_buka) dijaga oleh fungsi daftar_rsvp di database, jadi
 * aksi ini tidak bisa dipakai untuk melewati batasan apa pun.
 */
export async function kirimRsvp(_prev: HasilRsvp, form: FormData): Promise<HasilRsvp> {
  if (!sql) return { tahap: "gagal", pesan: "Database belum tersambung." };

  const teks = (k: string) => String(form.get(k) ?? "").trim().slice(0, 200);
  const nama = teks("nama");
  const email = teks("email");
  if (!nama || !email) {
    return { tahap: "gagal", pesan: "Nama dan email wajib diisi." };
  }

  const eventId = teks("event_id");
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) {
    return { tahap: "gagal", pesan: "Event tidak dikenali." };
  }

  let data: unknown;
  try {
    const [baris] = await sql`
      select daftar_rsvp(
        ${eventId}::uuid, ${nama}, ${email},
        ${teks("whatsapp") || null}, ${teks("bidang_karya") || null},
        ${form.get("izin_tampil") === "on"}, ${form.get("kabari_kota") === "on"}
      ) as hasil
    `;
    data = baris.hasil;
  } catch (error) {
    console.error("daftar_rsvp gagal", error);
    return { tahap: "gagal", pesan: "Maaf, pendaftaran gagal. Coba lagi sebentar." };
  }

  const h = data as {
    ok: boolean;
    pesan?: string;
    status?: "terdaftar" | "waitlist" | "hadir";
    kode?: string;
    posisi_waitlist?: number | null;
    sudah_terdaftar?: boolean;
  };
  if (!h.ok || !h.status || !h.kode) {
    return { tahap: "gagal", pesan: h.pesan ?? "Pendaftaran gagal." };
  }
  return {
    tahap: "berhasil",
    status: h.status,
    kode: h.kode,
    posisi: h.posisi_waitlist,
    sudahTerdaftar: h.sudah_terdaftar,
    nama: nama.split(" ")[0],
  };
}
