"use client";

import Link from "next/link";
import type { EventRingkas, Kota } from "@/lib/types";
import { useKotaPilihan } from "@/lib/kota-pilihan";
import { jarakKm, rentangJam, tanggalPendek } from "@/lib/format";
import { BarisEvent, LabelStatus } from "./ui";

/**
 * Bagian beranda yang bergantung pada kota pilihan pengunjung.
 * Kalau kota itu belum punya event, tampilkan event di kota terdekat
 * (dihitung dari koordinat kota, bukan GPS pengunjung).
 */
export function EventKotaKu({ kota, event }: { kota: Kota[]; event: EventRingkas[] }) {
  const slug = useKotaPilihan();
  const kotaKu = kota.find((k) => k.slug === slug);

  if (!kotaKu) {
    return (
      <section>
        <JudulBagian>Event bulan ini di semua kota</JudulBagian>
        <DaftarRingkas event={event} />
      </section>
    );
  }

  const milikKota = event.filter((e) => e.kota.id === kotaKu.id);
  const lainnya = event.filter((e) => e.kota.id !== kotaKu.id);

  if (milikKota.length > 0) {
    const [utama, ...sisa] = milikKota;
    return (
      <section className="space-y-8">
        <div>
          <JudulBagian>Event berikutnya di {kotaKu.nama}</JudulBagian>
          <KartuUtama ev={utama} />
          {sisa.length > 0 && <DaftarRingkas event={sisa} />}
        </div>
        {lainnya.length > 0 && (
          <div>
            <JudulBagian>Kota lain</JudulBagian>
            <DaftarRingkas event={lainnya.slice(0, 5)} />
          </div>
        )}
      </section>
    );
  }

  // Kota belum punya event: cari kota terdekat yang punya.
  const terdekat = lainnya
    .map((e) => ({ e, km: jarakKm(kotaKu, e.kota) }))
    .sort((a, b) => a.km - b.km)[0];

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-dashed border-gold p-6 text-center">
        <p className="font-display text-lg font-bold">
          Belum ada lingkaran di {kotaKu.nama}
        </p>
        <p className="mt-1 text-sm text-ink2">
          Sementara itu, ini event terdekat dari kotamu.
        </p>
      </div>
      {terdekat && (
        <div>
          <JudulBagian>
            Terdekat · {terdekat.e.kota.nama} ±{Math.round(terdekat.km)} km
          </JudulBagian>
          <KartuUtama ev={terdekat.e} />
        </div>
      )}
      {kotaKu.status === "cari_host" && (
        <div className="rounded-3xl bg-plum p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Jadi host
          </p>
          <p className="mt-1 font-display text-lg font-bold">
            Bawa Magic Circle Cast ke {kotaKu.nama}
          </p>
          <p className="mt-1 text-sm text-white/80">
            Kami bantu format, tema, dan promosi. Kamu yang kumpulkan orangnya.
          </p>
          <span className="mt-4 inline-block rounded-full bg-gold px-4 py-2 text-sm font-bold text-ink opacity-70">
            Form host segera hadir
          </span>
        </div>
      )}
    </section>
  );
}

function JudulBagian({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 font-display text-lg font-bold">{children}</h2>;
}

function DaftarRingkas({ event }: { event: EventRingkas[] }) {
  if (event.length === 0)
    return <p className="text-sm text-ink2">Belum ada event terjadwal.</p>;
  return (
    <div className="rounded-2xl border border-line bg-white px-4">
      {event.map((e) => (
        <BarisEvent key={e.id} ev={e} />
      ))}
    </div>
  );
}

function KartuUtama({ ev }: { ev: EventRingkas }) {
  const zona = ev.kota.zona_waktu;
  return (
    <Link
      href={`/event/${ev.slug}`}
      className="group block overflow-hidden rounded-3xl border border-line bg-white transition hover:shadow-lg"
    >
      <div className="h-28 bg-gradient-to-br from-[#d9d2f3] to-[#f6e6c2]" />
      <div className="p-4">
        <LabelStatus status={ev.status} />
        <p className="mt-2 font-display text-xl font-bold group-hover:text-plum">
          {ev.judul}
        </p>
        <p className="mt-1 text-sm text-muted">
          {tanggalPendek(ev.mulai, zona)} · {rentangJam(ev.mulai, ev.selesai, zona)}
          {ev.venue && ` · ${ev.venue.nama}`}
        </p>
      </div>
    </Link>
  );
}
