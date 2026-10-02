import type { Metadata } from "next";
import { Geist, Geist_Mono, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { Player } from "@/components/player";
import { ScrollProgress } from "@/components/scroll-progress";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPalette } from "@/components/command-palette";
import { CursorLabel } from "@/components/cursor-label";
import { EasterEggs } from "@/components/easter-eggs";
import { Toaster } from "@/components/toast";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";

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
  // Resolves relative link-preview images (a story's cover) to full URLs.
  metadataBase: new URL(SITE_URL),
  title: "Tarun's Portfolio",
  description: "Tarun Monga — software engineer working across frontend and design systems.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  /** A travel story opened over the home page (app/@modal). */
  modal: React.ReactNode;
}>) {
  return (
    // next-themes sets the class on <html> before hydration, which React would
    // otherwise flag as a mismatch.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${crimsonPro.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <ScrollProgress />
          <Player />
          <CursorLabel />
          <CommandPalette />
          <EasterEggs />
          <Toaster />
          {children}
          {modal}
        </ThemeProvider>
        {/* Page views for Vercel Web Analytics (enabled per project in the dashboard). */}
        <Analytics />
      </body>
    </html>
  );
}
