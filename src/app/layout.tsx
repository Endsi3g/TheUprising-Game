import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { PlausibleScript } from "@/components/analytics/PlausibleScript";
import { CrispChat } from "@/components/support/CrispChat";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Uprising Game - Salon AI",
  description:
    "Jeu interactif pilote par IA pour salons et evenements. Audit, portfolio et accompagnement entrepreneurial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <PlausibleScript />
        <CrispChat />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
