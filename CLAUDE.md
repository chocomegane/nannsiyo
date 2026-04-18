# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # 開発サーバー起動 (http://localhost:5173)
npm run build     # 本番ビルド (tsc -b && vite build)
npm run lint      # ESLint 実行
npx tsc --noEmit  # 型チェックのみ
docker compose up -d --build  # Docker ビルド＆起動
```

## Architecture

React + TypeScript SPA。サーバーなし（Phase 1 はクライアントのみ）。

```
src/
├── components/   # UI コンポーネント（1コンポーネント1責務）
├── store/        # Zustand ストア（petStore / playerStore）
├── data/         # マスターデータ（DROP_TABLE など）
├── systems/      # ゲームロジック（dropSystem）
└── types.ts      # 共通型定義（Pet / DroppedItem / Player）
```

### データフロー
`dropSystem.ts` → `playerStore.addDroppedItem()` → `Room.tsx` でレンダリング  
クリック → `playerStore.collectItem()` → `InventoryPanel` に移動  
「全部売る」 → `playerStore.sellAll()` → `money` 増加

### 重要な制約
- `verbatimModuleSyntax: true` のため、型のみの import は必ず `import type` を使う
- `any` 禁止。型定義は `src/types.ts` に集約
- マスターデータはロジック内にハードコードせず `src/data/` に置く

## デプロイ構成

- Docker: マルチステージビルド（node:22-alpine でビルド → nginx:alpine で配信）
- ポート: コンテナ内 80 → ホスト 8080 → サーバーの nginx がリバースプロキシ
- 詳細フェーズ計画: `.claude/FUTURE_FEATURES.md` 参照
