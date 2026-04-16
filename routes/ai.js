'use strict';

const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

// AX診断専用のシステムプロンプト
const SYSTEM_PROMPT = `あなたはREQS Lab専属のAX（AI Transformation）コンサルタントAIです。
REQS Labは「業務AXソリューション」「Webアプリ開発」「データベース統合・自動化」の3つのサービスを提供しています。

## あなたの役割
- 企業のAI成熟度診断結果をもとに、具体的・実践的なアドバイスを提供する
- 難しい専門用語を避け、経営者・担当者が理解しやすい言葉で説明する
- 抽象的な提案ではなく、「明日から実行できる具体的なアクション」を提示する
- REQS Labのサービスを自然な文脈でさりげなく提案する

## 回答スタイル
- 日本語で回答（技術用語は英語可）
- 箇条書きと見出しを活用して読みやすく構造化
- 具体的な数字・期間・コストの目安を含める
- 過度に楽観的にならず、課題も率直に伝える
- 返答は簡潔に（長くなる場合は要点を先に述べる）`;

// AX成熟度レベルの説明
const LEVEL_DESCRIPTIONS = {
  1: '入門期（AIをほぼ使っていない）',
  2: '探索期（一部で試験的に利用）',
  3: '導入期（特定業務に本格導入）',
  4: '統合期（複数業務に統合・自動化）',
  5: '変革期（AI中心の業務設計が完成）'
};

// ---------- ユーティリティ: SSE ストリーミング ----------
function streamResponse(res, stream) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  return (async () => {
    try {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
          res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  })();
}

// ---------- POST /api/ai/analyze ----------
// 診断結果を受け取り、詳細なAX分析をストリーミング返却
router.post('/analyze', async (req, res) => {
  const { assessmentResult, companyInfo } = req.body;
  if (!assessmentResult) {
    return res.status(400).json({ error: '診断結果が必要です' });
  }

  const { totalScore, level, dimensionScores = {}, strengths = [], weaknesses = [], priorityActions = [] } = assessmentResult;
  const company = companyInfo || {};

  const userMessage = `
以下の企業のAX診断結果を分析してください。

## 企業情報
- 会社名: ${company.name || '未入力'}
- 業種: ${company.industry || '未入力'}
- 規模: ${company.size || '未入力'}
- 役職: ${company.role || '未入力'}

## AX成熟度スコア
- 総合スコア: ${totalScore}/100
- 成熟度レベル: Level ${level} - ${LEVEL_DESCRIPTIONS[level] || ''}

## 5次元スコア
- AI認知・理解度: ${dimensionScores.awareness || 0}点
- AI導入経験: ${dimensionScores.adoption || 0}点
- AI統合度: ${dimensionScores.integration || 0}点
- AI最適化: ${dimensionScores.optimization || 0}点
- AI変革力: ${dimensionScores.transformation || 0}点

## 診断で判明した強み
${strengths.map(s => `- ${s}`).join('\n') || '- データ収集中'}

## 改善が必要な領域
${weaknesses.map(w => `- ${w}`).join('\n') || '- データ収集中'}

---

以下の観点で詳細な分析を提供してください：
1. **現状の総括**（この企業の今のAX状況を2-3文で）
2. **最大の課題と根本原因**（なぜそうなっているのか）
3. **即効性のある改善策 TOP3**（来週から実行できるレベル）
4. **3〜6ヶ月の重点施策**
5. **REQS Labが支援できること**（自然な形で）
`;

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  return streamResponse(res, stream);
});

// ---------- POST /api/ai/chat ----------
// チャット（会話履歴付き）
router.post('/chat', async (req, res) => {
  const { messages, assessmentResult, companyInfo } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'メッセージが必要です' });
  }

  // 診断結果があればコンテキストとして追加
  let contextSystem = SYSTEM_PROMPT;
  if (assessmentResult) {
    const { totalScore, level, dimensionScores = {} } = assessmentResult;
    const company = companyInfo || {};
    contextSystem += `

## 現在の対話コンテキスト（この企業の診断結果）
- 会社: ${company.name || '未入力'} / 業種: ${company.industry || '未入力'}
- AXスコア: ${totalScore}/100（Level ${level}: ${LEVEL_DESCRIPTIONS[level] || ''}）
- 弱点次元: ${
  Object.entries(dimensionScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([k, v]) => `${k}(${v}点)`)
    .join(', ')
}

この情報を踏まえて、ユーザーの質問に具体的に回答してください。`;
  }

  // Anthropic APIが期待する messages 形式に変換
  const apiMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: m.content }));

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 1000,
    system: contextSystem,
    messages: apiMessages
  });

  return streamResponse(res, stream);
});

// ---------- POST /api/ai/recommend-detail ----------
// 特定ツールの選定理由・導入ステップをAIが詳細説明
router.post('/recommend-detail', async (req, res) => {
  const { tool, assessmentResult, companyInfo } = req.body;
  if (!tool) return res.status(400).json({ error: 'ツール情報が必要です' });

  const company = companyInfo || {};
  const score = assessmentResult?.totalScore ?? '未診断';
  const level = assessmentResult?.level ?? 1;

  const userMessage = `
以下のAIツールの導入について、この企業向けに詳細なアドバイスをください。

## 企業情報
- 業種: ${company.industry || '未入力'} / 規模: ${company.size || '未入力'}
- AXスコア: ${score}点（Level ${level}）

## 対象ツール
- ツール名: ${tool.name}
- カテゴリ: ${tool.category}
- 用途: ${(tool.useCase || []).join('、')}
- 価格: ${tool.monthlyPrice || tool.pricing}
- 説明: ${tool.description}

以下を教えてください：
1. **このツールがこの企業に向いている具体的な理由**
2. **導入の手順**（Week1〜Week4の具体的なスケジュール）
3. **期待できるROI・効果の目安**（数字で）
4. **導入時の注意点・つまずきやすいポイント**
5. **REQS Labによるサポート内容**（該当する場合）
`;

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  return streamResponse(res, stream);
});

// ---------- POST /api/ai/roadmap-detail ----------
// ロードマップの特定フェーズを深掘り
router.post('/roadmap-detail', async (req, res) => {
  const { phase, assessmentResult, companyInfo } = req.body;
  if (!phase) return res.status(400).json({ error: 'フェーズ情報が必要です' });

  const company = companyInfo || {};
  const level = assessmentResult?.level ?? 1;

  const userMessage = `
AXロードマップの以下フェーズについて、実行計画を詳細化してください。

## 企業情報
- 業種: ${company.industry || '未入力'} / 規模: ${company.size || '未入力'}
- 現在のAXレベル: Level ${level}

## 対象フェーズ
- フェーズ名: ${phase.title}
- 期間: ${phase.duration}
- 主なアクション: ${(phase.actions || []).join('、')}
- 活用ツール: ${(phase.tools || []).join('、')}
- KPI: ${(phase.kpis || []).join('、')}

このフェーズを実際に実行するための：
1. **週次タスクブレークダウン**（最初の4週間）
2. **必要なリソース・体制**（人・予算・時間）
3. **成功のクリティカルファクター**
4. **よくある失敗パターンと回避策**
5. **このフェーズでREQS Labが貢献できること**
`;

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  return streamResponse(res, stream);
});

module.exports = router;
