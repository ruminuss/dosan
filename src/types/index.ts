export interface Message {
  id: string;
  nickname: string;
  nationality: string;
  message: string;
  created_at: string;
}

export interface MessageInput {
  nickname: string;
  nationality: string;
  message: string;
}

export interface VisitorStats {
  total: number;
  today: number;
}

export interface StatsData {
  visitors: VisitorStats;
  messageCount: number;
}

export type Locale = "ko" | "en";
