import type { Metadata } from "next";
import { Geist, Geist_Mono, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { Player } from "@/components/player";
import { ScrollProgress } from "@/components/scroll-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Tarun's Portfolio",
  description: "Tarun Monga — software engineer working across frontend and design systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${crimsonPro.variable} antialiased`}
      >
        <ScrollProgress />
        <Player />
        {children}
      </body>
    </html>
  );
}
