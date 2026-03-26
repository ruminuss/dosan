-- messages 테이블
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname varchar(20) NOT NULL,
  nationality varchar(2) NOT NULL DEFAULT 'KR',
  message varchar(200) NOT NULL,
  ip_hash varchar(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

-- visitors 테이블
CREATE TABLE IF NOT EXISTS visitors (
  id serial PRIMARY KEY,
  ip_hash varchar(64) NOT NULL,
  visited_at date NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE visitors ADD CONSTRAINT uq_visitors_ip_date UNIQUE (ip_hash, visited_at);

-- Realtime 활성화 (messages 테이블)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- RLS 정책
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- messages: 누구나 읽기 가능, 서비스 키로만 쓰기
CREATE POLICY "Anyone can read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Service can insert messages" ON messages FOR INSERT WITH CHECK (true);

-- visitors: 서비스 키로만 읽기/쓰기
CREATE POLICY "Service can read visitors" ON visitors FOR SELECT USING (true);
CREATE POLICY "Service can insert visitors" ON visitors FOR INSERT WITH CHECK (true);
