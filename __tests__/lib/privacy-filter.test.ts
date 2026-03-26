import { describe, it, expect } from "vitest";
import { filterContent, type FilterResult } from "@/lib/privacy-filter";

describe("privacy-filter", () => {
  describe("위치/좌표 필터", () => {
    it("위도·경도 패턴을 차단한다", () => {
      expect(filterContent("북위 33도 근처에서 목격").blocked).toBe(true);
      expect(filterContent("N33.5 E128.7").blocked).toBe(true);
    });

    it("현재 위치 키워드를 차단한다", () => {
      expect(filterContent("현재 위치가 어디야").blocked).toBe(true);
      expect(filterContent("current position near guam").blocked).toBe(true);
    });

    it("해역명을 차단한다", () => {
      expect(filterContent("태평양 한가운데 있다더라").blocked).toBe(false);
      expect(filterContent("괌 근처 해역에서 포착").blocked).toBe(true);
    });
  });

  describe("실명 필터", () => {
    it("한글 실명 패턴을 차단한다", () => {
      expect(filterContent("김민수가 응원합니다").blocked).toBe(true);
      expect(filterContent("이영희 파이팅").blocked).toBe(true);
    });

    it("일반 단어는 허용한다", () => {
      expect(filterContent("대한민국 파이팅").blocked).toBe(false);
      expect(filterContent("해군 화이팅").blocked).toBe(false);
    });
  });

  describe("연락처 필터", () => {
    it("전화번호를 차단한다", () => {
      expect(filterContent("010-1234-5678").blocked).toBe(true);
      expect(filterContent("01012345678").blocked).toBe(true);
    });

    it("이메일을 차단한다", () => {
      expect(filterContent("test@example.com").blocked).toBe(true);
    });
  });

  describe("정상 메시지", () => {
    it("일반 응원 메시지를 허용한다", () => {
      expect(filterContent("무사히 돌아오세요!").blocked).toBe(false);
      expect(filterContent("Safe return!").blocked).toBe(false);
      expect(filterContent("KSS-III 최고!").blocked).toBe(false);
    });
  });
});
