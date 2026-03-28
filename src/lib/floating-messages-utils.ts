export interface FloatingPosition {
  top: number;  // 10~80
  left: number; // 5~75
}

export function hasPositionConflict(
  candidate: FloatingPosition,
  existing: FloatingPosition[],
  minDistance = 15
): boolean {
  return existing.some(
    (pos) =>
      Math.sqrt(
        Math.pow(candidate.top - pos.top, 2) +
          Math.pow(candidate.left - pos.left, 2)
      ) < minDistance
  );
}

export function pickRandomPosition(existing: FloatingPosition[]): FloatingPosition {
  for (let i = 0; i < 3; i++) {
    const candidate: FloatingPosition = {
      top: Math.random() * 70 + 10,
      left: Math.random() * 70 + 5,
    };
    if (!hasPositionConflict(candidate, existing)) return candidate;
  }
  return {
    top: Math.random() * 70 + 10,
    left: Math.random() * 70 + 5,
  };
}

export function truncateMessage(text: string, maxLength = 30): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}
