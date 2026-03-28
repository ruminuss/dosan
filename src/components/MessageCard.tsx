"use client";

import { motion } from "framer-motion";
import { getFlagEmoji } from "@/lib/countries";
import type { Message } from "@/types";

interface MessageCardProps {
  message: Message;
  t: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };
  isNew?: boolean;
}

function formatTime(dateStr: string, t: MessageCardProps["t"]): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t.justNow;
  if (mins < 60) return t.minutesAgo.replace("{n}", String(mins));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t.hoursAgo.replace("{n}", String(hours));
  const days = Math.floor(hours / 24);
  return t.daysAgo.replace("{n}", String(days));
}

export default function MessageCard({ message, t, isNew }: MessageCardProps) {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: -20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-[rgba(41,182,246,0.05)] rounded-lg border-l-[3px] border-[#29b6f6]"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-[#29b6f6]">
          {getFlagEmoji(message.nationality)} {message.nickname}
        </span>
        <span className="text-xs text-[#4a8fc0]">
          {formatTime(message.created_at, t)}
        </span>
      </div>
      <p className="text-sm text-[#b3e5fc]">{message.message}</p>
    </motion.div>
  );
}
