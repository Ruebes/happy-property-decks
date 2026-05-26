import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Happy Property — Sales Deck Generator",
  description: "PDF-Sales-Decks für Immobilienprojekte",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-cream text-dark">
        <NavBar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
