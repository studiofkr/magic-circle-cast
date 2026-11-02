import { connection } from "next/server";
import { supabase } from "./supabase";
import type {
  EventDetail,
  EventRingkas,
  HitungRsvp,
  Kota,
  Peserta,
  Tema,
} from "./types";

const KOLOM_EVENT = `
  id, judul, slug, mulai, selesai, kuota, status,
  kota:kota_id ( id, nama, slug, lat, lng, zona_waktu, status ),
  venue:venue_id ( id, nama, alamat, lat, lng, link_maps ),
  tema:tema_id ( id, nama, slug, bulan, pertanyaan_pemantik, deskripsi, warna_aksen ),
  pembicara:pembicara_id ( id, nama, bio, foto_url, instagram )
`;

export async function ambilKota(): Promise<Kota[]> {
  if (!supabase) return [];
  await connection(); // data selalu segar, tidak di-cache saat build
  const { data, error } = await supabase
    .from("kota")
    .select("id, nama, slug, lat, lng, zona_waktu, status")
    .order("nama");
  if (error) throw error;
  return data as Kota[];
}

/** Event yang belum lewat (dan bukan draft — draft sudah disaring RLS). */
export async function ambilEventMendatang(): Promise<EventRingkas[]> {
  if (!supabase) return [];
  await connection(); // data selalu segar, tidak di-cache saat build
  const sejakKemarin = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("event")
    .select(KOLOM_EVENT)
    .gte("mulai", sejakKemarin)
    .neq("status", "batal")
    .order("mulai");
  if (error) throw error;
  return data as unknown as EventRingkas[];
}

export async function ambilEventArsip(): Promise<EventRingkas[]> {
  if (!supabase) return [];
  await connection(); // data selalu segar, tidak di-cache saat build
  const { data, error } = await supabase
    .from("event")
    .select(KOLOM_EVENT)
    .lt("mulai", new Date().toISOString())
    .order("mulai", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as unknown as EventRingkas[];
}

export async function ambilEvent(slug: string): Promise<EventDetail | null> {
  if (!supabase) return null;
  await connection(); // data selalu segar, tidak di-cache saat build
  const { data, error } = await supabase
    .from("event")
    .select(
      `${KOLOM_EVENT}, deskripsi, video_url,
       event_partner ( partner:partner_id ( id, nama, logo_url, link, deskripsi ) )`,
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { event_partner, ...sisa } = data as unknown as EventDetail & {
    event_partner: { partner: EventDetail["partner"][number] }[];
  };
  return { ...sisa, partner: event_partner.map((ep) => ep.partner) };
}

/** Tema untuk bulan berjalan; kalau belum ada, tema terdekat berikutnya. */
export async function ambilTemaAktif(): Promise<Tema | null> {
  if (!supabase) return null;
  await connection(); // data selalu segar, tidak di-cache saat build
  const awalBulan = new Date();
  awalBulan.setUTCDate(1);
  const { data, error } = await supabase
    .from("tema")
    .select("id, nama, slug, bulan, pertanyaan_pemantik, deskripsi, warna_aksen")
    .gte("bulan", awalBulan.toISOString().slice(0, 10))
    .order("bulan")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Tema | null;
}

export async function hitungRsvp(eventId: string): Promise<HitungRsvp> {
  if (!supabase) return { terisi: 0, waitlist: 0 };
  await connection(); // data selalu segar, tidak di-cache saat build
  const { data, error } = await supabase
    .rpc("hitung_rsvp", { p_event_id: eventId })
    .single();
  if (error) throw error;
  return data as HitungRsvp;
}

export async function ambilPeserta(eventId: string): Promise<Peserta[]> {
  if (!supabase) return [];
  await connection(); // data selalu segar, tidak di-cache saat build
  const { data, error } = await supabase.rpc("peserta_publik", {
    p_event_id: eventId,
  });
  if (error) throw error;
  return (data ?? []) as Peserta[];
}
