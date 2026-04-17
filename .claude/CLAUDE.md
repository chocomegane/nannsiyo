# CLAUDE.md — ペット育成ゲーム

## 注意
計画に対する開始の確認を実施
著作権があるものは利用しない
オープンソースは利用可


## 今やること（MVP Phase 1）

以下の4機能だけを最小構成で実装する。余計な機能は追加しない。

1. ペットが画面に表示される
2. 時間経過でアイテムをドロップする
3. アイテムをクリックして回収する
4. 売ってお金が増える

## 技術スタック

- **フレームワーク**: React + TypeScript
- **状態管理**: Zustand
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion
- **ビルド**: Vite

> PixiJS・Socket.ioはPhase 3以降。今は使わない。

---

## ディレクトリ構成（MVP）

```
src/
├── components/
│   ├── Pet.tsx          # ペット表示
│   ├── DroppedItem.tsx  # ドロップアイテム表示
│   ├── MoneyDisplay.tsx # 所持金表示
│   └── Room.tsx         # ルーム全体
├── store/
│   ├── petStore.ts      # ペット状態
│   └── playerStore.ts   # プレイヤー（お金等）
├── data/
│   └── items.ts         # アイテムマスターデータ
├── systems/
│   └── dropSystem.ts    # ドロップロジック
└── App.tsx
```

---

## 型定義（MVP）

```typescript
// ペット
interface Pet {
  id: string
  name: string
  species: 'dragon' | 'unicorn' | 'slime'
  level: number
  stats: {
    happiness: number  // 0〜100
    hunger: number     // 0〜100
  }
}

// ドロップアイテム
interface DroppedItem {
  id: string
  itemId: string
  name: string
  sellPrice: number
  x: number  // 画面上の表示位置
  y: number
}

// プレイヤー
interface Player {
  money: number
  inventory: DroppedItem[]
}
```

---

## ドロップシステム仕様

- ペットは **30秒〜60秒ごと** にランダムでアイテムをドロップ
- ドロップしたアイテムはルーム内の床にアイコン表示
- クリックで回収 → インベントリへ
- 「売る」ボタンでインベントリを全売却 → お金に変換
- ドロップ品は種族ごとに異なる

```typescript
// アイテム例（data/items.ts）
const DROP_TABLE = {
  dragon: [
    { itemId: 'dragon_scale', name: 'ドラゴンの鱗', sellPrice: 100, weight: 70 },
    { itemId: 'dragon_claw',  name: 'ドラゴンの爪', sellPrice: 300, weight: 30 },
  ],
  unicorn: [
    { itemId: 'unicorn_hair', name: 'ユニコーンの毛', sellPrice: 150, weight: 60 },
    { itemId: 'unicorn_dust', name: '角の粉',         sellPrice: 250, weight: 40 },
  ],
  slime: [
    { itemId: 'slime_gel',    name: 'スライムゲル',   sellPrice: 50,  weight: 80 },
    { itemId: 'slime_core',   name: 'スライムコア',   sellPrice: 200, weight: 20 },
  ],
}
```

---

## 実装ルール

- **ロジックはすべてクライアント側**（MVPはサーバーなし）
- **1コンポーネント1責務**。肥大化させない
- **マスターデータは `data/` に集約**。ロジック内にハードコードしない
- **型定義は必ず書く**。`any` 禁止
- **コメントは日本語OK**

---

## 将来実装予定（今は触らない）

詳細は `FUTURE_FEATURES.md` を参照。

- レベルアップ・スキルシステム
- 食事による外見変化（色・サイズ）
- 部屋の飾り付け
- ダンジョン・公園（MMO要素）
- テレポート・宝くじ店
- Socket.io によるリアルタイム通信