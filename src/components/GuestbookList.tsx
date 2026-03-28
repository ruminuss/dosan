"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import MessageCard from "./MessageCard";
import type { Message } from "@/types";

interface GuestbookListProps {
  t: {
    listTitle: string;
    realtime: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    loadMore: string;
    noMessages: string;
  };
}

export default function GuestbookList({ t }: GuestbookListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const fetchMessages = useCallback(async (cursor?: string) => {
    const url = cursor
      ? `/api/messages?cursor=${encodeURIComponent(cursor)}`
      : "/api/messages";
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }, []);

  useEffect(() => {
    fetchMessages().then((data) => {
      setMessages(data.messages);
      setNextCursor(data.nextCursor);
      setLoading(false);
    });
  }, [fetchMessages]);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [newMsg, ...prev]);
          setNewIds((prev) => new Set(prev).add(newMsg.id));
          setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev);
              next.delete(newMsg.id);
              return next;
            });
          }, 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadMore() {
    if (!nextCursor) return;
    const data = await fetchMessages(nextCursor);
    setMessages((prev) => [...prev, ...data.messages]);
    setNextCursor(data.nextCursor);
  }

  const timeT = {
    justNow: t.justNow,
    minutesAgo: t.minutesAgo,
    hoursAgo: t.hoursAgo,
    daysAgo: t.daysAgo,
  };

  return (
    <div className="bg-[#0d2e5f] border border-[#1e4f91] rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">
        {t.listTitle}{" "}
        <span className="text-sm font-normal text-[#29b6f6]">{t.realtime}</span>
      </h2>

      {loading ? (
        <div className="text-center py-8 text-[#5badd8]">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-[#5badd8]">{t.noMessages}</div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <MessageCard
              key={msg.id}
              message={msg}
              t={timeT}
              isNew={newIds.has(msg.id)}
            />
          ))}
        </div>
      )}

      {nextCursor && (
        <button
          onClick={loadMore}
          className="w-full mt-4 py-2 text-sm text-[#29b6f6] hover:text-[#81d4fa] transition-colors"
        >
          {t.loadMore}
        </button>
      )}
    </div>
  );
}
