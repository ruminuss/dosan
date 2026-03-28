"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { getFlagEmoji } from "@/lib/countries";
import {
  pickRandomPosition,
  type FloatingPosition,
} from "@/lib/floating-messages-utils";
import type { Message } from "@/types";

interface FloatingMessage extends FloatingPosition {
  id: string;
  nickname: string;
  nationality: string;
  message: string;
  sizeIdx: number;
}

const MAX_ACTIVE = 5;
const ROTATE_INTERVAL_MS = 4000;
const INIT_STAGGER_MS = 600;

const SIZE_VARIANTS = [
  { box: "w-[120px]", text: "text-[10px]", sub: "text-[8px]",  scroll: 140 },
  { box: "w-[150px]", text: "text-xs",     sub: "text-[9px]",  scroll: 170 },
  { box: "w-[185px]", text: "text-sm",     sub: "text-[10px]", scroll: 205 },
  { box: "w-[130px]", text: "text-[11px]", sub: "text-[9px]",  scroll: 150 },
] as const;

function toFloating(msg: Message, top: number, left: number): FloatingMessage {
  return {
    id: `${msg.id}-${Date.now()}-${Math.random()}`,
    nickname: msg.nickname,
    nationality: msg.nationality,
    message: msg.message,
    top,
    left,
    sizeIdx: Math.floor(Math.random() * SIZE_VARIANTS.length),
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

  // 초기 로드
  useEffect(() => {
    const timerIds: ReturnType<typeof setTimeout>[] = [];
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data: { messages: Message[] }) => {
        if (!data.messages?.length) return;
        poolRef.current = data.messages;
        const initialPositions: FloatingPosition[] = [];
        const count = Math.min(MAX_ACTIVE, data.messages.length);
        for (let i = 0; i < count; i++) {
          timerIds.push(
            setTimeout(() => {
              const msg = popFromPool();
              if (!msg) return;
              const pos = pickRandomPosition(initialPositions);
              initialPositions.push(pos);
              setActiveMessages((prev) => [
                ...prev,
                toFloating(msg, pos.top, pos.left),
              ]);
            }, i * INIT_STAGGER_MS)
          );
        }
      })
      .catch((err) => console.error("[FloatingMessages] fetch failed:", err));
    return () => timerIds.forEach(clearTimeout);
  }, [popFromPool]);

  // 주기적 교체
  useEffect(() => {
    const timer = setInterval(() => {
      const msg = popFromPool();
      if (!msg) return;
      setActiveMessages((prev) => {
        if (prev.length === 0) return prev;
        const remaining = prev.slice(1);
        const pos = pickRandomPosition(
          remaining.map((m) => ({ top: m.top, left: m.left }))
        );
        return [...remaining, toFloating(msg, pos.top, pos.left)];
      });
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [popFromPool]);

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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6 }}
          style={{ top: `${msg.top}%`, left: `${msg.left}%` }}
          className={`absolute pointer-events-none z-[5] ${SIZE_VARIANTS[msg.sizeIdx].box}`}
        >
          <div className={`bg-[rgba(41,182,246,0.15)] border border-[rgba(41,182,246,0.35)] rounded-2xl px-3 py-2 ${SIZE_VARIANTS[msg.sizeIdx].text} text-[#81d4fa]`}>
            {/* 메시지 텍스트: 우→좌 무한 스크롤 */}
            <div className="overflow-hidden w-full">
              <motion.p
                className="whitespace-nowrap"
                initial={{ x: SIZE_VARIANTS[msg.sizeIdx].scroll }}
                animate={{ x: [SIZE_VARIANTS[msg.sizeIdx].scroll, -420] }}
                transition={{
                  duration: 7,
                  ease: "linear",
                  repeat: Infinity,
                  repeatDelay: 0,
                }}
              >
                {msg.message}
              </motion.p>
            </div>
            <p className={`mt-1 ${SIZE_VARIANTS[msg.sizeIdx].sub} opacity-60 truncate`}>
              {getFlagEmoji(msg.nationality)} {msg.nickname}
            </p>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
