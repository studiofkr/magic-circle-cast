import type { Metadata } from "next";
import { Suspense } from "react";
import { ambilEventArsip, ambilEventMendatang, ambilKota } from "@/lib/data";
import { supabaseSiap } from "@/lib/supabase";
import { DaftarEvent } from "@/components/DaftarEvent";
import { PesanBelumTersambung } from "@/components/ui";

export const metadata: Metadata = { title: "Jadwal event" };

export default function HalamanJadwal() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Jadwal event</h1>
      <p className="mt-1 text-ink2">Semua lingkaran, semua kota.</p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-lav" />}>
          <Isi />
        </Suspense>
      </div>
    </main>
  );
}

async function Isi() {
  if (!supabaseSiap) return <PesanBelumTersambung />;
  const [kota, mendatang, arsip] = await Promise.all([
    ambilKota(),
    ambilEventMendatang(),
    ambilEventArsip(),
  ]);
  return <DaftarEvent kota={kota} mendatang={mendatang} arsip={arsip} />;
}
