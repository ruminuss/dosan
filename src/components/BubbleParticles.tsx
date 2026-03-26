"use client";

import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export default function BubbleParticles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const items: Bubble[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 10,
    }));
    setBubbles(items);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full bg-[#4a90d9] opacity-20 animate-bubble"
          style={{
            left: `${b.x}%`,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
