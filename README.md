# Magic Circle Cast

Web event Magic Circle Cast: talk kreatif bulanan di banyak kota, dengan satu tema yang sama tiap bulan.

Dibangun dengan **Next.js** (App Router) + **Postgres di Neon**, di-deploy ke **Vercel**.

## Yang sudah ada

| Halaman | Isi |
|---|---|
| `/` | Hero tema bulan ini, event di kota pilihan pengunjung (atau kota terdekat kalau kotanya belum punya event) |
| `/event` | Jadwal semua kota, tab Mendatang/Arsip, filter kota |
| `/event/[slug]` | Detail event, kapasitas, peserta (yang mengizinkan), partner, form RSVP |

- **Pilih kota manual.** Tidak memakai GPS; pilihan disimpan di browser pengunjung.
- **RSVP tanpa akun.** Satu email satu kursi. Kuota penuh → otomatis waitlist. Yang batal → waitlist teratas naik.
- **Data pribadi aman.** Database hanya diakses dari kode server dengan `DATABASE_URL` rahasia. Email dan nomor WhatsApp peserta/relawan tidak pernah dikirim ke browser.

## Menyiapkan database (sekali saja)

1. Buka Neon → project **magic-circle-cast** → **SQL Editor**.
2. Tempel isi `db/migrations/20261102000000_skema_awal.sql`, klik **Run**.
3. (Opsional, untuk mencoba) tempel isi `db/seed.sql`, klik **Run**. Ini mengisi data **contoh** (nama orang & venue fiktif). Event Bandung sengaja berkuota 2 supaya waitlist bisa dicoba.

Admin mengelola data lewat **Tables** di dashboard Neon:
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

Hanya satu, dan **rahasia**:

```
DATABASE_URL=postgresql://...-pooler...neon.tech/neondb?sslmode=require
```

Ambil dari Neon → **Connect** → pilih *Pooled connection*. Isi di Vercel → Project → Settings → Environment Variables (atau `.env.local` untuk di laptop; lihat `.env.example`). Jangan diberi awalan `NEXT_PUBLIC_` dan jangan di-commit.

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
src/lib/db.ts            koneksi database (server saja)
src/lib/data.ts          semua query baca data
src/lib/format.ts        format tanggal/jam per zona (WIB/WITA/WIT), jarak antar kota
db/migrations/           skema database & fungsi RSVP
db/seed.sql              data contoh
```

## Belum dikerjakan

- Halaman kota (`/kota/[slug]`) dan halaman tema (`/tema/[slug]`)
- Form relawan & form calon host
- Email konfirmasi + pengingat H-1 (butuh domain sendiri)
- Halaman check-in untuk panitia
- Logo, warna, dan foto resmi (warna sekarang masih usulan)
