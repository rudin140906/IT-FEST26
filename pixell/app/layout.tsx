import type { Metadata } from "next";
import { Press_Start_2P, Pixelify_Sans, Space_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/footer";
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
  title: "IT-FESTIVAL",
  description:
    "Festival teknologi terbesar 2026 yang menghadirkan kompetisi, pelatihan, dan seminar untuk talenta digital masa depan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${pixelFont.variable} ${pixelifyFont.variable} ${monoFont.variable} font-sans antialiased`}>
        <div className="fixed inset-0 -z-30 bg-[linear-gradient(rgba(245,241,224,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,224,0.06)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none"/>
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}