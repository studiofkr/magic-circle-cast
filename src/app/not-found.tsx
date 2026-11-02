import Link from "next/link";

export default function TidakDitemukan() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="font-display text-5xl font-bold text-plum">404</p>
      <p className="mt-3 font-display text-xl font-bold">Lingkaran ini tidak ditemukan</p>
      <p className="mt-1 text-ink2">Mungkin event-nya sudah dipindah atau tautannya keliru.</p>
      <Link
        href="/event"
        className="mt-6 inline-block rounded-full bg-plum px-5 py-2.5 font-bold text-white"
      >
        Lihat jadwal
      </Link>
    </main>
  );
}
