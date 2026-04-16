-- ============================================================
-- REQS AX診断 データベーススキーマ
-- ============================================================

-- 診断セッション（企業情報 + 進捗管理）
CREATE TABLE IF NOT EXISTS sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  industry     TEXT,
  company_size TEXT,
  role         TEXT,
  budget       TEXT,
  step         INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 診断回答（質問への回答を保存）
CREATE TABLE IF NOT EXISTS answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  value       JSONB NOT NULL,          -- scale: number, choice: string, boolean: bool, text: string
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 診断結果（スコアリング結果）
CREATE TABLE IF NOT EXISTS assessment_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  total_score      INTEGER NOT NULL,
  level            INTEGER NOT NULL,
  level_name       TEXT NOT NULL,
  dimension_scores JSONB NOT NULL,     -- {awareness, adoption, integration, optimization, transformation}
  strengths        JSONB NOT NULL DEFAULT '[]',
  weaknesses       JSONB NOT NULL DEFAULT '[]',
  priority_actions JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- チャット履歴
CREATE TABLE IF NOT EXISTS chat_histories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ツールお気に入り
CREATE TABLE IF NOT EXISTS tool_favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  tool_id    TEXT NOT NULL,
  tool_name  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, tool_id)
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS（Row Level Security）有効化
ALTER TABLE sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_histories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_favorites    ENABLE ROW LEVEL SECURITY;

-- anon キーからの読み書きを許可（サーバーサイドから service_role で操作するため全許可）
CREATE POLICY "allow all for service role" ON sessions          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all for service role" ON answers           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all for service role" ON assessment_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all for service role" ON chat_histories    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all for service role" ON tool_favorites    FOR ALL USING (true) WITH CHECK (true);

-- インデックス
CREATE INDEX idx_answers_session           ON answers(session_id);
CREATE INDEX idx_assessment_session        ON assessment_results(session_id);
CREATE INDEX idx_chat_session              ON chat_histories(session_id);
CREATE INDEX idx_chat_created              ON chat_histories(created_at);
CREATE INDEX idx_tool_favorites_session    ON tool_favorites(session_id);
