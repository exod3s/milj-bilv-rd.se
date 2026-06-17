import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://miljobilvard-ovik.se"),
  title: {
    default: "Miljö Bilvård i Ö-vik | Bilvård, rekond och biltvätt",
    template: "%s | Miljö Bilvård i Ö-vik"
  },
  description:
    "Modern bilvård, rekond, biltvätt och polering i Örnsköldsvik med miljövänliga produkter och professionell utrustning.",
  keywords: [
    "Bilvård Örnsköldsvik",
    "Rekond Örnsköldsvik",
    "Biltvätt Örnsköldsvik",
    "Polering Örnsköldsvik",
    "Invändig rekond Örnsköldsvik"
  ],
  openGraph: {
    title: "Miljö Bilvård i Ö-vik",
    description:
      "Premium bilvård, rekond och polering i Örnsköldsvik. Boka din tid online.",
    locale: "sv_SE",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="min-h-full">
      <body className="flex min-h-screen min-h-dvh flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
