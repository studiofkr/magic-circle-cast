import "server-only";
import postgres from "postgres";

/**
 * Koneksi ke database Postgres (Neon).
 *
 * DATABASE_URL hanya ada di server dan TIDAK PERNAH dikirim ke browser
 * (sengaja tanpa awalan NEXT_PUBLIC_). Karena semua akses database lewat
 * kode server ini, data pribadi peserta tidak bisa dibaca dari luar.
 *
 * Bernilai null kalau DATABASE_URL belum diisi.
 */
const url = process.env.DATABASE_URL;

export const sql = url
  ? postgres(url, {
      max: 5,
      idle_timeout: 20, // tutup koneksi menganggur, cocok untuk serverless
      prepare: false, // wajib untuk connection pooler Neon
    })
  : null;

export const dbSiap = sql !== null;
