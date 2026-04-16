-- ============================================================
-- AX診断 v2：書き起こし分析結果テーブル
-- ============================================================

-- ヒアリング書き起こし → Claude分析結果を保存
CREATE TABLE IF NOT EXISTS transcript_analyses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID REFERENCES sessions(id) ON DELETE SET NULL,  -- 任意

  -- 企業情報
  company_name        TEXT,
  industry            TEXT,

  -- スコアリング
  total_score         INTEGER NOT NULL DEFAULT 0,  -- 5-25
  ai_potential        INTEGER NOT NULL DEFAULT 0,  -- 0-100
  stage               TEXT,                        -- 未着手層/検討層/試用層/活用層/変革層
  stage_description   TEXT,

  -- 5軸スコア (JSONB)
  scores              JSONB NOT NULL DEFAULT '{}',
  -- {aiMaturity, automationPotential, dataReadiness, orgMomentum, costOptimization}

  -- 5軸詳細（根拠・課題・経営層/現場スコア）
  dimension_details   JSONB NOT NULL DEFAULT '{}',
  -- {aiMaturity: {score, evidence, gap, mgmtScore, frontlineScore}, ...}

  -- 部署・レイヤー別ギャップ診断
  department_analysis JSONB NOT NULL DEFAULT '{}',
  -- {departments: [...], layerGap: {...}}

  -- 主要発見
  key_findings        JSONB NOT NULL DEFAULT '[]',

  -- 4アウトプット
  outputs             JSONB NOT NULL DEFAULT '{}',
  -- {itPortfolio, processRoadmap, systemIntegration, dataStrategy}

  -- ROIシミュレーション
  roi_simulation      JSONB NOT NULL DEFAULT '{}',

  -- 次のアクション
  next_steps          JSONB NOT NULL DEFAULT '[]',

  -- 入力テキスト情報（全文は保存しない）
  transcript_chars    INTEGER,  -- 文字数のみ記録

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE transcript_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow all for service role" ON transcript_analyses FOR ALL USING (true) WITH CHECK (true);

-- インデックス
CREATE INDEX idx_transcript_analyses_session    ON transcript_analyses(session_id);
CREATE INDEX idx_transcript_analyses_created    ON transcript_analyses(created_at);
CREATE INDEX idx_transcript_analyses_stage      ON transcript_analyses(stage);
CREATE INDEX idx_transcript_analyses_potential  ON transcript_analyses(ai_potential);
