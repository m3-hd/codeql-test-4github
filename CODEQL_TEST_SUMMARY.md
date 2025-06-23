# CodeQL Vulnerability Detection Test Files

## 問題の背景

GitHub からの通知によると、以前に導入された脆弱性は実際に悪用する方法がなかったため無視されました。CodeQL がセキュリティ問題を検出するには、以下の条件が必要です：

1. **Source（ソース）**: 攻撃者が制御できるデータの入力点
2. **Sink（シンク）**: 危険な処理を行うコードの部分
3. **実行可能なパス**: Source から Sink までのデータフローが存在すること

## 作成したテストファイル

### Backend (Kotlin/Spring Boot)

#### 1. `VulnerableController.kt`

- **場所**: `apps/manage/backend/src/main/kotlin/com/ieyasu/manage/controller/VulnerableController.kt`
- **目的**: HTTP エンドポイントを通じてユーザー入力を受け取り、脆弱なメソッドに渡す
- **検出される脆弱性**:
  - SQL Injection (`/api/vulnerable/users`, `/api/vulnerable/login`)
  - Command Injection (`/api/vulnerable/execute`)
  - Path Traversal (`/api/vulnerable/file`)
  - XSS (`/api/vulnerable/echo`)
  - LDAP Injection (`/api/vulnerable/ldap`)
  - Insecure Deserialization (`/api/vulnerable/deserialize`)
  - XXE (`/api/vulnerable/xml`)
  - HTTP Header Injection (`/api/vulnerable/redirect`)

#### 2. `BackendApplication.kt` (既存ファイルの更新)

- 脆弱なメソッドは既に存在していたが、今回の Controller によって実際に呼び出されるようになった

### Frontend (TypeScript/React/Next.js)

#### 1. `VulnerableComponent.tsx`

- **場所**: `apps/manage/frontend/src/components/VulnerableComponent.tsx`
- **目的**: ユーザー入力を受け取り、複数の脆弱な処理を実行する React コンポーネント
- **検出される脆弱性**:
  - DOM-based XSS (innerHTML)
  - Client-side Code Injection (eval)
  - Insecure API calls
  - Weak cryptography usage
  - Insecure random number generation
  - Sensitive data in localStorage

#### 2. `vulnerable-test.tsx`

- **場所**: `apps/manage/frontend/src/pages/vulnerable-test.tsx`
- **目的**: 複数の Source から Sink へのデータフローを作成するテストページ
- **Source（攻撃者制御データ）**:
  - URL parameters (`router.query`)
  - Form input (`useState`)
  - localStorage data
  - postMessage events
  - document.cookie
  - window.location.hash
- **Sink（危険な処理）**:
  - `eval()` execution
  - Command injection
  - File operations
  - DOM manipulation (innerHTML)

#### 3. `securityIssues.ts` (既存ファイルの更新)

- Command injection メソッドのコメントアウトを解除
- 実際に呼び出し可能な脆弱なメソッドを提供

## データフローの例

### 1. SQL Injection (Backend)

```
Source: HTTP Request Parameter (/api/vulnerable/users?name=malicious)
↓
Flow: VulnerableController.getUsers()
↓
Sink: BackendApplication.unsafeSQL() → SQL query execution
```

### 2. XSS (Frontend)

```
Source: URL Parameter (?input=<script>alert('xss')</script>)
↓
Flow: useRouter().query → useState → VulnerableComponent
↓
Sink: dangerouslySetInnerHTML / element.innerHTML
```

### 3. Command Injection (Frontend)

```
Source: postMessage event data
↓
Flow: window.addEventListener('message') → event.data
↓
Sink: securityIssues.commandInjection() → child_process.exec()
```

## CodeQL 検出のポイント

1. **完全なデータフロー**: 外部入力から危険な処理まで追跡可能
2. **実際の使用**: 脆弱なメソッドが実際にアプリケーションで呼び出される
3. **複数のパターン**: 異なる種類の脆弱性と攻撃ベクター
4. **現実的なシナリオ**: 実際の Web アプリケーションで起こりうる状況

## テスト方法

### Backend

```bash
cd apps/manage/backend
./gradlew build
```

### Frontend

```bash
cd apps/manage/frontend
yarn install
yarn build
```

### CodeQL 実行

```bash
# Backend analysis
github/codeql-action/analyze@v3 (java-kotlin)

# Frontend analysis
github/codeql-action/analyze@v3 (javascript-typescript)
```

## 期待される結果

CodeQL は以下の脆弱性を検出するはずです：

- **High severity**: SQL Injection, Command Injection, Code Injection
- **Medium severity**: XSS, Path Traversal, XXE, Insecure Deserialization
- **Low severity**: Weak Cryptography, Information Disclosure

これらのファイルにより、CodeQL は実際に悪用可能な脆弱性として検出し、セキュリティアラートを生成するはずです。
