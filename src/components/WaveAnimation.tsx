"use client";

export default function WaveAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full animate-wave">
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,60 1440,60 L1440,120 L0,120 Z"
            fill="rgba(41,182,246,0.08)"
          />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full animate-wave-slow">
          <path
            d="M0,80 C320,40 640,100 960,60 C1200,30 1360,80 1440,70 L1440,120 L0,120 Z"
            fill="rgba(41,182,246,0.05)"
          />
        </svg>
      </div>
    </div>
  );
}
