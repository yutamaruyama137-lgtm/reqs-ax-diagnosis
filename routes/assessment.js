'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const supabase = require('../lib/supabase');

const DATA_DIR = path.join(__dirname, '..', 'data');

// ---------- helpers ----------

function loadJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

const MOCK_QUESTIONS = {
  questions: [
    { id: 'q001', category: 'AI認知・理解度', subcategory: '基礎知識', question: '生成AIの基本的な仕組みを理解していますか？', type: 'scale', weight: 1.0, axDimension: 'awareness' },
    { id: 'q002', category: 'AI認知・理解度', subcategory: '活用事例', question: '業界内のAI活用事例を把握していますか？', type: 'scale', weight: 1.0, axDimension: 'awareness' },
    { id: 'q003', category: 'AI導入経験', subcategory: 'ツール利用', question: 'ChatGPTなどの生成AIツールを業務で利用していますか？', type: 'scale', weight: 1.0, axDimension: 'adoption' },
    { id: 'q004', category: 'AI導入経験', subcategory: '導入実績', question: 'AIツールを正式に導入したことがありますか？', type: 'boolean', weight: 1.2, axDimension: 'adoption' },
    { id: 'q005', category: 'AI統合度', subcategory: 'システム連携', question: '既存の業務システムにAIを統合していますか？', type: 'scale', weight: 1.0, axDimension: 'integration' },
    { id: 'q006', category: 'AI統合度', subcategory: 'データ活用', question: '自社データをAIモデルの学習・活用に使っていますか？', type: 'scale', weight: 1.2, axDimension: 'integration' },
    { id: 'q007', category: 'AI最適化', subcategory: 'KPI改善', question: 'AIの導入によりKPIが改善されましたか？', type: 'scale', weight: 1.0, axDimension: 'optimization' },
    { id: 'q008', category: 'AI最適化', subcategory: 'コスト削減', question: 'AI活用によるコスト削減効果を測定していますか？', type: 'boolean', weight: 1.0, axDimension: 'optimization' },
    { id: 'q009', category: 'AI変革力', subcategory: '戦略整合', question: 'AI活用が経営戦略と整合していますか？', type: 'scale', weight: 1.2, axDimension: 'transformation' },
    { id: 'q010', category: 'AI変革力', subcategory: '組織変革', question: 'AIを前提とした業務設計・組織変革を進めていますか？', type: 'scale', weight: 1.2, axDimension: 'transformation' }
  ]
};

const MOCK_TOOLS = {
  tools: [
    { id: 't001', name: 'ChatGPT', category: '文書・コンテンツ生成', useCase: ['文書作成', 'アイデア出し', '要約'], description: 'OpenAIの汎用生成AI', url: 'https://chatgpt.com', pricing: 'freemium', tags: ['llm', 'text'], minAxScore: 0, targetIndustries: ['全業界'], recommendedFor: ['中小企業', '大企業'], axDimension: 'adoption' },
    { id: 't002', name: 'Claude', category: '文書・コンテンツ生成', useCase: ['文書作成', 'コード生成', '分析'], description: 'Anthropicの高性能生成AI', url: 'https://claude.ai', pricing: 'freemium', tags: ['llm', 'text'], minAxScore: 0, targetIndustries: ['全業界'], recommendedFor: ['中小企業', '大企業'], axDimension: 'adoption' },
    { id: 't003', name: 'Notion AI', category: '文書・コンテンツ生成', useCase: ['議事録', 'ドキュメント整備'], description: 'NotionにAIが統合されたナレッジ管理ツール', url: 'https://notion.so', pricing: 'freemium', tags: ['knowledge', 'docs'], minAxScore: 20, targetIndustries: ['全業界'], recommendedFor: ['中小企業'], axDimension: 'adoption' },
    { id: 't004', name: 'Zapier AI', category: '業務自動化', useCase: ['ワークフロー自動化', 'アプリ連携'], description: 'ノーコードで業務自動化', url: 'https://zapier.com', pricing: 'freemium', tags: ['automation', 'nocode'], minAxScore: 30, targetIndustries: ['全業界'], recommendedFor: ['中小企業', '大企業'], axDimension: 'integration' },
    { id: 't005', name: 'Microsoft Copilot', category: '業務自動化', useCase: ['Office自動化', 'メール作成', '会議要約'], description: 'Microsoft 365に統合されたAIアシスタント', url: 'https://copilot.microsoft.com', pricing: 'paid', tags: ['microsoft', 'office'], minAxScore: 40, targetIndustries: ['全業界'], recommendedFor: ['中小企業', '大企業'], axDimension: 'integration' },
    { id: 't006', name: 'Salesforce Einstein', category: 'CRM', useCase: ['営業予測', 'リード分析', 'カスタマーサポート'], description: 'Salesforceに統合されたAI機能', url: 'https://salesforce.com', pricing: 'enterprise', tags: ['crm', 'sales'], minAxScore: 60, targetIndustries: ['製造', '小売', 'サービス'], recommendedFor: ['大企業'], axDimension: 'optimization' },
    { id: 't007', name: 'GitHub Copilot', category: 'コード生成', useCase: ['コード補完', 'コードレビュー', 'テスト生成'], description: 'AIペアプログラマー', url: 'https://github.com/features/copilot', pricing: 'paid', tags: ['dev', 'code'], minAxScore: 30, targetIndustries: ['IT', 'テック'], recommendedFor: ['中小企業', '大企業'], axDimension: 'adoption' },
    { id: 't008', name: 'Tableau AI', category: 'データ分析', useCase: ['データ可視化', 'インサイト自動抽出'], description: 'AI搭載BIツール', url: 'https://tableau.com', pricing: 'paid', tags: ['bi', 'analytics'], minAxScore: 50, targetIndustries: ['全業界'], recommendedFor: ['大企業'], axDimension: 'optimization' },
    { id: 't009', name: 'HubSpot AI', category: 'マーケティング', useCase: ['コンテンツ生成', 'SEO', 'リード育成'], description: 'AI搭載マーケティング自動化プラットフォーム', url: 'https://hubspot.com', pricing: 'freemium', tags: ['marketing', 'crm'], minAxScore: 30, targetIndustries: ['サービス', '小売'], recommendedFor: ['中小企業', '大企業'], axDimension: 'integration' },
    { id: 't010', name: 'UiPath AI', category: '業務自動化', useCase: ['RPA', 'プロセス自動化', '帳票処理'], description: 'AI搭載エンタープライズRPAプラットフォーム', url: 'https://uipath.com', pricing: 'enterprise', tags: ['rpa', 'automation'], minAxScore: 60, targetIndustries: ['製造', '金融', '物流'], recommendedFor: ['大企業'], axDimension: 'transformation' }
  ]
};

// Level定義
const LEVELS = [
  { min: 0,  max: 20,  level: 1, name: '入門期',  description: 'AIをほぼ使っていない段階' },
  { min: 21, max: 40,  level: 2, name: '探索期',  description: '一部で試験的に利用している段階' },
  { min: 41, max: 60,  level: 3, name: '導入期',  description: '特定業務に本格導入している段階' },
  { min: 61, max: 80,  level: 4, name: '統合期',  description: '複数業務に統合・自動化が進む段階' },
  { min: 81, max: 100, level: 5, name: '変革期',  description: 'AI中心の業務設計が完成した段階' }
];

function getLevel(score) {
  return LEVELS.find(l => score >= l.min && score <= l.max) || LEVELS[0];
}

function calcAnswerScore(answer) {
  const { type, value } = answer;
  if (type === 'scale') {
    const v = parseFloat(value);
    if (isNaN(v)) return 0;
    return ((Math.min(Math.max(v, 1), 5) - 1) / 4) * 100;
  }
  if (type === 'boolean') {
    return value === true || value === 'true' || value === 1 ? 100 : 0;
  }
  if (type === 'choice') {
    // answer.score が事前定義されていれば使用、なければvalueをそのままスコアとして扱う
    if (typeof answer.score === 'number') return Math.min(Math.max(answer.score, 0), 100);
    const v = parseFloat(value);
    return isNaN(v) ? 0 : Math.min(Math.max(v, 0), 100);
  }
  return 0;
}

function scoreAnswers(answers, questions) {
  const dimensions = { awareness: [], adoption: [], integration: [], optimization: [], transformation: [] };

  for (const answer of answers) {
    const q = questions.find(q => q.id === answer.questionId);
    if (!q || !dimensions[q.axDimension]) continue;
    const rawScore = calcAnswerScore({ type: answer.type || q.type, value: answer.value, score: answer.score });
    const weight = q.weight || 1.0;
    dimensions[q.axDimension].push({ score: rawScore, weight });
  }

  const dimensionScores = {};
  for (const [dim, items] of Object.entries(dimensions)) {
    if (items.length === 0) {
      dimensionScores[dim] = 0;
      continue;
    }
    const totalWeight = items.reduce((s, i) => s + i.weight, 0);
    const weightedSum = items.reduce((s, i) => s + i.score * i.weight, 0);
    dimensionScores[dim] = Math.round(weightedSum / totalWeight);
  }

  const dimValues = Object.values(dimensionScores);
  const totalScore = Math.round(dimValues.reduce((s, v) => s + v, 0) / dimValues.length);

  return { dimensionScores, totalScore };
}

function buildFeedback(dimensionScores, levelObj) {
  const THRESHOLD_HIGH = 65;
  const THRESHOLD_LOW = 45;
  const labels = {
    awareness: 'AI認知・理解度',
    adoption: 'AI導入経験',
    integration: 'AI統合度',
    optimization: 'AI最適化',
    transformation: 'AI変革力'
  };

  const strengths = [];
  const weaknesses = [];

  for (const [dim, score] of Object.entries(dimensionScores)) {
    if (score >= THRESHOLD_HIGH) strengths.push(`${labels[dim]}が高い（${score}点）`);
    else if (score < THRESHOLD_LOW) weaknesses.push(`${labels[dim]}が不十分（${score}点）`);
  }

  // 改善アクション
  const priorityActions = [];
  const sorted = Object.entries(dimensionScores).sort((a, b) => a[1] - b[1]);
  if (sorted[0][1] < 60) priorityActions.push(`${labels[sorted[0][0]]}の強化に取り組む`);
  if (sorted[1] && sorted[1][1] < 60) priorityActions.push(`${labels[sorted[1][0]]}の改善施策を検討する`);
  if (levelObj.level < 3) priorityActions.push('生成AIツールを業務に試験導入する');
  if (levelObj.level < 4) priorityActions.push('AI活用のKPIを設定し効果測定を開始する');
  if (levelObj.level < 5) priorityActions.push('AI活用を経営戦略に組み込む');

  return { strengths, weaknesses, priorityActions };
}

// ---------- GET /api/questions ----------
router.get('/questions', (req, res) => {
  const data = loadJson('questions.json') || MOCK_QUESTIONS;
  let questions = data.questions || [];

  if (req.query.category) {
    questions = questions.filter(q => q.category === req.query.category);
  }
  if (req.query.limit) {
    const limit = parseInt(req.query.limit, 10);
    if (!isNaN(limit) && limit > 0) questions = questions.slice(0, limit);
  }

  const categories = [...new Set((data.questions || []).map(q => q.category))];

  res.json({ questions, total: questions.length, categories });
});

// ---------- POST /api/sessions ----------
// セッション（企業情報）をDBに保存してsession_idを返す
router.post('/sessions', async (req, res) => {
  const { companyName, industry, companySize, role, budget } = req.body;
  if (!supabase) return res.json({ sessionId: null, note: 'DB未接続' });

  const { data, error } = await supabase
    .from('sessions')
    .insert({ company_name: companyName, industry, company_size: companySize, role, budget })
    .select('id')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ sessionId: data.id });
});

// ---------- POST /api/assess ----------
router.post('/assess', async (req, res) => {
  const { answers, companyInfo, sessionId } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: '回答データが必要です', code: 'MISSING_ANSWERS' });
  }

  const questionData = loadJson('questions.json') || MOCK_QUESTIONS;
  const questions = questionData.questions || [];

  const { dimensionScores, totalScore } = scoreAnswers(answers, questions);
  const levelObj = getLevel(totalScore);
  const { strengths, weaknesses, priorityActions } = buildFeedback(dimensionScores, levelObj);

  const result = {
    totalScore,
    level: levelObj.level,
    levelName: levelObj.name,
    levelDescription: levelObj.description,
    dimensionScores,
    strengths: strengths.length ? strengths : ['データ収集中'],
    weaknesses: weaknesses.length ? weaknesses : ['特定の弱点は見つかりませんでした'],
    priorityActions,
    companyProfile: companyInfo || {}
  };

  // Supabaseに保存（sessionIdがあれば）
  if (supabase && sessionId) {
    await supabase.from('assessment_results').insert({
      session_id:       sessionId,
      total_score:      totalScore,
      level:            levelObj.level,
      level_name:       levelObj.name,
      dimension_scores: dimensionScores,
      strengths:        result.strengths,
      weaknesses:       result.weaknesses,
      priority_actions: priorityActions
    });

    // 回答もまとめて保存
    const answerRows = answers.map(a => ({
      session_id:  sessionId,
      question_id: a.questionId,
      value:       { v: a.value }
    }));
    await supabase.from('answers').insert(answerRows);
  }

  res.json(result);
});

module.exports = router;
