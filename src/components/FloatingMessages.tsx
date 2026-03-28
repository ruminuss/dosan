"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { getFlagEmoji } from "@/lib/countries";
import {
  pickRandomPosition,
  truncateMessage,
  type FloatingPosition,
} from "@/lib/floating-messages-utils";
import type { Message } from "@/types";

interface FloatingMessage extends FloatingPosition {
  id: string;
  nickname: string;
  nationality: string;
  message: string;
}

const MAX_ACTIVE = 5;
const ROTATE_INTERVAL_MS = 3000;
const INIT_STAGGER_MS = 200;

function toFloating(msg: Message, top: number, left: number): FloatingMessage {
  return {
    id: `${msg.id}-${Date.now()}-${Math.random()}`,
    nickname: msg.nickname,
    nationality: msg.nationality,
    message: msg.message,
    top,
    left,
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

  // 초기 로드: API에서 최신 20개 fetch 후 MAX_ACTIVE개 순차 표시
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
              setActiveMessages((prev) => [...prev, toFloating(msg, pos.top, pos.left)]);
            }, i * INIT_STAGGER_MS)
          );
        }
      })
      .catch((err) => console.error("[FloatingMessages] fetch failed:", err));
    return () => timerIds.forEach(clearTimeout);
  }, [popFromPool]);

  // 3초마다 가장 오래된 bubble 교체
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
          className="absolute pointer-events-none z-[5] max-w-[160px]"
        >
          <div className="bg-[rgba(74,144,217,0.15)] border border-[rgba(74,144,217,0.35)] rounded-full px-3 py-1 text-xs text-[#7ab3e0] whitespace-nowrap overflow-hidden text-ellipsis">
            {getFlagEmoji(msg.nationality)} {msg.nickname}:{" "}
            {truncateMessage(msg.message)}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
