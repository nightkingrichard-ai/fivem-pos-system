# FiveM POS System

FiveM RP用レジシステム - 店員用POS画面 + 商品管理 + 売上管理

## 機能

- ✅ レジ画面（商品追加・合計計算・売上確定）
- ✅ 商品管理（追加・編集・削除・画像登録）
- ✅ 売上管理（日別・商品別・店員別集計）
- ✅ 店員管理（ログイン・権限管理）
- ✅ Discord Webhook 売上通知
- ✅ PC・タブレット対応

## 技術スタック

- React 18
- Firebase (Realtime Database + Authentication)
- Vite
- GitHub Pages

## セットアップ

### 1. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクト作成
3. Realtime Database を有効化（テストモード）
4. Authentication > Email/Password を有効化
5. プロジェクト設定から API キー取得

### 2. 環境変数設定

`.env.local` ファイルを作成：

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

### 3. インストール

```bash
npm install
npm start
```

### 4. ビルド・デプロイ

```bash
npm run build
```

GitHub Pages にデプロイ

## 使い方

### 店長向け
- ログイン → 商品管理 → 売上管理

### 店員向け
- ログイン → レジ画面 → 商品追加 → 支払い確定

## ライセンス

MIT
