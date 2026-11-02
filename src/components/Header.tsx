import Link from "next/link";
import { Suspense } from "react";
import { ambilKota } from "@/lib/data";
import { PilihKota } from "./PilihKota";
import { Logo } from "./ui";

async function TombolKota() {
  const kota = await ambilKota();
  return <PilihKota kota={kota} />;
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="Magic Circle Cast, beranda">
          <Logo />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/event" className="hidden text-ink2 hover:text-plum sm:inline">
            Jadwal
          </Link>
          <Suspense
            fallback={
              <span className="inline-block h-8 w-28 animate-pulse rounded-full bg-lav" />
            }
          >
            <TombolKota />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
