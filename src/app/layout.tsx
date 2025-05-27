import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import { Press_Start_2P } from 'next/font/google';
import Header from '@/components/Header'; // ✅ import Header

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const retroFont = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-retro',
});

export const metadata: Metadata = {
  title: "OG Explorer",
  description: "Blockchain Explorer for 0G",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${retroFont.variable} font-mono bg-[#0d1117] text-[#e6edf3]`}>
        <div className="page-container">
          <Header /> {/* ✅ header ditampilkan di semua halaman */}
          {children}
        </div>
      </body>
    </html>
  );
}
