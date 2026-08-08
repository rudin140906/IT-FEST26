import type { Metadata } from "next";
import { Press_Start_2P, Pixelify_Sans, Space_Mono } from "next/font/google";
import ClientLayout from "@/components/layout/client-layout";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const pixelifyFont = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
});

const monoFont = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "IT-FESTIVAL 2026",
  description:
    "Festival teknologi terbesar 2026 yang menghadirkan kompetisi, pelatihan, dan seminar untuk talenta digital masa depan.",
  icons: {
    icon: [
      { url: "/logos/logo_navbar.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/logos/logo_navbar.png",
    apple: "/logos/logo_navbar.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${pixelFont.variable} ${pixelifyFont.variable} ${monoFont.variable} font-sans antialiased bg-navy-900 text-cream relative`}>
        {/* RETRO BACKGROUND PATTERNS & FLOATING OVERLAYS */}
        <div className="fixed inset-0 -z-30 bg-[linear-gradient(rgba(245,241,224,0.05)_1px,transparent_1px),gradient(90deg,rgba(245,241,224,0.05)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
        
        {/* Floating Cyber Orbs */}
        <div className="fixed top-[-10%] left-[5%] w-96 h-96 bg-pink/20 rounded-full blur-[140px] -z-20 pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="fixed bottom-[-10%] right-[5%] w-96 h-96 bg-cyan/20 rounded-full blur-[140px] -z-20 pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="fixed top-[40%] right-[20%] w-80 h-80 bg-yellow/15 rounded-full blur-[120px] -z-20 pointer-events-none animate-pulse" style={{ animationDuration: "7s" }} />

        {/* Floating Retro Pixel Block Ornaments */}
        <div className="fixed top-24 left-6 w-7 h-7 bg-pink border-3 border-ink rotate-[-12deg] hidden lg:block animate-float -z-10 opacity-70" />
        <div className="fixed top-1/3 right-8 w-8 h-8 bg-cyan border-3 border-ink rotate-[15deg] hidden lg:block animate-float -z-10 opacity-70" style={{ animationDelay: "1.5s" }} />
        <div className="fixed bottom-32 left-10 w-6 h-6 bg-yellow border-3 border-ink rotate-[25deg] hidden lg:block animate-float -z-10 opacity-70" style={{ animationDelay: "2.5s" }} />
        <div className="fixed bottom-1/4 right-16 w-5 h-5 bg-pink border-3 border-ink rotate-[-20deg] hidden lg:block animate-float -z-10 opacity-70" style={{ animationDelay: "0.8s" }} />

        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}