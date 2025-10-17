# Claude Code タスク分解書（Phase 1: MVP）

## ドキュメント概要

本ドキュメントは、家計簿アプリのPhase 1（MVP）開発をClaude Codeで実装するための具体的なタスク分解です。

**開発目標：** 実働1〜2週間でMVP完成

**前提ドキュメント：**
- 要件定義書 v1.1
- 技術選定詳細書 v1.2

---

## Phase 1: MVP の範囲

### 含まれる機能
- ✅ 基本的なデータ構造とストレージ
- ✅ 勘定科目の管理（追加・編集・表示）
- ✅ 取引の入力（PC版）
- ✅ 取引一覧の表示
- ✅ 基本的なレポート（損益計算書、貸借対照表）
- ✅ ファイルの保存・読み込み

### 含まれない機能（Phase 2以降）
- ❌ スマホ最適化UI
- ❌ GnuCashインポート
- ❌ クラウド同期
- ❌ 予算管理
- ❌ グラフ表示
- ❌ テンプレート機能
- ❌ 複数通貨対応

---

## タスク実行の方針

### 開発の流れ

Phase 1の開発は**ボトムアップ方式**で進めます：

```
データ層 → ビジネスロジック層 → UI層 → 統合・テスト
```

**この順序にする理由：**
1. **データ層が最も重要** - すべての機能の基盤。ここが不安定だと後で大きな手戻り
2. **各層で動作確認** - 下の層が完成してから上の層を作ることで、問題の切り分けが容易
3. **段階的な価値提供** - データ保存ができた時点で最低限の価値あり

### マイルストーン

**Milestone 1（Week 1前半）:** データが保存できる
- Task 0-3完了
- データストアの動作確認

**Milestone 2（Week 1後半）:** 取引を入力できる  
- Task 4-6完了
- 実際に使える状態

**Milestone 3（Week 2前半）:** データを閲覧できる
- Task 7-8完了
- 基本的な家計簿として機能

**Milestone 4（Week 2後半）:** MVP完成
- Task 9-12完了
- Phase 2へ進める状態

---

## タスク一覧

### Task 0: プロジェクトセットアップ
**推定時間：** 30分  
**優先度：** 最高  
**依存：** なし

**このタスクの目的：**  
開発環境を整え、以降のタスクで実装に集中できる状態にする。

**期待される成果物：**
- Vite + React + TypeScript のプロジェクトが起動する
- 必要なパッケージがインストール済み
- ディレクトリ構造が整っている
- 基本設定ファイルが揃っている

**具体的な作業：**

#### 0.1 Viteプロジェクト作成
```bash
npm create vite@latest household-budget -- --template react-ts
cd household-budget
npm install
```

#### 0.2 追加パッケージのインストール
```bash
npm install react-router-dom
npm install -D sass vite-plugin-pwa
```

#### 0.3 ディレクトリ構造の作成
```
src/
├── types/
├── store/
├── services/
├── utils/
├── pages/
├── components/
│   ├── Layout/
│   └── Common/
└── styles/
```

#### 0.4 基本設定ファイル
- `vite.config.ts` - Vite設定（React、SCSS、PWA）
- `tsconfig.json` - TypeScript設定の調整
- `.gitignore` - 不要ファイルの除外

#### 検証方法
- `npm run dev` でエラーなく起動
- ブラウザで http://localhost:5173 にアクセスでき、React の初期画面が表示される

---

### Task 1: 型定義の作成
**推定時間：** 1時間  
**優先度：** 最高  
**依存：** Task 0

**このタスクの目的：**  
アプリ全体で使用するデータ構造を型として定義し、TypeScriptの型安全性を確保する。これにより後続のタスクで型エラーを防ぎ、開発効率を上げる。

**なぜTask 2より先か：**  
DataStoreの実装に型定義が必要。先に型を決めることで、データ構造の設計を明確にできる。

**期待される成果物：**
- すべてのデータ型が `src/types/index.ts` で定義されている
- Account, Transaction, Entry, AppData の型が利用可能
- TypeScriptのコンパイルエラーなし

**具体的な作業：**

#### 1.1 基本型定義
**ファイル：** `src/types/index.ts`

```typescript
export type AccountType = '資産' | '負債' | '純資産' | '収益' | '費用';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  parent_id: string | null;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  account_id: string;
  debit: number;
  credit: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  entries: Entry[];
  created_at: string;
  updated_at: string;
}

export interface AppData {
  accounts: Account[];
  transactions: Transaction[];
  version: number;
  lastModified: string;
}
```

#### 検証方法
- TypeScriptのコンパイルエラーなし
- 型定義を他のファイルからインポートして使用できる
- すべての必須フィールドが定義されている

---

### Task 2: データストアの実装
**推定時間：** 3〜4時間  
**優先度：** 最高  
**依存：** Task 1

**このタスクの目的：**  
アプリのデータ永続化とビジネスロジック（CRUD操作、バリデーション）を実装する。これがアプリの心臓部となる。

**なぜこれが次か：**  
UI層を作る前にデータ層を完成させることで、UIはデータストアを呼ぶだけのシンプルな実装にできる。データ層の品質がアプリ全体の品質を決定する。

**期待される成果物：**
- `DataStore` クラスが実装されている
- localStorage へのデータ保存・読み込みが動作する
- トランザクションのバリデーション（借方=貸方）が機能する
- 勘定科目の削除チェック（使用中は is_active = false）が機能する
- エラーハンドリングが適切に行われている

**具体的な作業：**

#### 2.1 DataStoreクラスの実装
**ファイル：** `src/store/DataStore.ts`

**必須機能：**
- データの初期化（空データ作成）
- localStorage からの読み込み
- localStorage への保存
- データサイズが5MB超えたら IndexedDB に切り替え（将来対応で良い、とりあえずlocalStorageのみ）

**主要メソッド：**
```typescript
class DataStore {
  async initialize(): Promise<void>
  async load(): Promise<void>
  async save(): Promise<void>
  
  // Account操作
  getAllAccounts(): Account[]
  getAccountById(id: string): Account | undefined
  addAccount(account: Account): void
  updateAccount(id: string, updates: Partial<Account>): void
  deleteAccount(id: string): void
  
  // Transaction操作
  getAllTransactions(): Transaction[]
  getTransactionsByDateRange(start: string, end: string): Transaction[]
  addTransaction(transaction: Transaction): void
  updateTransaction(id: string, updates: Partial<Transaction>): void
  deleteTransaction(id: string): void
  
  // バリデーション
  private validateTransaction(transaction: Transaction): void
}
```

**重要な処理：**
- トランザクションのバリデーション（借方合計 = 貸方合計）
- 勘定科目削除時のチェック（使用中なら is_active = false に変更）
- エラーハンドリング

#### 2.2 ユーティリティ関数
**ファイル：** `src/utils/id.ts`

```typescript
// UUIDの生成
export function generateId(): string {
  return crypto.randomUUID();
}
```

**ファイル：** `src/utils/date.ts`

```typescript
// 日付フォーマット（YYYY-MM-DD）
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getCurrentDate(): string {
  return formatDate(new Date());
}
```

#### 検証方法
- ユニットテスト作成（簡易的でOK）
- データの保存・読み込みが正常動作
- バリデーションが正しく機能（借方≠貸方でエラー）
- localStorage の内容を Developer Tools で確認できる

---

### Task 3: React Context と Hooks の実装
**推定時間：** 2時間  
**優先度：** 最高  
**依存：** Task 2

**このタスクの目的：**  
DataStoreをReactアプリから使えるようにする。グローバルな状態管理を構築し、どのコンポーネントからもデータにアクセスできるようにする。

**なぜこれが次か：**  
DataStoreができたので、それをReactで使うための橋渡しが必要。これがないとUIコンポーネントがデータにアクセスできない。

**期待される成果物：**
- `AppContext` が実装され、アプリ全体で利用可能
- カスタムフック（`useAccounts`, `useTransactions`）が利用可能
- コンポーネントからデータの取得・更新ができる
- データ更新時に自動的に再レンダリングされる

**具体的な作業：**

#### 3.1 AppContext の作成
**ファイル：** `src/store/AppContext.tsx`

- DataStore インスタンスの保持
- グローバル状態（accounts, transactions）の管理
- loading/error 状態の管理
- refresh, save メソッドの提供

#### 3.2 カスタムフックの作成
**ファイル：** `src/store/hooks.ts`

- `useAccounts()` - 勘定科目の操作
- `useTransactions()` - 取引の操作

#### 3.3 App.tsx への統合
**ファイル：** `src/App.tsx`

- AppProvider でアプリ全体をラップ
- 初期ローディング表示

#### 検証方法
- 簡単なテストコンポーネントを作成し、useAccounts() でデータ取得できることを確認
- データ追加後、コンポーネントが自動的に再レンダリングされることを確認
- ブラウザをリロードしても状態が保持されることを確認

---

### Task 4: ルーティングとレイアウトの実装
**推定時間：** 2時間  
**優先度：** 高  
**依存：** Task 3

**このタスクの目的：**  
画面遷移の仕組みと全ページ共通のレイアウトを作る。これにより各ページの実装に集中できる。

**なぜこれが次か：**  
データ層とReact統合ができたので、次はUI層の骨格を作る。各ページのコンテンツより先に、ページ間の移動とレイアウトを決めることで、統一感のあるUIになる。

**期待される成果物：**
- React Router が設定され、ページ間の遷移ができる
- 全ページ共通のレイアウト（ヘッダー、サイドバー）が表示される
- ナビゲーションメニューが機能する
- 基本的なスタイルが適用されている

**具体的な作業：**

#### 4.1 React Router のセットアップ
**ファイル：** `src/main.tsx`

```typescript
import { BrowserRouter } from 'react-router-dom';

// BrowserRouter でラップ
```

**ファイル：** `src/App.tsx`

ルート定義：
- `/` - ダッシュボード
- `/transactions` - 取引一覧
- `/transactions/new` - 新規取引
- `/accounts` - 勘定科目管理
- `/reports` - レポート
- `/settings` - 設定

#### 4.2 レイアウトコンポーネント
**ファイル：** `src/components/Layout/Layout.tsx`

- ヘッダー（アプリ名、ナビゲーション）
- サイドバーまたはメニュー
- メインコンテンツエリア

**ファイル：** `src/components/Layout/Header.tsx`  
**ファイル：** `src/components/Layout/Sidebar.tsx`

#### 4.3 基本スタイリング
**ファイル：** `src/styles/main.scss`

- CSS Variables（カラーパレット、フォント）
- リセットCSS
- 基本的なレイアウトスタイル

#### 検証方法
- すべてのルートに遷移可能（空ページでも可）
- ナビゲーションメニューが機能し、現在のページがハイライトされる
- レイアウトが崩れていない（ヘッダー、サイドバー、コンテンツエリアが適切に配置）

---

### Task 5: 勘定科目管理画面の実装
**推定時間：** 4時間  
**優先度：** 高  
**依存：** Task 4

**このタスクの目的：**  
複式簿記の基盤となる勘定科目を管理できるようにする。取引入力より先に勘定科目が必要。

**なぜ取引入力より先か：**  
取引を入力するには勘定科目が必要。先に勘定科目管理を作り、初期データも投入することで、Task 6で取引入力をすぐテストできる。

**期待される成果物：**
- 勘定科目の一覧が階層構造で表示される
- 勘定科目の追加・編集・削除ができる
- タイプ別（資産/負債/純資産/収益/費用）にフィルタできる
- 初期データ（最低限の勘定科目）が投入されている
- バリデーションが機能する

**具体的な作業：**

#### 5.1 勘定科目一覧ページ
**ファイル：** `src/pages/Accounts/AccountList.tsx`

**表示内容：**
- 勘定科目のツリー表示（階層構造）
- タイプ別のフィルタ（資産/負債/純資産/収益/費用）
- 追加ボタン

#### 5.2 勘定科目追加・編集フォーム
**ファイル：** `src/pages/Accounts/AccountForm.tsx`

**入力項目：**
- 科目名
- タイプ（セレクトボックス）
- 親科目（階層構造用、オプション）
- 通貨（デフォルトJPY）

**バリデーション：**
- 科目名は必須
- 親科目が選択された場合、同じタイプであることを確認

#### 5.3 初期データのシード
**ファイル：** `src/utils/seedData.ts`

GnuCashのデフォルト科目を参考に、最低限の勘定科目を用意：
- 資産
  - 現金
  - 普通預金
- 負債
  - クレジットカード
- 純資産
  - 開始残高
- 収益
  - 給与
- 費用
  - 食費
  - 交通費
  - 光熱費

初回起動時に自動投入

#### 検証方法
- 勘定科目の追加・編集・削除が正常動作する
- 階層構造が正しく表示される（親子関係が視覚的に分かる）
- 使用中の勘定科目を削除しようとすると、非アクティブ化される
- バリデーションエラーが適切に表示される

---

### Task 6: 取引入力画面の実装
**推定時間：** 5時間  
**優先度：** 最高  
**依存：** Task 5

**このタスクの目的：**  
家計簿の核となる取引入力機能を実装する。これができれば実際に家計簿として使い始められる。

**なぜこれが最優先か：**  
MVP の最重要機能。取引を入力できないと家計簿として成立しない。勘定科目があるので、すぐに実用的なテストができる。

**期待される成果物：**
- 取引入力フォームが動作する
- 複数の仕訳明細を追加・削除できる
- 借方・貸方の合計が自動計算され、不一致時に警告が表示される
- 入力した取引がデータストアに保存される
- バリデーションが機能する

**具体的な作業：**

#### 6.1 取引入力フォーム
**ファイル：** `src/pages/Transactions/TransactionForm.tsx`

**入力項目：**
- 日付（DatePicker）
- 摘要（テキスト）
- 仕訳明細（動的に追加可能）
  - 科目（セレクトボックス）
  - 借方金額
  - 貸方金額
- 明細追加ボタン
- 明細削除ボタン

**機能：**
- 借方合計・貸方合計の自動計算と表示
- 合計不一致時の警告表示
- 保存前のバリデーション

#### 6.2 共通入力コンポーネント
**ファイル：** `src/components/Common/Input.tsx`  
**ファイル：** `src/components/Common/Select.tsx`  
**ファイル：** `src/components/Common/DatePicker.tsx`  
**ファイル：** `src/components/Common/Button.tsx`

基本的なフォーム要素の再利用可能コンポーネント

#### 6.3 勘定科目セレクター
**ファイル：** `src/components/Common/AccountSelect.tsx`

- 階層構造を考慮したセレクトボックス
- タイプでフィルタリング可能

#### 検証方法
- 取引の新規作成が可能
- 借方・貸方の合計チェックが機能（不一致時はエラー表示、保存不可）
- バリデーションエラーが適切に表示される
- 保存後、localStorage にデータが保存される
- ブラウザをリロードしてもデータが保持される

**Milestone 2 達成：** このタスク完了時点で、家計簿として最低限使える状態になる

---

### Task 7: 取引一覧画面の実装
**推定時間：** 3時間  
**優先度：** 高  
**依存：** Task 6

**このタスクの目的：**  
入力した取引を確認・編集・削除できるようにする。入力だけでは不十分で、過去の取引を見直せることが必要。

**なぜTask 8（レポート）より先か：**  
取引の編集・削除機能は頻繁に使う。レポートは月次で見るが、取引一覧は日常的に使う。実用性の高い順。

**期待される成果物：**
- 取引のリスト表示が動作する
- 日付でソートできる
- 期間でフィルタできる（月選択）
- 取引の編集・削除ができる
- 削除時に確認ダイアログが表示される

**具体的な作業：**

#### 7.1 取引一覧ページ
**ファイル：** `src/pages/Transactions/TransactionList.tsx`

**表示内容：**
- 取引のリスト表示（テーブル）
  - 日付
  - 摘要
  - 金額（簡易表示）
- 日付でのソート（デフォルト：新しい順）
- 期間フィルタ（月選択）
- 新規作成ボタン
- 各行に編集・削除ボタン

#### 7.2 取引詳細表示
**ファイル：** `src/pages/Transactions/TransactionDetail.tsx`

- 仕訳明細の完全表示
- 編集ボタン
- 削除ボタン（確認ダイアログ付き）

#### 7.3 共通コンポーネント
**ファイル：** `src/components/Common/Modal.tsx`

削除確認などに使用

#### 検証方法
- 取引一覧が正しく表示される
- フィルタリング（期間選択）が機能する
- ソート（日付順）が機能する
- 編集ボタンで取引入力フォームが開き、データが編集できる
- 削除ボタンで確認ダイアログが表示され、削除できる
- 削除後、一覧から消える

---

### Task 8: レポート画面の実装（簡易版）
**推定時間：** 4時間  
**優先度：** 中  
**依存：** Task 7

**このタスクの目的：**  
家計の状況を把握できるレポート機能を実装する。損益計算書と貸借対照表があれば、家計の健全性を確認できる。

**なぜこれがTask 9（ファイル操作）より先か：**  
レポートは家計簿の価値を直接提供する。ファイル操作はバックアップやデータ移行のための補助機能。

**期待される成果物：**
- 損益計算書が表示される（期間指定可能）
- 貸借対照表が表示される（基準日指定可能）
- 勘定科目別の内訳が階層表示される
- 合計金額が正しく計算される
- 貸借対照表がバランスする（資産 = 負債 + 純資産）

**具体的な作業：**

#### 8.1 レポートサービス
**ファイル：** `src/services/reportService.ts`

**実装する計算ロジック：**
```typescript
// 損益計算書データの生成
export function generateIncomeStatement(
  transactions: Transaction[],
  accounts: Account[],
  startDate: string,
  endDate: string
): IncomeStatementData

// 貸借対照表データの生成
export function generateBalanceSheet(
  transactions: Transaction[],
  accounts: Account[],
  date: string
): BalanceSheetData

// 勘定科目別残高の計算
function calculateAccountBalance(
  accountId: string,
  transactions: Transaction[],
  endDate?: string
): number
```

#### 8.2 損益計算書ページ
**ファイル：** `src/pages/Reports/IncomeStatement.tsx`

**表示内容：**
- 期間選択（開始日〜終了日）
- 収益合計
- 費用合計
- 差引（収益 - 費用）
- 勘定科目別の内訳（階層表示）

#### 8.3 貸借対照表ページ
**ファイル：** `src/pages/Reports/BalanceSheet.tsx`

**表示内容：**
- 基準日選択
- 資産合計
- 負債合計
- 純資産合計
- 勘定科目別の内訳（階層表示）
- バランスチェック（資産 = 負債 + 純資産）

#### 8.4 レポートメニュー
**ファイル：** `src/pages/Reports/ReportsIndex.tsx`

各レポートへのリンク

#### 検証方法
- 損益計算書が正しく計算される（収益 - 費用 = 利益）
- 貸借対照表がバランスする（資産 = 負債 + 純資産）
- 期間変更で再計算される
- 勘定科目の階層構造が正しく表示される
- 手入力した取引データでレポートが正確であることを確認

**Milestone 3 達成：** このタスク完了時点で、基本的な家計簿として完全に機能する

---

### Task 9: ファイル操作機能の実装
**推定時間：** 3時間  
**優先度：** 高  
**依存：** Task 3（DataStoreが必要）

**このタスクの目的：**  
データのバックアップとリストア機能を提供する。ブラウザのストレージは不安定なので、ファイルとして保存できることが重要。

**なぜこのタイミングか：**  
UI層の実装が一段落したので、データ保護機能を追加する。ユーザーが本格的に使い始める前に必要。

**期待される成果物：**
- データをJSONファイルとしてエクスポートできる
- JSONファイルからインポートできる
- File System Access API が動作する（Chrome/Edge）
- フォールバック（ダウンロードリンク）が動作する（Firefox/Safari）
- 不正なデータのインポート時にエラー表示される

**具体的な作業：**

#### 9.1 ファイルサービス
**ファイル：** `src/services/fileService.ts`

**実装する機能：**
```typescript
// ファイルへのエクスポート
export async function exportToFile(data: AppData): Promise<void>

// ファイルからのインポート
export async function importFromFile(file: File): Promise<AppData>

// File System Access API with フォールバック
```

#### 9.2 設定画面
**ファイル：** `src/pages/Settings/Settings.tsx`

**機能：**
- エクスポートボタン（JSONファイルダウンロード）
- インポートボタン（ファイル選択）
- データクリアボタン（確認ダイアログ付き）
- アプリ情報（バージョンなど）

#### 9.3 自動保存機能
- データ変更時に自動的に localStorage に保存
- Ctrl+S で手動保存（念のため）

#### 検証方法
- エクスポートしたファイルが正しいJSON形式である
- インポートで元のデータが完全に復元される
- 不正なJSONファイルをインポートするとエラーメッセージが表示される
- File System Access API 対応ブラウザで保存場所を選択できる
- 非対応ブラウザでダウンロードが機能する
- データクリア後、初期状態に戻る

---

### Task 10: エラーハンドリングとローディング表示
**推定時間：** 2時間  
**優先度：** 中  
**依存：** Task 1-9

**このタスクの目的：**  
ユーザー体験を向上させ、エラー発生時に適切なフィードバックを提供する。

**なぜこのタイミングか：**  
主要機能がすべて実装されたので、ユーザー体験を磨く段階。エラーハンドリングは全機能で共通して使う。

**期待される成果物：**
- エラー境界（ErrorBoundary）が設定されている
- ローディング表示が適切なタイミングで表示される
- 成功・エラーメッセージがトーストで表示される
- すべての非同期処理にローディング状態がある

**具体的な作業：**

#### 10.1 エラー境界
**ファイル：** `src/components/Common/ErrorBoundary.tsx`

React Error Boundary の実装

#### 10.2 ローディングコンポーネント
**ファイル：** `src/components/Common/Loading.tsx`

スピナーまたはスケルトン表示

#### 10.3 トーストメッセージ
**ファイル：** `src/components/Common/Toast.tsx`

成功・エラーメッセージの表示（シンプルな実装でOK）

#### 検証方法
- わざとエラーを発生させて、ErrorBoundary が機能することを確認
- データ読み込み中にローディング表示がある
- 操作完了時に成功メッセージが表示される
- エラー時に分かりやすいメッセージが表示される

---

### Task 11: 基本的なテストとデバッグ
**推定時間：** 3時間  
**優先度：** 中  
**依存：** Task 1-10

**このタスクの目的：**  
すべての機能が正常に動作することを確認し、発見されたバグを修正する。リリース前の品質保証。

**なぜこのタイミングか：**  
すべての機能が実装されたので、統合テストを行う。個別の機能は動いても、組み合わせで問題が出ることがある。

**期待される成果物：**
- すべての主要機能が正常動作することが確認されている
- エッジケースのテストが完了している
- 発見されたバグが修正されている
- 動作確認チェックリストが完了している

**具体的な作業：**

#### 11.1 主要機能の動作確認
- [ ] 勘定科目の追加・編集・削除
- [ ] 取引の入力・編集・削除
- [ ] レポートの表示（損益計算書、貸借対照表）
- [ ] ファイルのエクスポート・インポート
- [ ] ブラウザリロード後のデータ永続化

#### 11.2 エッジケースのテスト
- [ ] 空データでの起動
- [ ] 大量データ（100件以上の取引）
- [ ] 不正なデータのインポート
- [ ] 借方・貸方が合わない取引の入力試行
- [ ] 使用中の勘定科目の削除試行
- [ ] 親科目を持つ勘定科目の削除試行

#### 11.3 ブラウザ互換性テスト
- [ ] Chrome/Edge での動作確認
- [ ] Firefox での動作確認（File System Access API フォールバック）
- [ ] Safari での動作確認（可能であれば）

#### 11.4 バグ修正
発見されたバグの修正とリグレッションテスト

#### 検証方法
- すべてのチェックリストが完了している
- クリティカルなバグがない（軽微なバグは Phase 2 で対応可）
- 実際のユースケース（1ヶ月分の家計簿入力）で問題なく動作する

---

### Task 12: ドキュメントとクリーンアップ
**推定時間：** 1時間  
**優先度：** 低  
**依存：** Task 11

**このタスクの目的：**  
プロジェクトを他の人（または未来の自分）が理解できるようにする。プロダクションビルドの準備。

**なぜ最後か：**  
すべての実装が完了してから、正確なドキュメントを書ける。コードの最終調整も含む。

**期待される成果物：**
- README.md が作成されている（使い方、セットアップ方法）
- コードがクリーンアップされている
- プロダクションビルドが成功する
- ビルドしたアプリが正常動作する

**具体的な作業：**

#### 12.1 README.md の作成
最低限含めるべき内容：
- プロジェクト概要
- セットアップ方法（`npm install`, `npm run dev`）
- 基本的な使い方
- データのバックアップ方法
- Phase 2 以降の予定

#### 12.2 コードのクリーンアップ
- 不要なコメント削除
- console.log の削除（デバッグ用）
- 未使用のインポート削除
- コードフォーマット統一

#### 12.3 ビルドの確認
```bash
npm run build
npm run preview
```

#### 検証方法
- ビルドがエラーなく完了する
- プロダクションビルドが正常動作する
- README.md の手順通りにセットアップできる

**Milestone 4 達成：** MVP 完成！

---

## 実装の優先順位

### Week 1（最優先）
1. Task 0: プロジェクトセットアップ
2. Task 1: 型定義
3. Task 2: データストア
4. Task 3: React Context
5. Task 4: ルーティング
6. Task 5: 勘定科目管理
7. Task 6: 取引入力

**ゴール：** 取引の入力・保存ができる状態

### Week 2（優先）
8. Task 7: 取引一覧
9. Task 8: レポート
10. Task 9: ファイル操作
11. Task 10: エラーハンドリング
12. Task 11: テスト
13. Task 12: ドキュメント

**ゴール：** MVP完成

---

## 開発時の注意事項

### コーディング規約

#### TypeScript
- `strict: true` を使用
- `any` 型は極力避ける
- 関数の戻り値の型を明示

#### React
- 関数コンポーネントを使用
- Props の型定義を明確に
- useEffect の依存配列を正確に

#### スタイリング
- SCSS を使用
- BEM命名規則（推奨）
- CSS Variables で色やサイズを管理

#### ファイル命名
- コンポーネント: PascalCase（例: `AccountList.tsx`）
- ユーティリティ: camelCase（例: `dateUtils.ts`）
- 定数: UPPER_SNAKE_CASE

### デバッグのポイント

#### データが保存されない場合
1. localStorage の確認（Developer Tools > Application > Local Storage）
2. DataStore.save() が呼ばれているか
3. エラーがコンソールに出ていないか

#### 借方・貸方が合わない
1. 計算ロジックの確認
2. 浮動小数点誤差の考慮（0.01以下の差は許容）
3. 入力値の型（string vs number）

#### コンポーネントが再レンダリングされない
1. Context の値が変更されているか
2. useEffect の依存配列が正しいか
3. 状態の更新が正しく行われているか

---

## 完成の定義（Definition of Done）

Phase 1 MVP は以下の条件を満たした時点で完成とする：

### 機能要件
- [ ] 勘定科目の追加・編集・削除ができる
- [ ] 階層構造の勘定科目が表示できる
- [ ] 取引を入力できる（借方・貸方）
- [ ] 取引一覧が表示できる
- [ ] 取引の編集・削除ができる
- [ ] 損益計算書が表示できる
- [ ] 貸借対照表が表示できる
- [ ] データをファイルにエクスポートできる
- [ ] ファイルからデータをインポートできる

### 非機能要件
- [ ] ブラウザリロード後もデータが保持される
- [ ] 入力バリデーションが機能する
- [ ] エラーメッセージが適切に表示される
- [ ] レスポンシブではないがPCで使用可能
- [ ] TypeScriptのコンパイルエラーなし

### ドキュメント
- [ ] README.md が作成されている
- [ ] 基本的な使い方が記載されている

---

## Phase 2 への準備

Phase 1 完成後、以下を検討：

### 優先度：高
1. **スマホ対応**
   - レスポンシブデザインの実装
   - タッチ操作の最適化
   - モバイル向けUI調整

2. **GnuCashインポート**
   - XML解析（gzip対応）
   - データマッピング
   - エラーハンドリング

### 優先度：中
3. **グラフ表示**
   - recharts などのライブラリ導入
   - 資産推移グラフ
   - 費用内訳グラフ

4. **予算管理**
   - 予算設定UI
   - 実績との比較表示
   - 予算超過アラート

5. **テンプレート機能**
   - よく使う取引の保存
   - ワンクリック入力
   - テンプレート管理画面

### 優先度：低
6. **複数通貨対応**
   - 為替レート管理
   - 通貨別残高表示
   - 日本円換算表示

7. **クラウド同期**
   - Google Drive連携
   - 自動同期
   - 競合解決

---

**文書バージョン：** 1.1  
**作成日：** 2025-10-17  
**最終更新：** 2025-10-17
