// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

// Font initialization
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const retroFont = Press_Start_2P({
  variable: "--font-retro",
  weight: "400",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "OG BlockChain Explorer",
  description: "BlockChain Explorer for 0G Network",
};

// Root Layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${retroFont.variable} 
          font-mono 
          bg-[#0d1117] 
          text-[#e6edf3]
        `}
      >
        <div className="page-container">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
