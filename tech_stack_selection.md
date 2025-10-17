# 家計簿アプリ 技術選定詳細書

## 1. 概要

本ドキュメントでは、要件定義書に基づいて技術スタックの具体的な選定を行います。

### 1.1 選定基準
1. **枯れた技術** - 長期的に保守可能
2. **学習コストの低さ** - 必要に応じて理解・修正できる
3. **クロスプラットフォーム対応** - Windows/Linux必須、スマホ対応
4. **パフォーマンス** - 起動3秒以内、操作1秒以内
5. **開発スピード** - 1〜2週間でMVP完成
6. **ローカルファイル操作** - ファイル読み書きが容易

---

## 2. アーキテクチャ方針

### 2.1 全体構成

```
┌─────────────────────────────────────┐
│         UI Layer (Web)              │
│  TypeScript + HTML/CSS              │
└─────────────────────────────────────┘
              │
┌─────────────────────────────────────┐
│      Application Layer              │
│  TypeScript (+ Rust/WASM 検討)      │
│  - ビジネスロジック                    │
│  - データ変換・計算                    │
└─────────────────────────────────────┘
              │
┌─────────────────────────────────────┐
│       Data Layer                    │
│  SQLite (推奨) or JSON              │
│  - ローカルストレージ                  │
│  - File System API                  │
└─────────────────────────────────────┘
              │
┌─────────────────────────────────────┐
│    Platform Layer (選択肢)          │
│  PWA or Tauri                       │
└─────────────────────────────────────┘
```

---

## 3. 配布方法の選定

### 3.1 選択肢の比較

| 項目 | PWA (Progressive Web App) | Tauri |
|------|---------------------------|-------|
| **Windows対応** | ◎ ブラウザで動作 | ◎ ネイティブアプリ |
| **Linux対応** | ◎ ブラウザで動作 | ◎ ネイティブアプリ |
| **スマホ対応** | ◎ iOS/Android両対応 | △ モバイル対応は実験的 |
| **ファイル操作** | △ File System Access API（一部ブラウザのみ） | ◎ 完全なファイルアクセス |
| **オフライン動作** | ◎ Service Worker | ◎ ネイティブ |
| **配布の容易さ** | ◎ URLアクセスのみ | △ インストーラー配布 |
| **更新の容易さ** | ◎ 自動更新 | △ 手動更新が必要 |
| **起動速度** | ◯ ブラウザ起動後 | ◎ 高速 |
| **パッケージサイズ** | - (不要) | 小〜中（WebViewベース） |
| **開発の複雑さ** | ◎ シンプル | ◯ やや複雑 |

### 3.2 推奨案：**PWA（段階的にTauri検討）**

**理由：**
1. **スマホ対応が必須要件** - PWAなら追加開発なしで対応
2. **開発・配布が容易** - URLを開くだけで利用可能
3. **自動更新** - ユーザーが常に最新版を使える
4. **クロスプラットフォーム** - Windows/Linuxで同じコードベース

**懸念点と対策：**
- **ファイルアクセス制限**
  - 対策1：File System Access API（Chrome/Edge対応）
  - 対策2：File APIでファイル選択・保存
  - 対策3：将来的にTauriに移行も検討
- **オフライン動作**
  - Service Workerでキャッシュ → 問題なし

**段階的アプローチ：**
1. Phase 1-3: PWAで開発
2. 必要に応じてTauriラッパーを追加（Webコードはそのまま利用可能）

---

## 4. フロントエンド技術

### 4.1 フレームワークの選定

**結論：React（SPA）**

**理由：**
1. **グローバルな状態管理** - 複式簿記データを複数画面で共有する必要がある
2. **デファクトスタンダード** - エコシステムが最も充実
3. **開発速度** - コンポーネントベースで効率的な開発
4. **長期保守性** - React自体が成熟しており、今後も長期サポートが期待できる
5. **学習コスト** - 情報が豊富で問題解決しやすい

**技術構成：**
- **React 18+** - 最新の安定版
- **TypeScript** - 型安全性
- **React Router** - SPA用ルーティング
- **Context API or Zustand** - 状態管理
  - MVP段階：Context API（標準機能で十分）
  - 複雑化したら：Zustand（軽量で使いやすい）

**メリット：**
- ◎ 開発速度が速い
- ◎ コンポーネントの再利用性
- ◎ デバッグツールが充実
- ◎ エコシステム（チャートライブラリなど）

**デメリット：**
- △ バンドルサイズが大きめ（約140KB gzip後）
  - 対策：コード分割、lazy loading

**SPA vs MPA判断：**
- ✅ SPA選択理由：
  - 複式簿記データをメモリに保持して複数画面で参照
  - 画面遷移時のスムーズなUX
  - オフライン動作に有利

---

## 5. データストレージ

### 5.1 選択肢の比較

#### 選択肢A：**JSON + localStorage/IndexedDB**

**構成：**
- データをJSONで管理
- localStorage（小規模）またはIndexedDB（大規模）に保存
- JavaScriptで検索・集計

**メリット：**
- ◎ 非常にシンプル
- ◎ 外部ライブラリ不要
- ◎ デバッグしやすい（可読性が高い）
- ◎ ファイル保存が容易（JSON.stringify/parse）
- ◎ データ構造の柔軟性
- ◎ 移行コストが低い（後でSQLiteに移行しやすい）

**デメリット：**
- △ 複雑なクエリは自前実装
- △ 大量データ時のパフォーマンス（数万件以上）
- △ インデックスを自前で管理

**実装イメージ：**
```typescript
interface AppData {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  templates: Template[];
}

class DataStore {
  private data: AppData;
  
  async save() {
    const json = JSON.stringify(this.data);
    localStorage.setItem('budgetData', json);
  }
  
  async load() {
    const json = localStorage.getItem('budgetData');
    this.data = json ? JSON.parse(json) : this.getDefaultData();
  }
  
  getTransactions(startDate: string, endDate: string): Transaction[] {
    return this.data.transactions.filter(t => 
      t.date >= startDate && t.date <= endDate
    );
  }
}
```

---

#### 選択肢B：**SQLite（sql.js）**

**構成：**
- sql.js（SQLiteのWASM版）
- IndexedDBに永続化
- SQLでクエリ

**メリット：**
- ◎ リレーショナルデータベースの恩恵
- ◎ 複雑なクエリが書きやすい
- ◎ トランザクション対応
- ◎ GnuCashと親和性高い
- ◎ インデックスによる高速検索

**デメリット：**
- △ ライブラリサイズ大（約1MB）
- △ 初期導入の複雑さ
- △ ファイル保存時にバイナリ変換が必要

---

### 5.2 推奨案：**JSON（Phase 1-2） → SQLite検討（Phase 3以降）**

**Phase 1-2: JSON + localStorage（小規模時）またはIndexedDB（大規模時）**
- シンプルで理解しやすい
- 外部依存なし
- 十分なパフォーマンス（数千件程度）
- ファイル保存が容易

**データ量に応じた切り替え：**
```typescript
class DataStore {
  private useIndexedDB: boolean;
  
  constructor() {
    // データサイズでストレージを選択
    const dataSize = this.estimateDataSize();
    this.useIndexedDB = dataSize > 5 * 1024 * 1024; // 5MB以上
  }
}
```

**Phase 3以降: SQLite検討**
- データ量が1万件を超えた場合
- 複雑な集計クエリが頻繁に必要になった場合
- パフォーマンス問題が顕在化した場合

**移行の容易性：**
JSONデータ → SQLite移行は比較的容易
```typescript
// JSONからSQLiteへの移行スクリプト
async function migrateToSQLite(jsonData: AppData) {
  const db = new SQL.Database();
  
  // テーブル作成
  db.run(CREATE_TABLES_SQL);
  
  // データ挿入
  jsonData.accounts.forEach(account => {
    db.run('INSERT INTO accounts VALUES (?, ?, ?, ?)', 
      [account.id, account.name, account.type, account.parent_id]);
  });
  
  return db;
}
```

**理由：**
1. **YAGNI原則** - 必要になるまで複雑な技術を導入しない
2. **開発速度** - JSONは実装が最も速い
3. **柔軟性** - 後から移行可能
4. **十分な性能** - 数千件程度なら問題なし

---

## 6. スタイリング

### 6.1 推奨案：**CSS Variables + SCSS**

**構成：**
- SCSS（変数、ネスト、mixin）
- CSS Variables（ダークモード対応）
- モダンCSS（Grid、Flexbox）

**理由：**
- ◎ 枯れた技術
- ◎ CSSフレームワーク不要（軽量）
- ◎ 柔軟なカスタマイズ
- ◎ レスポンシブ対応が容易

**例：**
```scss
:root {
  --color-primary: #2563eb;
  --color-background: #ffffff;
  --color-text: #1f2937;
}

[data-theme="dark"] {
  --color-background: #1f2937;
  --color-text: #f9fafb;
}

.button {
  background: var(--color-primary);
  color: white;
  
  &:hover {
    background: darken(var(--color-primary), 10%);
  }
}
```

---

## 7. ビルドツール

### 7.1 推奨案：**Vite**

**理由：**
- ◎ 高速（ESM + esbuild）
- ◎ TypeScript対応標準
- ◎ PWA plugin対応
- ◎ 開発サーバー＋HMR
- ◎ シンプルな設定

**設定例：**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '家計簿アプリ',
        short_name: '家計簿',
        theme_color: '#2563eb',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  build: {
    target: 'es2020'
  }
});
```

---

## 8. Rustの活用（オプション）

### 8.1 導入タイミング

**Phase 1-2: 不要**
- TypeScriptで十分なパフォーマンス
- 複雑なロジックがまだ少ない

**Phase 3以降: 検討対象**
以下のケースでRust（WASM）導入を検討：

1. **GnuCashインポート処理**
   - XMLパース + gzip解凍
   - 複雑なデータ変換
   - エラーハンドリングが重要

2. **大量データの集計処理**
   - 年間数千件以上の取引
   - 複雑な計算（為替換算など）

3. **複式簿記のバリデーション**
   - 借方・貸方の整合性チェック
   - トランザクションの一貫性

### 8.2 実装アプローチ

```rust
// Rust側（WASM化）
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn parse_gnucash_xml(xml_data: &str) -> Result<JsValue, JsValue> {
    // XMLパース + データ変換
    let transactions = parse_xml(xml_data)?;
    Ok(serde_wasm_bindgen::to_value(&transactions)?)
}

#[wasm_bindgen]
pub fn validate_entries(entries: JsValue) -> Result<bool, JsValue> {
    // 借方・貸方の合計チェック
    let entries: Vec<Entry> = serde_wasm_bindgen::from_value(entries)?;
    Ok(validate(&entries))
}
```

```typescript
// TypeScript側
import init, { parse_gnucash_xml } from './pkg/budget_wasm.js';

await init();
const transactions = parse_gnucash_xml(xmlContent);
```

**ライブラリ候補：**
- `wasm-bindgen` - Rust ↔ JavaScript連携
- `serde` - シリアライゼーション
- `flate2` - gzip解凍

---

## 9. ファイル操作

### 9.1 推奨案：**File System Access API + フォールバック**

**メインアプローチ：File System Access API**
```typescript
async function saveFile(data: string, filename: string) {
  try {
    // File System Access API（Chrome/Edge）
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [{
        description: 'Budget Data',
        accept: { 'application/json': ['.json'] }
      }]
    });
    
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
  } catch (e) {
    // フォールバック：ダウンロードリンク
    downloadFallback(data, filename);
  }
}

function downloadFallback(data: string, filename: string) {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

**ファイル読み込み：**
```typescript
async function openFile(): Promise<string> {
  try {
    // File System Access API
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'Budget Data',
        accept: { 'application/json': ['.json'] }
      }]
    });
    
    const file = await handle.getFile();
    return await file.text();
  } catch (e) {
    // フォールバック：input type=file
    return await openFileFallback();
  }
}
```

---

## 10. クラウド同期

### 10.1 推奨案：**Google Drive API**

**理由：**
- ユーザーがGoogle Driveに精通している可能性
- OAuth認証が標準的
- 無料で15GB利用可能

**実装アプローチ：**
1. OAuth 2.0で認証
2. Drive APIでファイルアップロード/ダウンロード
3. 特定フォルダに`.budget.db`ファイルを保存
4. 定期的に同期（手動 or 自動）

**競合解決：**
- タイムスタンプベースで最新を優先
- （将来）差分マージ機能

**ライブラリ：**
```typescript
import { gapi } from 'gapi-script';

// 初期化
gapi.load('client:auth2', async () => {
  await gapi.client.init({
    apiKey: 'YOUR_API_KEY',
    clientId: 'YOUR_CLIENT_ID',
    scope: 'https://www.googleapis.com/auth/drive.file'
  });
});

// ファイルアップロード
async function uploadToDrive(data: Blob, filename: string) {
  const metadata = {
    name: filename,
    mimeType: 'application/json'
  };
  
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', data);
  
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gapi.auth.getToken().access_token}`
      },
      body: form
    }
  );
  
  return await response.json();
}
```

---

## 11. テスト戦略

### 11.1 推奨案

**Phase 1（MVP）：**
- 手動テスト中心
- 重要なロジックのみユニットテスト

**Phase 2以降：**
- Vitest（Viteと親和性高い）
- Testing Library（UI）
- Playwright（E2E、後回し）

**Rustロジック：**
- `cargo test`（標準テストフレームワーク）
- `wasm-bindgen-test`（WASM用）

---

## 12. 最終推奨スタック

### 12.1 Phase 1（MVP）構成

```
┌─────────────────────────────────────┐
│         配布方法: PWA               │
│  - Service Worker                   │
│  - Web App Manifest                 │
└─────────────────────────────────────┘
              │
┌─────────────────────────────────────┐
│    フロントエンド: React + TypeScript│
│  - React 18+                        │
│  - React Router                     │
│  - Context API (状態管理)            │
│  - SCSS + CSS Variables             │
└─────────────────────────────────────┘
              │
┌─────────────────────────────────────┐
│    データ: JSON                     │
│  - localStorage (小規模時)           │
│  - IndexedDB (大規模時)              │
│  - シンプルなデータ構造               │
└─────────────────────────────────────┘
              │
┌─────────────────────────────────────┐
│    ファイル: File System Access API │
│  - JSON形式                         │
│  - フォールバック対応                │
└─────────────────────────────────────┘
              │
┌─────────────────────────────────────┐
│    ビルド: Vite                     │
│  - TypeScript                       │
│  - React Plugin                     │
│  - PWA Plugin                       │
└─────────────────────────────────────┘
```

### 12.2 Phase 3以降の拡張

**必要に応じて追加：**
- **Zustand** - 状態管理が複雑化したら
- **SQLite (sql.js)** - データ量増加時（1万件以上）
- **Rust/WASM** - GnuCashインポート、複雑な計算
- **Tauri** - ネイティブアプリ化が必要なら

---

## 13. プロジェクト構成

```
household-budget/
├── src/
│   ├── main.tsx             # エントリーポイント
│   ├── App.tsx              # ルートコンポーネント
│   ├── types/
│   │   ├── account.ts       # 勘定科目型定義
│   │   ├── transaction.ts   # 取引型定義
│   │   ├── budget.ts        # 予算型定義
│   │   └── index.ts
│   ├── store/
│   │   ├── DataStore.ts     # データストアクラス
│   │   ├── AppContext.tsx   # React Context
│   │   └── hooks.ts         # カスタムフック
│   ├── services/
│   │   ├── fileService.ts   # ファイル読み書き
│   │   ├── storageService.ts # localStorage/IndexedDB
│   │   ├── importService.ts # GnuCashインポート
│   │   ├── exportService.ts # データエクスポート
│   │   ├── reportService.ts # レポート生成
│   │   └── syncService.ts   # クラウド同期
│   ├── utils/
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   ├── validation.ts
│   │   └── calculations.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Transactions/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   └── TransactionDetail.tsx
│   │   ├── Accounts/
│   │   │   ├── AccountList.tsx
│   │   │   └── AccountForm.tsx
│   │   ├── Reports/
│   │   │   ├── IncomeStatement.tsx
│   │   │   ├── BalanceSheet.tsx
│   │   │   ├── AssetChart.tsx
│   │   │   └── BudgetReport.tsx
│   │   └── Settings/
│   │       ├── GeneralSettings.tsx
│   │       ├── ImportExport.tsx
│   │       └── CloudSync.tsx
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── Common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   └── Charts/
│   │       ├── LineChart.tsx
│   │       └── BarChart.tsx
│   └── styles/
│       ├── main.scss
│       ├── variables.scss
│       ├── mixins.scss
│       └── themes/
│           ├── light.scss
│           └── dark.scss
├── public/
│   ├── manifest.json
│   ├── sw.js               # Service Worker
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── tests/
│   ├── unit/
│   └── integration/
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 14. 依存パッケージ（Phase 1）

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite-plugin-pwa": "^0.17.0",
    "sass": "^1.69.0",
    "vitest": "^1.0.0"
  }
}
```

**合計サイズ：** 約140KB（gzip後、React + React DOM + React Router）

**Phase 2以降で検討：**
```json
{
  "dependencies": {
    "zustand": "^4.4.0",        // 状態管理が複雑化したら
    "recharts": "^2.10.0",       // チャート描画
    "date-fns": "^3.0.0"         // 日付処理
  }
}
```

---

## 15. 開発環境セットアップ

```bash
# プロジェクト作成
npm create vite@latest household-budget -- --template react-ts

# 依存関係インストール
cd household-budget
npm install react-router-dom
npm install -D vite-plugin-pwa sass vitest

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

**Vite設定例：**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '家計簿アプリ',
        short_name: '家計簿',
        description: '複式簿記対応の家計簿アプリ',
        theme_color: '#2563eb',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
});
```

---

## 16. データストアの実装方針

### 16.1 基本アーキテクチャ

**データ型定義の例（概念的なもの）：**
- Account（勘定科目）
- Transaction（取引）
- Entry（仕訳明細）
- Budget（予算）
- Template（テンプレート）
- AppData（全体のデータ構造）

**主要な機能要件：**
1. **データの永続化**
   - localStorage（5MB未満）
   - IndexedDB（5MB以上）
   - 自動切り替え

2. **CRUD操作**
   - Create/Read/Update/Delete
   - トランザクションのバリデーション（借方=貸方）
   - 階層構造の勘定科目管理

3. **ファイル操作**
   - JSON形式でのimport/export
   - File System Access API対応
   - フォールバック実装

4. **データ整合性**
   - 外部キー的な参照整合性チェック
   - 使用中の勘定科目の削除防止
   - タイムスタンプ管理

### 16.2 React統合パターン

**状態管理の方針：**
- Context APIでグローバル状態管理
- カスタムフックで各エンティティへのアクセス提供
- 自動保存機能（データ変更時）

**典型的な使用パターン：**
```typescript
// コンポーネント内での使用イメージ
function TransactionForm() {
  const { addTransaction } = useTransactions();
  const { accounts } = useAccounts();
  
  const handleSubmit = async (data) => {
    await addTransaction(data);
  };
  
  // ...
}
```

### 16.3 パフォーマンス考慮事項

- メモリ内キャッシュ
- 大量データ時のフィルタリング最適化
- 必要に応じたインデックス構築
- 段階的なSQLite移行を見据えた設計

**注意：** 実際の実装は開発時に最適な形に調整してください。ここで示した内容はあくまで設計の方向性を示す概念的なものです。
