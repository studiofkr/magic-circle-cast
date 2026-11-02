export type StatusKota = "aktif" | "cari_host";
export type StatusEvent =
  | "draft"
  | "segera"
  | "rsvp_buka"
  | "rsvp_tutup"
  | "selesai"
  | "batal";

export type Kota = {
  id: string;
  nama: string;
  slug: string;
  lat: number;
  lng: number;
  zona_waktu: string;
  status: StatusKota;
};

export type Venue = {
  id: string;
  nama: string;
  alamat: string | null;
  lat: number | null;
  lng: number | null;
  link_maps: string | null;
};

export type Tema = {
  id: string;
  nama: string;
  slug: string;
  bulan: string;
  pertanyaan_pemantik: string | null;
  deskripsi: string | null;
  warna_aksen: string | null;
};

export type Pembicara = {
  id: string;
  nama: string;
  bio: string | null;
  foto_url: string | null;
  instagram: string | null;
};

export type Partner = {
  id: string;
  nama: string;
  logo_url: string | null;
  link: string | null;
  deskripsi: string | null;
};

export type EventRingkas = {
  id: string;
  judul: string;
  slug: string;
  mulai: string;
  selesai: string | null;
  kuota: number;
  status: StatusEvent;
  kota: Kota;
  venue: Venue | null;
  tema: Tema | null;
  pembicara: Pembicara | null;
};

export type EventDetail = EventRingkas & {
  deskripsi: string | null;
  video_url: string | null;
  partner: Partner[];
};

export type HitungRsvp = { terisi: number; waitlist: number };
export type Peserta = { nama_depan: string; inisial: string };
