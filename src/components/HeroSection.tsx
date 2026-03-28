"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DEPARTURE_DATE } from "@/lib/constants";
import WaveAnimation from "./WaveAnimation";
import BubbleParticles from "./BubbleParticles";
import FloatingMessages from "./FloatingMessages";

interface HeroProps {
  t: {
    subtitle: string;
    title: string;
    shipInfo: string;
    voyage: string;
    counterLabel: string;
    counterPrefix: string;
    departureInfo: string;
  };
}

function getDaysSinceDeparture(): number {
  const now = new Date();
  const diff = now.getTime() - DEPARTURE_DATE.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function HeroSection({ t }: HeroProps) {
  const [days, setDays] = useState(getDaysSinceDeparture());

  useEffect(() => {
    const timer = setInterval(() => {
      setDays(getDaysSinceDeparture());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col md:flex-row">
      {/* Left: Text */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 z-10">
        <p className="text-[10px] md:text-xs tracking-[3px] text-[#29b6f6] mb-3">
          {t.subtitle}
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2">
          {t.title}
        </h1>
        <p className="text-sm text-[#81d4fa] mb-1">{t.shipInfo}</p>
        <p className="text-xs text-[#5badd8] mb-8">{t.voyage}</p>

        {/* D+ Counter */}
        <div className="bg-[rgba(41,182,246,0.1)] border border-[rgba(41,182,246,0.3)] rounded-xl p-6 max-w-[240px] text-center">
          <p className="text-xs tracking-[2px] text-[#29b6f6] mb-1">
            {t.counterLabel}
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-lg text-[#81d4fa]">{t.counterPrefix}</span>
            <span className="text-5xl md:text-6xl font-bold font-mono tabular-nums">
              {String(days).padStart(3, "0")}
            </span>
          </div>
          <p className="text-[10px] text-[#5badd8] mt-2">{t.departureInfo}</p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden md:flex flex-1 relative items-center justify-center bg-gradient-to-b from-[#0d3275] via-[#1a4a8a] to-[#0a2a68]">
        <WaveAnimation />
        <BubbleParticles />
        <FloatingMessages />
        <Image
          src="/submarine.svg"
          alt="Submarine"
          width={420}
          height={145}
          className="relative z-10 opacity-80"
          priority
        />
      </div>
    </section>
  );
}
