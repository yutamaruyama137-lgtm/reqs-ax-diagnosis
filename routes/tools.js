'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function loadJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

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

// ---------- GET /api/tools ----------
router.get('/tools', (req, res) => {
  const data = loadJson('ai_tools.json') || MOCK_TOOLS;
  let tools = data.tools || [];

  if (req.query.category) {
    tools = tools.filter(t => t.category === req.query.category);
  }
  if (req.query.pricing) {
    tools = tools.filter(t => t.pricing === req.query.pricing);
  }
  if (req.query.minScore !== undefined) {
    const minScore = parseFloat(req.query.minScore);
    if (!isNaN(minScore)) tools = tools.filter(t => (t.minAxScore || 0) >= minScore);
  }
  if (req.query.maxScore !== undefined) {
    const maxScore = parseFloat(req.query.maxScore);
    if (!isNaN(maxScore)) tools = tools.filter(t => (t.minAxScore || 0) <= maxScore);
  }

  const categories = [...new Set((data.tools || []).map(t => t.category))];
  res.json({ tools, total: tools.length, categories });
});

// ---------- POST /api/recommend ----------
router.post('/recommend', (req, res) => {
  const { assessmentResult, preferences } = req.body;

  if (!assessmentResult || typeof assessmentResult.totalScore === 'undefined') {
    return res.status(400).json({ error: '診断結果が必要です', code: 'MISSING_ASSESSMENT' });
  }

  const { totalScore, dimensionScores = {}, weaknesses = [] } = assessmentResult;
  const { budget = 'medium', companySize = '' } = preferences || {};

  const data = loadJson('ai_tools.json') || MOCK_TOOLS;
  let tools = (data.tools || []).filter(t => (t.minAxScore || 0) <= totalScore + 20);

  // 予算フィルタリング
  if (budget === 'low') {
    tools = tools.filter(t => t.pricing === 'free' || t.pricing === 'freemium');
  } else if (budget === 'medium') {
    tools = tools.filter(t => t.pricing !== 'enterprise');
  }
  // high の場合は全てのツールを許容

  // 規模フィルタリング（推奨対象があれば優先）
  const sizedTools = companySize
    ? tools.filter(t => {
        const sizes = t.targetCompanySize || t.recommendedFor;
        return !sizes || sizes.includes(companySize);
      })
    : tools;
  const finalTools = sizedTools.length > 0 ? sizedTools : tools;

  // 弱点次元を特定
  const weakDimensions = Object.entries(dimensionScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([dim]) => dim);

  // ツールをスコアに応じて3段階に分類
  const immediate = finalTools.filter(t => (t.minAxScore || 0) <= totalScore);
  const shortTerm = finalTools.filter(t => (t.minAxScore || 0) > totalScore && (t.minAxScore || 0) <= totalScore + 20);
  const longTerm = (data.tools || []).filter(t => (t.minAxScore || 0) > totalScore + 20);

  function buildRecommendation(tool, dimScores, weakDims) {
    const isWeakDim = weakDims.includes(tool.axDimension);
    const priority = isWeakDim ? 'high' : 'medium';
    const reason = isWeakDim
      ? `${tool.name}は弱点次元「${tool.axDimension}」の改善に直接貢献します`
      : `${tool.name}はAX成熟度レベルの向上に効果的です`;
    return { tool, reason, priority };
  }

  // カテゴリ別Top3
  const toolsByCategory = {};
  for (const tool of finalTools) {
    if (!toolsByCategory[tool.category]) toolsByCategory[tool.category] = [];
    if (toolsByCategory[tool.category].length < 3) {
      toolsByCategory[tool.category].push(tool);
    }
  }

  res.json({
    recommendations: {
      immediate: immediate.slice(0, 5).map(t => buildRecommendation(t, dimensionScores, weakDimensions)),
      shortTerm: shortTerm.slice(0, 4).map(t => buildRecommendation(t, dimensionScores, weakDimensions)),
      longTerm: longTerm.slice(0, 3).map(t => buildRecommendation(t, dimensionScores, weakDimensions))
    },
    toolsByCategory
  });
});

// ---------- POST /api/roadmap ----------
router.post('/roadmap', (req, res) => {
  const { assessmentResult, recommendations } = req.body;

  if (!assessmentResult || typeof assessmentResult.level === 'undefined') {
    return res.status(400).json({ error: '診断結果が必要です', code: 'MISSING_ASSESSMENT' });
  }

  const currentLevel = assessmentResult.level || 1;
  const targetLevel = Math.min(currentLevel + 2, 5);
  const { dimensionScores = {}, weaknesses = [], priorityActions = [] } = assessmentResult;

  // 改善が必要な次元
  const dimLabels = {
    awareness: 'AI認知・理解度',
    adoption: 'AI導入経験',
    integration: 'AI統合度',
    optimization: 'AI最適化',
    transformation: 'AI変革力'
  };

  const weakDims = Object.entries(dimensionScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([dim]) => ({ key: dim, label: dimLabels[dim], score: dimensionScores[dim] }));

  // フェーズ生成
  const phases = [];

  if (currentLevel <= 2) {
    phases.push({
      phase: 1,
      title: 'フェーズ1: 基盤整備・AI試験導入',
      duration: '1-3ヶ月',
      actions: [
        '社内AI活用ガイドラインの策定',
        '主要スタッフへのAIリテラシー研修',
        'ChatGPT / Claude などの生成AIを業務試験導入',
        'AI活用事例の社内共有・ナレッジベース構築'
      ],
      tools: ['ChatGPT', 'Claude', 'Notion AI'],
      kpis: ['AI利用率（月間アクティブユーザー数）', '業務効率改善率（試験部門）', 'AIリテラシースコア（研修前後比較）']
    });
  }

  if (currentLevel <= 3) {
    phases.push({
      phase: phases.length + 1,
      title: `フェーズ${phases.length + 1}: 業務特化AI導入・統合`,
      duration: '3-6ヶ月',
      actions: [
        '主力業務プロセスへのAI本格導入',
        '既存ツール・システムとのAI連携',
        'AI活用KPIの設定と定期モニタリング開始',
        weakDims[0] ? `${weakDims[0].label}の重点強化施策を実施` : '全次元バランス改善'
      ],
      tools: ['Microsoft Copilot', 'Zapier AI', 'HubSpot AI', 'GitHub Copilot'],
      kpis: ['対象業務の工数削減率（目標20%）', 'AIツール定着率', 'エラー率・品質スコア変化']
    });
  }

  if (currentLevel <= 4) {
    phases.push({
      phase: phases.length + 1,
      title: `フェーズ${phases.length + 1}: AI最適化・データ活用強化`,
      duration: '6-12ヶ月',
      actions: [
        '自社データを活用したAIモデルのカスタマイズ・ファインチューニング',
        'データ基盤（データウェアハウス / データレイク）の整備',
        'AI活用効果の定量化とROI算出',
        '全社横断AI推進体制（CoE: Center of Excellence）の構築'
      ],
      tools: ['Tableau AI', 'Salesforce Einstein', 'UiPath AI'],
      kpis: ['ROI（投資対効果）', '全社AI導入率', 'データドリブン意思決定の割合']
    });
  }

  phases.push({
    phase: phases.length + 1,
    title: `フェーズ${phases.length + 1}: AI変革・競合優位確立`,
    duration: '12-24ヶ月',
    actions: [
      'AI前提の業務設計・組織構造の再設計',
      '経営戦略へのAI活用目標の完全統合',
      '自社AIモデル・プロダクトの開発検討',
      'AI活用による新規事業・サービス創出'
    ],
    tools: ['カスタムAIモデル', 'エンタープライズAIプラットフォーム'],
    kpis: ['AI起点の売上比率', '新規事業創出数', 'AI人材比率（全社）']
  });

  // ITポートフォリオ
  const itPortfolio = {
    optimize: [
      '現行基幹システムへのAI機能追加・連携',
      'データ管理基盤の統合・クレンジング',
      '既存業務ツールのAI搭載版へのアップグレード検討'
    ],
    add: [
      'AI統合データ分析プラットフォーム',
      'AI搭載CRM / MAツール',
      weakDims[0] ? `${weakDims[0].label}強化のための専用ツール` : 'AI専用ワークフロー管理ツール'
    ],
    retire: [
      '手動作業が多く自動化余地の大きいレガシーシステム',
      '重複機能を持つ非AIツール',
      'データ連携が困難な孤立システム'
    ]
  };

  // 業務プロセス最適化
  const processOptimization = [
    '定型業務（データ入力・集計・報告書作成）のAI自動化',
    'カスタマーサポートへのAIチャットボット導入',
    '営業プロセスへのAI商談予測・優先度付け導入',
    '採用・HR業務へのAI書類選考・スクリーニング導入',
    '経理・会計業務の自動化（請求書処理・照合）'
  ].filter((_, i) => i < (currentLevel < 3 ? 3 : 5));

  // データ戦略
  const dataStrategy = [
    '全社データの収集・統合基盤（CDP / DWH）の構築',
    'データガバナンスポリシーとプライバシー対応の整備',
    'AIモデル学習用データセットの整備・ラベリング',
    'リアルタイムデータパイプラインの構築',
    '顧客データ・行動データの分析活用強化'
  ];

  const roiEstimates = {
    1: '投資1に対して1.2-1.5倍の効果を12ヶ月以内に期待',
    2: '投資1に対して1.5-2.0倍の効果を12ヶ月以内に期待',
    3: '投資1に対して2.0-3.0倍の効果を18ヶ月以内に期待',
    4: '投資1に対して3.0-5.0倍の効果を24ヶ月以内に期待',
    5: 'AI前提設計により持続的な競争優位と指数関数的成長を実現'
  };

  res.json({
    roadmap: {
      currentLevel,
      targetLevel,
      phases,
      itPortfolio,
      processOptimization,
      dataStrategy,
      estimatedRoi: roiEstimates[currentLevel] || roiEstimates[1],
      reqs_services: {
        business_ax: '業務AXソリューション: 貴社の業務プロセスにAIを組み込む伴走型支援サービス。要件定義からPoC・本番運用まで一貫対応。',
        web_app: 'Webアプリ開発: AIを活用した業務アプリ・社内ツールの高速開発。Next.js + AI APIで最短1ヶ月でリリース。',
        database: 'データベース統合・自動化: 散在するデータを統合し、AI活用可能なデータ基盤を構築。RPAによる自動入力・帳票処理も対応。'
      }
    }
  });
});

module.exports = router;
