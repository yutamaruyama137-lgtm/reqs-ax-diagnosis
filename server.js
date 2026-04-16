'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const assessmentRouter = require('./routes/assessment');
const toolsRouter = require('./routes/tools');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

// ---------- ミドルウェア ----------
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 静的ファイル配信
app.use(express.static(path.join(__dirname, 'public')));

// ---------- ヘルスチェック ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ---------- ルーティング ----------
app.use('/api', assessmentRouter);
app.use('/api', toolsRouter);
app.use('/api/ai', aiRouter);

// ---------- SPA フォールバック ----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/step/:stepNumber', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- 404 ハンドラ ----------
app.use((req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません', code: 'NOT_FOUND' });
});

// ---------- グローバルエラーハンドラ ----------
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'サーバーエラーが発生しました',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { detail: err.message })
  });
});

// ---------- 起動 ----------
app.listen(PORT, () => {
  console.log(`REQS AX診断サーバー起動中: http://localhost:${PORT}`);
  console.log(`API一覧:`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/questions`);
  console.log(`  POST /api/assess`);
  console.log(`  GET  /api/tools`);
  console.log(`  POST /api/recommend`);
  console.log(`  POST /api/roadmap`);
  console.log(`  POST /api/ai/analyze    ← Claude: 診断結果の詳細分析（ストリーミング）`);
  console.log(`  POST /api/ai/chat       ← Claude: チャット（会話履歴付き）`);
  console.log(`  POST /api/ai/recommend-detail ← Claude: ツール選定の詳細説明`);
  console.log(`  POST /api/ai/roadmap-detail   ← Claude: ロードマップ深掘り`);
});

module.exports = app;
