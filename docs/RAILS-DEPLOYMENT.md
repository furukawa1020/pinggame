# Rails Backend Deployment Guide

このドキュメントは、Ruby on Rails バックエンドのデプロイ方法について説明します。

## 🚀 デプロイオプション

### 1. Heroku へのデプロイ

Heroku は Rails アプリケーションのデプロイに最適なプラットフォームです。

#### 前提条件
- Heroku CLI がインストールされていること
- Heroku アカウントを持っていること

#### デプロイ手順

```bash
# Heroku にログイン
heroku login

# 新しいアプリケーションを作成
heroku create yarn-penguin-rails-api

# PostgreSQL アドオンを追加（本番環境用）
heroku addons:create heroku-postgresql:mini

# 環境変数を設定
heroku config:set RAILS_ENV=production
heroku config:set RAILS_MASTER_KEY=$(cat rails-backend/config/master.key)

# デプロイ
cd rails-backend
git push heroku main

# データベースマイグレーション
heroku run rails db:migrate

# アプリケーションを開く
heroku open
```

### 2. Railway へのデプロイ

Railway は簡単にデプロイできる代替プラットフォームです。

#### デプロイ手順

1. Railway.app にサインアップ
2. 新しいプロジェクトを作成
3. GitHub リポジトリを接続
4. `rails-backend` ディレクトリをルートに設定
5. 環境変数を設定:
   - `RAILS_ENV=production`
   - `RAILS_MASTER_KEY=<your-master-key>`
6. 自動デプロイが開始されます

### 3. AWS (Elastic Beanstalk) へのデプロイ

#### 前提条件
- AWS CLI がインストールされていること
- EB CLI がインストールされていること

#### デプロイ手順

```bash
# EB CLI をインストール
pip install awsebcli

# Rails ディレクトリに移動
cd rails-backend

# EB 環境を初期化
eb init -p ruby-3.2 yarn-penguin-rails-api --region ap-northeast-1

# RDS データベースを作成
eb create yarn-penguin-prod --database

# 環境変数を設定
eb setenv RAILS_ENV=production RAILS_MASTER_KEY=$(cat config/master.key)

# デプロイ
eb deploy

# アプリケーションを開く
eb open
```

### 4. Docker を使用したデプロイ

Rails アプリケーションには既に Dockerfile が含まれています。

#### ローカルで Docker イメージをビルド

```bash
cd rails-backend

# イメージをビルド
docker build -t yarn-penguin-rails:latest .

# コンテナを実行
docker run -p 3000:3000 \
  -e RAILS_ENV=production \
  -e RAILS_MASTER_KEY=<your-master-key> \
  yarn-penguin-rails:latest
```

#### Docker Compose を使用

`docker-compose.yml` を作成:

```yaml
version: '3.8'

services:
  web:
    build: ./rails-backend
    ports:
      - "3000:3000"
    environment:
      - RAILS_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/yarn_penguin_production
      - RAILS_MASTER_KEY=${RAILS_MASTER_KEY}
    depends_on:
      - db
    command: bundle exec rails server -b 0.0.0.0

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=yarn_penguin_production
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

実行:

```bash
docker-compose up -d
```

### 5. Kamal を使用したデプロイ

Rails 8 には Kamal がバンドルされており、任意のサーバーへのデプロイが可能です。

#### セットアップ

```bash
cd rails-backend

# config/deploy.yml を編集してサーバー情報を設定

# 環境変数を設定
kamal env push

# 初回デプロイ
kamal setup

# アプリケーションをデプロイ
kamal deploy
```

## 🔧 本番環境の設定

### 環境変数

本番環境では以下の環境変数を設定してください:

```env
RAILS_ENV=production
RAILS_MASTER_KEY=<config/master.key の内容>
DATABASE_URL=postgresql://user:password@host:5432/database
ALLOWED_ORIGINS=https://yourdomain.com
SECRET_KEY_BASE=<rails secret で生成>
```

### データベース設定

本番環境では PostgreSQL を使用することを推奨します。

`config/database.yml` を更新:

```yaml
production:
  primary: &primary_production
    adapter: postgresql
    encoding: unicode
    pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
    url: <%= ENV['DATABASE_URL'] %>
```

### アセットのプリコンパイル

```bash
RAILS_ENV=production bundle exec rails assets:precompile
```

### マイグレーション

```bash
RAILS_ENV=production bundle exec rails db:migrate
```

## 🔐 セキュリティ

### HTTPS の有効化

`config/environments/production.rb`:

```ruby
config.force_ssl = true
```

### シークレットキーの管理

```bash
# 新しい secret key base を生成
rails secret

# 環境変数に設定
export SECRET_KEY_BASE=<generated-key>
```

### CORS の設定

`config/initializers/cors.rb`:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('ALLOWED_ORIGINS', 'https://yourdomain.com')
    
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

## 📊 モニタリング

### ログの確認

```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# AWS EB
eb logs
```

### ヘルスチェック

アプリケーションには `/api/v1/health` エンドポイントがあります。
ロードバランサーやモニタリングツールでこのエンドポイントを使用できます。

## 🔄 継続的デプロイ

GitHub Actions ワークフロー (`.github/workflows/rails-ci-cd.yml`) が設定されています。

`main` ブランチへのプッシュで自動的に:
1. リントチェック
2. テスト実行
3. セキュリティスキャン
4. デプロイ準備

が実行されます。

デプロイステップをカスタマイズするには、ワークフローファイルの `deploy` ジョブを編集してください。

## 🆘 トラブルシューティング

### データベース接続エラー

```bash
# DATABASE_URL が正しく設定されているか確認
echo $DATABASE_URL

# データベースが存在するか確認
rails db:create RAILS_ENV=production
```

### マイグレーションエラー

```bash
# 保留中のマイグレーションを確認
rails db:migrate:status RAILS_ENV=production

# マイグレーションをロールバック
rails db:rollback RAILS_ENV=production
```

### アセット関連のエラー

```bash
# アセットを再コンパイル
rails assets:clobber RAILS_ENV=production
rails assets:precompile RAILS_ENV=production
```

## 📚 参考リンク

- [Ruby on Rails Guides - Deployment](https://guides.rubyonrails.org/deploying_rails_applications.html)
- [Heroku Rails Guide](https://devcenter.heroku.com/articles/getting-started-with-rails8)
- [Kamal Documentation](https://kamal-deploy.org/)
- [Docker Rails Guide](https://docs.docker.com/samples/rails/)
