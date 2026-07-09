import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arwin Gerard Miclat — Portfolio",
  description:
    "Computer engineer & web developer crafting cinematic, high-performance interfaces.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
