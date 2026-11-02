"use client";

import { useSyncExternalStore } from "react";

const KUNCI = "mcc-kota";
const EVENT = "mcc-kota-berubah";

function baca(): string | null {
  try {
    return window.localStorage.getItem(KUNCI);
  } catch {
    return null;
  }
}

export function simpanKota(slug: string) {
  try {
    window.localStorage.setItem(KUNCI, slug);
  } catch {
    // mode privat / penyimpanan diblokir: pilihan berlaku sampai halaman ditutup
  }
  sementara = slug;
  window.dispatchEvent(new Event(EVENT));
}

let sementara: string | null = null;

function langganan(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Slug kota yang dipilih pengunjung (null = belum memilih). */
export function useKotaPilihan(): string | null {
  return useSyncExternalStore(
    langganan,
    () => baca() ?? sementara,
    () => null,
  );
}
