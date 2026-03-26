export const COUNTRIES = [
  { code: "KR", flag: "\u{1F1F0}\u{1F1F7}", name: { ko: "대한민국", en: "South Korea" } },
  { code: "US", flag: "\u{1F1FA}\u{1F1F8}", name: { ko: "미국", en: "United States" } },
  { code: "CA", flag: "\u{1F1E8}\u{1F1E6}", name: { ko: "캐나다", en: "Canada" } },
  { code: "JP", flag: "\u{1F1EF}\u{1F1F5}", name: { ko: "일본", en: "Japan" } },
  { code: "CN", flag: "\u{1F1E8}\u{1F1F3}", name: { ko: "중국", en: "China" } },
  { code: "GB", flag: "\u{1F1EC}\u{1F1E7}", name: { ko: "영국", en: "United Kingdom" } },
  { code: "DE", flag: "\u{1F1E9}\u{1F1EA}", name: { ko: "독일", en: "Germany" } },
  { code: "FR", flag: "\u{1F1EB}\u{1F1F7}", name: { ko: "프랑스", en: "France" } },
  { code: "AU", flag: "\u{1F1E6}\u{1F1FA}", name: { ko: "호주", en: "Australia" } },
  { code: "XX", flag: "\u{1F30D}", name: { ko: "기타", en: "Other" } },
] as const;

export function getFlagEmoji(code: string): string {
  const country = COUNTRIES.find((c) => c.code === code);
  return country?.flag ?? "\u{1F30D}";
}
