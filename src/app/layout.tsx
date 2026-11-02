import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import "./globals.css";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap";

export const metadata: Metadata = {
  title: {
    default: "Magic Circle Cast",
    template: "%s · Magic Circle Cast",
  },
  description:
    "Talk kreatif gratis tiap bulan di berbagai kota. Satu tema, banyak lingkaran.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONT_URL} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="mt-16 border-t border-line">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted">
            <span>© Magic Circle Cast</span>
            <nav className="flex gap-4">
              <Link href="/event" className="hover:text-plum">
                Jadwal
              </Link>
              <a href="https://www.instagram.com/magiccirclecast/" className="hover:text-plum">
                Instagram
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
