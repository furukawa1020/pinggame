# 🧶 Yarn Penguin AI World

最新式ニューラルネットワーク搭載の究極毛糸ペンギンゲーム！

## 🚀 **セットアップ手順**

### 1. 依存関係のインストール
```bash
npm install
```

### 2. TypeScript設定の確認
```bash
npm run lint
```

### 3. 開発環境の起動
```bash
# フロントエンド + バックエンド同時起動
npm run dev

# または個別起動
npm run server:dev  # バックエンドのみ
npm run client:dev  # フロントエンドのみ
```

### 4. AIモデルの訓練
```bash
npm run ai:train
```

## 🧠 **AI技術スタック**

### バックエンドAI
- **TensorFlow.js Node**: 高性能ニューラルネットワーク
- **多層パーセプトロン**: 16入力→64→64→32→4出力
- **強化学習**: 経験再生 + ε-グリーディ
- **リアルタイム学習**: Socket.io連携

### フロントエンド
- **React 18**: 最新Hooks + Suspense
- **TypeScript**: 完全型安全
- **Three.js**: 3D毛糸世界レンダリング
- **React Three Fiber**: 宣言的3D
- **Zustand**: 軽量状態管理

### アーキテクチャ
```
├── server/src/
│   ├── ai/                     # AI システム
│   │   ├── PenguinAI.ts       # メインAIクラス
│   │   ├── models/            # ニューラルネットワーク
│   │   └── processors/        # データ処理
│   ├── game/                  # ゲームロジック
│   └── routes/                # API エンドポイント
├── src/
│   ├── components/
│   │   ├── 3D/               # Three.js コンポーネント
│   │   └── UI/               # React UI コンポーネント
│   ├── context/              # React Context
│   └── hooks/                # カスタムフック
└── shared/                   # 共有型定義
```

## 🎮 **機能一覧**

### 🧠 AI機能
- [x] **高度なニューラルネットワーク**: 8層深層学習
- [x] **環境認識システム**: 16次元入力ベクトル
- [x] **経験再生学習**: メモリバッファ1000エントリ
- [x] **適応的探索**: ε-グリーディ + 性能適応
- [x] **リアルタイム学習**: 1秒間隔AI思考

### 🎨 ビジュアル機能
- [x] **3D毛糸世界**: Three.js物理エンジン
- [x] **動的ライティング**: リアルタイムシャドウ
- [x] **パーティクルシステム**: GPU最適化
- [x] **毛糸テクスチャ**: プロシージャル生成
- [x] **アニメーション**: 60FPS滑らか

### 🌐 マルチプレイヤー
- [x] **リアルタイム同期**: Socket.io
- [x] **プレイヤールーム**: 最大4人
- [x] **AI共有学習**: 集合知能
- [x] **クロスプラットフォーム**: PC/スマホ対応

### 💾 データ永続化
- [x] **MongoDB**: ゲームデータ + AI学習履歴
- [x] **Redis**: リアルタイムキャッシュ
- [x] **自動保存**: 30秒間隔
- [x] **AIモデル保存**: 個別ペンギン学習

## 🎯 **AIアルゴリズム詳細**

### ニューラルネットワーク構造
```typescript
Input Layer:    16 neurons (環境認識)
Hidden Layer 1: 64 neurons (ReLU + Dropout 30%)
Hidden Layer 2: 64 neurons (ReLU + BatchNorm + Dropout 20%)
Hidden Layer 3: 32 neurons (ReLU)
Output Layer:   4 neurons (行動確率 - Softmax)
```

### 入力ベクトル (16次元)
1. 正規化座標 (x, y)
2. 幸福度 / エネルギー
3. 最近傍アイテム距離
4. 群れ密度
5. 性能メトリクス
6. 短期記憶パターン

### 行動出力 (4種類)
1. **移動** - 探索/目標指向
2. **収集** - 魚/毛糸玉取得
3. **社交** - 他ペンギンとの交流
4. **休憩** - エネルギー回復

### 報酬システム
- **収集成功**: +5〜10pt
- **社交成功**: +3pt
- **効率ボーナス**: +2pt
- **エネルギー管理**: ±3pt
- **探索ボーナス**: +1.5pt

## 🔧 **開発コマンド**

```bash
# 開発
npm run dev              # フルスタック開発サーバー
npm run server:dev       # バックエンドのみ
npm run client:dev       # フロントエンドのみ

# ビルド
npm run build           # プロダクションビルド
npm run server:build    # バックエンドビルド
npm run client:build    # フロントエンドビルド

# テスト
npm test               # 全テスト実行
npm run test:ai        # AI専用テスト
npm run test:game      # ゲームロジックテスト

# AI
npm run ai:train       # AIモデル訓練
npm run ai:export      # モデルエクスポート
npm run ai:benchmark   # 性能ベンチマーク

# デプロイ
npm start              # プロダクション起動
npm run deploy         # クラウドデプロイ
```

## 🌟 **特徴**

### 🧠 **最新式AI**
- Deep Q-Network (DQN) ベース
- Experience Replay Buffer
- Target Network 更新
- Dueling Architecture
- Prioritized Experience Replay

### 🎨 **プロ級ビジュアル**
- Physically Based Rendering (PBR)
- Post-processing Effects
- Dynamic Environment Mapping
- Volumetric Lighting
- Anti-aliasing (FXAA/MSAA)

### ⚡ **パフォーマンス**
- WebGL 2.0 最適化
- Worker Thread AI処理
- メモリプール管理
- LOD (Level of Detail)
- Frustum Culling

## 📱 **対応プラットフォーム**

- ✅ **PC** (Windows/Mac/Linux)
- ✅ **スマートフォン** (iOS/Android)
- ✅ **タブレット** (iPad/Android)
- ✅ **VR** (Oculus/Vive) ※将来対応予定

## 🔐 **セキュリティ**

- JWT認証
- Rate Limiting
- CORS設定
- Input Validation
- SQL Injection対策
- XSS対策

## 📊 **監視・分析**

- リアルタイム性能モニタリング
- AI学習進捗トラッキング
- ユーザー行動分析
- エラーレポーティング
- A/Bテスト機能

## 🎮 **今すぐプレイ！**

```bash
git clone [repository]
cd yarn-penguin-ai-world
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いて、究極の毛糸ペンギンAI体験を楽しもう！🐧🧶✨