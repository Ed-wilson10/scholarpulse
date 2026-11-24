import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "ScholarPulse — Scholarships & opportunities for Ghanaian students",
  description:
    "Find scholarships, exchange programs, tech training and graduate opportunities for university students in Ghana. Levels 100 to 400, all in one place.",
  keywords: [
    "scholarships Ghana",
    "masters scholarship",
    "exchange program",
    "AWS re/Start",
    "AmaliTech",
    "student opportunities",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
