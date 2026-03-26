import type { Locale } from "@/types";
import ko from "@/messages/ko.json";
import en from "@/messages/en.json";

const messages = { ko, en } as const;

export const LOCALES: Locale[] = ["ko", "en"];
export const DEFAULT_LOCALE: Locale = "ko";

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages[DEFAULT_LOCALE];
}

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
