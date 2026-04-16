# AX診断 データスキーマ定義（インターフェース契約）

## questions.json スキーマ
```json
{
  "questions": [
    {
      "id": "q001",
      "category": "AI認知・理解度",
      "subcategory": "基礎知識",
      "question": "質問テキスト",
      "type": "scale|choice|boolean|text",
      "options": ["選択肢1", "選択肢2"],
      "weight": 1.0,
      "tags": ["ai_literacy", "foundation"],
      "axDimension": "awareness|adoption|integration|optimization|transformation"
    }
  ]
}
```

## ai_tools.json スキーマ
```json
{
  "tools": [
    {
      "id": "t001",
      "name": "ツール名",
      "category": "文書生成|画像生成|コード生成|業務自動化|データ分析|コミュニケーション|CRM|マーケティング|HR|会計",
      "useCase": ["use case 1", "use case 2"],
      "description": "説明",
      "url": "https://...",
      "pricing": "free|freemium|paid|enterprise",
      "tags": ["tag1", "tag2"],
      "minAxScore": 0,
      "targetIndustries": ["製造", "小売"],
      "recommendedFor": ["中小企業", "大企業"],
      "axDimension": "awareness|adoption|integration|optimization|transformation"
    }
  ]
}
```

## スコアリング次元（AX成熟度モデル）
- **Dimension 1**: AI認知・理解度 (awareness) - 20%
- **Dimension 2**: AI導入経験 (adoption) - 20%  
- **Dimension 3**: AI統合度 (integration) - 20%
- **Dimension 4**: AI最適化 (optimization) - 20%
- **Dimension 5**: AI変革力 (transformation) - 20%

## AX成熟度レベル
- Level 1 (0-20): 入門期 - AIをほぼ使っていない
- Level 2 (21-40): 探索期 - 一部で試験的に利用
- Level 3 (41-60): 導入期 - 特定業務に本格導入
- Level 4 (61-80): 統合期 - 複数業務に統合・自動化
- Level 5 (81-100): 変革期 - AI中心の業務設計が完成

## API エンドポイント
- GET /api/questions - 質問一覧取得
- POST /api/assess - 回答送信 → スコア計算
- GET /api/tools - ツール一覧取得
- POST /api/recommend - スコアに基づくツールレコメンド
- POST /api/roadmap - AXロードマップ生成
