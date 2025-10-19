# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**KKB (K's Kakeibo)** is a double-entry bookkeeping household budget application being developed as a replacement for GnuCash. The project aims to maintain GnuCash's strengths (local-first, double-entry accounting) while solving smartphone compatibility and Japanese input issues.

**Development Stage:** Tasks 0-3 completed; implementation in progress.

**Target Timeline:** 1-2 weeks for MVP (Phase 1)

**Current Task:** Task 8 - Reports (P&L and Balance Sheet)

**Related Documents:**
- `requirements.md` - Detailed requirements specification (in Japanese)
- `task_breakdown.md` - Phase 1 task breakdown (in Japanese)
- `tech_stack_selection.md` - Technical stack selection rationale (in Japanese)

## Core Design Principles

1. **Local-first architecture** - All data stored locally; cloud sync is optional
2. **Double-entry accounting** - Debit and credit must always balance
3. **Progressive enhancement** - Start with JSON storage, migrate to SQLite if needed
4. **YAGNI principle** - Implement only what's necessary for current phase
5. **Data integrity first** - Validation and data layer come before UI

## Technical Stack (Phase 1)

- **Build Tool:** Vite
- **Framework:** React 18+ with TypeScript (strict mode)
- **Routing:** React Router DOM
- **State Management:** Context API (upgrade to Zustand if complexity increases)
- **Styling:** SCSS + CSS Variables
- **Data Storage:** JSON in localStorage (IndexedDB for >5MB data)
- **File Operations:** File System Access API with fallback
- **Distribution:** PWA (Progressive Web App)

**Deferred to later phases:**
- Rust/WASM (for GnuCash XML parsing and complex calculations)
- SQLite/sql.js (when data exceeds 10,000 transactions)
- Tauri (for native app distribution)

## Project Structure

```
src/
├── types/           # TypeScript type definitions (Account, Transaction, Entry, etc.)
├── store/           # Data store and React Context
│   ├── DataStore.ts # Core data management class
│   ├── AppContext.tsx
│   └── hooks.ts     # Custom hooks (useAccounts, useTransactions)
├── services/        # Business logic layer
│   ├── fileService.ts    # Import/export JSON files
│   ├── storageService.ts # localStorage/IndexedDB wrapper
│   ├── reportService.ts  # P&L, balance sheet calculations
│   ├── importService.ts  # GnuCash XML import (Phase 3+)
│   └── syncService.ts    # Cloud sync (Phase 3+)
├── utils/           # Pure utility functions
│   ├── date.ts
│   ├── id.ts       # UUID generation
│   ├── validation.ts
│   └── calculations.ts
├── pages/           # Page components (route endpoints)
│   ├── Dashboard.tsx
│   ├── Transactions/
│   ├── Accounts/
│   ├── Reports/
│   └── Settings/
├── components/      # Reusable UI components
│   ├── Layout/     # Header, Sidebar, Footer
│   └── Common/     # Button, Input, Select, DatePicker, Modal
└── styles/          # SCSS files with CSS Variables
```

## Development Commands

### Initial Setup
Setup is complete. The project includes:
- ✅ Vite + React + TypeScript project structure
- ✅ Dependencies installed (react-router-dom, sass, vite-plugin-pwa, vitest)
- ✅ Directory structure created under `src/`
- ✅ PWA configuration in `vite.config.ts`
- ✅ TypeScript strict mode enabled

### Development
```bash
npm run dev          # Start dev server (http://localhost:5173)
```

### Build
```bash
npm run build        # Production build
npm run preview      # Preview production build
```

### Testing
```bash
npm run test         # Run tests (Vitest)
npm run test:ui      # Run tests with UI
```

## Data Architecture

### Core Data Types

All data types are defined in `src/types/index.ts`:

- **Account** - Chart of accounts with hierarchy support
  - Types: 資産 (Asset), 負債 (Liability), 純資産 (Equity), 収益 (Revenue), 費用 (Expense)
  - Fields: id, name, type, parent_id, currency, is_active, timestamps

- **Transaction** - Financial transactions
  - Contains multiple Entry records (double-entry)
  - Fields: id, date, description, entries[], timestamps

- **Entry** - Journal entry line item
  - Fields: account_id, debit, credit
  - Constraint: Sum of debits must equal sum of credits

- **AppData** - Root data structure
  - Contains: accounts[], transactions[], version, lastModified

### Data Flow

```
UI Component → Custom Hook (useAccounts/useTransactions)
     ↓
React Context (AppContext)
     ↓
DataStore (business logic + validation)
     ↓
Storage Service (localStorage/IndexedDB)
```

### Validation Rules

**Critical validations in DataStore:**
1. Transaction balance check: `sum(debits) === sum(credits)`
2. Account deletion: If account has transactions, set `is_active = false` instead of deleting
3. Parent account type matching: Child accounts must have same type as parent
4. Required fields validation

## Implementation Approach

### Development Order (Bottom-Up)

Follow this strict order to minimize rework:

```
Data Layer → Business Logic → UI Layer → Integration
```

**Rationale:** The data layer is the foundation. Building UI before data is stable leads to major refactoring.

### Phase 1 Milestones

1. **Week 1 前半** - Data persistence working (Tasks 0-3)
2. **Week 1 後半** - Transaction entry working (Tasks 4-6)
3. **Week 2 前半** - Data viewing working (Tasks 7-8)
4. **Week 2 後半** - MVP complete (Tasks 9-12)

### Task Sequence (Phase 1 MVP)

0. ✅ Project setup (Vite + React + TypeScript) - **COMPLETED**
1. ✅ Type definitions (`src/types/`) - **COMPLETED**
2. ✅ **DataStore implementation** (most critical - test thoroughly) - **COMPLETED**
3. ✅ React Context integration - **COMPLETED**
4. ✅ Routing and layout - **COMPLETED**
5. ✅ Account management UI - **COMPLETED**
6. ✅ Transaction entry form - **COMPLETED**
7. ✅ Transaction list view - **COMPLETED**
8. Reports (P&L and Balance Sheet) - **NEXT**
9. File import/export
10. Error handling and loading states
11. Testing and debugging
12. Documentation

**Why this order?** Each task depends on the previous being stable. DataStore (Task 2) is the most critical component - if this is buggy, everything breaks.

## Critical Implementation Notes

### DataStore Testing

Before proceeding to UI, verify DataStore with these tests:
- Save and load data from localStorage
- Transaction validation: reject unbalanced entries
- Account deletion: transactions should prevent deletion
- Edge cases: empty data, large datasets (100+ transactions)

### Transaction Entry Form

The most complex UI component. Key requirements:
- Dynamic entry rows (add/remove journal entries)
- Real-time debit/credit totals
- Balance mismatch warning
- Disable save button if not balanced

### Report Calculations

Core calculation logic in `reportService.ts`:
- `calculateAccountBalance(accountId, transactions, endDate?)` - account balance at a point in time
- `generateIncomeStatement(transactions, accounts, startDate, endDate)` - P&L statement
- `generateBalanceSheet(transactions, accounts, date)` - balance sheet

**Verification:** Balance sheet must balance: `Assets = Liabilities + Equity`

## File Operations

### Export/Import Flow

```typescript
// Export: AppData → JSON.stringify → File System Access API → Save to disk
// Import: Load from disk → JSON.parse → Validate schema → DataStore.load()
```

**Browser Compatibility:**
- Chrome/Edge: Use File System Access API (can overwrite files)
- Firefox/Safari: Fallback to download/upload with `<a>` tag and file input

## Coding Standards

### TypeScript
- Use `strict: true` mode
- Avoid `any` type - use `unknown` if necessary
- Explicit return types for all functions
- Prefer interfaces over types for object shapes

### React
- Function components only (no class components)
- Explicit prop types with interfaces
- Accurate dependency arrays in `useEffect`
- Use `React.memo()` only when profiling shows performance issues

### Styling
- SCSS with BEM naming convention (recommended)
- CSS Variables for colors, spacing, fonts
- Mobile-first responsive design (deferred to Phase 2)

### File Naming
- Components: PascalCase (e.g., `AccountList.tsx`)
- Utilities: camelCase (e.g., `dateUtils.ts`)
- Constants: UPPER_SNAKE_CASE

## Common Debugging Scenarios

### Data not persisting
1. Check localStorage in DevTools (Application > Local Storage)
2. Verify `DataStore.save()` is called after mutations
3. Check console for errors

### Balance sheet doesn't balance
1. Verify all transactions have balanced entries
2. Check account type classification (asset/liability/equity)
3. Verify calculation logic includes all relevant accounts

### Component not re-rendering
1. Verify Context value is changing (not mutating in place)
2. Check `useEffect` dependency arrays
3. Confirm state updates are immutable

## Phase Boundaries

### Phase 1 Scope (MVP)
**INCLUDED:** Account management, transaction entry/list, P&L/BS reports, file import/export

**EXCLUDED:**
- Smartphone-optimized UI (responsive design)
- GnuCash XML import
- Cloud sync (Google Drive)
- Budget management
- Charts/graphs
- Templates
- Multi-currency support

### When to Stop and Review

Before moving to Phase 2, ensure:
- All Phase 1 tasks (0-12) completed
- Manual testing of core workflows successful
- Data can survive browser reload and file export/import
- No critical bugs (minor UI issues acceptable)

## Performance Targets

- **Startup:** <3 seconds
- **Transaction entry response:** <1 second
- **Report generation:** <5 seconds (for annual data)
- **Data size:** Optimize for 1000-5000 transactions/year

## Development Workflow

### GitHub Issue-Based Development

All development work follows this workflow:

1. **Create Issue** - Use `gh issue create` to create a GitHub issue describing the task
2. **Create Branch** - Create a feature branch from main: `git checkout -b feature/issue-XX-description`
3. **Implementation** - Make changes and commit following commit message conventions
4. **Push** - Push branch to remote: `git push -u origin branch-name`
5. **Create PR** - Use `gh pr create` to create a pull request that references the issue
6. **Review** - Code review by project owner
7. **Merge** - Merge to main after approval

### Branch Naming Convention

- **Feature:** `feature/issue-XX-short-description`
- **Bug Fix:** `fix/issue-XX-short-description`
- **Documentation:** `docs/issue-XX-short-description`
- **Refactoring:** `refactor/issue-XX-short-description`

### Commit Message Convention

Follow Conventional Commits format:

```
<type>: <description>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `chore:` - Maintenance tasks

### PR Creation

When creating PRs:
- Title should clearly describe the change
- Body should include:
  - Summary of changes (bullet points)
  - Test plan/checklist
  - Reference to issue: `Closes #XX`

### Git Commit Rules

**IMPORTANT:**
- **NEVER use `git commit --amend` after `git push`**
  - Once commits are pushed to remote, they should not be modified
  - Amending pushed commits can cause issues for collaborators and PR reviews
  - If you need to make changes after pushing, create a new commit instead
- You may amend commits that are still local (before first push)
- Use `git revert` to undo changes in pushed commits if necessary

## Translation Note

- **Code and documentation:** English
- **UI text and messages:** Japanese (日本語)
- Comments in code may be in Japanese for complex business logic

## Getting Started

### For New Claude Code Instances

If you're starting work on this project:

1. **Read the planning documents** first to understand the full context:
   - `requirements.md` - Complete requirements (Japanese)
   - `task_breakdown.md` - Detailed task breakdown with implementation order (Japanese)
   - `tech_stack_selection.md` - Technology choices and rationale (Japanese)

2. **Check current implementation status**:
   - Tasks 0-3 (Project Setup, Type definitions, DataStore, React Context) are complete
   - Currently working on Task 4 (Routing and layout)
   - Follow the task sequence in order

3. **Follow the bottom-up approach**: Data Layer → Business Logic → UI Layer → Integration

4. **Use GitHub workflow**: Create issue → Create branch → Implement → Push → Create PR

### Current Implementation Status

**Completed:**
- ✅ Task 0: Project Setup (PR #6)
  - Vite + React + TypeScript project initialized
  - Dependencies installed
  - Directory structure created
  - PWA configuration added

- ✅ Task 1: Type definitions (PR #8)
  - Core type definitions: Account, Transaction, Entry, AppData
  - Account type labels and constants
  - TypeScript strict mode compatible

- ✅ Task 2: DataStore implementation (PR #10)
  - Core data management class with CRUD operations
  - Comprehensive validation logic (balance check, soft delete, type matching)
  - Utility functions (UUID generation, date handling)
  - 29 passing unit tests

- ✅ Task 3: React Context integration (PR #12)
  - AppContext with DataStore integration and localStorage persistence
  - Custom hooks: useAccounts and useTransactions
  - Comprehensive tests (16 tests for Context, 45 total)
  - Demo UI integrated in App.tsx
  - Optimized with useMemo for performance

- ✅ Task 4: Routing and layout (PR #14)
  - React Router DOM v6 implementation
  - 7 page routes defined (Dashboard, Transactions, Accounts, Reports, Settings)
  - Layout components: Header, Sidebar, Footer, MainLayout
  - Placeholder pages for all routes
  - CSS Variables-based styling with BEM naming
  - 9 tests added (54 total)

- ✅ Task 5: Account management UI (PR #16)
  - AccountList component with hierarchical display
  - AccountForm component with create/edit modes
  - Full CRUD operations (Create, Read, Update, Delete)
  - Soft delete for accounts with transactions
  - Form validation (required fields, duplicate check, type matching)
  - Initial account data seeder (8 basic accounts)
  - Error handling with try-catch and user feedback
  - 13 tests added (81 total)

- ✅ Task 6: Transaction entry form (PR #18)
  - TransactionForm component with dynamic entry rows (add/remove)
  - Real-time debit/credit balance calculation and validation
  - TransactionList component with proper double-entry display
  - Table-based layout with aligned debit/credit columns
  - Multi-row display for unbalanced entry counts (e.g., 1 debit, 2 credits)
  - Full CRUD operations (Create, Read, Update, Delete)
  - Edit transactions inline in list view
  - Semantic HTML structure (table, fieldset, proper form elements)
  - Currency units on all amounts
  - Navigation paths corrected (/transactions, /transactions/new)
  - Success messages without automatic page navigation
  - Enhanced date utilities (formatDateForInput, improved validation)
  - 24 new tests added (111 total)

- ✅ Task 7: Transaction list view (PR #20)
  - Month filter for transactions (dropdown with available months)
  - Sort order toggle (newest/oldest) with visual indicator
  - Transaction detail page with full entry display
  - Navigation from list to detail view
  - Edit navigation from detail to list with auto-open form
  - Comprehensive styling for list and detail pages
  - BEM-compliant CSS with proper color contrast
  - Utility functions extracted (getAccountName, formatDateWithSlash, formatDateJapanese)
  - Locale specification for all number formatting (ja-JP)
  - Date parsing vulnerability fixed
  - 32 new tests added (143 total)

**Next:**
- Task 8: Reports (P&L and Balance Sheet)
