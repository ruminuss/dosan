"use client";

import { useEffect, useState } from "react";
import CountUpNumber from "./CountUpNumber";
import type { StatsData } from "@/types";
import { VOYAGE_DISTANCE_KM } from "@/lib/constants";

interface StatsBarProps {
  t: {
    visitors: string;
    messages: string;
    distance: string;
    distanceUnit: string;
  };
}

export default function StatsBar({ t }: StatsBarProps) {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        await fetch("/api/visitors", { method: "POST" });
        const res = await fetch("/api/visitors");
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: t.visitors, value: stats?.visitors.total ?? 0, icon: "\u{1F465}" },
    { label: t.messages, value: stats?.messageCount ?? 0, icon: "\u{1F4AC}" },
    { label: t.distance, value: VOYAGE_DISTANCE_KM, icon: "\u{1F30A}", suffix: t.distanceUnit },
  ];

  return (
    <section className="bg-[#0d1f35] py-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center gap-4 md:gap-8 px-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex-1 bg-[#0a1628] border border-[#1e3a5f] rounded-xl p-6 text-center"
          >
            <p className="text-sm text-[#4a90d9] mb-2">
              {card.icon} {card.label}
            </p>
            <p className="text-3xl md:text-4xl font-bold">
              <CountUpNumber end={card.value} suffix={card.suffix ? ` ${card.suffix}` : ""} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
