import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavbarDemo } from "@/components/navbar-menu";
const inter = Inter({ subsets: ["latin"] });

// FIX THE LAYOUT TO MAKE EVERY PAGE RESPONSIVE TO DIMENSIONS

export const metadata: Metadata = {
  title: "Arwin Miclat - Portfolio",
  description: "Portfolio of Arwin Miclat, a Compunter engineer based in the Philippines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body className={`dark ${inter.className}`}>
        <NavbarDemo />
        {children}
      </body>
    </html>
  );
}