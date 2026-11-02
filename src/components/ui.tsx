import Link from "next/link";
import type { EventRingkas, StatusEvent } from "@/lib/types";
import { kotakTanggal, rentangJam } from "@/lib/format";

export function Logo({ terang = false }: { terang?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-display font-bold tracking-tight ${terang ? "text-white" : "text-ink"}`}
    >
      <span className="relative inline-block h-5 w-5 rounded-full border-[3px] border-gold">
        <span className="absolute inset-[3px] rounded-full bg-plum2" />
      </span>
      Magic Circle Cast
    </span>
  );
}

const LABEL_STATUS: Record<StatusEvent, { teks: string; gaya: string }> = {
  rsvp_buka: { teks: "RSVP buka", gaya: "bg-[#dff5ee] text-[#1d7d64]" },
  segera: { teks: "Segera", gaya: "bg-gold2 text-[#8a5d00]" },
  rsvp_tutup: { teks: "RSVP tutup", gaya: "bg-[#fde4e1] text-[#b2402f]" },
  selesai: { teks: "Selesai", gaya: "bg-[#eceaf2] text-ink2" },
  batal: { teks: "Batal", gaya: "bg-[#fde4e1] text-[#b2402f]" },
  draft: { teks: "Draft", gaya: "bg-[#eceaf2] text-ink2" },
};

export function LabelStatus({ status, penuh }: { status: StatusEvent; penuh?: boolean }) {
  const { teks, gaya } =
    penuh && status === "rsvp_buka"
      ? { teks: "Penuh · waitlist", gaya: "bg-[#fde4e1] text-[#b2402f]" }
      : LABEL_STATUS[status];
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${gaya}`}>
      {teks}
    </span>
  );
}

export function KotakTanggal({ iso, zona, gelap }: { iso: string; zona: string; gelap?: boolean }) {
  const { hari, bulan } = kotakTanggal(iso, zona);
  return (
    <div
      className={`flex w-12 flex-none flex-col items-center rounded-xl py-1.5 ${gelap ? "bg-plum text-white" : "bg-lav text-plum"}`}
    >
      <span className="font-display text-lg leading-none font-bold">{hari}</span>
      <span className="text-[10px] font-bold uppercase">{bulan}</span>
    </div>
  );
}

export function BarisEvent({ ev }: { ev: EventRingkas }) {
  return (
    <Link
      href={`/event/${ev.slug}`}
      className="flex items-center gap-3 border-b border-line py-3 transition last:border-0 hover:bg-lav/40"
    >
      <KotakTanggal iso={ev.mulai} zona={ev.kota.zona_waktu} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{ev.judul}</p>
        <p className="truncate text-xs text-muted">
          {ev.kota.nama} · {rentangJam(ev.mulai, null, ev.kota.zona_waktu)}
          {ev.venue && ` · ${ev.venue.nama}`}
        </p>
      </div>
      <LabelStatus status={ev.status} />
    </Link>
  );
}

export function PesanBelumTersambung() {
  return (
    <div className="rounded-2xl border border-gold bg-gold2 p-4 text-sm text-ink">
      <p className="font-semibold">Database belum tersambung.</p>
      <p className="mt-1 text-ink2">
        Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (lihat README), lalu muat ulang
        halaman ini.
      </p>
    </div>
  );
}
