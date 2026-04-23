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

React + TypeScript SPA。バックエンドは Express + Socket.io + SQLite (better-sqlite3)。

```
src/
├── components/   # UI コンポーネント（1コンポーネント1責務）
├── store/        # Zustand ストア（gameStore）
├── scenes/       # 7シーン（room / park / dungeon / lottery / ranking / furniture / friend）
├── api/          # APIクライアント (client.ts)
└── types.ts      # 共通型定義

server/
├── src/
│   ├── routes/   # Express ルーター（players / ranking / lottery / events / auth / guilds / friends / board / settings）
│   ├── sockets/  # Socket.io ハンドラー（park / dungeon / radio）
│   └── db/       # SQLite スキーマ・接続
```

### 重要な制約
- `verbatimModuleSyntax: true` のため、型のみの import は必ず `import type` を使う
- `any` 禁止。型定義は `src/store/types.ts` に集約
- マスターデータはロジック内にハードコードせず `src/store/types.ts` に置く

## Deploy

- Docker: クライアント (nginx) + サーバー (node) の2コンテナ構成
- ポート: client 8080、server 3000
- 本番 FRONTEND_URL: `https://tokachitomato.top`

## 詳細ドキュメント

- ゲーム仕様・シーン・ペット・スキル・家具など: `.claude/GAME_SPEC.md`
- 将来実装予定機能・フェーズ計画: `.claude/FUTURE_FEATURES.md`
- Claude の会話スタイル・ペルソナ: `.claude/PERSONA.md`
- 開発ルール・注意事項: `.claude/rules/RULES.md`
