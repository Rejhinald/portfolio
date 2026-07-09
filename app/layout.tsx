import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { RevealProvider } from "@/components/layout/reveal-provider";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Preloader } from "@/components/layout/preloader";
import { Cursor } from "@/components/layout/cursor";

const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-shippori",
  display: "swap",
});

const zen = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-zen",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arwin Gerard Miclat — Web Developer",
  description:
    "Computer engineer & web developer crafting cinematic, high-performance interfaces. Next.js, GSAP, and Three.js.",
  keywords: [
    "Arwin Miclat",
    "web developer",
    "computer engineer",
    "Next.js",
    "GSAP",
    "Three.js",
    "portfolio",
  ],
  authors: [{ name: "Arwin Gerard Miclat" }],
  openGraph: {
    title: "Arwin Gerard Miclat — Web Developer",
    description:
      "Computer engineer & web developer crafting cinematic, high-performance interfaces.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arwin Gerard Miclat — Web Developer",
    description:
      "Computer engineer & web developer crafting cinematic, high-performance interfaces.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${shippori.variable} ${zen.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <Preloader />
        <SmoothScroll>
          <RevealProvider />
          <Cursor />
          <Nav />
          <main id="top">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
