import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { RevealProvider } from "@/components/layout/reveal-provider";

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
  title: "Arwin Gerard Miclat — Portfolio",
  description:
    "Computer engineer & web developer crafting cinematic, high-performance interfaces.",
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
        <SmoothScroll>
          <RevealProvider />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
