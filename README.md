# Magic Circle Cast

Web event Magic Circle Cast: talk kreatif bulanan di banyak kota, dengan satu tema yang sama tiap bulan.

Dibangun dengan **Next.js** (App Router) + **Supabase** (database & keamanan), di-deploy ke **Vercel**.

## Yang sudah ada

| Halaman | Isi |
|---|---|
| `/` | Hero tema bulan ini, event di kota pilihan pengunjung (atau kota terdekat kalau kotanya belum punya event) |
| `/event` | Jadwal semua kota, tab Mendatang/Arsip, filter kota |
| `/event/[slug]` | Detail event, kapasitas, peserta (yang mengizinkan), partner, form RSVP |

- **Pilih kota manual.** Tidak memakai GPS; pilihan disimpan di browser pengunjung.
- **RSVP tanpa akun.** Satu email satu kursi. Kuota penuh → otomatis waitlist. Yang batal → waitlist teratas naik.
- **Data pribadi aman.** Email dan nomor WhatsApp peserta/relawan tidak bisa dibaca dari web (Row Level Security).

## Menyiapkan database (sekali saja)

1. Buka Supabase → project Magic Circle Cast → **SQL Editor**.
2. Tempel isi `supabase/migrations/20261102000000_skema_awal.sql`, klik **Run**.
3. (Opsional, untuk mencoba) tempel isi `supabase/seed.sql`, klik **Run**. Ini mengisi data **contoh** (nama orang & venue fiktif). Event Bandung sengaja berkuota 2 supaya waitlist bisa dicoba.

Admin mengelola data lewat **Table Editor** di dashboard Supabase:
ubah `status` event menjadi `rsvp_buka` untuk membuka pendaftaran, lihat peserta di tabel `rsvp`, dsb.

### Status event

| Status | Arti |
|---|---|
| `draft` | Tersembunyi dari publik |
| `segera` | Tampil, RSVP belum dibuka |
| `rsvp_buka` | Pendaftaran dibuka |
| `rsvp_tutup` | Tampil, pendaftaran ditutup |
| `selesai` | Sudah lewat |
| `batal` | Dibatalkan |

## Environment variable

Salin `.env.example` → `.env.local` (lokal) atau isi di Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Kunci **service_role** tidak dipakai dan tidak boleh ditaruh di repo atau Vercel.

## Menjalankan di laptop (opsional)

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Struktur

```
src/app/                 halaman (beranda, jadwal, detail event + aksi RSVP)
src/components/          header, pilih kota, daftar event, komponen kecil
src/lib/data.ts          semua pengambilan data dari Supabase
src/lib/format.ts        format tanggal/jam per zona (WIB/WITA/WIT), jarak antar kota
supabase/migrations/     skema database, keamanan, fungsi RSVP
supabase/seed.sql        data contoh
```

## Belum dikerjakan

- Halaman kota (`/kota/[slug]`) dan halaman tema (`/tema/[slug]`)
- Form relawan & form calon host
- Email konfirmasi + pengingat H-1 (butuh domain sendiri)
- Halaman check-in untuk panitia
- Logo, warna, dan foto resmi (warna sekarang masih usulan)
