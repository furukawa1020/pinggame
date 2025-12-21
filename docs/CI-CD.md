# CI/CD パイプライン構成

このプロジェクトでは、GitHub Actionsを使用したCI/CDパイプラインを実装しています。

## 📋 ワークフロー概要

### 1. CI (Continuous Integration) - `.github/workflows/ci.yml`

**トリガー条件:**
- `main`, `develop`, `copilot/**` ブランチへのプッシュ
- `main`, `develop` ブランチへのプルリクエスト

**ジョブ構成:**

#### Lint ジョブ
- コードスタイルと品質のチェック
- ESLint による TypeScript コードの検証

#### Test ジョブ
- Jest を使用した単体テスト実行
- テストカバレッジの確認

#### Build ジョブ
- クライアント（Vite）のビルド
- サーバー（TypeScript）のビルド
- ビルド成果物のアーティファクト保存（7日間保持）

**依存関係:**
- Build ジョブは Lint と Test の成功後に実行

### 2. CD (Continuous Deployment) - `.github/workflows/cd.yml`

**トリガー条件:**
- `main` ブランチへのプッシュ
- 手動トリガー（workflow_dispatch）

**ジョブ構成:**

#### Deploy ジョブ
- 本番環境への自動デプロイ準備
- アプリケーションの完全ビルド
- デプロイ通知

**環境:**
- 本番環境（production）での実行

### 3. Code Quality - `.github/workflows/code-quality.yml`

**トリガー条件:**
- `main`, `develop` ブランチへのプッシュまたはプルリクエスト

**ジョブ構成:**

#### Dependency Review
- プルリクエスト時の依存関係レビュー
- セキュリティ脆弱性のチェック

#### Code Quality Check
- TypeScript 型チェック（`tsc --noEmit`）
- コードフォーマットのチェック（Prettier設定時）

## 🚀 使用方法

### ローカル開発での事前チェック

CI/CD パイプラインと同じチェックをローカルで実行できます：

```bash
# リント実行
npm run lint

# テスト実行
npm test

# ビルド実行
npm run build

# 型チェック
npx tsc --noEmit
```

### ブランチ戦略

1. **Feature ブランチ**: `copilot/**` または `feature/**`
   - CI ワークフローが自動実行
   
2. **Develop ブランチ**: `develop`
   - CI と Code Quality ワークフローが実行
   
3. **Main ブランチ**: `main`
   - すべてのワークフロー（CI、CD、Code Quality）が実行
   - 本番デプロイが自動実行

### プルリクエスト時の動作

プルリクエストを作成すると：
1. ✅ Lint チェック
2. ✅ Test 実行
3. ✅ Build 検証
4. ✅ 依存関係レビュー
5. ✅ 型チェック

すべてのチェックが成功すると、マージが可能になります。

## 📊 ワークフローステータス確認

GitHub リポジトリの "Actions" タブで：
- ワークフローの実行状況
- ビルドログ
- テスト結果
- アーティファクト

を確認できます。

## 🔧 カスタマイズ

### Node.js バージョン変更

すべてのワークフローファイルで Node.js バージョンを変更できます：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'  # ここを変更
```

### デプロイターゲット追加

`cd.yml` にデプロイステップを追加：

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID }}
    vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### シークレット設定

GitHub リポジトリ設定で以下を設定可能：
- Settings → Secrets and variables → Actions
- デプロイに必要な認証情報を追加

## 🎯 ベストプラクティス

1. **プッシュ前にローカルテスト**: `npm run lint && npm test && npm run build`
2. **小さな変更単位**: 頻繁にコミット・プッシュ
3. **プルリクエストレビュー**: CI チェック成功を確認
4. **依存関係の更新**: 定期的な `npm audit` 実行

## 📈 今後の拡張案

- [ ] E2Eテスト（Playwright/Cypress）
- [ ] パフォーマンステスト
- [ ] セキュリティスキャン（CodeQL）
- [ ] 自動バージョニング
- [ ] リリースノート自動生成
- [ ] Slack/Discord 通知連携

## 🐛 トラブルシューティング

### CI が失敗する場合

1. **Lint エラー**: `npm run lint` をローカルで実行して修正
2. **Test エラー**: `npm test` でテストを確認
3. **Build エラー**: `npm run build` で詳細確認

### キャッシュの問題

Actions タブから手動でキャッシュをクリア可能です。

---

**作成日**: 2025-12-21  
**ワークフローバージョン**: 1.0
