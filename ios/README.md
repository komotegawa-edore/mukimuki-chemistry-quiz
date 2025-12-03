# Roopy iOS App

受験学習アプリ「Roopy」のiOS版（SwiftUI + Supabase）

## 📱 機能

- **ホーム画面**: ポイント・連続ログイン・バッジ・お知らせ表示
- **クエスト**: 章ごとのクイズ（4択問題）
- **ドリル**: 単語カード学習（フラッシュカード）
- **認証**: メール/パスワード、LINE OAuth、マジックリンク

## 🛠 技術スタック

- **Swift 5.9+**
- **SwiftUI** (iOS 17+)
- **Supabase Swift SDK**
- **MVVM アーキテクチャ**

## 📁 プロジェクト構成

```
ios/
├── Roopy/
│   ├── Assets.xcassets/     # アイコン・画像
│   ├── Models/              # データモデル（Codable）
│   ├── Services/            # API通信層
│   ├── ViewModels/          # ビューモデル
│   ├── Views/               # SwiftUI ビュー
│   │   ├── Auth/
│   │   ├── Home/
│   │   ├── Quest/
│   │   ├── Quiz/
│   │   └── Drill/
│   ├── Theme/               # カラー・スタイル
│   ├── Supabase.swift       # Supabase クライアント
│   └── Info.plist
├── scripts/
│   └── generate-app-icons.sh
└── README.md
```

## 🚀 セットアップ

### 1. Xcodeプロジェクト作成

```bash
# Xcodeで新規プロジェクトを作成
# 1. File → New → Project
# 2. iOS → App を選択
# 3. Product Name: Roopy
# 4. Interface: SwiftUI
# 5. Language: Swift
# 6. 保存先: mukimuki/ios/
```

### 2. Swift Package Manager でSupabase追加

Xcode で:
1. File → Add Package Dependencies...
2. URL: `https://github.com/supabase/supabase-swift`
3. バージョン: `2.0.0` 以上
4. 必要なライブラリ: `Supabase`

### 3. ファイルをプロジェクトに追加

1. Roopy フォルダ内のファイルをXcodeプロジェクトにドラッグ&ドロップ
2. "Copy items if needed" はオフ
3. "Create groups" を選択

### 4. ビルド設定

- **Deployment Target**: iOS 17.0
- **Bundle Identifier**: `com.yourcompany.roopy`
- **URL Schemes**: `roopy` (Info.plist で設定済み)

### 5. アプリアイコン生成

```bash
cd ios/scripts
./generate-app-icons.sh
```

## 🔐 Supabase 設定

`Supabase.swift` に以下の情報を設定:

```swift
let supabase = SupabaseClient(
    supabaseURL: URL(string: "YOUR_SUPABASE_URL")!,
    supabaseKey: "YOUR_ANON_KEY"
)
```

### LINE OAuth 設定

1. Supabase Dashboard → Authentication → Providers → LINE
2. LINE Developers Console でアプリ作成
3. Callback URL: `roopy://login-callback`

## 🎨 デザイン

Webアプリと同じカラーパレットを使用:

| 名前 | Hex | 用途 |
|------|-----|------|
| Primary | `#5DDFC3` | メインカラー |
| Background | `#E0F7F1` | 背景 |
| Text | `#3A405A` | テキスト |
| Gold | `#FFD700` | ポイント |

## 📝 TODO

- [ ] 履歴画面の実装
- [ ] 復習モードの実装
- [ ] プッシュ通知
- [ ] オフライン対応
- [ ] ウィジェット

## 📄 ライセンス

Private
