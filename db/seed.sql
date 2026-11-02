-- =====================================================================
-- Data CONTOH untuk mencoba web. Semua nama orang, venue, dan alamat
-- di sini fiktif. Hapus atau ganti sebelum peluncuran.
-- Jalankan setelah file migrasi: Neon → SQL Editor → tempel → Run.
-- =====================================================================

insert into kota (nama, slug, lat, lng, zona_waktu, status) values
  ('Jakarta',    'jakarta',    -6.2088, 106.8456, 'Asia/Jakarta',  'aktif'),
  ('Bandung',    'bandung',    -6.9175, 107.6191, 'Asia/Jakarta',  'aktif'),
  ('Yogyakarta', 'yogyakarta', -7.7956, 110.3695, 'Asia/Jakarta',  'aktif'),
  ('Surabaya',   'surabaya',   -7.2575, 112.7521, 'Asia/Jakarta',  'aktif'),
  ('Bekasi',     'bekasi',     -6.2383, 106.9756, 'Asia/Jakarta',  'cari_host'),
  ('Semarang',   'semarang',   -6.9667, 110.4167, 'Asia/Jakarta',  'cari_host'),
  ('Medan',      'medan',       3.5952,  98.6722, 'Asia/Jakarta',  'cari_host'),
  ('Makassar',   'makassar',   -5.1477, 119.4327, 'Asia/Makassar', 'cari_host'),
  ('Denpasar',   'denpasar',   -8.6705, 115.2126, 'Asia/Makassar', 'cari_host');

insert into venue (nama, alamat, kota_id, lat, lng, kapasitas) values
  ('Ruang Temu Kemang',  'Jl. Contoh Raya No. 12, Jakarta Selatan', (select id from kota where slug='jakarta'),    -6.2607, 106.8137, 120),
  ('Taman Kopi Dago',    'Jl. Contoh Dago No. 5, Bandung',          (select id from kota where slug='bandung'),    -6.8850, 107.6130, 80),
  ('Galeri Lumbung',     'Jl. Contoh Kaliurang Km 6, Sleman',        (select id from kota where slug='yogyakarta'), -7.7480, 110.3820, 100),
  ('Ruang Baca Darmo',   'Jl. Contoh Darmo No. 30, Surabaya',        (select id from kota where slug='surabaya'),   -7.2870, 112.7380, 90);

insert into tema (nama, slug, bulan, pertanyaan_pemantik, kota_pemilih_id) values
  ('Arus',   'arus',   '2026-10-01', 'Ke mana karyamu mengalir?', (select id from kota where slug='yogyakarta')),
  ('Gema',   'gema',   '2026-11-01', 'Apa yang tetap terdengar setelah karya kita selesai?', (select id from kota where slug='bandung')),
  ('Simpul', 'simpul', '2026-12-01', 'Apa yang mengikat kita satu sama lain?', (select id from kota where slug='jakarta'));

insert into pembicara (nama, bio) values
  ('Dimas Prasetyo',  'Desainer suara dan pembuat podcast yang meneliti bagaimana kota "berbunyi". (Tokoh contoh.)'),
  ('Rara Anindya',    'Ilustrator dan pengajar lokakarya zine. (Tokoh contoh.)'),
  ('Kevin Halim',     'Arsitek yang merancang ruang baca publik. (Tokoh contoh.)'),
  ('Bagas Wicaksono', 'Perupa dan pengelola ruang seni kolektif. (Tokoh contoh.)'),
  ('Yoga Pratama',    'Penulis dan editor buku nonfiksi. (Tokoh contoh.)');

insert into event (judul, slug, deskripsi, mulai, selesai, kota_id, venue_id, tema_id, pembicara_id, kuota, status) values
  ('Yoga Pratama on Arus', 'yoga-pratama-on-arus',
   'Obrolan pagi tentang menulis yang mengikuti arus, bukan melawannya.',
   '2026-10-30 08:00+07', '2026-10-30 10:00+07',
   (select id from kota where slug='jakarta'), (select id from venue where nama='Ruang Temu Kemang'),
   (select id from tema where slug='arus'), (select id from pembicara where nama='Yoga Pratama'), 120, 'selesai'),
  ('Rara Anindya on Gema', 'rara-anindya-on-gema',
   'Bagaimana zine kecil bisa bergema jauh melampaui jumlah cetaknya.',
   '2026-11-20 07:30+07', '2026-11-20 09:30+07',
   (select id from kota where slug='bandung'), (select id from venue where nama='Taman Kopi Dago'),
   (select id from tema where slug='gema'), (select id from pembicara where nama='Rara Anindya'), 2, 'rsvp_buka'),  -- kuota sengaja 2 untuk mencoba waitlist
  ('Kevin Halim on Gema', 'kevin-halim-on-gema',
   'Ruang publik yang dirancang untuk didengar, bukan hanya dilihat.',
   '2026-11-20 08:00+07', '2026-11-20 10:00+07',
   (select id from kota where slug='surabaya'), (select id from venue where nama='Ruang Baca Darmo'),
   (select id from tema where slug='gema'), (select id from pembicara where nama='Kevin Halim'), 90, 'segera'),
  ('Dimas Prasetyo on Gema', 'dimas-prasetyo-on-gema',
   'Dimas akan bercerita soal gema yang ditinggalkan karya kita: suara, kebiasaan, dan orang-orang yang tersentuh olehnya.',
   '2026-11-27 08:00+07', '2026-11-27 10:00+07',
   (select id from kota where slug='jakarta'), (select id from venue where nama='Ruang Temu Kemang'),
   (select id from tema where slug='gema'), (select id from pembicara where nama='Dimas Prasetyo'), 120, 'rsvp_buka'),
  ('Bagas Wicaksono on Gema', 'bagas-wicaksono-on-gema',
   'Seni kolektif dan gema yang lahir dari kerja bersama.',
   '2026-11-27 08:00+07', '2026-11-27 10:00+07',
   (select id from kota where slug='yogyakarta'), (select id from venue where nama='Galeri Lumbung'),
   (select id from tema where slug='gema'), (select id from pembicara where nama='Bagas Wicaksono'), 100, 'rsvp_buka'),
  ('Simpul: pembicara segera diumumkan', 'jakarta-desember-simpul',
   null, '2026-12-11 08:00+07', '2026-12-11 10:00+07',
   (select id from kota where slug='jakarta'), null, (select id from tema where slug='simpul'), null, 120, 'draft');

insert into partner (nama, link, deskripsi, tingkat) values
  ('Kedai Kopi Contoh', 'https://example.com', 'Menyediakan kopi pagi untuk peserta. (Partner contoh.)', 'event'),
  ('Percetakan Contoh', 'https://example.com', 'Mencetak zine dan materi acara. (Partner contoh.)', 'event');

insert into event_partner (event_id, partner_id)
select e.id, p.id from event e, partner p where e.slug = 'dimas-prasetyo-on-gema';
