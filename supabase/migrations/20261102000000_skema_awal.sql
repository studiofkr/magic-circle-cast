-- =====================================================================
-- Magic Circle Cast — skema awal database
-- Jalankan sekali di Supabase: Dashboard → SQL Editor → tempel → Run.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tipe status
-- ---------------------------------------------------------------------
create type status_kota    as enum ('aktif', 'cari_host');
create type status_event   as enum ('draft', 'segera', 'rsvp_buka', 'rsvp_tutup', 'selesai', 'batal');
create type status_rsvp    as enum ('terdaftar', 'waitlist', 'hadir', 'batal');
create type status_relawan as enum ('baru', 'dihubungi', 'aktif', 'alumni');
create type tingkat_partner as enum ('global', 'kota', 'event');

-- ---------------------------------------------------------------------
-- Data referensi
-- ---------------------------------------------------------------------
create table kota (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null,
  slug         text not null unique,
  lat          double precision not null,
  lng          double precision not null,
  zona_waktu   text not null default 'Asia/Jakarta',   -- Asia/Jakarta (WIB), Asia/Makassar (WITA), Asia/Jayapura (WIT)
  status       status_kota not null default 'cari_host',
  instagram    text,
  dibuat_pada  timestamptz not null default now()
);

create table venue (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null,
  alamat       text,
  kota_id      uuid not null references kota(id),
  lat          double precision,
  lng          double precision,
  kapasitas    int,
  link_maps    text,
  dibuat_pada  timestamptz not null default now()
);

create table tema (
  id                  uuid primary key default gen_random_uuid(),
  nama                text not null,
  slug                text not null unique,
  bulan               date not null,                 -- tanggal 1 bulan tema, mis. 2026-11-01
  pertanyaan_pemantik text,
  deskripsi           text,
  warna_aksen         text default '#f2b632',
  ilustrasi_url       text,
  kota_pemilih_id     uuid references kota(id),
  dibuat_pada         timestamptz not null default now()
);

create table pembicara (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null,
  bio          text,
  foto_url     text,
  instagram    text,
  website      text,
  dibuat_pada  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Event
-- ---------------------------------------------------------------------
create table event (
  id            uuid primary key default gen_random_uuid(),
  judul         text not null,
  slug          text not null unique,
  deskripsi     text,
  mulai         timestamptz not null,
  selesai       timestamptz,
  kota_id       uuid not null references kota(id),
  venue_id      uuid references venue(id),
  tema_id       uuid references tema(id),
  pembicara_id  uuid references pembicara(id),
  kuota         int not null default 100 check (kuota > 0),
  status        status_event not null default 'draft',
  video_url     text,
  dibuat_pada   timestamptz not null default now()
);
create index on event (mulai);
create index on event (kota_id);

-- ---------------------------------------------------------------------
-- Peserta & relawan (berisi data pribadi — tidak bisa dibaca publik)
-- ---------------------------------------------------------------------
create table rsvp (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references event(id) on delete cascade,
  nama          text not null,
  email         text not null,
  whatsapp      text,
  bidang_karya  text,
  izin_tampil   boolean not null default false,
  status        status_rsvp not null,
  kode_checkin  text not null unique,
  dibuat_pada   timestamptz not null default now(),
  diubah_pada   timestamptz not null default now()
);
create unique index rsvp_satu_email_per_event on rsvp (event_id, lower(email));
create index on rsvp (event_id, status, dibuat_pada);

create table relawan (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null,
  email         text not null,
  whatsapp      text,
  kota_id       uuid references kota(id),
  peran         text[] not null default '{}',
  cerita        text,
  foto_url      text,
  izin_tampil   boolean not null default false,
  status        status_relawan not null default 'baru',
  catatan_admin text,
  dibuat_pada   timestamptz not null default now()
);

create table minat_kota (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  kota_id      uuid not null references kota(id),
  dibuat_pada  timestamptz not null default now()
);
create unique index minat_kota_unik on minat_kota (lower(email), kota_id);

-- ---------------------------------------------------------------------
-- Partner & tabel penghubung
-- ---------------------------------------------------------------------
create table partner (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null,
  logo_url     text,
  link         text,
  deskripsi    text,
  tingkat      tingkat_partner not null default 'event',
  kota_id      uuid references kota(id),
  dibuat_pada  timestamptz not null default now()
);

create table event_partner (
  event_id    uuid references event(id) on delete cascade,
  partner_id  uuid references partner(id) on delete cascade,
  primary key (event_id, partner_id)
);

create table event_kru (
  event_id    uuid references event(id) on delete cascade,
  relawan_id  uuid references relawan(id) on delete cascade,
  peran       text not null,
  primary key (event_id, relawan_id, peran)
);

-- =====================================================================
-- Keamanan: Row Level Security
-- Publik (anon) hanya boleh MEMBACA data acara, dan hanya boleh MENGISI
-- form relawan / minat kota. RSVP lewat fungsi daftar_rsvp() di bawah.
-- Admin memakai dashboard Supabase (tidak terkena RLS).
-- =====================================================================
alter table kota          enable row level security;
alter table venue         enable row level security;
alter table tema          enable row level security;
alter table pembicara     enable row level security;
alter table event         enable row level security;
alter table rsvp          enable row level security;
alter table relawan       enable row level security;
alter table minat_kota    enable row level security;
alter table partner       enable row level security;
alter table event_partner enable row level security;
alter table event_kru     enable row level security;

create policy "publik baca kota"      on kota          for select using (true);
create policy "publik baca venue"     on venue         for select using (true);
create policy "publik baca tema"      on tema          for select using (true);
create policy "publik baca pembicara" on pembicara     for select using (true);
create policy "publik baca partner"   on partner       for select using (true);
create policy "publik baca ep"        on event_partner for select using (true);
create policy "publik baca event"     on event         for select using (status <> 'draft');

create policy "publik daftar relawan" on relawan for insert to anon, authenticated
  with check (status = 'baru' and catatan_admin is null);
create policy "publik minat kota"     on minat_kota for insert to anon, authenticated
  with check (true);
-- rsvp & event_kru: sengaja TIDAK ada policy untuk publik.

-- =====================================================================
-- Fungsi publik (aman: hanya mengembalikan data yang boleh tampil)
-- =====================================================================

-- Jumlah kursi terisi (terdaftar + hadir) dan antrean waitlist
create or replace function hitung_rsvp(p_event_id uuid)
returns table (terisi int, waitlist int)
language sql stable security definer set search_path = public as $$
  select
    count(*) filter (where status in ('terdaftar','hadir'))::int,
    count(*) filter (where status = 'waitlist')::int
  from rsvp where event_id = p_event_id;
$$;

-- Nama depan + inisial peserta yang mengizinkan namanya tampil
create or replace function peserta_publik(p_event_id uuid)
returns table (nama_depan text, inisial text)
language sql stable security definer set search_path = public as $$
  select split_part(trim(nama), ' ', 1),
         upper(left(trim(nama), 1) || coalesce(left(nullif(split_part(trim(nama), ' ', 2), ''), 1), ''))
  from rsvp
  where event_id = p_event_id and izin_tampil and status in ('terdaftar','hadir')
  order by dibuat_pada;
$$;

-- Tim relawan aktif sebuah kota (tanpa email / nomor HP)
create or replace function tim_kota(p_kota_id uuid)
returns table (nama text, foto_url text, peran text[])
language sql stable security definer set search_path = public as $$
  select nama, foto_url, peran from relawan
  where kota_id = p_kota_id and status = 'aktif' and izin_tampil
  order by nama;
$$;

-- Kru sebuah event (tanpa data kontak)
create or replace function kru_event(p_event_id uuid)
returns table (nama text, peran text)
language sql stable security definer set search_path = public as $$
  select r.nama, k.peran from event_kru k join relawan r on r.id = k.relawan_id
  where k.event_id = p_event_id and r.izin_tampil
  order by k.peran;
$$;

-- Kode check-in acak, mis. MCC-7K2Q (tanpa huruf/angka yang mirip: 0 O 1 I L)
create or replace function buat_kode_checkin()
returns text language plpgsql volatile set search_path = public as $$
declare
  abjad text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  kode  text;
begin
  loop
    kode := 'MCC-';
    for i in 1..4 loop
      kode := kode || substr(abjad, 1 + floor(random() * length(abjad))::int, 1);
    end loop;
    exit when not exists (select 1 from rsvp where kode_checkin = kode);
  end loop;
  return kode;
end $$;

-- ---------------------------------------------------------------------
-- RSVP: satu-satunya pintu masuk pendaftaran.
-- Mengunci baris event supaya dua orang yang mendaftar bersamaan tidak
-- sama-sama mendapat kursi terakhir.
-- ---------------------------------------------------------------------
create or replace function daftar_rsvp(
  p_event_id     uuid,
  p_nama         text,
  p_email        text,
  p_whatsapp     text default null,
  p_bidang_karya text default null,
  p_izin_tampil  boolean default false,
  p_kabari_kota  boolean default false
)
returns json
language plpgsql security definer set search_path = public as $$
declare
  ev       event%rowtype;
  lama     rsvp%rowtype;
  terisi   int;
  st       status_rsvp;
  kode     text;
  posisi   int;
  ada_lama boolean;
begin
  if coalesce(trim(p_nama), '') = '' or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return json_build_object('ok', false, 'pesan', 'Nama dan email yang valid wajib diisi.');
  end if;

  select * into ev from event where id = p_event_id for update;
  if not found or ev.status <> 'rsvp_buka' then
    return json_build_object('ok', false, 'pesan', 'Pendaftaran untuk event ini sedang tidak dibuka.');
  end if;

  -- Sudah pernah daftar dengan email ini? Kembalikan status yang ada.
  select * into lama from rsvp where event_id = ev.id and lower(email) = lower(trim(p_email));
  ada_lama := found;
  if ada_lama and lama.status <> 'batal' then
    return json_build_object('ok', true, 'sudah_terdaftar', true,
                             'status', lama.status, 'kode', lama.kode_checkin);
  end if;

  select count(*) into terisi from rsvp
   where event_id = ev.id and status in ('terdaftar','hadir');
  st := case when terisi < ev.kuota then 'terdaftar' else 'waitlist' end;

  if ada_lama then
    -- pernah batal, daftar lagi: pakai baris lama
    update rsvp set nama = trim(p_nama), whatsapp = p_whatsapp, bidang_karya = p_bidang_karya,
                    izin_tampil = p_izin_tampil, status = st, dibuat_pada = now(), diubah_pada = now()
     where id = lama.id returning kode_checkin into kode;
  else
    kode := buat_kode_checkin();
    insert into rsvp (event_id, nama, email, whatsapp, bidang_karya, izin_tampil, status, kode_checkin)
    values (ev.id, trim(p_nama), lower(trim(p_email)), p_whatsapp, p_bidang_karya, p_izin_tampil, st, kode);
  end if;

  if p_kabari_kota then
    insert into minat_kota (email, kota_id) values (lower(trim(p_email)), ev.kota_id)
    on conflict do nothing;
  end if;

  if st = 'waitlist' then
    select count(*) into posisi from rsvp
     where event_id = ev.id and status = 'waitlist'
       and dibuat_pada <= (select dibuat_pada from rsvp where kode_checkin = kode);
  end if;

  return json_build_object('ok', true, 'status', st, 'kode', kode, 'posisi_waitlist', posisi);
end $$;

-- ---------------------------------------------------------------------
-- Batal hadir: butuh kode check-in + email (keduanya dari email konfirmasi).
-- Kursi yang kosong otomatis diberikan ke waitlist paling awal.
-- ---------------------------------------------------------------------
create or replace function batal_rsvp(p_kode text, p_email text)
returns json
language plpgsql security definer set search_path = public as $$
declare
  r rsvp%rowtype;
begin
  update rsvp set status = 'batal', diubah_pada = now()
   where kode_checkin = upper(trim(p_kode)) and lower(email) = lower(trim(p_email))
     and status in ('terdaftar','waitlist')
  returning * into r;

  if not found then
    return json_build_object('ok', false, 'pesan', 'Kode atau email tidak cocok.');
  end if;

  perform naikkan_waitlist(r.event_id);
  return json_build_object('ok', true);
end $$;

create or replace function naikkan_waitlist(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  kuota_ev int;
  terisi   int;
begin
  select kuota into kuota_ev from event where id = p_event_id for update;
  select count(*) into terisi from rsvp where event_id = p_event_id and status in ('terdaftar','hadir');

  update rsvp set status = 'terdaftar', diubah_pada = now()
   where id in (
     select id from rsvp
      where event_id = p_event_id and status = 'waitlist'
      order by dibuat_pada
      limit greatest(kuota_ev - terisi, 0)
   );
end $$;

-- Hak akses fungsi: publik hanya boleh memanggil fungsi yang aman.
revoke all on function hitung_rsvp(uuid), peserta_publik(uuid), tim_kota(uuid), kru_event(uuid),
                       buat_kode_checkin(), daftar_rsvp(uuid,text,text,text,text,boolean,boolean),
                       batal_rsvp(text,text), naikkan_waitlist(uuid)
  from public;
grant execute on function hitung_rsvp(uuid), peserta_publik(uuid), tim_kota(uuid), kru_event(uuid),
                          daftar_rsvp(uuid,text,text,text,text,boolean,boolean), batal_rsvp(text,text)
  to anon, authenticated;
-- Supabase memberi hak eksekusi bawaan ke anon/authenticated; cabut untuk fungsi internal.
revoke execute on function buat_kode_checkin(), naikkan_waitlist(uuid) from anon, authenticated;
