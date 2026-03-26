import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "대한민국 잠수함 승조원 무사귀환 응원",
  description: "ROK Navy Submarine Crew - Safe Return Support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
