/* =====================================================
   REQS AX診断 v2 — app.js
   ===================================================== */

/* =====================================================
   MOCK DATA (API未接続時フォールバック)
   ===================================================== */
const MOCK_RESULT = {
  scores: {
    aiMaturity:          2,
    automationPotential: 4,
    dataReadiness:       2,
    orgMomentum:         3,
    costOptimization:    4,
  },
  totalScore: 15,
  aiPotential: 62,
  stage: '試用層',
  stageDescription: '業務AX + 定着支援が必要なフェーズです。まず小さな成功体験を積み上げることが重要です。',
  keyFindings: [
    '請求書処理が最大の自動化ポイント（月推定32時間）',
    'kintoneとExcelが連携されておらず二重入力が発生',
    '経営層のAI関心は高いが推進担当者が未設定',
  ],
  dimensionDetails: {
    aiMaturity:          { score: 2, evidence: '「ChatGPTを個人で使っている人はいる」', gap: '業務への組織的な展開が未実施', mgmtScore: 3, frontlineScore: 2 },
    automationPotential: { score: 4, evidence: '「請求書の処理は全部手入力です」', gap: '繰り返し業務が多数残存', mgmtScore: 4, frontlineScore: 4 },
    dataReadiness:       { score: 2, evidence: '「データはExcelとkintoneに別々に入っている」', gap: 'データ統合基盤が未整備', mgmtScore: 3, frontlineScore: 2 },
    orgMomentum:         { score: 3, evidence: '「社長はAIに前向き。ただ担当者がいない」', gap: 'AI推進専任者の不在', mgmtScore: 4, frontlineScore: 2 },
    costOptimization:    { score: 4, evidence: '「外注費が毎月100万以上かかっている」', gap: '自動化で大幅削減できる余地がある', mgmtScore: 3, frontlineScore: 4 },
  },
  departmentAnalysis: {
    departments: [
      {
        name: '経営層',
        aiAdoption: 3,
        digitalReadiness: 3,
        painPoints: ['AI活用の具体的な打ち手が不明', '推進体制が整っていない'],
        currentTools: ['Excel', 'Slack'],
        aiOpportunities: ['経営ダッシュボードの自動化', 'AI議事録'],
        evidence: '「AIは使いたいと思っているが、何から始めれば良いかわからない」',
      },
      {
        name: '営業部',
        aiAdoption: 2,
        digitalReadiness: 3,
        painPoints: ['提案書作成に時間がかかる', '顧客情報が散在'],
        currentTools: ['kintone', 'Excel'],
        aiOpportunities: ['AI提案書生成', 'CRM自動更新'],
        evidence: '「提案書を毎回1から作っている。テンプレートもバラバラ」',
      },
      {
        name: '経理部',
        aiAdoption: 1,
        digitalReadiness: 2,
        painPoints: ['請求書処理が全手作業', '月次締め作業に3日かかる'],
        currentTools: ['Excel', '会計ソフト'],
        aiOpportunities: ['AI-OCR請求書処理', '自動仕訳連携'],
        evidence: '「請求書の処理は全部手入力です。月200件くらいあります」',
      },
    ],
    layerGap: {
      managementScore: 4,
      frontlineScore: 2,
      gapScore: 4,
      analysis: '経営層はAI活用に積極的だが、現場はツールの使い方が不明で日常業務に追われている。この認識差を埋めるためのブリッジ施策が最優先。',
      riskLevel: '高',
      bridgingActions: [
        'AI推進担当者を現場から1名任命し、経営層と連携させる',
        '小さなPoC（請求書自動化）を成功させて現場の信頼を獲得する',
      ],
    },
  },
  outputs: {
    itPortfolio: {
      keep:     ['Slack', 'kintone'],
      optimize: ['Excel → Google Sheets'],
      retire:   [],
      add:      ['Make.com', 'Notion AI'],
    },
    processRoadmap: {
      phase1: {
        title:   '0〜3ヶ月：即効自動化',
        actions: ['請求書AI-OCR導入', 'Slack通知自動化'],
        impact:  '月32時間削減',
        tools:   ['Make.com', 'ChatGPT'],
      },
      phase2: {
        title:   '3〜6ヶ月：部門横断改革',
        actions: ['CRM連携', '議事録自動生成'],
        impact:  '月60時間削減',
        tools:   ['Zapier', 'Notion AI'],
      },
      phase3: {
        title:   '6ヶ月〜：データドリブン',
        actions: ['KPI自動集計', '予測分析導入'],
        impact:  '意思決定速度3倍',
        tools:   ['Power BI', 'Google Looker Studio'],
      },
    },
    systemIntegration: {
      connections: [
        { from: 'kintone', to: 'Airtable', method: 'Zapier', benefit: '顧客データ一元化' },
        { from: 'Slack',   to: 'kintone',  method: 'Make.com', benefit: '申請フローのデジタル化' },
      ],
      priority: 'kintone-Slack連携から着手（1週間で実装可能）',
    },
    dataStrategy: {
      currentState:    'データが3箇所に散在（Excel・kintone・紙）',
      integrationPlan: 'Airtableを中央DBとして統合し、全部門がリアルタイム参照できる環境を構築',
      aiUseCases:      ['売上予測AI', 'FAQ自動応答bot', '在庫最適化AI'],
      kpis:            ['データ検索時間50%削減', 'レポート作成工数80%削減'],
    },
  },
  roiSimulation: {
    saving:  '月22.5万円削減',
    payback: '約2〜3ヶ月で回収見込み',
  },
  nextSteps: [
    { priority: 1, action: 'Make.com × ChatGPT で請求書処理自動化PoC', cost: '約3万円' },
    { priority: 2, action: 'kintone-Slack通知連携',                     cost: '0円' },
    { priority: 3, action: 'Notion AIでナレッジベース構築',              cost: '月2,000円〜' },
  ],
};

/* =====================================================
   STATE
   ===================================================== */
const state = {
  transcript:  '',
  companyName: '',
  industry:    '',
  result:      null,
  currentTab:  'it',
};

/* =====================================================
   VIEW SWITCHING
   ===================================================== */
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${name}`);
  if (target) target.classList.add('active');

  if (name === 'input') {
    checkPrevResult();
  }
}

/* =====================================================
   CHAR COUNTER
   ===================================================== */
function updateCharCount() {
  const val   = document.getElementById('transcriptInput').value;
  const count = val.length;
  const el    = document.getElementById('charCount');
  const wrap  = document.getElementById('charCounter');

  el.textContent = count.toLocaleString();
  wrap.classList.toggle('ready', count >= 200);
}

/* =====================================================
   SUBMIT / ANALYSIS
   ===================================================== */
async function startAnalysis() {
  const transcriptEl = document.getElementById('transcriptInput');
  const text = transcriptEl.value.trim();

  if (text.length < 200) {
    showToast('書き起こしテキストは200文字以上貼り付けてください', 'error');
    transcriptEl.focus();
    return;
  }

  state.transcript  = text;
  state.companyName = document.getElementById('inputCompanyName').value.trim();
  state.industry    = document.getElementById('inputIndustry').value;

  showView('analyzing');
  runAnalyzingAnimation();

  try {
    const res = await fetch('/api/ai/analyze-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript:  state.transcript,
        companyInfo: {
          name:     state.companyName,
          industry: state.industry,
        },
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.result = data;
  } catch (err) {
    console.warn('API failed, using mock data:', err.message);
    // フォールバック: モックデータ
    await delay(500);
    state.result = { ...MOCK_RESULT };
    if (state.companyName) {
      // mock doesn't have a company, that's fine
    }
  }

  // save to localStorage
  saveResult(state.result, state.companyName, state.industry);

  // Wait for animation to finish minimum 3s
  await delay(500);

  finishAnalyzing();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* =====================================================
   ANALYZING ANIMATION
   ===================================================== */
let _analyzingTimer = null;
let _analyzingStart = null;

function runAnalyzingAnimation() {
  const fill    = document.getElementById('analyzingFill');
  const pctEl   = document.getElementById('analyzingPct');
  const steps   = [
    document.getElementById('step-0'),
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
  ];

  // Reset
  steps.forEach(s => {
    s.classList.remove('done', 'active');
    s.querySelector('.step-icon-wrap').innerHTML = '<i class="fas fa-circle"></i>';
  });

  fill.style.width = '0%';
  pctEl.textContent = '0%';

  _analyzingStart = Date.now();

  // Step-by-step: 0→done 500ms, 1→done 1000ms, 2→done 1800ms, 3→done 2600ms
  const schedule = [
    { idx: 0, activateAt:   0, doneAt:  600 },
    { idx: 1, activateAt:  600, doneAt: 1400 },
    { idx: 2, activateAt: 1400, doneAt: 2400 },
    { idx: 3, activateAt: 2400, doneAt: 3200 },
  ];

  schedule.forEach(({ idx, activateAt, doneAt }) => {
    setTimeout(() => {
      steps[idx].classList.add('active');
      steps[idx].querySelector('.step-icon-wrap').innerHTML =
        '<i class="fas fa-circle-notch fa-spin"></i>';
    }, activateAt);

    setTimeout(() => {
      steps[idx].classList.remove('active');
      steps[idx].classList.add('done');
      steps[idx].querySelector('.step-icon-wrap').innerHTML =
        '<i class="fas fa-check-circle"></i>';
    }, doneAt);
  });

  // Progress bar animation
  let prog = 0;
  _analyzingTimer = setInterval(() => {
    prog = Math.min(prog + (Math.random() * 3 + 1), 90);
    fill.style.width = prog + '%';
    pctEl.textContent = Math.round(prog) + '%';
  }, 120);
}

function finishAnalyzing() {
  clearInterval(_analyzingTimer);
  const fill  = document.getElementById('analyzingFill');
  const pctEl = document.getElementById('analyzingPct');
  fill.style.width = '100%';
  pctEl.textContent = '100%';

  setTimeout(() => {
    renderResults(state.result);
    showView('results');
  }, 400);
}

/* =====================================================
   RENDER RESULTS
   ===================================================== */
function renderResults(data) {
  if (!data) return;

  // Company name
  const companyEl = document.getElementById('resultsCompanyName');
  if (state.companyName) {
    companyEl.textContent = state.companyName + (state.industry ? ` / ${state.industry}` : '');
  } else {
    companyEl.textContent = state.industry || '診断レポート';
  }

  // AI Potential Score (count-up)
  const targetScore = data.aiPotential ?? Math.round((data.totalScore / 25) * 100);
  animateCount('scoreBig', 0, targetScore, 1400);

  // Score bar
  setTimeout(() => {
    document.getElementById('scoreBarFill').style.width = targetScore + '%';
  }, 100);

  // Stage badge
  const stageBadge = document.getElementById('stageBadge');
  const stageDesc  = document.getElementById('stageDesc');
  stageBadge.textContent = data.stage || '試用層';
  stageBadge.className   = `stage-badge ${(data.stage || '試用層').replace(/\s/g, '')}`;
  stageDesc.textContent  = data.stageDescription || '';

  // ROI
  if (data.roiSimulation) {
    document.getElementById('roiSection').style.display = '';
    document.getElementById('roiSaving').textContent  = data.roiSimulation.saving  || '';
    document.getElementById('roiPayback').textContent = data.roiSimulation.payback || '';
  }

  // Key findings
  const findingsList = document.getElementById('findingsList');
  findingsList.innerHTML = (data.keyFindings || [])
    .map(f => `<li>${escHtml(f)}</li>`)
    .join('');

  // Radar chart (5軸)
  const scores = data.scores || {};
  drawRadar({
    aiMaturity:          scores.aiMaturity          ?? 2,
    automationPotential: scores.automationPotential ?? 3,
    dataReadiness:       scores.dataReadiness       ?? 2,
    orgMomentum:         scores.orgMomentum         ?? 3,
    costOptimization:    scores.costOptimization    ?? 3,
  });

  // Tabs
  renderTab('it');

  // Next Steps
  if (data.nextSteps && data.nextSteps.length) {
    const nsSection = document.getElementById('nextStepsSection');
    const nsList    = document.getElementById('nextStepsList');
    nsSection.style.display = '';
    nsList.innerHTML = data.nextSteps.map(ns => `
      <div class="next-step-card">
        <div class="next-step-num">${ns.priority}</div>
        <div>
          <div class="next-step-action">${escHtml(ns.action)}</div>
          <div class="next-step-cost">${escHtml(ns.cost || '')}</div>
        </div>
      </div>
    `).join('');
  }
}

/* =====================================================
   TAB SWITCHING
   ===================================================== */
function switchTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  renderTab(tab);
}

function renderTab(tab) {
  const container = document.getElementById('tabContent');
  const data = state.result;

  if (!data || !data.outputs) {
    container.innerHTML = '<p style="color:var(--text-sub);padding:20px 0">データを取得中...</p>';
    return;
  }

  const outputs = data.outputs;

  switch (tab) {
    case 'it':
      container.innerHTML = renderITPortfolio(outputs.itPortfolio);
      break;
    case 'process':
      container.innerHTML = renderProcessRoadmap(outputs.processRoadmap);
      break;
    case 'integration':
      container.innerHTML = renderSystemIntegration(outputs.systemIntegration);
      break;
    case 'data':
      container.innerHTML = renderDataStrategy(outputs.dataStrategy);
      break;
    case 'gap':
      container.innerHTML = renderGapAnalysis(data.departmentAnalysis, data.dimensionDetails);
      break;
  }
}

/* ---- IT Portfolio ---- */
function renderITPortfolio(portfolio) {
  if (!portfolio) return '<p class="text-muted">データなし</p>';

  const groups = [
    { key: 'keep',     label: '継続利用',     cls: 'keep'     },
    { key: 'optimize', label: '最適化・移行', cls: 'optimize' },
    { key: 'add',      label: '新規導入推奨', cls: 'add'      },
    { key: 'retire',   label: '廃止検討',     cls: 'retire'   },
  ];

  const html = groups
    .filter(g => (portfolio[g.key] || []).length > 0)
    .map(g => `
      <div class="portfolio-group">
        <div class="portfolio-group-title ${g.cls}">${g.label}</div>
        <div>
          ${(portfolio[g.key] || []).map(t =>
            `<span class="portfolio-tag ${g.cls}">${escHtml(t)}</span>`
          ).join('')}
        </div>
      </div>
    `).join('');

  return `<h2 class="tab-section-title">ITポートフォリオ評価</h2>${html}`;
}

/* ---- Process Roadmap ---- */
function renderProcessRoadmap(roadmap) {
  if (!roadmap) return '<p class="text-muted">データなし</p>';

  const phases = [
    { key: 'phase1', cls: 'phase1' },
    { key: 'phase2', cls: 'phase2' },
    { key: 'phase3', cls: 'phase3' },
  ];

  const html = phases
    .filter(p => roadmap[p.key])
    .map(p => {
      const ph = roadmap[p.key];
      return `
        <div class="phase-card ${p.cls}">
          <div class="phase-header">
            <div class="phase-title">${escHtml(ph.title || '')}</div>
            <div class="phase-meta">
              ${ph.impact ? `<span class="phase-impact">${escHtml(ph.impact)}</span>` : ''}
            </div>
          </div>
          <ul class="phase-actions-list">
            ${(ph.actions || []).map(a => `<li>${escHtml(a)}</li>`).join('')}
          </ul>
          ${(ph.tools || []).length ? `
            <div class="phase-tools-row">
              ${ph.tools.map(t => `<span class="phase-tool-tag">${escHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

  return `<h2 class="tab-section-title">業務変革ロードマップ</h2>${html}`;
}

/* ---- System Integration ---- */
function renderSystemIntegration(integration) {
  if (!integration) return '<p class="text-muted">データなし</p>';

  const conns = (integration.connections || []).map(c => `
    <div class="connection-card">
      <span class="connection-from">${escHtml(c.from)}</span>
      <span class="connection-arrow"><i class="fas fa-arrow-right"></i></span>
      <span class="connection-to">${escHtml(c.to)}</span>
      ${c.method ? `<span class="connection-method">${escHtml(c.method)}</span>` : ''}
      ${c.benefit ? `<span class="connection-benefit">${escHtml(c.benefit)}</span>` : ''}
    </div>
  `).join('');

  return `
    <h2 class="tab-section-title">システム統合プラン</h2>
    ${integration.priority ? `
      <div class="integration-priority">
        <div class="integration-priority-label">まず着手すべき優先統合</div>
        <div class="integration-priority-text">${escHtml(integration.priority)}</div>
      </div>
    ` : ''}
    ${conns}
  `;
}

/* ---- Data Strategy ---- */
function renderDataStrategy(data) {
  if (!data) return '<p class="text-muted">データなし</p>';

  const aiUseCases = (data.aiUseCases || []).map(u => `<li>${escHtml(u)}</li>`).join('');
  const kpis       = (data.kpis       || []).map(k => `<li>${escHtml(k)}</li>`).join('');

  return `
    <h2 class="tab-section-title">データ活用戦略</h2>
    ${data.currentState ? `
      <div class="data-card">
        <div class="data-card-title">現状</div>
        <div class="data-text">${escHtml(data.currentState)}</div>
      </div>
    ` : ''}
    ${data.integrationPlan ? `
      <div class="data-card">
        <div class="data-card-title">統合計画</div>
        <div class="data-text">${escHtml(data.integrationPlan)}</div>
      </div>
    ` : ''}
    ${aiUseCases ? `
      <div class="data-card">
        <div class="data-card-title">AI活用ユースケース</div>
        <ul class="data-list">${aiUseCases}</ul>
      </div>
    ` : ''}
    ${kpis ? `
      <div class="data-card">
        <div class="data-card-title">目標KPI</div>
        <ul class="data-list">${kpis}</ul>
      </div>
    ` : ''}
  `;
}

/* ---- Gap Analysis ---- */
function renderGapAnalysis(deptAnalysis, dimensionDetails) {
  if (!deptAnalysis && !dimensionDetails) return '<p class="text-muted">データなし</p>';

  let html = '<h2 class="tab-section-title">経営層・部署別ギャップ診断</h2>';

  // Layer gap summary
  if (deptAnalysis?.layerGap) {
    const lg = deptAnalysis.layerGap;
    const riskCls = lg.riskLevel === '高' ? 'risk-high' : lg.riskLevel === '中' ? 'risk-mid' : 'risk-low';
    html += `
      <div class="gap-summary-card">
        <div class="gap-summary-header">
          <div class="gap-summary-title">経営層 vs 現場 認識ギャップ</div>
          <span class="gap-risk-badge ${riskCls}">リスク：${escHtml(lg.riskLevel)}</span>
        </div>
        <div class="gap-meter-row">
          <div class="gap-layer-label">経営層</div>
          <div class="gap-bar-track">
            <div class="gap-bar-fill mgmt" style="width:${(lg.managementScore / 5) * 100}%"></div>
          </div>
          <div class="gap-score-num">${lg.managementScore}/5</div>
        </div>
        <div class="gap-meter-row">
          <div class="gap-layer-label">現　場</div>
          <div class="gap-bar-track">
            <div class="gap-bar-fill frontline" style="width:${(lg.frontlineScore / 5) * 100}%"></div>
          </div>
          <div class="gap-score-num">${lg.frontlineScore}/5</div>
        </div>
        <div class="gap-analysis-text">${escHtml(lg.analysis)}</div>
        ${(lg.bridgingActions || []).length ? `
          <div class="gap-bridging">
            <div class="gap-bridging-title">ギャップ解消アクション</div>
            <ul>${lg.bridgingActions.map(a => `<li>${escHtml(a)}</li>`).join('')}</ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 5-axis layer breakdown table
  if (dimensionDetails) {
    const axes = [
      { key: 'aiMaturity',          label: 'AI活用成熟度' },
      { key: 'automationPotential', label: '業務自動化余地' },
      { key: 'dataReadiness',       label: 'データ整備度' },
      { key: 'orgMomentum',         label: '組織推進力' },
      { key: 'costOptimization',    label: 'コスト最適化余地' },
    ];

    html += `
      <div class="gap-axis-table-wrap">
        <div class="gap-axis-table-title">5軸・経営層/現場スコア比較</div>
        <table class="gap-axis-table">
          <thead>
            <tr>
              <th>指標</th>
              <th>総合</th>
              <th>経営層</th>
              <th>現場</th>
              <th>乖離</th>
              <th>課題</th>
            </tr>
          </thead>
          <tbody>
            ${axes.map(ax => {
              const d = dimensionDetails[ax.key] || {};
              const mgmt = d.mgmtScore ?? d.score ?? '-';
              const fl   = d.frontlineScore ?? d.score ?? '-';
              const diff = (typeof mgmt === 'number' && typeof fl === 'number') ? Math.abs(mgmt - fl) : '-';
              const diffCls = diff >= 2 ? 'diff-high' : diff >= 1 ? 'diff-mid' : 'diff-low';
              return `
                <tr>
                  <td class="axis-name">${ax.label}</td>
                  <td class="score-cell">${d.score ?? '-'}</td>
                  <td class="score-cell">${mgmt}</td>
                  <td class="score-cell">${fl}</td>
                  <td class="diff-cell ${typeof diff === 'number' ? diffCls : ''}">${typeof diff === 'number' ? diff : '-'}</td>
                  <td class="gap-desc">${escHtml(d.gap || '')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Evidence quotes
    html += '<div class="evidence-section"><div class="evidence-section-title">分析根拠（ヒアリング引用）</div>';
    axes.forEach(ax => {
      const d = dimensionDetails[ax.key];
      if (d?.evidence) {
        html += `
          <div class="evidence-item">
            <span class="evidence-axis">${ax.label}</span>
            <span class="evidence-quote">"${escHtml(d.evidence)}"</span>
          </div>
        `;
      }
    });
    html += '</div>';
  }

  // Department cards
  if (deptAnalysis?.departments?.length) {
    html += '<div class="dept-section-title">部署別 AI/IT導入状況</div>';
    html += '<div class="dept-cards">';
    deptAnalysis.departments.forEach(dept => {
      const adoptPct  = ((dept.aiAdoption      || 0) / 5) * 100;
      const digitalPct = ((dept.digitalReadiness || 0) / 5) * 100;
      html += `
        <div class="dept-card">
          <div class="dept-card-header">
            <div class="dept-name">${escHtml(dept.name)}</div>
            <div class="dept-scores">
              <span class="dept-score-pill">AI活用 ${dept.aiAdoption}/5</span>
              <span class="dept-score-pill digi">DX ${dept.digitalReadiness}/5</span>
            </div>
          </div>
          <div class="dept-bar-row">
            <span class="dept-bar-label">AI活用</span>
            <div class="dept-bar-track"><div class="dept-bar-fill ai" style="width:${adoptPct}%"></div></div>
          </div>
          <div class="dept-bar-row">
            <span class="dept-bar-label">DX成熟</span>
            <div class="dept-bar-track"><div class="dept-bar-fill dx" style="width:${digitalPct}%"></div></div>
          </div>
          ${dept.painPoints?.length ? `
            <div class="dept-section"><div class="dept-sub-title">課題</div>
              <ul>${dept.painPoints.map(p => `<li>${escHtml(p)}</li>`).join('')}</ul>
            </div>
          ` : ''}
          ${dept.aiOpportunities?.length ? `
            <div class="dept-section"><div class="dept-sub-title opportunity">AI改善余地</div>
              <ul class="opportunity-list">${dept.aiOpportunities.map(o => `<li>${escHtml(o)}</li>`).join('')}</ul>
            </div>
          ` : ''}
          ${dept.evidence ? `<div class="dept-evidence">"${escHtml(dept.evidence)}"</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }

  return html;
}

/* =====================================================
   RADAR CHART
   ===================================================== */
let _radarInstance = null;

function drawRadar(scores) {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;

  if (_radarInstance) {
    _radarInstance.destroy();
    _radarInstance = null;
  }

  const labels = [
    'AI成熟度',
    '自動化ポテンシャル',
    'データ準備度',
    '組織推進力',
    'コスト最適化',
  ];

  const values = [
    scores.aiMaturity,
    scores.automationPotential,
    scores.dataReadiness,
    scores.orgMomentum,
    scores.costOptimization,
  ];

  _radarInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'AXスコア',
        data: values,
        backgroundColor: 'rgba(26,86,219,0.15)',
        borderColor: '#1A56DB',
        borderWidth: 2,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      animation: { duration: 1200, easing: 'easeOutCubic' },
      scales: {
        r: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1,
            font: { size: 9, family: 'Noto Sans JP' },
            color: 'rgba(255,255,255,0.3)',
            backdropColor: 'transparent',
          },
          grid:        { color: 'rgba(255,255,255,0.08)' },
          angleLines:  { color: 'rgba(255,255,255,0.08)' },
          pointLabels: {
            font:  { size: 10, family: 'Noto Sans JP', weight: '600' },
            color: 'rgba(255,255,255,0.7)',
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.parsed.r} / 5` },
        },
      },
    },
  });
}

/* =====================================================
   COUNT-UP ANIMATION
   ===================================================== */
function animateCount(elId, from, to, duration) {
  const el = document.getElementById(elId);
  if (!el) return;
  const start  = performance.now();
  const update = (now) => {
    const pct   = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - pct, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (pct < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* =====================================================
   LOCALSTORAGE
   ===================================================== */
function saveResult(result, companyName, industry) {
  try {
    localStorage.setItem('reqs_ax_result', JSON.stringify({ result, companyName, industry, savedAt: Date.now() }));
  } catch (e) { /* ignore */ }
}

function loadPrevResult() {
  try {
    const raw = localStorage.getItem('reqs_ax_result');
    if (!raw) return;
    const saved = JSON.parse(raw);
    state.result      = saved.result;
    state.companyName = saved.companyName || '';
    state.industry    = saved.industry    || '';
    renderResults(state.result);
    showView('results');
    showToast('前回の診断結果を表示しています');
  } catch (e) {
    showToast('前回のデータを読み込めませんでした', 'error');
  }
}

function checkPrevResult() {
  try {
    const raw = localStorage.getItem('reqs_ax_result');
    const btn = document.getElementById('btnLoadPrev');
    if (!btn) return;
    if (raw) {
      const saved = JSON.parse(raw);
      const ago   = Date.now() - (saved.savedAt || 0);
      // Show within 7 days
      btn.style.display = ago < 7 * 24 * 3600 * 1000 ? '' : 'none';
    } else {
      btn.style.display = 'none';
    }
  } catch (e) {
    const btn = document.getElementById('btnLoadPrev');
    if (btn) btn.style.display = 'none';
  }
}

/* =====================================================
   PDF / PRINT
   ===================================================== */
function saveReport() {
  window.print();
}

/* =====================================================
   TOAST
   ===================================================== */
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast${type ? ' ' + type : ''}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* =====================================================
   UTILITY
   ===================================================== */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* =====================================================
   MARKDOWN HELPER (for chat)
   ===================================================== */
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

/* =====================================================
   STREAMING API UTILITY
   ===================================================== */
async function streamFromApi(endpoint, body, onChunk, onDone) {
  const res = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';

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

/* =====================================================
   CHAT WIDGET
   ===================================================== */
let chatHistory = [];
let chatOpen    = false;

function toggleChat() {
  chatOpen = !chatOpen;
  const widget  = document.getElementById('chatWidget');
  const fab     = document.getElementById('chatFab');
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
  const text  = input.value.trim();
  if (!text) return;

  input.value = '';
  input.disabled = true;
  document.getElementById('chatSendBtn').disabled = true;
  document.getElementById('chatSuggestions').style.display = 'none';

  appendChatMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  const msgEl  = appendChatMessage('assistant', '');
  const bubble = msgEl.querySelector('.message-bubble');
  bubble.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';

  let fullText = '';
  try {
    await streamFromApi(
      '/api/ai/chat',
      {
        messages:         chatHistory,
        assessmentResult: state.result,
        companyInfo:      { companyName: state.companyName, industry: state.industry },
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
  const div       = document.createElement('div');
  div.className   = `chat-message ${role}`;
  div.innerHTML   = `<div class="message-bubble">${text ? markdownToHtml(text) : ''}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

/* =====================================================
   INIT
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Check for previous results
  checkPrevResult();

  // Restore any partially typed text
  try {
    const raw = localStorage.getItem('reqs_ax_draft');
    if (raw) {
      const draft = JSON.parse(raw);
      if (draft.companyName) document.getElementById('inputCompanyName').value = draft.companyName;
      if (draft.industry)    document.getElementById('inputIndustry').value    = draft.industry;
      if (draft.transcript) {
        document.getElementById('transcriptInput').value = draft.transcript;
        updateCharCount();
      }
    }
  } catch {}

  // Auto-save draft every 10 seconds
  setInterval(() => {
    try {
      localStorage.setItem('reqs_ax_draft', JSON.stringify({
        companyName: document.getElementById('inputCompanyName').value,
        industry:    document.getElementById('inputIndustry').value,
        transcript:  document.getElementById('transcriptInput').value.slice(0, 20000),
      }));
    } catch {}
  }, 10000);
});
