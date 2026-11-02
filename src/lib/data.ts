import "server-only";
import { connection } from "next/server";
import { sql } from "./db";
import type {
  EventDetail,
  EventRingkas,
  HitungRsvp,
  Kota,
  Peserta,
  Tema,
} from "./types";

// Potongan SELECT bersama: event + kota/venue/tema/pembicara sebagai objek JSON.
// Event berstatus draft tidak pernah ikut.
function kolomEvent() {
  if (!sql) throw new Error("Database belum tersambung");
  return sql`
    e.id, e.judul, e.slug, e.mulai, e.selesai, e.kuota, e.status,
    json_build_object(
      'id', k.id, 'nama', k.nama, 'slug', k.slug, 'lat', k.lat, 'lng', k.lng,
      'zona_waktu', k.zona_waktu, 'status', k.status
    ) as kota,
    case when v.id is null then null else json_build_object(
      'id', v.id, 'nama', v.nama, 'alamat', v.alamat, 'lat', v.lat, 'lng', v.lng,
      'link_maps', v.link_maps
    ) end as venue,
    case when t.id is null then null else json_build_object(
      'id', t.id, 'nama', t.nama, 'slug', t.slug, 'bulan', t.bulan,
      'pertanyaan_pemantik', t.pertanyaan_pemantik, 'deskripsi', t.deskripsi,
      'warna_aksen', t.warna_aksen
    ) end as tema,
    case when p.id is null then null else json_build_object(
      'id', p.id, 'nama', p.nama, 'bio', p.bio, 'foto_url', p.foto_url,
      'instagram', p.instagram
    ) end as pembicara
  `;
}

function dariEvent() {
  if (!sql) throw new Error("Database belum tersambung");
  return sql`
    event e
    join kota k on k.id = e.kota_id
    left join venue v on v.id = e.venue_id
    left join tema t on t.id = e.tema_id
    left join pembicara p on p.id = e.pembicara_id
  `;
}

/** postgres.js mengembalikan timestamp sebagai Date; komponen butuh string ISO. */
function rapikan<T extends { mulai: unknown; selesai: unknown }>(baris: T): T {
  const iso = (x: unknown) => (x instanceof Date ? x.toISOString() : x);
  return { ...baris, mulai: iso(baris.mulai), selesai: iso(baris.selesai) };
}

export async function ambilKota(): Promise<Kota[]> {
  if (!sql) return [];
  await connection(); // data selalu segar, tidak di-cache saat build
  return sql<Kota[]>`
    select id, nama, slug, lat, lng, zona_waktu, status from kota order by nama
  `;
}

/** Event yang belum lewat (sejak kemarin), tanpa draft dan batal. */
export async function ambilEventMendatang(): Promise<EventRingkas[]> {
  if (!sql) return [];
  await connection();
  const baris = await sql<EventRingkas[]>`
    select ${kolomEvent()} from ${dariEvent()}
    where e.status not in ('draft', 'batal')
      and e.mulai >= now() - interval '1 day'
    order by e.mulai
  `;
  return baris.map(rapikan);
}

export async function ambilEventArsip(): Promise<EventRingkas[]> {
  if (!sql) return [];
  await connection();
  const baris = await sql<EventRingkas[]>`
    select ${kolomEvent()} from ${dariEvent()}
    where e.status <> 'draft' and e.mulai < now()
    order by e.mulai desc
    limit 50
  `;
  return baris.map(rapikan);
}

export async function ambilEvent(slug: string): Promise<EventDetail | null> {
  if (!sql) return null;
  await connection();
  const [ev] = await sql<EventDetail[]>`
    select ${kolomEvent()}, e.deskripsi, e.video_url,
      coalesce((
        select json_agg(json_build_object(
          'id', pr.id, 'nama', pr.nama, 'logo_url', pr.logo_url,
          'link', pr.link, 'deskripsi', pr.deskripsi
        ) order by pr.nama)
        from event_partner ep join partner pr on pr.id = ep.partner_id
        where ep.event_id = e.id
      ), '[]') as partner
    from ${dariEvent()}
    where e.slug = ${slug} and e.status <> 'draft'
  `;
  return ev ? rapikan(ev) : null;
}

/** Tema bulan berjalan; kalau belum ada, tema terdekat berikutnya. */
export async function ambilTemaAktif(): Promise<Tema | null> {
  if (!sql) return null;
  await connection();
  const [tema] = await sql<Tema[]>`
    select id, nama, slug, to_char(bulan, 'YYYY-MM-DD') as bulan,
           pertanyaan_pemantik, deskripsi, warna_aksen
    from tema
    where bulan >= date_trunc('month', now() at time zone 'Asia/Jakarta')::date
    order by bulan
    limit 1
  `;
  return tema ?? null;
}

export async function hitungRsvp(eventId: string): Promise<HitungRsvp> {
  if (!sql) return { terisi: 0, waitlist: 0 };
  await connection();
  const [h] = await sql<HitungRsvp[]>`select * from hitung_rsvp(${eventId})`;
  return h ?? { terisi: 0, waitlist: 0 };
}

export async function ambilPeserta(eventId: string): Promise<Peserta[]> {
  if (!sql) return [];
  await connection();
  return sql<Peserta[]>`select * from peserta_publik(${eventId})`;
}
