"use client";

import { useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { MAX_NICKNAME_LENGTH, MAX_MESSAGE_LENGTH, CONTACT_EMAIL } from "@/lib/constants";
import type { Locale } from "@/types";

interface GuestbookFormProps {
  locale: Locale;
  t: {
    title: string;
    warning: string;
    contact: string;
    nicknamePlaceholder: string;
    nicknameLabel: string;
    nationalityLabel: string;
    messagePlaceholder: string;
    messageLabel: string;
    submit: string;
    submitting: string;
    successMessage: string;
    errorName: string;
    errorLocation: string;
    errorContact: string;
    errorRateLimit: string;
    errorGeneric: string;
  };
  onMessageSent?: () => void;
}

export default function GuestbookForm({ locale, t, onMessageSent }: GuestbookFormProps) {
  const [nickname, setNickname] = useState("");
  const [nationality, setNationality] = useState("KR");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, nationality, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorKey = data.error as string;
        const errorMap: Record<string, string> = {
          errorName: t.errorName,
          errorLocation: t.errorLocation,
          errorContact: t.errorContact,
          errorRateLimit: t.errorRateLimit,
        };
        setErrorMsg(errorMap[errorKey] ?? t.errorGeneric);
        setStatus("error");
        return;
      }

      setNickname("");
      setMessage("");
      setStatus("success");
      onMessageSent?.();
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setErrorMsg(t.errorGeneric);
      setStatus("error");
    }
  }

  return (
    <div className="bg-[#0d2e5f] border border-[#1e4f91] rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">{t.title}</h2>

      {/* Warning */}
      <div className="bg-[rgba(243,156,18,0.1)] border border-[rgba(243,156,18,0.3)] rounded-lg p-3 mb-4 text-xs text-[#f39c12]">
        <p>{t.warning}</p>
        <p className="mt-1">{t.contact}: {CONTACT_EMAIL}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nickname */}
        <div>
          <label className="text-xs text-[#81d4fa] mb-1 block">{t.nicknameLabel}</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={MAX_NICKNAME_LENGTH}
            placeholder={t.nicknamePlaceholder}
            required
            className="w-full bg-[#0a1f3e] border border-[#1e4f91] rounded-lg px-3 py-2 text-sm text-white placeholder-[#5badd8] focus:border-[#29b6f6] focus:outline-none transition-colors"
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="text-xs text-[#81d4fa] mb-1 block">{t.nationalityLabel}</label>
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full bg-[#0a1f3e] border border-[#1e4f91] rounded-lg px-3 py-2 text-sm text-white focus:border-[#29b6f6] focus:outline-none transition-colors"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name[locale]}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="text-xs text-[#81d4fa] mb-1 block">{t.messageLabel}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder={t.messagePlaceholder}
            required
            rows={3}
            className="w-full bg-[#0a1f3e] border border-[#1e4f91] rounded-lg px-3 py-2 text-sm text-white placeholder-[#5badd8] focus:border-[#29b6f6] focus:outline-none transition-colors resize-none"
          />
          <p className="text-right text-[10px] text-[#4a8fc0] mt-1">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </p>
        </div>

        {/* Error / Success */}
        {status === "error" && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}
        {status === "success" && (
          <p className="text-xs text-green-400">{t.successMessage}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-gradient-to-r from-[#29b6f6] to-[#1976d2] text-white font-bold py-2.5 rounded-lg hover:from-[#42a5f5] hover:to-[#2196f3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}
