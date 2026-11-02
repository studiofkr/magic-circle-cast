"use client";

import { useActionState } from "react";
import { kirimRsvp, type HasilRsvp } from "./actions";

const BIDANG = [
  "Desain",
  "Ilustrasi",
  "Fotografi / video",
  "Musik / suara",
  "Tulisan",
  "Arsitektur / ruang",
  "Teknologi",
  "Lainnya",
];

export function FormRsvp({
  eventId,
  namaKota,
  penuh,
}: {
  eventId: string;
  namaKota: string;
  penuh: boolean;
}) {
  const [hasil, aksi, sedangKirim] = useActionState<HasilRsvp, FormData>(kirimRsvp, {
    tahap: "awal",
  });

  if (hasil.tahap === "berhasil") return <Berhasil hasil={hasil} />;

  return (
    <form action={aksi} className="space-y-3">
      <input type="hidden" name="event_id" value={eventId} />
      <Kolom label="Nama" name="nama" placeholder="Nama lengkap" wajib autoComplete="name" />
      <Kolom
        label="Email"
        name="email"
        type="email"
        placeholder="nama@email.com"
        wajib
        autoComplete="email"
      />
      <Kolom
        label="No. WhatsApp"
        name="whatsapp"
        type="tel"
        placeholder="08xx xxxx xxxx"
        autoComplete="tel"
      />
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-ink2">Kamu berkarya di bidang…</span>
        <select
          name="bidang_karya"
          defaultValue=""
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
        >
          <option value="">Pilih (opsional)</option>
          {BIDANG.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </label>
      <Centang name="izin_tampil">Boleh tampilkan nama depan saya di daftar peserta</Centang>
      <Centang name="kabari_kota">Kabari saya event berikutnya di {namaKota}</Centang>

      {hasil.tahap === "gagal" && (
        <p role="alert" className="rounded-xl bg-[#fde4e1] px-3 py-2 text-sm text-[#b2402f]">
          {hasil.pesan}
        </p>
      )}

      <button
        type="submit"
        disabled={sedangKirim}
        className="w-full rounded-full bg-plum py-3 font-bold text-white transition hover:bg-plum2 disabled:opacity-60"
      >
        {sedangKirim ? "Mengirim…" : penuh ? "Masuk waitlist" : "Kirim RSVP"}
      </button>
      <p className="text-center text-xs text-muted">
        Tanpa akun. Satu email untuk satu kursi. Email dan nomormu tidak ditampilkan.
      </p>
    </form>
  );
}

function Berhasil({ hasil }: { hasil: Extract<HasilRsvp, { tahap: "berhasil" }> }) {
  const waitlist = hasil.status === "waitlist";
  return (
    <div className="rounded-2xl bg-white p-5 text-center" role="status">
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${waitlist ? "bg-gold2" : "bg-[#dff5ee]"}`}
        aria-hidden
      >
        {waitlist ? "⏳" : "✓"}
      </div>
      <p className="mt-3 font-display text-xl font-bold">
        {hasil.sudahTerdaftar
          ? `Kamu sudah terdaftar, ${hasil.nama}`
          : waitlist
            ? `Kamu di waitlist${hasil.posisi ? ` #${hasil.posisi}` : ""}`
            : `Kursimu aman, ${hasil.nama}!`}
      </p>
      <p className="mt-1 text-sm text-ink2">
        {waitlist
          ? "Kursi sedang penuh. Kalau ada yang batal, kamu otomatis naik."
          : "Simpan kode ini dan tunjukkan di meja registrasi."}
      </p>
      <p className="mt-4 font-display text-2xl font-bold tracking-widest text-plum">
        {hasil.kode}
      </p>
      <p className="text-xs text-muted">kode check-in</p>
    </div>
  );
}

function Kolom({
  label,
  name,
  type = "text",
  placeholder,
  wajib,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  wajib?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-ink2">
        {label}
        {wajib && <span className="text-coral"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={wajib}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={200}
        className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-plum"
      />
    </label>
  );
}

function Centang({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" name={name} className="mt-0.5 h-4 w-4 accent-plum" />
      <span>{children}</span>
    </label>
  );
}
