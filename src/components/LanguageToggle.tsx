"use client";

import Link from "next/link";
import type { Locale } from "@/types";

export default function LanguageToggle({ locale }: { locale: Locale }) {
  const otherLocale = locale === "ko" ? "en" : "ko";

  return (
    <Link
      href={`/${otherLocale}`}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#1e3a5f] hover:border-[#4a90d9] transition-colors text-sm"
    >
      {locale === "ko" ? (
        <>
          <span>🇺🇸</span>
          <span className="text-[#7ab3e0]">EN</span>
        </>
      ) : (
        <>
          <span>🇰🇷</span>
          <span className="text-[#7ab3e0]">KO</span>
        </>
      )}
    </Link>
  );
}
