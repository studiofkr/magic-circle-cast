import Link from "next/link";
import { Suspense } from "react";
import { ambilEventMendatang, ambilKota, ambilTemaAktif } from "@/lib/data";
import { supabaseSiap } from "@/lib/supabase";
import { EventKotaKu } from "@/components/EventKotaKu";
import { PesanBelumTersambung } from "@/components/ui";

export default function Beranda() {
  return (
    <main>
      <section className="relative overflow-hidden bg-plum text-white">
        <Cincin />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <Suspense fallback={<p className="h-4" />}>
            <LabelTema />
          </Suspense>
          <h1 className="mt-2 max-w-xl font-display text-4xl leading-[1.1] font-bold sm:text-5xl">
            Kumpul pagi, pulang membawa ide.
          </h1>
          <p className="mt-4 max-w-md text-white/85">
            Talk kreatif gratis tiap bulan di kotamu. Sarapan, ngobrol, kenalan.
          </p>
          <Link
            href="/event"
            className="mt-6 inline-block rounded-full bg-gold px-5 py-2.5 font-bold text-ink transition hover:brightness-105"
          >
            Lihat jadwal
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-3xl bg-lav" />}>
          <BagianEvent />
        </Suspense>
      </div>
    </main>
  );
}

async function LabelTema() {
  const tema = await ambilTemaAktif();
  if (!tema) return null;
  const bulan = new Intl.DateTimeFormat("id-ID", { month: "long", timeZone: "UTC" }).format(
    new Date(tema.bulan),
  );
  return (
    <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold">
      Tema {bulan} · {tema.nama}
      {tema.pertanyaan_pemantik && (
        <span className="mt-1 block font-normal tracking-normal normal-case text-white/70">
          {tema.pertanyaan_pemantik}
        </span>
      )}
    </p>
  );
}

async function BagianEvent() {
  if (!supabaseSiap) return <PesanBelumTersambung />;
  const [kota, event] = await Promise.all([ambilKota(), ambilEventMendatang()]);
  return <EventKotaKu kota={kota} event={event} />;
}

function Cincin() {
  return (
    <svg
      aria-hidden
      className="absolute -top-24 -right-32 h-[460px] w-[460px] opacity-70"
      viewBox="0 0 200 200"
    >
      <circle cx="100" cy="100" r="95" fill="none" stroke="#f2b632" strokeWidth="1" opacity=".6" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="#f2b632" strokeWidth="1" opacity=".4" />
      <circle cx="100" cy="100" r="45" fill="none" stroke="#fff" strokeWidth="1" opacity=".2" />
      <circle cx="100" cy="100" r="22" fill="#5a44b0" />
    </svg>
  );
}
