"use client";

import Link from "next/link";
import type { Locale } from "@/types";

export default function LanguageToggle({ locale }: { locale: Locale }) {
  const otherLocale = locale === "ko" ? "en" : "ko";

  return (
    <Link
      href={`/${otherLocale}`}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#1e4f91] hover:border-[#29b6f6] transition-colors text-sm"
    >
      {locale === "ko" ? (
        <>
          <span>🇺🇸</span>
          <span className="text-[#81d4fa]">EN</span>
        </>
      ) : (
        <>
          <span>🇰🇷</span>
          <span className="text-[#81d4fa]">KO</span>
        </>
      )}
    </Link>
  );
}
