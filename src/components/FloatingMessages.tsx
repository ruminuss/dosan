"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { getFlagEmoji } from "@/lib/countries";
import type { Message } from "@/types";

interface FloatingMessage {
  id: string;
  nickname: string;
  nationality: string;
  message: string;
  top: number;
}

const MAX_ACTIVE = 5;
const SPAWN_INTERVAL_MS = 2200;
const SCROLL_DURATION = 12; // 우→좌 이동 시간 (초)
const LANES = [10, 22, 35, 50, 63, 76]; // 수직 위치 레인 (%)

function getRandomLane(): number {
  return LANES[Math.floor(Math.random() * LANES.length)];
}

function toFloating(msg: Message): FloatingMessage {
  return {
    id: `${msg.id}-${Date.now()}-${Math.random()}`,
    nickname: msg.nickname,
    nationality: msg.nationality,
    message: msg.message,
    top: getRandomLane(),
  };
}

export default function FloatingMessages() {
  const poolRef = useRef<Message[]>([]);
  const [activeMessages, setActiveMessages] = useState<FloatingMessage[]>([]);

  const popFromPool = useCallback((): Message | null => {
    if (poolRef.current.length === 0) return null;
    const [msg, ...rest] = poolRef.current;
    poolRef.current = rest.length > 0 ? [...rest, msg] : [msg];
    return msg;
  }, []);

  const spawnMessage = useCallback(() => {
    const msg = popFromPool();
    if (!msg) return;
    setActiveMessages((prev) => {
      if (prev.length >= MAX_ACTIVE) return prev;
      return [...prev, toFloating(msg)];
    });
  }, [popFromPool]);

  const removeMessage = useCallback((id: string) => {
    setActiveMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // 초기 로드: API에서 최신 20개 fetch 후 순차 생성
  useEffect(() => {
    const timerIds: ReturnType<typeof setTimeout>[] = [];
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data: { messages: Message[] }) => {
        if (!data.messages?.length) return;
        poolRef.current = data.messages;
        const count = Math.min(3, data.messages.length);
        for (let i = 0; i < count; i++) {
          timerIds.push(setTimeout(() => spawnMessage(), i * SPAWN_INTERVAL_MS));
        }
      })
      .catch((err) => console.error("[FloatingMessages] fetch failed:", err));
    return () => timerIds.forEach(clearTimeout);
  }, [spawnMessage]);

  // 주기적으로 새 버블 생성
  useEffect(() => {
    const timer = setInterval(spawnMessage, SPAWN_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [spawnMessage]);

  // Supabase Realtime: 신규 메시지를 pool 앞에 삽입
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel("floating-messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const raw = payload.new;
          if (raw && typeof (raw as Message).id !== "undefined") {
            poolRef.current = [raw as Message, ...poolRef.current];
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AnimatePresence>
      {activeMessages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ left: "110%", opacity: 0 }}
          animate={{ left: "-35%", opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            left: { duration: SCROLL_DURATION, ease: "linear" },
            opacity: { duration: 0.5 },
          }}
          onAnimationComplete={() => removeMessage(msg.id)}
          style={{ top: `${msg.top}%` }}
          className="absolute pointer-events-none z-[5] w-[160px]"
        >
          <div className="bg-[rgba(74,144,217,0.15)] border border-[rgba(74,144,217,0.35)] rounded-2xl px-3 py-2 text-xs text-[#7ab3e0]">
            <p className="line-clamp-2 leading-snug">{msg.message}</p>
            <p className="mt-1 text-[10px] opacity-60">
              {getFlagEmoji(msg.nationality)} {msg.nickname}
            </p>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
