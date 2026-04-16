'use strict';

const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const supabase = require('../lib/supabase');

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
// チャット（会話履歴付き）+ Supabase保存
router.post('/chat', async (req, res) => {
  const { messages, assessmentResult, companyInfo, sessionId } = req.body;

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

  // 最後のユーザーメッセージをDBに保存
  const lastUser = apiMessages.filter(m => m.role === 'user').pop();
  if (supabase && sessionId && lastUser) {
    await supabase.from('chat_histories').insert({ session_id: sessionId, role: 'user', content: lastUser.content });
  }

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 1000,
    system: contextSystem,
    messages: apiMessages
  });

  // アシスタントの返答も保存
  let fullReply = '';
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        fullReply += chunk.delta.text;
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    if (supabase && sessionId && fullReply) {
      await supabase.from('chat_histories').insert({ session_id: sessionId, role: 'assistant', content: fullReply });
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  }
  res.end();
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

// ---------- POST /api/ai/analyze-transcript ----------
// ヒアリング書き起こしテキストを受け取り、5軸スコアリング + 4アウトプットをJSON返却
const TRANSCRIPT_SYSTEM_PROMPT = `あなたはREQS Lab専属のAX（AI Transformation）診断AIです。
企業のヒアリング書き起こしテキストを分析し、構造化された診断結果をJSONで返します。

## 分析フレームワーク：5軸スコアリング（各1-5点）

1. **AI活用成熟度** (aiMaturity)
   - 1: AIツールをほぼ使っていない
   - 2: 個人レベルでChatGPT等を試用
   - 3: 一部業務でAIツールを本格利用
   - 4: 複数部門でAI統合・効果測定あり
   - 5: AI前提の業務設計が完成

2. **業務自動化余地** (automationPotential)
   - 1: すでに高度に自動化されている
   - 2: 一部自動化済み、大きな余地なし
   - 3: 中程度の手作業あり
   - 4: 多くの繰り返し作業・属人業務あり（自動化余地大）
   - 5: ほぼ手作業・属人化・紙/FAX多用（自動化余地最大）
   ※スコアが高いほど「伸びしろ」が大きい

3. **データ整備度** (dataReadiness)
   - 1: データがバラバラ・活用ほぼゼロ
   - 2: 一部デジタル化、活用は限定的
   - 3: 主要データはデジタル化、連携は弱い
   - 4: データ統合基盤あり、一部AI活用
   - 5: データ完全一元化・AI学習に活用中

4. **組織推進力** (orgMomentum)
   - 1: 経営層・現場ともにAI無関心
   - 2: 一部に関心あり、推進体制なし
   - 3: 担当者はいるが予算・権限が弱い
   - 4: 経営層理解あり、推進者も明確
   - 5: 全社DX推進体制が整備済み

5. **コスト最適化余地** (costOptimization)
   - 1: IT費用は最適化済み、無駄なし
   - 2: 若干の無駄あり、改善余地小
   - 3: 中程度の無駄・外注依存あり
   - 4: 使っていないツール・高コスト外注多数
   - 5: IT費用が非常に非効率（自動化で大幅削減可能）
   ※スコアが高いほど「伸びしろ」が大きい

## AI導入ポテンシャルスコア（0-100）
総合スコア(5-25)を0-100に正規化 + 緊迫感・リソース準備度ボーナス

## 部署・レイヤー別ギャップ診断
ヒアリングから登場する部署・役職・担当者の発言を分析し、各部署のAI/IT導入度と課題を特定する。
- 発言者が「経営層（社長・役員・部長等）」か「現場（担当者・スタッフ等）」かを識別する
- 各部署名はヒアリングに登場したものを使用（例：営業部、経理部、製造部など）
- 発言から読み取れる部署ごとのデジタル化レベル・AI活用度・ペインポイントを抽出する
- 経営層と現場のAI/IT認識ギャップを1-5で評価（1=ギャップなし、5=深刻なギャップ）
- 登場しない部署は含めない

## 重要な分析姿勢
- テキストにない情報は「不明」とする（推測で埋めない）
- 具体的な発言を「evidence」として必ず引用する
- 工数・コストは発言から数値化（「週3時間×2名=月24時間」など）
- 曖昧な場合は保守的に（低め）スコアリングする

必ず有効なJSONのみを返し、マークダウンやコードブロックは使わない。`;

// stageを総合スコアから判定するヘルパー
function determineStage(totalScore) {
  if (totalScore <= 9)  return { stage: '未着手層', stageDescription: 'AI活用の基礎構築から始めるフェーズです' };
  if (totalScore <= 14) return { stage: '検討層',   stageDescription: 'ツール選定と小規模PoC開始が有効なフェーズです' };
  if (totalScore <= 18) return { stage: '試用層',   stageDescription: '業務AX + 定着支援が必要なフェーズです' };
  if (totalScore <= 22) return { stage: '活用層',   stageDescription: '部門横断展開と効果測定を強化するフェーズです' };
  return                       { stage: '変革層',   stageDescription: 'AI前提の業務設計・組織変革が可能なフェーズです' };
}

router.post('/analyze-transcript', async (req, res) => {
  const { transcript, companyInfo } = req.body;

  // バリデーション
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'transcriptが必要です' });
  }
  if (transcript.trim().length < 200) {
    return res.status(400).json({ error: 'transcriptが短すぎます（200文字以上必要）' });
  }

  const company = companyInfo || {};
  const userMessage = `以下のヒアリング書き起こしを分析し、診断結果を指定のJSON形式で返してください。

## 企業情報
- 会社名: ${company.name || '未入力'}
- 業種: ${company.industry || '未入力'}
- 規模: ${company.size || '未入力'}

## ヒアリング書き起こし
${transcript}

## 出力するJSONのスキーマ
{
  "scores": {
    "aiMaturity": <1-5の整数>,
    "automationPotential": <1-5の整数>,
    "dataReadiness": <1-5の整数>,
    "orgMomentum": <1-5の整数>,
    "costOptimization": <1-5の整数>
  },
  "aiPotential": <0-100の整数>,
  "dimensionDetails": {
    "aiMaturity":          { "score": <1-5>, "evidence": "<発言の引用>", "gap": "<課題の説明>", "mgmtScore": <1-5>, "frontlineScore": <1-5> },
    "automationPotential": { "score": <1-5>, "evidence": "<発言の引用>", "gap": "<課題の説明>", "mgmtScore": <1-5>, "frontlineScore": <1-5> },
    "dataReadiness":       { "score": <1-5>, "evidence": "<発言の引用>", "gap": "<課題の説明>", "mgmtScore": <1-5>, "frontlineScore": <1-5> },
    "orgMomentum":         { "score": <1-5>, "evidence": "<発言の引用>", "gap": "<課題の説明>", "mgmtScore": <1-5>, "frontlineScore": <1-5> },
    "costOptimization":    { "score": <1-5>, "evidence": "<発言の引用>", "gap": "<課題の説明>", "mgmtScore": <1-5>, "frontlineScore": <1-5> }
  },
  "departmentAnalysis": {
    "departments": [
      {
        "name": "<部署名（例：経営層・営業部・経理部など、ヒアリングに登場した部署のみ）>",
        "aiAdoption": <1-5の整数：AI/ITツール活用度>,
        "digitalReadiness": <1-5の整数：デジタル化成熟度>,
        "painPoints": ["<現場の課題1>", "<現場の課題2>"],
        "currentTools": ["<現在使用中のツール>"],
        "aiOpportunities": ["<AI/自動化で改善できる業務>"],
        "evidence": "<この部署に関する発言の引用>"
      }
    ],
    "layerGap": {
      "managementScore": <1-5：経営層のAI/IT理解度>,
      "frontlineScore": <1-5：現場のAI/IT活用度>,
      "gapScore": <1-5：経営層と現場の認識ギャップ（1=ほぼなし、5=深刻）>,
      "analysis": "<経営層と現場のギャップの詳細分析>",
      "riskLevel": "<低/中/高>",
      "bridgingActions": ["<ギャップ解消アクション1>", "<ギャップ解消アクション2>"]
    }
  },
  "keyFindings": ["<発見1>", "<発見2>", "<発見3>"],
  "outputs": {
    "itPortfolio": {
      "current":  ["<現在使用中のツール一覧>"],
      "keep":     ["<継続利用すべきツール>"],
      "optimize": ["<改善方法付きツール>"],
      "retire":   ["<廃止候補ツール>"],
      "add":      ["<新規導入推奨ツール>"],
      "summary":  "<IT環境の現状サマリー>"
    },
    "processRoadmap": {
      "phase1": {
        "title":   "0〜3ヶ月：即効自動化",
        "actions": ["<アクション1>", "<アクション2>"],
        "impact":  "<削減時間・コスト効果>",
        "tools":   ["<ツール1>", "<ツール2>"]
      },
      "phase2": {
        "title":   "3〜6ヶ月：部門横断改革",
        "actions": ["<アクション1>", "<アクション2>"],
        "impact":  "<削減時間・コスト効果>",
        "tools":   ["<ツール1>", "<ツール2>"]
      },
      "phase3": {
        "title":   "6ヶ月〜：データドリブン経営",
        "actions": ["<アクション1>", "<アクション2>"],
        "impact":  "<意思決定・事業効果>",
        "tools":   ["<ツール1>", "<ツール2>"]
      }
    },
    "systemIntegration": {
      "asIs":        "<現状のシステム連携状況>",
      "toBe":        "<理想のシステム連携状況>",
      "connections": [
        { "from": "<システムA>", "to": "<システムB>", "method": "<連携方法>", "benefit": "<効果>" }
      ],
      "priority": "<最優先で取り組む連携>"
    },
    "dataStrategy": {
      "currentState":      "<データ管理の現状>",
      "collectTarget":     ["<収集すべきデータ1>", "<収集すべきデータ2>"],
      "integrationPlan":   "<データ統合計画>",
      "aiUseCases":        ["<AIユースケース1>", "<AIユースケース2>"],
      "kpis":              ["<KPI1>", "<KPI2>"]
    }
  },
  "roiSimulation": {
    "currentCost": "<現状の手作業コスト>",
    "afterCost":   "<AX化後のコスト>",
    "saving":      "<月次削減額>",
    "payback":     "<投資回収見込み>"
  },
  "nextSteps": [
    { "priority": 1, "action": "<アクション>", "cost": "<費用目安>" },
    { "priority": 2, "action": "<アクション>", "cost": "<費用目安>" },
    { "priority": 3, "action": "<アクション>", "cost": "<費用目安>" }
  ]
}`;

  // タイムアウト制御（60秒）
  const timeoutMs = 60000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let rawText = '';
  try {
    const message = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 6000,
        system: TRANSCRIPT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      },
      { signal: controller.signal }
    );

    rawText = message.content?.[0]?.text ?? '';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
      return res.status(504).json({ error: 'Claude APIタイムアウト（30秒超過）' });
    }
    console.error('[analyze-transcript] Claude API error:', err);
    return res.status(502).json({ error: 'Claude APIエラー', detail: err.message });
  }
  clearTimeout(timeoutId);

  // JSONパース（コードブロック除去 → パース → フォールバック）
  let parsed;
  try {
    // ```json ... ``` や ``` ... ``` を除去
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (_) {
    // パース失敗時はフォールバックレスポンスを返す
    console.error('[analyze-transcript] JSON parse failed. raw:', rawText.slice(0, 300));
    return res.status(200).json({
      _parseError: true,
      _rawResponse: rawText,
      scores: { aiMaturity: 0, automationPotential: 0, dataReadiness: 0, orgMomentum: 0, costOptimization: 0 },
      totalScore: 0,
      stage: '分析エラー',
      stageDescription: 'JSONの解析に失敗しました。書き起こし内容を確認してください。',
      aiPotential: 0,
      dimensionDetails: {},
      keyFindings: [],
      outputs: {},
      roiSimulation: {},
      nextSteps: []
    });
  }

  // totalScore と stage をサーバー側で計算・付与
  const scores = parsed.scores || {};
  const totalScore = (scores.aiMaturity || 0)
    + (scores.automationPotential || 0)
    + (scores.dataReadiness || 0)
    + (scores.orgMomentum || 0)
    + (scores.costOptimization || 0);
  const { stage, stageDescription } = determineStage(totalScore);

  const result = {
    ...parsed,
    totalScore,
    stage,
    stageDescription
  };

  return res.status(200).json(result);
});

module.exports = router;

