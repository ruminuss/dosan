import type { Metadata } from "next";
import { isValidLocale, getMessages } from "@/lib/i18n";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = getMessages(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url: `https://dosan-phi.vercel.app/${locale}`,
      siteName: "도산함 응원",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <body className="bg-[#0a1628] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
