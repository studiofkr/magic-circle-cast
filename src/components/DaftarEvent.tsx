"use client";

import { useState } from "react";
import type { EventRingkas, Kota } from "@/lib/types";
import { kunciHari, tanggalPanjang } from "@/lib/format";
import { useKotaPilihan } from "@/lib/kota-pilihan";
import { BarisEvent } from "./ui";

/** Daftar event dengan tab Mendatang/Arsip dan filter kota. */
export function DaftarEvent({
  kota,
  mendatang,
  arsip,
}: {
  kota: Kota[];
  mendatang: EventRingkas[];
  arsip: EventRingkas[];
}) {
  const [tab, setTab] = useState<"mendatang" | "arsip">("mendatang");
  const [filter, setFilter] = useState<string>("semua");
  const kotaKu = useKotaPilihan();

  const sumber = tab === "mendatang" ? mendatang : arsip;
  const tampil =
    filter === "semua" ? sumber : sumber.filter((e) => e.kota.slug === filter);

  // kelompokkan per hari
  const grup = new Map<string, EventRingkas[]>();
  for (const e of tampil) {
    const k = kunciHari(e.mulai, e.kota.zona_waktu);
    grup.set(k, [...(grup.get(k) ?? []), e]);
  }

  const kotaBerEvent = kota.filter((k) =>
    [...mendatang, ...arsip].some((e) => e.kota.id === k.id),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {(["mendatang", "arsip"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${tab === t ? "bg-ink text-white" : "bg-[#f2f0f7] text-ink2"}`}
          >
            {t}
          </button>
        ))}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="ml-auto rounded-xl border border-line bg-white px-3 py-2 text-sm"
          aria-label="Filter kota"
        >
          <option value="semua">Semua kota</option>
          {kotaBerEvent.map((k) => (
            <option key={k.id} value={k.slug}>
              {k.nama}
              {k.slug === kotaKu ? " (kotamu)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-6">
        {grup.size === 0 && (
          <p className="text-sm text-ink2">
            {tab === "mendatang"
              ? "Belum ada event terjadwal untuk pilihan ini."
              : "Belum ada arsip."}
          </p>
        )}
        {[...grup.entries()].map(([hari, list]) => (
          <div key={hari}>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink2">
              {tanggalPanjang(list[0].mulai, list[0].kota.zona_waktu)}
            </p>
            <div className="rounded-2xl border border-line bg-white px-4">
              {list.map((e) => (
                <BarisEvent key={e.id} ev={e} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
