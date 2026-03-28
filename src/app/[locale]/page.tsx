import { getMessages, isValidLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/types";
import LanguageToggle from "@/components/LanguageToggle";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import GuestbookForm from "@/components/GuestbookForm";
import GuestbookList from "@/components/GuestbookList";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const t = getMessages(locale as Locale);

  return (
    <main>
      {/* Header */}
      <header className="fixed top-0 right-0 p-4 z-50">
        <LanguageToggle locale={locale as Locale} />
      </header>

      {/* Section 1: Hero */}
      <HeroSection t={t.hero} />

      {/* Section 2: Stats */}
      <StatsBar t={t.stats} />

      {/* Section 3: Guestbook */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/5">
            <GuestbookForm locale={locale as Locale} t={t.guestbook} />
          </div>
          <div className="lg:w-3/5">
            <GuestbookList t={t.guestbook} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-[#3a6a9f] border-t border-[#1e3a5f]">
        <p>
          {locale === "ko"
            ? "대한민국 잠수함 승조원의 무사귀환을 응원합니다"
            : "Supporting the safe return of ROK Navy submarine crew"}
        </p>
      </footer>
    </main>
  );
}
