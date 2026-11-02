"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Kota } from "@/lib/types";
import { simpanKota, useKotaPilihan } from "@/lib/kota-pilihan";

export function PilihKota({ kota }: { kota: Kota[] }) {
  const pilihan = useKotaPilihan();
  const [buka, setBuka] = useState(false);
  const [cari, setCari] = useState("");
  const terpilih = kota.find((k) => k.slug === pilihan);

  useEffect(() => {
    if (!buka) return;
    const tutup = (e: KeyboardEvent) => e.key === "Escape" && setBuka(false);
    window.addEventListener("keydown", tutup);
    return () => window.removeEventListener("keydown", tutup);
  }, [buka]);

  const cocok = (k: Kota) => k.nama.toLowerCase().includes(cari.toLowerCase());
  const aktif = kota.filter((k) => k.status === "aktif" && cocok(k));
  const cariHost = kota.filter((k) => k.status === "cari_host" && cocok(k));

  const pilih = (slug: string) => {
    simpanKota(slug);
    setBuka(false);
    setCari("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-lav px-3 py-1.5 text-sm font-semibold text-plum transition hover:bg-plum hover:text-white"
      >
        <IkonPin />
        {terpilih ? terpilih.nama : "Pilih kota"}
        <span aria-hidden>▾</span>
      </button>

      {buka &&
        // Portal ke <body>: header memakai backdrop-blur, yang membuat
        // elemen "fixed" di dalamnya ikut terkurung di area header.
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <button
              type="button"
              aria-label="Tutup"
              className="absolute inset-0 bg-ink/55"
              onClick={() => setBuka(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="judul-pilih-kota"
              className="relative w-full max-w-md rounded-t-3xl bg-white p-5 pb-7 shadow-xl sm:rounded-3xl"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
              <h2
                id="judul-pilih-kota"
                className="font-display text-xl font-bold"
              >
                Kamu di kota mana?
              </h2>
              <input
                autoFocus
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari kota…"
                className="mt-3 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-plum"
              />

              {aktif.length > 0 && (
                <Grup judul="Kota dengan event aktif">
                  {aktif.map((k) => (
                    <Pil
                      key={k.id}
                      aktif={k.slug === pilihan}
                      onClick={() => pilih(k.slug)}
                    >
                      {k.nama}
                    </Pil>
                  ))}
                </Grup>
              )}
              {cariHost.length > 0 && (
                <Grup judul="Belum ada tim (cari host)">
                  {cariHost.map((k) => (
                    <Pil
                      key={k.id}
                      redup
                      aktif={k.slug === pilihan}
                      onClick={() => pilih(k.slug)}
                    >
                      {k.nama}
                    </Pil>
                  ))}
                </Grup>
              )}
              {aktif.length + cariHost.length === 0 && (
                <p className="mt-5 text-sm text-ink2">
                  Kota itu belum ada di daftar. Pilih kota terdekat dulu, ya.
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function Grup({
  judul,
  children,
}: {
  judul: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink2">
        {judul}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pil({
  children,
  aktif,
  redup,
  onClick,
}: {
  children: React.ReactNode;
  aktif?: boolean;
  redup?: boolean;
  onClick: () => void;
}) {
  const gaya = aktif
    ? "bg-plum text-white"
    : redup
      ? "bg-[#eceaf2] text-ink2 hover:bg-line"
      : "bg-lav text-plum hover:bg-plum hover:text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${gaya}`}
    >
      {children}
      {aktif && " ✓"}
    </button>
  );
}

function IkonPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="2.5" fill="currentColor" />
    </svg>
  );
}
