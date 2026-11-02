import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ambilEvent, ambilPeserta, hitungRsvp } from "@/lib/data";
import { dbSiap } from "@/lib/db";
import { rentangJam, tanggalPanjang } from "@/lib/format";
import { LabelStatus, PesanBelumTersambung } from "@/components/ui";
import { FormRsvp } from "./FormRsvp";

export default function HalamanEvent({ params }: PageProps<"/event/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <Suspense fallback={<Kerangka />}>
        <IsiEvent params={params} />
      </Suspense>
    </main>
  );
}

async function IsiEvent({ params }: { params: PageProps<"/event/[slug]">["params"] }) {
  if (!dbSiap) return <PesanBelumTersambung />;
  const { slug } = await params;
  const ev = await ambilEvent(slug);
  if (!ev) notFound();

  const [hitung, peserta] = await Promise.all([hitungRsvp(ev.id), ambilPeserta(ev.id)]);
  const zona = ev.kota.zona_waktu;
  const penuh = hitung.terisi >= ev.kuota;
  const persen = Math.min(100, Math.round((hitung.terisi / ev.kuota) * 100));
  const peta = ev.venue?.link_maps
    ? ev.venue.link_maps
    : ev.venue?.lat != null
      ? `https://www.google.com/maps/search/?api=1&query=${ev.venue.lat},${ev.venue.lng}`
      : null;

  return (
    <article className="grid gap-8 md:grid-cols-[1fr_360px]">
      <div>
        <Link href={`/event`} className="text-sm font-semibold text-plum">
          ← Semua event
        </Link>
        <div className="mt-3 h-40 rounded-3xl bg-gradient-to-br from-[#d9d2f3] to-[#f6e6c2]" />

        {ev.tema && (
          <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-plum2">
            Seri {ev.tema.nama}
          </p>
        )}
        <h1 className="mt-1 font-display text-3xl leading-tight font-bold">{ev.judul}</h1>
        <div className="mt-2">
          <LabelStatus status={ev.status} penuh={penuh} />
        </div>

        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          <dt aria-label="Waktu">📅</dt>
          <dd>
            <b>{tanggalPanjang(ev.mulai, zona)}</b> · {rentangJam(ev.mulai, ev.selesai, zona)}
          </dd>
          <dt aria-label="Tempat">📍</dt>
          <dd>
            {ev.venue ? (
              <>
                <b>{ev.venue.nama}</b>
                {ev.venue.alamat && <span className="block text-muted">{ev.venue.alamat}</span>}
                {peta && (
                  <a href={peta} target="_blank" rel="noreferrer" className="font-semibold text-plum">
                    Buka di Google Maps ↗
                  </a>
                )}
              </>
            ) : (
              <span className="text-muted">Venue diumumkan segera · {ev.kota.nama}</span>
            )}
          </dd>
          <dt aria-label="Kursi">🎟️</dt>
          <dd>
            Gratis · <b>{hitung.terisi} / {ev.kuota}</b> kursi terisi
            {hitung.waitlist > 0 && ` · ${hitung.waitlist} di waitlist`}
          </dd>
        </dl>
        <div className="mt-3 h-2 rounded-full bg-line">
          <div className="h-full rounded-full bg-mint" style={{ width: `${persen}%` }} />
        </div>
        {ev.status === "rsvp_buka" && (
          <a
            href="#rsvp"
            className="mt-4 block rounded-full bg-gold py-3 text-center font-bold text-ink md:hidden"
          >
            {penuh ? "Masuk waitlist" : "RSVP sekarang"}
          </a>
        )}

        {ev.deskripsi && <p className="mt-6 leading-relaxed text-ink2">{ev.deskripsi}</p>}

        {ev.pembicara && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-bold">Tentang pembicara</h2>
            <div className="mt-3 flex gap-4">
              <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-plum2 font-display font-bold text-white">
                {ev.pembicara.nama
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="font-semibold">{ev.pembicara.nama}</p>
                {ev.pembicara.bio && <p className="mt-1 text-sm text-ink2">{ev.pembicara.bio}</p>}
              </div>
            </div>
          </section>
        )}

        {peserta.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-bold">
              {hitung.terisi} orang akan datang
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {peserta.slice(0, 24).map((p, i) => (
                <span
                  key={i}
                  title={p.nama_depan}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-lav text-xs font-bold text-plum"
                >
                  {p.inisial}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">
              {peserta.slice(0, 5).map((p) => p.nama_depan).join(", ")}
              {hitung.terisi > 5 && ", dan lainnya"}
            </p>
          </section>
        )}

        {ev.partner.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-bold">Didukung oleh</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {ev.partner.map((p) => (
                <li key={p.id} className="rounded-2xl border border-line bg-white p-4 text-sm">
                  <p className="font-semibold">{p.nama}</p>
                  {p.deskripsi && <p className="mt-1 text-ink2">{p.deskripsi}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside id="rsvp" className="h-fit rounded-3xl bg-lav p-5 md:sticky md:top-20">
        <h2 className="mb-4 font-display text-lg font-bold">Daftar hadir</h2>
        {ev.status === "rsvp_buka" ? (
          <FormRsvp eventId={ev.id} namaKota={ev.kota.nama} penuh={penuh} />
        ) : (
          <p className="text-sm text-ink2">
            {ev.status === "segera"
              ? "Pendaftaran belum dibuka. Pantau terus halaman ini."
              : ev.status === "selesai"
                ? "Event ini sudah selesai. Terima kasih yang sudah datang!"
                : "Pendaftaran sedang ditutup."}
          </p>
        )}
      </aside>
    </article>
  );
}

function Kerangka() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-40 rounded-3xl bg-lav" />
      <div className="h-8 w-2/3 rounded bg-lav" />
      <div className="h-4 w-1/2 rounded bg-lav" />
    </div>
  );
}
