/* =====================================================
   REQS AX診断 — app.js
   ===================================================== */

/* ============ MOCK DATA ============ */

const mockQuestions = [
  // ---- Awareness ----
  { id: 'q001', category: 'AI認知・理解度', subcategory: '基礎知識', question: 'ChatGPTやCopilotなどの生成AIツールを業務で使ったことがありますか？', type: 'scale', weight: 1.0, axDimension: 'awareness' },
  { id: 'q002', category: 'AI認知・理解度', subcategory: '基礎知識', question: '社内でAI・DXに関する勉強会や研修が行われていますか？', type: 'scale', weight: 1.0, axDimension: 'awareness' },
  { id: 'q003', category: 'AI認知・理解度', subcategory: '戦略理解', question: '経営層がAI活用に関して明確なビジョンや方針を持っていますか？', type: 'scale', weight: 1.2, axDimension: 'awareness' },
  { id: 'q004', category: 'AI認知・理解度', subcategory: '知識共有', question: 'AI関連のニュースやトレンドを定期的に確認していますか？', type: 'boolean', weight: 0.8, axDimension: 'awareness' },

  // ---- Adoption ----
  { id: 'q005', category: 'AI導入経験', subcategory: 'ツール利用', question: '現在、業務でAIツールをどの程度活用していますか？', type: 'scale', weight: 1.2, axDimension: 'adoption' },
  { id: 'q006', category: 'AI導入経験', subcategory: 'ツール種類', question: 'どのカテゴリのAIツールを導入または検討していますか？', type: 'choice', options: ['文書生成・要約', '画像・動画生成', 'データ分析・BI', '業務自動化（RPA等）', 'チャットボット・サポート', 'まだ何も導入していない'], weight: 1.0, axDimension: 'adoption' },
  { id: 'q007', category: 'AI導入経験', subcategory: '予算', question: 'AI・DXへの投資予算が年次計画に含まれていますか？', type: 'scale', weight: 1.0, axDimension: 'adoption' },
  { id: 'q008', category: 'AI導入経験', subcategory: '専任担当', question: 'AI・DX推進の専任担当者または部門が存在しますか？', type: 'boolean', weight: 1.2, axDimension: 'adoption' },

  // ---- Integration ----
  { id: 'q009', category: 'AI統合度', subcategory: 'システム連携', question: '既存のシステム（ERP・CRM等）とAIツールが連携していますか？', type: 'scale', weight: 1.2, axDimension: 'integration' },
  { id: 'q010', category: 'AI統合度', subcategory: 'データ活用', question: '業務データを収集・整理し、分析に活用できる環境が整っていますか？', type: 'scale', weight: 1.2, axDimension: 'integration' },
  { id: 'q011', category: 'AI統合度', subcategory: 'API連携', question: '社内ツール同士がAPIで連携されていますか？', type: 'scale', weight: 1.0, axDimension: 'integration' },
  { id: 'q012', category: 'AI統合度', subcategory: 'ワークフロー', question: 'AIを活用した業務ワークフローが標準化されていますか？', type: 'boolean', weight: 1.0, axDimension: 'integration' },

  // ---- Optimization ----
  { id: 'q013', category: 'AI最適化', subcategory: '効果測定', question: 'AI導入の効果（工数削減・売上向上等）を定量的に測定していますか？', type: 'scale', weight: 1.2, axDimension: 'optimization' },
  { id: 'q014', category: 'AI最適化', subcategory: '改善サイクル', question: 'AI活用の結果を分析し、継続的に改善するPDCAが回っていますか？', type: 'scale', weight: 1.2, axDimension: 'optimization' },
  { id: 'q015', category: 'AI最適化', subcategory: 'コスト効率', question: 'AI投資のROIを把握・管理していますか？', type: 'boolean', weight: 1.0, axDimension: 'optimization' },
  { id: 'q016', category: 'AI最適化', subcategory: '精度管理', question: 'AI出力の品質・精度を監視・管理する仕組みがありますか？', type: 'scale', weight: 1.0, axDimension: 'optimization' },

  // ---- Transformation ----
  { id: 'q017', category: 'AI変革力', subcategory: 'ビジネスモデル', question: 'AIを活用した新しいビジネスモデルや収益源を検討・実装していますか？', type: 'scale', weight: 1.2, axDimension: 'transformation' },
  { id: 'q018', category: 'AI変革力', subcategory: '組織変革', question: 'AI活用を前提とした組織再編や人材育成が行われていますか？', type: 'scale', weight: 1.0, axDimension: 'transformation' },
  { id: 'q019', category: 'AI変革力', subcategory: '競合優位', question: 'AI活用が競合他社に対する明確な差別化要因になっていますか？', type: 'scale', weight: 1.2, axDimension: 'transformation' },
  { id: 'q020', category: 'AI変革力', subcategory: '将来戦略', question: '5年後のAI活用ビジョンと具体的なロードマップが存在しますか？', type: 'scale', weight: 1.0, axDimension: 'transformation' },
];

const mockAssessmentResult = {
  totalScore: 58,
  level: 3,
  levelName: '導入期',
  dimensions: {
    awareness:      { score: 65, label: 'AI認知・理解度', color: '#3B82F6' },
    adoption:       { score: 70, label: 'AI導入経験',     color: '#8B5CF6' },
    integration:    { score: 50, label: 'AI統合度',       color: '#10B981' },
    optimization:   { score: 45, label: 'AI最適化',       color: '#F59E0B' },
    transformation: { score: 40, label: 'AI変革力',       color: '#EF4444' },
  },
  strengths: [
    'AI認知・理解度が高く、社内でのAIリテラシーが育っている',
    '主要な生成AIツールの導入・試験的活用が進んでいる',
    '経営層のAIへの関心・理解度が高い',
  ],
  weaknesses: [
    'AIシステムの統合・連携が不十分で、サイロ化が発生している',
    'AI投資のROI測定・効果検証の仕組みが不足している',
    'AI変革を前提とした組織・ビジネスモデルの再設計が遅れている',
  ],
  priorityActions: [
    { title: 'AIシステム統合基盤の構築', desc: '既存システムのAPI連携を整備し、データの一元管理を実現する' },
    { title: 'ROI・KPI測定の仕組み導入', desc: 'AI施策の効果を定量化するダッシュボードを構築し、改善サイクルを確立する' },
    { title: 'AX推進専任チームの設立', desc: 'AI変革を主導する専任部門と人材育成プログラムを整備する' },
  ],
};

const mockRecommendations = [
  {
    id: 't001', name: 'ChatGPT / GPT-4o', category: '文書生成',
    icon: '🤖', description: 'OpenAIの最先端LLM。文書作成・要約・翻訳・コーディング支援など幅広い業務に即活用可能。',
    pricing: 'freemium', url: 'https://chat.openai.com',
    phase: 'immediate', difficulty: 1, axDimension: 'awareness',
  },
  {
    id: 't002', name: 'Microsoft Copilot', category: '業務自動化',
    icon: '💼', description: 'Office 365と深く統合されたAIアシスタント。Word・Excel・PowerPoint・Teams全体で使えるAI機能。',
    pricing: 'paid', url: 'https://copilot.microsoft.com',
    phase: 'immediate', difficulty: 1, axDimension: 'adoption',
  },
  {
    id: 't003', name: 'Notion AI', category: '文書生成',
    icon: '📝', description: 'Notionワークスペースに組み込まれたAI。議事録の要約・プロジェクト管理・ナレッジ構築を効率化。',
    pricing: 'freemium', url: 'https://notion.so',
    phase: 'immediate', difficulty: 1, axDimension: 'adoption',
  },
  {
    id: 't004', name: 'n8n / Make', category: '業務自動化',
    icon: '⚙️', description: 'ノーコード業務自動化プラットフォーム。APIを組み合わせてルーティン作業を完全自動化。',
    pricing: 'freemium', url: 'https://n8n.io',
    phase: 'short', difficulty: 2, axDimension: 'integration',
  },
  {
    id: 't005', name: 'Tableau / Looker Studio', category: 'データ分析',
    icon: '📊', description: 'BIツールを使ったデータ可視化・ダッシュボード構築。AI分析との連携でインサイトを自動抽出。',
    pricing: 'freemium', url: 'https://lookerstudio.google.com',
    phase: 'short', difficulty: 2, axDimension: 'optimization',
  },
  {
    id: 't006', name: 'Salesforce Einstein', category: 'CRM',
    icon: '☁️', description: 'CRMにAI予測分析を統合。リード優先度、商談確率、顧客チャーン予測を自動化。',
    pricing: 'enterprise', url: 'https://www.salesforce.com/jp/products/einstein/overview/',
    phase: 'short', difficulty: 3, axDimension: 'integration',
  },
  {
    id: 't007', name: 'HubSpot AI', category: 'マーケティング',
    icon: '🎯', description: 'マーケティング・セールス・カスタマーサービス統合プラットフォーム。AI機能でリード獲得・育成を自動化。',
    pricing: 'freemium', url: 'https://www.hubspot.jp',
    phase: 'short', difficulty: 2, axDimension: 'adoption',
  },
  {
    id: 't008', name: 'Vertex AI / Azure AI', category: 'データ分析',
    icon: '🧠', description: 'クラウドベースのエンタープライズAI開発基盤。カスタムモデルの構築・展開・運用管理が可能。',
    pricing: 'paid', url: 'https://cloud.google.com/vertex-ai',
    phase: 'long', difficulty: 4, axDimension: 'transformation',
  },
  {
    id: 't009', name: 'Slack AI', category: 'コミュニケーション',
    icon: '💬', description: 'SlackのAI機能でチャンネルのサマリー、検索強化、ワークフロー自動化を実現。',
    pricing: 'paid', url: 'https://slack.com/intl/ja-jp/features/ai',
    phase: 'immediate', difficulty: 1, axDimension: 'adoption',
  },
  {
    id: 't010', name: 'LangChain / RAGシステム', category: '業務自動化',
    icon: '🔗', description: '社内ナレッジベースとLLMを連携するRAGシステム。自社データに基づいた高精度AIアシスタントを構築。',
    pricing: 'free', url: 'https://python.langchain.com',
    phase: 'long', difficulty: 5, axDimension: 'transformation',
  },
];

const mockRoadmap = {
  phases: [
    {
      num: 1, title: 'AI基盤整備フェーズ', duration: '1〜3ヶ月',
      actions: ['全社員向けAIリテラシー研修の実施', '主要生成AIツール（ChatGPT等）の全社展開', 'AI活用ガイドライン・セキュリティポリシーの策定'],
      tools: ['ChatGPT Business', 'Microsoft Copilot', 'Notion AI'],
      kpis: ['AI利用率 30%以上', '基礎研修完了率 100%', '月間AI活用時間 50時間以上'],
    },
    {
      num: 2, title: 'プロセス自動化フェーズ', duration: '3〜6ヶ月',
      actions: ['繰り返し業務のAI自動化（n8n/Make連携）', 'データ収集・分析基盤の構築', 'カスタマーサポートAIの導入'],
      tools: ['n8n / Make', 'Looker Studio', 'Slack AI'],
      kpis: ['自動化による工数削減 20%', 'レポート作成時間 50%削減', '問い合わせ対応時間 30%削減'],
    },
    {
      num: 3, title: 'システム統合フェーズ', duration: '6〜12ヶ月',
      actions: ['CRM・ERPとAIの統合', 'AIダッシュボード・KPI管理システムの構築', 'ROI計測・改善PDCAの確立'],
      tools: ['Salesforce Einstein', 'Tableau / Power BI', 'HubSpot AI'],
      kpis: ['AIシステム統合率 80%', 'ROI 150%以上', 'データドリブン意思決定率 60%以上'],
    },
    {
      num: 4, title: 'AI変革・競争優位フェーズ', duration: '12ヶ月以降',
      actions: ['AI活用を前提とした組織・ビジネスモデル再設計', 'カスタムAIソリューションの開発・展開', 'AI変革による新規事業・収益源の創出'],
      tools: ['Vertex AI / Azure AI', 'LangChain / RAGシステム', 'カスタム開発'],
      kpis: ['AI起点の新規売上 20%', '競合対比AX指数でTOP3入り', 'AI人材比率 15%以上'],
    },
  ],
};

/* ============ STATE ============ */

const state = {
  currentStep: 0,
  currentQuestionIndex: 0,
  answers: [],
  companyInfo: {},
  assessmentResult: null,
  recommendations: null,
  roadmap: null,
  questions: [],
  tools: [],
  isLoading: false,
  completedSteps: new Set(),
  currentCategory: '',
  currentPhase: 'immediate',
  currentCategory_tools: 'all',
  currentPricing: 'all',
  scoreGaugeChart: null,
  radarChartInstance: null,
  recognition: null,
  isListening: false,
};

/* ============ API ============ */

const API = {
  async getQuestions() {
    try {
      const r = await fetch('/api/questions');
      if (!r.ok) throw new Error('API error');
      return await r.json();
    } catch {
      return { questions: mockQuestions };
    }
  },
  async submitAssessment(data) {
    try {
      const r = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error('API error');
      return await r.json();
    } catch {
      return computeLocalScore(data);
    }
  },
  async getRecommendations(data) {
    try {
      const r = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error('API error');
      return await r.json();
    } catch {
      return { tools: mockRecommendations };
    }
  },
  async getRoadmap(data) {
    try {
      const r = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error('API error');
      return await r.json();
    } catch {
      return mockRoadmap;
    }
  },
};

/* ============ LOCAL SCORE CALCULATION ============ */

function computeLocalScore(data) {
  const { answers, questions } = data;
  const dims = { awareness: [], adoption: [], integration: [], optimization: [], transformation: [] };

  questions.forEach((q, i) => {
    const ans = answers[i];
    if (ans == null) return;
    let val = 0;
    if (q.type === 'scale') val = parseFloat(ans) * 20;
    else if (q.type === 'boolean') val = ans === 'yes' ? 100 : 0;
    else if (q.type === 'choice') {
      const idx = q.options ? q.options.indexOf(ans) : 0;
      const last = (q.options ? q.options.length : 1) - 1;
      val = last > 0 ? (1 - idx / last) * 100 : 50;
    } else val = 50;
    if (dims[q.axDimension]) dims[q.axDimension].push(val * (q.weight || 1));
  });

  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 50;
  const scores = {
    awareness:      Math.round(avg(dims.awareness)),
    adoption:       Math.round(avg(dims.adoption)),
    integration:    Math.round(avg(dims.integration)),
    optimization:   Math.round(avg(dims.optimization)),
    transformation: Math.round(avg(dims.transformation)),
  };
  const total = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);

  const levels = [
    { min: 0,  level: 1, name: '入門期' },
    { min: 21, level: 2, name: '探索期' },
    { min: 41, level: 3, name: '導入期' },
    { min: 61, level: 4, name: '統合期' },
    { min: 81, level: 5, name: '変革期' },
  ];
  const lv = [...levels].reverse().find(l => total >= l.min) || levels[0];

  return {
    totalScore: total,
    level: lv.level,
    levelName: lv.name,
    dimensions: {
      awareness:      { score: scores.awareness,      label: 'AI認知・理解度', color: '#3B82F6' },
      adoption:       { score: scores.adoption,       label: 'AI導入経験',     color: '#8B5CF6' },
      integration:    { score: scores.integration,    label: 'AI統合度',       color: '#10B981' },
      optimization:   { score: scores.optimization,   label: 'AI最適化',       color: '#F59E0B' },
      transformation: { score: scores.transformation, label: 'AI変革力',       color: '#EF4444' },
    },
    strengths: buildStrengths(scores),
    weaknesses: buildWeaknesses(scores),
    priorityActions: mockAssessmentResult.priorityActions,
  };
}

function buildStrengths(scores) {
  const pairs = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const labels = { awareness: 'AI認知・理解度', adoption: 'AI導入経験', integration: 'AI統合度', optimization: 'AI最適化', transformation: 'AI変革力' };
  const msgs = {
    awareness: 'AIリテラシーが高く、社内での知識共有が進んでいる',
    adoption: '主要なAIツールの導入・試験的活用が進んでいる',
    integration: 'システム統合とデータ連携の基盤が整っている',
    optimization: 'AI施策の効果測定と改善サイクルが機能している',
    transformation: 'AIを核としたビジネス変革が進んでいる',
  };
  return pairs.slice(0, 3).map(([k]) => msgs[k] || `${labels[k]}が強みです`);
}

function buildWeaknesses(scores) {
  const pairs = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const msgs = {
    awareness: 'AIリテラシー向上のための研修・啓発活動が必要',
    adoption: 'AIツールの本格導入・活用拡大が急務',
    integration: 'システム統合とデータ基盤の整備が課題',
    optimization: 'AI投資のROI測定・改善PDCAの仕組みが不足',
    transformation: 'AI変革を前提とした組織・ビジネスモデルの再設計が遅れている',
  };
  return pairs.slice(0, 3).map(([k]) => msgs[k] || `${k}の改善が必要`);
}

/* ============ LOCALSTORAGE ============ */

function saveState() {
  try {
    localStorage.setItem('reqs_ax_state', JSON.stringify({
      currentStep: state.currentStep,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      companyInfo: state.companyInfo,
      assessmentResult: state.assessmentResult,
      completedSteps: [...state.completedSteps],
    }));
  } catch (e) { /* ignore */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem('reqs_ax_state');
    if (!raw) return false;
    const saved = JSON.parse(raw);
    Object.assign(state, {
      currentStep: saved.currentStep || 0,
      currentQuestionIndex: saved.currentQuestionIndex || 0,
      answers: saved.answers || [],
      companyInfo: saved.companyInfo || {},
      assessmentResult: saved.assessmentResult || null,
      completedSteps: new Set(saved.completedSteps || []),
    });
    return true;
  } catch { return false; }
}

/* ============ NAVIGATION ============ */

function showSection(stepNum) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
  const target = stepNum === 0 ? document.getElementById('section-landing') : document.getElementById(`section-step${stepNum}`);
  if (target) target.classList.add('active');

  const wrapper = document.getElementById('stepIndicatorWrapper');
  if (stepNum === 0) {
    wrapper.classList.remove('visible');
  } else {
    wrapper.classList.add('visible');
  }

  updateStepIndicator(stepNum);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  state.currentStep = stepNum;
  saveState();
}

function updateStepIndicator(activeStep) {
  for (let i = 1; i <= 5; i++) {
    const circle = document.getElementById(`step-circle-${i}`);
    const item = document.querySelector(`.step-item[data-step="${i}"]`);
    if (!circle || !item) continue;

    circle.classList.remove('active', 'completed');
    item.classList.remove('can-navigate');

    if (state.completedSteps.has(i) && i < activeStep) {
      circle.classList.add('completed');
      item.classList.add('can-navigate');
    } else if (i === activeStep) {
      circle.classList.add('active');
    }

    // connector
    if (i < 5) {
      const conn = document.getElementById(`connector-${i}-${i + 1}`);
      if (conn) {
        conn.classList.toggle('completed', state.completedSteps.has(i) && i < activeStep);
      }
    }
  }
}

function goToStep(stepNum) {
  if (stepNum > 1 && !state.completedSteps.has(stepNum - 1) && stepNum !== state.currentStep + 1) {
    showToast('前のステップを完了してください');
    return;
  }
  showSection(stepNum);

  if (stepNum === 2 && state.questions.length === 0) loadQuestions();
  if (stepNum === 4 && !state.recommendations) loadRecommendations();
  if (stepNum === 5) renderRoadmap();
}

function navigateTo(section) {
  if (section === 'landing') showSection(0);
}

function startDiagnosis() {
  showSection(1);
}

/* ============ TOAST ============ */

function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ============ STEP 1: COMPANY FORM ============ */

function initCompanyForm() {
  const form = document.getElementById('companyForm');
  if (!form) return;

  // Restore saved values
  if (state.companyInfo.companyName) {
    const f = state.companyInfo;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    setVal('companyName', f.companyName);
    setVal('industry', f.industry);
    setVal('employeeCount', f.employeeCount);
    setVal('position', f.position);
    setVal('budget', f.budget);
    if (f.aiExpectations) {
      document.querySelectorAll('[name="aiExpectations"]').forEach(cb => {
        cb.checked = f.aiExpectations.includes(cb.value);
      });
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateCompanyForm()) return;

    const data = new FormData(form);
    state.companyInfo = {
      companyName: data.get('companyName'),
      industry: data.get('industry'),
      employeeCount: data.get('employeeCount'),
      position: data.get('position'),
      budget: data.get('budget'),
      aiExpectations: [...document.querySelectorAll('[name="aiExpectations"]:checked')].map(c => c.value),
    };
    state.completedSteps.add(1);
    saveState();
    goToStep(2);
  });
}

function validateCompanyForm() {
  let valid = true;
  const required = [
    { id: 'companyName', msg: '会社名を入力してください' },
    { id: 'industry', msg: '業種を選択してください' },
    { id: 'employeeCount', msg: '従業員数を選択してください' },
  ];
  required.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(`error-${id}`);
    if (!el || !errEl) return;
    if (!el.value.trim()) {
      el.classList.add('error');
      errEl.textContent = msg;
      valid = false;
    } else {
      el.classList.remove('error');
      errEl.textContent = '';
    }
  });
  return valid;
}

/* ============ STEP 2: QUESTIONS ============ */

async function loadQuestions() {
  const data = await API.getQuestions();
  state.questions = data.questions || mockQuestions;
  if (state.answers.length === 0) {
    state.answers = new Array(state.questions.length).fill(null);
  }
  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.currentQuestionIndex];
  if (!q) return;

  // Update progress
  const pct = Math.round(((state.currentQuestionIndex + 1) / state.questions.length) * 100);
  document.getElementById('questionProgressFill').style.width = pct + '%';
  document.getElementById('currentQuestionNum').textContent = state.currentQuestionIndex + 1;
  document.getElementById('totalQuestionNum').textContent = state.questions.length;

  // Category separator on first question of new category
  const sep = document.getElementById('categorySeparator');
  if (q.category !== state.currentCategory) {
    state.currentCategory = q.category;
    document.getElementById('categoryBadge').textContent = q.category;
    document.getElementById('categoryTitle').textContent = getCategoryDescription(q.category);
    sep.style.display = 'block';
    setTimeout(() => { sep.style.display = 'none'; }, 2000);
  } else {
    sep.style.display = 'none';
  }

  // Question card
  const card = document.getElementById('questionCard');
  card.classList.remove('slide-out');
  void card.offsetWidth; // reflow

  document.getElementById('questionCategoryTag').textContent = q.category;
  document.getElementById('questionNumber').textContent = `Q.${state.currentQuestionIndex + 1}`;
  document.getElementById('questionText').textContent = q.question;

  // Hide all input types
  ['scaleOptions', 'choiceOptions', 'booleanOptions', 'textOption'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });

  // Show relevant input type
  const saved = state.answers[state.currentQuestionIndex];

  if (q.type === 'scale') {
    document.getElementById('scaleOptions').style.display = 'block';
    document.querySelectorAll('.scale-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === String(saved));
      btn.onclick = () => selectScale(btn.dataset.value);
    });
  } else if (q.type === 'choice') {
    const container = document.getElementById('choiceOptions');
    container.style.display = 'flex';
    container.innerHTML = '';
    (q.options || []).forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn' + (saved === opt ? ' selected' : '');
      btn.dataset.index = String.fromCharCode(65 + idx);
      btn.setAttribute('aria-label', opt);
      btn.textContent = opt;
      btn.onclick = () => selectChoice(opt);
      container.appendChild(btn);
    });
  } else if (q.type === 'boolean') {
    document.getElementById('booleanOptions').style.display = 'flex';
    document.querySelectorAll('.bool-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === saved);
      btn.onclick = () => selectBoolean(btn.dataset.value);
    });
  } else {
    document.getElementById('textOption').style.display = 'block';
    document.getElementById('textAnswer').value = saved || '';
  }

  // Navigation buttons
  const isLast = state.currentQuestionIndex === state.questions.length - 1;
  const allAnswered = state.answers.every(a => a !== null);

  document.getElementById('prevQuestionBtn').disabled = state.currentQuestionIndex === 0;
  document.getElementById('nextQuestionBtn').style.display = isLast ? 'none' : 'inline-flex';
  document.getElementById('submitBtn').style.display = (isLast && allAnswered) ? 'inline-flex' : 'none';
}

function getCategoryDescription(cat) {
  const map = {
    'AI認知・理解度': 'AIへの理解・知識・社内への浸透度を確認します',
    'AI導入経験': '実際のAIツール活用状況・導入フェーズを評価します',
    'AI統合度': 'AIシステムの業務統合・データ連携の深さを測定します',
    'AI最適化': 'AI施策の効果測定と継続的改善の取り組みを評価します',
    'AI変革力': 'AIによるビジネス変革の実現度・将来展望を確認します',
  };
  return map[cat] || cat;
}

function selectScale(value) {
  state.answers[state.currentQuestionIndex] = value;
  document.querySelectorAll('.scale-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.value === value);
  });
  saveState();
  checkSubmitBtn();
  // Auto-advance
  setTimeout(() => { if (state.currentQuestionIndex < state.questions.length - 1) nextQuestion(); }, 400);
}

function selectChoice(value) {
  state.answers[state.currentQuestionIndex] = value;
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent === value);
  });
  saveState();
  checkSubmitBtn();
  setTimeout(() => { if (state.currentQuestionIndex < state.questions.length - 1) nextQuestion(); }, 400);
}

function selectBoolean(value) {
  state.answers[state.currentQuestionIndex] = value;
  document.querySelectorAll('.bool-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.value === value);
  });
  saveState();
  checkSubmitBtn();
  setTimeout(() => { if (state.currentQuestionIndex < state.questions.length - 1) nextQuestion(); }, 400);
}

function checkSubmitBtn() {
  const isLast = state.currentQuestionIndex === state.questions.length - 1;
  const allAnswered = state.answers.every(a => a !== null);
  document.getElementById('submitBtn').style.display = (isLast && allAnswered) ? 'inline-flex' : 'none';
}

function nextQuestion() {
  // Save text answer if active
  const textEl = document.getElementById('textAnswer');
  if (document.getElementById('textOption').style.display !== 'none') {
    state.answers[state.currentQuestionIndex] = textEl.value.trim() || null;
    saveState();
  }
  if (state.answers[state.currentQuestionIndex] === null) {
    showToast('回答を選択してください');
    return;
  }
  if (state.currentQuestionIndex < state.questions.length - 1) {
    const card = document.getElementById('questionCard');
    card.classList.add('slide-out');
    setTimeout(() => {
      state.currentQuestionIndex++;
      saveState();
      renderQuestion();
    }, 300);
  }
}

function prevQuestion() {
  if (state.currentQuestionIndex > 0) {
    const card = document.getElementById('questionCard');
    card.classList.add('slide-out');
    setTimeout(() => {
      state.currentQuestionIndex--;
      saveState();
      renderQuestion();
    }, 300);
  }
}

/* ---- Voice Input ---- */
function initVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const btn = document.getElementById('voiceBtn');
    if (btn) btn.style.display = 'none';
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.continuous = false;
  recognition.interimResults = false;
  state.recognition = recognition;

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    document.getElementById('textAnswer').value = transcript;
    state.answers[state.currentQuestionIndex] = transcript;
    saveState();
  };

  recognition.onend = () => {
    state.isListening = false;
    const btn = document.getElementById('voiceBtn');
    if (btn) btn.classList.remove('listening');
  };

  const btn = document.getElementById('voiceBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (state.isListening) {
        recognition.stop();
      } else {
        recognition.start();
        state.isListening = true;
        btn.classList.add('listening');
      }
    });
  }
}

/* ============ STEP 3: ASSESSMENT ============ */

async function submitAssessment() {
  showSection(3);
  document.getElementById('assessLoading').style.display = 'flex';
  document.getElementById('resultsContent').style.display = 'none';

  // Animate loading bar
  let prog = 0;
  const bar = document.getElementById('loadingBarFill');
  const loadInterval = setInterval(() => {
    prog = Math.min(prog + Math.random() * 15, 90);
    bar.style.width = prog + '%';
  }, 300);

  const result = await API.submitAssessment({
    answers: state.answers,
    questions: state.questions,
    companyInfo: state.companyInfo,
  });

  clearInterval(loadInterval);
  bar.style.width = '100%';

  setTimeout(() => {
    state.assessmentResult = result;
    state.completedSteps.add(2);
    state.completedSteps.add(3);
    saveState();

    document.getElementById('assessLoading').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';
    updateStepIndicator(3);
    renderResults(result);
  }, 600);
}

function renderResults(result) {
  // Company name in subtitle
  if (state.companyInfo.companyName) {
    document.getElementById('resultCompanyName').textContent = `${state.companyInfo.companyName}のAX成熟度スコアです`;
  }

  // Score Gauge
  drawScoreGauge(result.totalScore);

  // Animate score number
  animateCount('scoreNumber', 0, result.totalScore, 1200);

  // Maturity badge
  document.getElementById('maturityLevel').textContent = `Level ${result.level}`;
  document.getElementById('maturityName').textContent = result.levelName;

  // Radar Chart
  drawRadarChart(result.dimensions);

  // Dimension bars
  const grid = document.getElementById('dimensionGrid');
  grid.innerHTML = '';
  Object.values(result.dimensions).forEach(dim => {
    const item = document.createElement('div');
    item.className = 'dimension-item';
    item.innerHTML = `
      <div class="dimension-header">
        <span class="dimension-name">${dim.label}</span>
        <span class="dimension-score-val">${dim.score}</span>
      </div>
      <div class="dimension-bar-track">
        <div class="dimension-bar-fill" style="width:0%; background:${dim.color}" data-target="${dim.score}"></div>
      </div>
    `;
    grid.appendChild(item);
  });
  // Animate bars
  requestAnimationFrame(() => {
    document.querySelectorAll('.dimension-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  });

  // Strengths
  const sl = document.getElementById('strengthsList');
  sl.innerHTML = (result.strengths || []).map(s => `<li>${s}</li>`).join('');

  // Weaknesses
  const wl = document.getElementById('weaknessesList');
  wl.innerHTML = (result.weaknesses || []).map(w => `<li>${w}</li>`).join('');

  // Priority Actions
  const pal = document.getElementById('priorityActionsList');
  pal.innerHTML = (result.priorityActions || []).map((a, i) => `
    <div class="priority-action-item">
      <div class="priority-action-num">${i + 1}</div>
      <div>
        <div class="priority-action-text">${a.title}</div>
        <div class="priority-action-desc">${a.desc || ''}</div>
      </div>
    </div>
  `).join('');
}

function animateCount(elId, from, to, duration) {
  const el = document.getElementById(elId);
  if (!el) return;
  const start = performance.now();
  const update = (now) => {
    const pct = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - pct, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (pct < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ---- Score Gauge (Canvas) ---- */
function drawScoreGauge(score) {
  const canvas = document.getElementById('scoreGauge');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) / 2 - 16;
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const range = endAngle - startAngle;

  let current = 0;
  const target = score / 100;
  const duration = 1200;
  const start = performance.now();

  const color = score >= 81 ? '#10B981' : score >= 61 ? '#3B82F6' : score >= 41 ? '#F59E0B' : '#EF4444';

  function frame(now) {
    const pct = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - pct, 3);
    current = target * eased;

    ctx.clearRect(0, 0, W, H);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Gradient arc
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#1A56DB');
    grad.addColorStop(1, color);

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, startAngle + range * current);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const a = startAngle + range * (i / 10);
      const isMain = i % 2 === 0;
      const inner = r - (isMain ? 26 : 22);
      const outer = r - 8;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
      ctx.strokeStyle = i / 10 <= current ? color : '#CBD5E1';
      ctx.lineWidth = isMain ? 2 : 1;
      ctx.stroke();
    }

    if (pct < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---- Radar Chart (Chart.js) ---- */
function drawRadarChart(dimensions) {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;

  if (state.radarChartInstance) {
    state.radarChartInstance.destroy();
    state.radarChartInstance = null;
  }

  const labels = Object.values(dimensions).map(d => d.label);
  const scores = Object.values(dimensions).map(d => d.score);

  state.radarChartInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'AXスコア',
        data: scores,
        backgroundColor: 'rgba(26,86,219,0.15)',
        borderColor: '#1A56DB',
        borderWidth: 2,
        pointBackgroundColor: scores.map((_, i) => Object.values(dimensions)[i].color),
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
      }],
    },
    options: {
      responsive: true,
      animation: { duration: 1200, easing: 'easeOutCubic' },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { size: 10, family: 'Noto Sans JP' },
            color: '#94A3B8',
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          pointLabels: {
            font: { size: 12, family: 'Noto Sans JP', weight: '600' },
            color: '#1E3A5F',
          },
          angleLines: { color: 'rgba(0,0,0,0.08)' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.r}点`,
          },
        },
      },
    },
  });
}

/* ============ STEP 4: TOOLS ============ */

async function loadRecommendations() {
  const data = await API.getRecommendations({
    assessmentResult: state.assessmentResult,
    companyInfo: state.companyInfo,
  });
  state.tools = data.tools || mockRecommendations;
  state.recommendations = data;
  renderTools();
}

function renderTools() {
  const grid = document.getElementById('toolsGrid');
  if (!grid) return;
  const filtered = state.tools.filter(t => {
    const catMatch = state.currentCategory_tools === 'all' || t.category === state.currentCategory_tools;
    const priceMatch = state.currentPricing === 'all' || t.pricing === state.currentPricing;
    const phaseMatch = t.phase === state.currentPhase;
    return catMatch && priceMatch && phaseMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">該当するツールが見つかりません</div>';
    return;
  }

  grid.innerHTML = filtered.map(t => `
    <div class="tool-card">
      <div class="tool-card-header">
        <div class="tool-icon">${t.icon || '🛠️'}</div>
        <span class="tool-priority-badge ${t.phase}">${phaseLabel(t.phase)}</span>
      </div>
      <div class="tool-name">${t.name}</div>
      <span class="tool-category-tag">${t.category}</span>
      <p class="tool-desc">${t.description}</p>
      <div class="tool-meta">
        <span class="tool-pricing ${t.pricing}">${pricingLabel(t.pricing)}</span>
        <div class="tool-difficulty" title="難易度 ${t.difficulty}/5">
          ${[1,2,3,4,5].map(n => `<div class="tool-difficulty-dot${n <= t.difficulty ? ' filled' : ''}"></div>`).join('')}
        </div>
      </div>
      ${t.url ? `<a href="${t.url}" target="_blank" rel="noopener noreferrer" class="tool-link"><i class="fas fa-external-link-alt"></i> 公式サイトを見る</a>` : ''}
    </div>
  `).join('');
}

function phaseLabel(phase) {
  return { immediate: '即導入可能', short: '短期', long: '長期' }[phase] || phase;
}

function pricingLabel(pricing) {
  return { free: '無料', freemium: 'フリーミアム', paid: '有料', enterprise: 'エンタープライズ' }[pricing] || pricing;
}

function filterTools(category) {
  if (category !== undefined) {
    state.currentCategory_tools = category;
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });
  }
  state.currentPricing = document.getElementById('pricingFilter')?.value || 'all';
  renderTools();
}

function setPhase(phase) {
  state.currentPhase = phase;
  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.phase === phase);
  });
  renderTools();
}

/* ============ STEP 5: ROADMAP ============ */

async function renderRoadmap() {
  if (!state.roadmap) {
    const data = await API.getRoadmap({
      assessmentResult: state.assessmentResult,
      companyInfo: state.companyInfo,
    });
    state.roadmap = data;
    state.completedSteps.add(4);
    state.completedSteps.add(5);
    saveState();
    updateStepIndicator(5);
  }

  // Company name
  if (state.companyInfo.companyName) {
    document.getElementById('roadmapCompanyName').textContent = `${state.companyInfo.companyName}専用のAI Transformationロードマップ`;
  }

  const timeline = document.getElementById('roadmapTimeline');
  if (!timeline) return;
  const phases = state.roadmap.phases || mockRoadmap.phases;

  timeline.innerHTML = phases.map((phase, idx) => `
    <div class="roadmap-phase" style="animation-delay:${idx * 0.1 + 0.1}s">
      <div class="phase-dot">
        <div class="phase-dot-circle">${phase.num}</div>
        <div class="phase-dot-label">${phase.duration}</div>
      </div>
      <div class="phase-card">
        <div class="phase-header">
          <div class="phase-title">${phase.title}</div>
          <div class="phase-duration">${phase.duration}</div>
        </div>
        <div class="phase-content-grid">
          <div class="phase-section">
            <h5>アクション</h5>
            <ul>
              ${(phase.actions || []).map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
          <div class="phase-section">
            <h5>活用ツール</h5>
            <ul>
              ${(phase.tools || []).map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          <div class="phase-section">
            <h5>KPI目標</h5>
            <ul>
              ${(phase.kpis || []).map(k => `<li>${k}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ============ INIT ============ */

function init() {
  const hasSaved = loadState();

  initCompanyForm();
  initVoiceInput();

  // Restore to saved step if any
  if (hasSaved && state.currentStep > 0) {
    showToast(`前回の続き（STEP ${state.currentStep}）から再開します`);
    showSection(state.currentStep);
    if (state.currentStep === 2) loadQuestions();
    if (state.currentStep === 3 && state.assessmentResult) renderResults(state.assessmentResult);
    if (state.currentStep === 4) loadRecommendations();
    if (state.currentStep === 5) renderRoadmap();
  } else {
    showSection(0);
  }

  // Handle browser back button
  window.addEventListener('popstate', () => showSection(0));
}

document.addEventListener('DOMContentLoaded', init);

/* ============================================================
   CLAUDE AI INTEGRATION
   ============================================================ */

// --- ストリーミングレスポンスをSSEで受け取る共通ユーティリティ ---
async function streamFromApi(endpoint, body, onChunk, onDone) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') { onDone?.(); return; }
      try {
        const json = JSON.parse(data);
        if (json.text) onChunk(json.text);
      } catch {}
    }
  }
  onDone?.();
}

// --- Markdown 風テキストを簡易HTMLに変換 ---
function markdownToHtml(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^#{1,3} (.+)$/gm, '<h4 class="ai-heading">$1</h4>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul class="ai-list">${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, (m, p) => p ? `<p>${p}</p>` : '')
    .replace(/<p><\/p>/g, '');
}

/* ---- STEP3: AI 詳細分析 ---- */
async function runAiAnalysis() {
  const btn = document.getElementById('btnAiAnalyze');
  const output = document.getElementById('aiAnalysisOutput');
  if (!state.assessmentResult) return showToast('先に診断を完了してください');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 分析中...';
  output.style.display = 'block';
  output.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';

  let fullText = '';
  try {
    await streamFromApi('/api/ai/analyze',
      { assessmentResult: state.assessmentResult, companyInfo: state.companyInfo },
      (chunk) => {
        fullText += chunk;
        output.innerHTML = markdownToHtml(fullText);
        output.scrollTop = output.scrollHeight;
      },
      () => {
        btn.innerHTML = '<i class="fas fa-redo"></i> 再分析';
        btn.disabled = false;
      }
    );
  } catch (e) {
    output.innerHTML = '<p class="ai-error">分析に失敗しました。APIキーを確認してください。</p>';
    btn.innerHTML = '<i class="fas fa-sparkles"></i> AI詳細分析を開始';
    btn.disabled = false;
  }
}

/* ---- ツールカードの AI 説明ボタン ---- */
async function showToolDetail(toolId) {
  const tool = (state.tools || []).find(t => t.id === toolId);
  if (!tool) return;
  const modal = document.getElementById('toolDetailModal') || createToolDetailModal();
  const modalBody = modal.querySelector('.modal-body');
  modalBody.innerHTML = `
    <h3>${tool.name}</h3>
    <p>${tool.description}</p>
    <div class="ai-stream-output" id="toolDetailOutput">
      <div class="ai-typing"><span></span><span></span><span></span></div>
    </div>`;
  modal.style.display = 'flex';

  let fullText = '';
  try {
    await streamFromApi('/api/ai/recommend-detail',
      { tool, assessmentResult: state.assessmentResult, companyInfo: state.companyInfo },
      (chunk) => {
        fullText += chunk;
        document.getElementById('toolDetailOutput').innerHTML = markdownToHtml(fullText);
      },
      () => {}
    );
  } catch {
    document.getElementById('toolDetailOutput').innerHTML = '<p class="ai-error">詳細情報の取得に失敗しました</p>';
  }
}

function createToolDetailModal() {
  const modal = document.createElement('div');
  modal.id = 'toolDetailModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" onclick="document.getElementById('toolDetailModal').style.display='none'">
        <i class="fas fa-times"></i>
      </button>
      <div class="modal-body"></div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  return modal;
}

/* ---- チャット機能 ---- */
let chatHistory = [];
let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  const widget = document.getElementById('chatWidget');
  const fab = document.getElementById('chatFab');
  const chevron = document.getElementById('chatChevron');
  widget.classList.toggle('chat-open', chatOpen);
  fab.style.display = chatOpen ? 'none' : 'flex';
  if (chatOpen) {
    chevron.className = 'fas fa-chevron-down';
    document.getElementById('chatInput')?.focus();
  } else {
    chevron.className = 'fas fa-chevron-up';
  }
}

function useSuggestion(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}

function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChat();
  }
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.disabled = true;
  document.getElementById('chatSendBtn').disabled = true;

  // サジェストを非表示
  document.getElementById('chatSuggestions').style.display = 'none';

  // ユーザーメッセージ表示
  appendChatMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  // アシスタント応答領域
  const msgEl = appendChatMessage('assistant', '');
  const bubble = msgEl.querySelector('.message-bubble');
  bubble.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';

  let fullText = '';
  try {
    await streamFromApi('/api/ai/chat',
      {
        messages: chatHistory,
        assessmentResult: state.assessmentResult,
        companyInfo: state.companyInfo
      },
      (chunk) => {
        fullText += chunk;
        bubble.innerHTML = markdownToHtml(fullText);
        document.getElementById('chatMessages').scrollTop = 999999;
      },
      () => {
        chatHistory.push({ role: 'assistant', content: fullText });
        input.disabled = false;
        document.getElementById('chatSendBtn').disabled = false;
        input.focus();
      }
    );
  } catch {
    bubble.innerHTML = '<span class="ai-error">エラーが発生しました。しばらくしてから再試行してください。</span>';
    input.disabled = false;
    document.getElementById('chatSendBtn').disabled = false;
  }
}

function appendChatMessage(role, text) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-message ${role}`;
  div.innerHTML = `<div class="message-bubble">${text ? markdownToHtml(text) : ''}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}
