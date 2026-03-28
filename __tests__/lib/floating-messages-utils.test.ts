import { describe, it, expect } from "vitest";
import {
  hasPositionConflict,
  pickRandomPosition,
  truncateMessage,
} from "@/lib/floating-messages-utils";

describe("hasPositionConflict", () => {
  it("기존 위치가 없으면 false 반환", () => {
    expect(hasPositionConflict({ top: 50, left: 50 }, [])).toBe(false);
  });

  it("거리가 minDistance(15) 미만이면 true 반환", () => {
    // distance ≈ 7.07
    expect(
      hasPositionConflict({ top: 50, left: 50 }, [{ top: 55, left: 55 }])
    ).toBe(true);
  });

  it("거리가 minDistance(15) 이상이면 false 반환", () => {
    // distance ≈ 28.28
    expect(
      hasPositionConflict({ top: 50, left: 50 }, [{ top: 70, left: 70 }])
    ).toBe(false);
  });
});

describe("pickRandomPosition", () => {
  it("top이 10~80 범위 안에 있다", () => {
    for (let i = 0; i < 20; i++) {
      const { top } = pickRandomPosition([]);
      expect(top).toBeGreaterThanOrEqual(10);
      expect(top).toBeLessThanOrEqual(80);
    }
  });

  it("left가 5~75 범위 안에 있다", () => {
    for (let i = 0; i < 20; i++) {
      const { left } = pickRandomPosition([]);
      expect(left).toBeGreaterThanOrEqual(5);
      expect(left).toBeLessThanOrEqual(75);
    }
  });
});

describe("truncateMessage", () => {
  it("maxLength 이하면 그대로 반환", () => {
    expect(truncateMessage("안녕하세요", 30)).toBe("안녕하세요");
  });

  it("maxLength 초과 시 말줄임 처리", () => {
    const result = truncateMessage("a".repeat(40), 30);
    expect(result).toBe("a".repeat(30) + "…");
  });

  it("정확히 maxLength이면 그대로 반환", () => {
    expect(truncateMessage("a".repeat(30), 30)).toBe("a".repeat(30));
  });
});
