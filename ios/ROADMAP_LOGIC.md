# 学習ロードマップ作成ロジック

このドキュメントは、Roopy iOSアプリの学習ロードマップ生成ロジックをまとめたものです。
ロジックを修正する際の参照用として使用してください。

---

## 目次

1. [全体フロー](#1-全体フロー)
2. [入力パラメータ](#2-入力パラメータ)
3. [ステージ判定ロジック](#3-ステージ判定ロジック)
4. [志望校レベルと目標ステージ](#4-志望校レベルと目標ステージ)
5. [教材カテゴリとルール](#5-教材カテゴリとルール)
6. [ロードマップ生成ロジック](#6-ロードマップ生成ロジック)
7. [所要日数の計算](#7-所要日数の計算)
8. [週2回ペースの計算（長文用）](#8-週2回ペースの計算長文用)
9. [出力構造体](#9-出力構造体)
10. [DB保存フロー](#10-db保存フロー)
11. [ファイル構成](#11-ファイル構成)
12. [カスタマイズポイント](#12-カスタマイズポイント)

---

## 1. 全体フロー

```
┌─────────────────────────┐
│  RoadmapInputView       │  ユーザー入力
│  (学年/偏差値/志望校)    │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ StageDeterminationService│  ステージ判定
│ (E1～E10を決定)          │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ MaterialSelectionView   │  教材選択
│ (グループ化して表示)     │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ RoadmapGeneratorService │  ロードマップ生成
│ (スケジュール・タスク)   │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ RoadmapService          │  Supabase保存
│ (DB永続化)              │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ RoadmapTabView          │  表示
│ (ガントチャート等)       │
└─────────────────────────┘
```

**関連ファイル:**
- `Views/Roadmap/RoadmapInputView.swift`
- `Services/Roadmap/RoadmapGeneratorService.swift`
- `Services/Roadmap/RoadmapService.swift`

---

## 2. 入力パラメータ

### 2.1 ユーザー入力項目

| 項目 | 変数名 | 型 | 説明 | 選択肢 |
|------|--------|-----|------|--------|
| 学年 | `selectedYear` | `SchoolYear` | 現在の学年 | 高1/高2/高3/既卒 |
| 模試種類 | `selectedExamType` | `MockExamType` | 受験した模試 | 河合/駿台/進研/東進 |
| 偏差値 | `deviationValue` | `Double` | 模試の偏差値 | 30～80 |
| 志望校レベル | `selectedTargetLevel` | `TargetLevel` | 目標とする大学群 | 日東駒専～東大 |
| 苦手分野 | `selectedWeakAreas` | `Set<WeakArea>` | 複数選択可 | 単語/文法/長文等 |
| 学習時間 | `dailyStudyMinutes` | `Int` | 1日の学習時間 | 30/60/90/120/150/180分 |
| 試験日 | `examDate` | `Date` | 目標の試験日 | 日付選択 |

### 2.2 API送信用構造体

```swift
struct RoadmapInputParams: Encodable {
    let currentLevel: String           // ステージ判定結果（E1～E10）
    let currentDeviationValue: Double? // 偏差値
    let weakAreas: [String]            // 苦手分野配列
    let dailyStudyMinutes: Int         // 1日の学習時間
    let daysUntilExam: Int             // 試験までの日数
    let targetUniversity: String?      // 志望校名（オプション）
    let targetLevel: String            // 志望レベル（"MARCH"など）
}
```

**修正箇所:** `ViewModels/Roadmap/RoadmapInputViewModel.swift`

---

## 3. ステージ判定ロジック

**ファイル:** `Models/Roadmap/StageDetermination.swift`

### 3.1 3段階の判定プロセス

#### Step 1: 模試種類による偏差値補正

```swift
let adjustedDeviation = deviation + examType.deviationAdjustment
```

| 模試種類 | 補正値 | 理由 |
|---------|-------|------|
| 河合全統 | +0 | 基準 |
| 駿台全国 | +5 | 難しいため高く評価 |
| 進研模試 | -10 | 易しいため低く評価 |
| 東進 | -3 | やや易しい |

**修正箇所:** `MockExamType.deviationAdjustment`

#### Step 2: 補正後偏差値 → ベースステージ

```swift
switch adjustedDeviation {
case ..<40:   return 1  // E1
case 40..<45: return 1  // E1
case 45..<50: return 2  // E2
case 50..<55: return 2  // E2
case 55..<60: return 3  // E3
case 60..<65: return 3  // E3
case 65..<70: return 4  // E4
default:      return 5  // E5+
}
```

| 補正後偏差値 | ベースステージ | レベル |
|-------------|---------------|--------|
| ～40 | E1 | 中学レベル |
| 40～50 | E2 | 高1基礎 |
| 50～60 | E3 | 基礎文法 |
| 60～70 | E4 | 文法演習 |
| 70～ | E5 | 応用レベル |

**修正箇所:** `StageDeterminationService.determineBaseStage()`

#### Step 3: 学年による補正

```swift
finalStageNumber = baseStage + year.stageOffset
// 範囲: E1～E10に制限
```

| 学年 | 補正値 |
|-----|-------|
| 高1 | +0 |
| 高2 | +1 |
| 高3 | +2 |
| 既卒 | +2 |

**修正箇所:** `SchoolYear.stageOffset`

### 3.2 判定結果の構造体

```swift
struct StageDeterminationResult {
    let stage: String              // E1～E10
    let description: String        // 日本語説明
    let achievableLevel: String    // 到達可能な大学レベル
    let inputYear: SchoolYear
    let inputExamType: MockExamType
    let inputDeviation: Double
    let adjustedDeviation: Double
}
```

---

## 4. 志望校レベルと目標ステージ

**ファイル:** `Models/Roadmap/StageDetermination.swift`

| 志望校レベル | enum値 | 目標ステージ |
|-------------|--------|-------------|
| 日東駒専 | `nittouKomaSen` | E6 |
| MARCH | `march` | E7 |
| 関関同立 | `kanKanDouRitsu` | E7 |
| 早慶 | `earlyKeio` | E8 |
| 阪大 | `osaka` | E9 |
| 京大 | `kyoto` | E10 |
| 東大 | `tokyo` | E10 |

**修正箇所:** `TargetLevel.requiredStage`

---

## 5. 教材カテゴリとルール

**ファイル:** `Models/Roadmap/CategoryRules.swift`

### 5.1 カテゴリ定義（8種類）

| カテゴリ | enum値 | ステージ範囲 | 進行タイプ |
|---------|--------|------------|-----------|
| 単語 | `vocabulary` | E1～E10 | **並行**（毎日） |
| 熟語 | `idiom` | E5～E10 | **並行**（毎日） |
| 文法 | `grammar` | E1～E4 | 順次 |
| 解釈 | `interpretation` | E4～E10 | 順次 |
| 長文 | `reading` | E5～E10 | 順次（週2回） |
| 英作文 | `writing` | E6～E10 | オプション |
| リスニング | `listening` | E8～E10 | オプション |
| 過去問 | `pastExam` | E9～E10 | 最終段階 |

### 5.2 進行ルール

```swift
// 並行進行カテゴリ（試験日まで毎日）
static let parallelCategories = ["単語", "熟語"]

// 順次進行の順序
static let sequentialOrder = ["文法", "解釈", "長文", "英作文", "リスニング", "過去問"]
```

**修正箇所:** `CategoryRules.parallelCategories`, `CategoryRules.sequentialOrder`

### 5.3 制約ルール

#### 同時進行禁止ペア

```swift
static let exclusivePairs: [[String]] = [
    ["文法", "解釈"]  // 文法と解釈は同時に進められない
]

static func canRunInParallel(_ category1: String, _ category2: String) -> Bool {
    !exclusivePairs.contains { pair in
        pair.contains(category1) && pair.contains(category2)
    }
}
```

**修正箇所:** `CategoryRules.exclusivePairs`

#### カテゴリ別の特殊ルール

| カテゴリ | ルール | 実装箇所 |
|---------|-------|---------|
| 単語・熟語 | 試験日まで毎日20分 | `generateSchedule()` |
| 長文 | 週2回ペース（火・土） | `ReadingScheduleHelper` |
| リスニング | 1日30分以下 | `generateSchedule()` |
| 過去問 | 最後に配置 | `sequentialOrder` |

---

## 6. ロードマップ生成ロジック

**ファイル:** `Services/Roadmap/RoadmapGeneratorService.swift`（591行）

### 6.1 メイン関数

```swift
func generateRoadmap(
    params: RoadmapInputParams,
    materials: [EnglishMaterial]
) -> GeneratedRoadmap
```

### 6.2 生成フロー

#### Step 1: 教材を分類

```swift
// 並行教材（単語・熟語）
let parallelMaterials = materials.filter {
    CategoryRules.parallelCategories.contains($0.materialCategory)
}

// 順次教材（その他）
let sequentialMaterials = materials.filter {
    !CategoryRules.parallelCategories.contains($0.materialCategory)
}
```

#### Step 2: SelectedMaterialに変換

```swift
struct SelectedMaterial {
    let material: EnglishMaterial
    let cycles: Int        // 周回数
    let totalDays: Int     // 所要日数
    let isPriority: Bool   // 優先度フラグ
}
```

#### Step 3: スケジュール生成

```swift
func generateSchedule(
    materials: [SelectedMaterial],
    dailyMinutes: Int,
    totalDays: Int,
    startDate: Date
) -> [MaterialSchedule]
```

**並行教材の処理:**
```swift
for material in parallelMaterials {
    schedules.append(MaterialSchedule(
        material: material,
        startDate: startDate,
        endDate: examDate,      // 試験日まで
        cycles: material.cycles,
        isParallel: true,
        isWeekly: false
    ))
}
```

**順次教材の処理:**
```swift
var currentDate = startDate

for phase in CategoryRules.sequentialOrder {
    let phaseMaterials = sequentialMaterials.filter { $0.materialCategory == phase }

    for material in phaseMaterials {
        // 制約チェック
        if !canStartMaterial(material, at: currentDate) {
            continue
        }

        let endDate = calculateEndDate(material, from: currentDate)

        schedules.append(MaterialSchedule(
            material: material,
            startDate: currentDate,
            endDate: endDate,
            cycles: material.cycles,
            isParallel: false,
            isWeekly: phase == "長文"
        ))

        currentDate = endDate.addingDays(1)
    }
}
```

#### Step 4: デイリータスク生成

```swift
func generateDailyTasks(
    schedules: [MaterialSchedule],
    dailyMinutes: Int
) -> [DailyTaskTemplate]
```

**章単位での分割:**
```swift
if let totalChapters = material.totalChapters, totalChapters > 0 {
    let totalTasks = totalChapters * cycles
    let chaptersPerDay = Int(ceil(Double(totalTasks) / Double(totalDays)))

    for day in 0..<totalDays {
        let chapterStart = day * chaptersPerDay + 1
        let chapterEnd = min((day + 1) * chaptersPerDay, totalTasks)

        tasks.append(DailyTaskTemplate(
            date: startDate.addingDays(day),
            materialName: material.materialName,
            chapterStart: chapterStart,
            chapterEnd: chapterEnd,
            estimatedMinutes: minutesPerDay
        ))
    }
}
```

---

## 7. 所要日数の計算

**ファイル:** `Services/Roadmap/RoadmapGeneratorService.swift`

```swift
func calculateMaterialDays(
    material: EnglishMaterial,
    dailyMinutes: Int,
    cycles: Int
) -> Int {
    // Priority 1: 推奨日数が設定されている場合
    if let recommendedDays = material.recommendedDays, recommendedDays > 0 {
        return recommendedDays * cycles
    }

    // Priority 2: 総章数と1章あたりの時間から計算
    if let totalChapters = material.totalChapters,
       let minutesPerChapter = material.standardMinutesPerChapter,
       totalChapters > 0, minutesPerChapter > 0 {
        let totalMinutes = totalChapters * minutesPerChapter * cycles
        let daysNeeded = Int(ceil(Double(totalMinutes) / Double(dailyMinutes)))
        return max(daysNeeded, 1)
    }

    // Priority 3: デフォルト
    return 30 * cycles
}
```

### 計算優先順位

| 優先度 | 条件 | 計算式 |
|-------|------|--------|
| 1 | `recommendedDays`がある | `recommendedDays × cycles` |
| 2 | `totalChapters`と`minutesPerChapter`がある | `ceil(章数 × 時間 × 周回数 / 1日の時間)` |
| 3 | デフォルト | `30 × cycles` |

**修正箇所:** `RoadmapGeneratorService.calculateMaterialDays()`

---

## 8. 週2回ペースの計算（長文用）

**ファイル:** `Services/Roadmap/RoadmapGeneratorService.swift`

```swift
struct ReadingScheduleHelper {
    /// 週2回のスケジュールを生成
    static func generateWeeklySchedule(
        startDate: Date,
        totalTasks: Int,
        preferredDays: [Int] = [3, 7]  // 火曜(3), 土曜(7)
    ) -> [Date] {
        var dates: [Date] = []
        var currentDate = startDate
        var taskCount = 0

        while taskCount < totalTasks {
            let weekday = Calendar.current.component(.weekday, from: currentDate)

            if preferredDays.contains(weekday) {
                dates.append(currentDate)
                taskCount += 1
            }

            currentDate = currentDate.addingDays(1)
        }

        return dates
    }

    /// 総日数を計算
    static func calculateTotalDays(totalTasks: Int) -> Int {
        // 週2回で進める場合
        let weeks = (totalTasks + 1) / 2
        return weeks * 7
    }
}
```

### 計算例

| タスク数 | 週数 | 総日数 |
|---------|-----|-------|
| 50 | 25週 | 175日 |
| 100 | 50週 | 350日 |

**修正箇所:** `ReadingScheduleHelper.preferredDays`（曜日変更）

---

## 9. 出力構造体

### 9.1 GeneratedRoadmap

```swift
struct GeneratedRoadmap {
    let startStage: String                  // 開始ステージ（E3など）
    let targetStage: String                 // 目標ステージ（E7など）
    let stages: [StageSchedule]             // ステージごとのスケジュール
    let materials: [MaterialSchedule]       // 教材ごとのスケジュール
    let dailyTasks: [DailyTaskTemplate]     // 日々のタスク
    let estimatedCompletionDate: Date       // 予想完了日
    let warnings: [String]                  // 警告メッセージ
}
```

### 9.2 StageSchedule

```swift
struct StageSchedule {
    let stageId: String      // E3
    let startDate: Date
    let endDate: Date
}
```

### 9.3 MaterialSchedule

```swift
struct MaterialSchedule {
    let material: EnglishMaterial
    let startDate: Date
    let endDate: Date
    let cycles: Int          // 周回数
    let isParallel: Bool     // 並行進行か（単語・熟語）
    let isWeekly: Bool       // 週2回ペースか（長文）
}
```

### 9.4 DailyTaskTemplate

```swift
struct DailyTaskTemplate {
    let date: Date
    let materialName: String
    let chapterStart: Int?
    let chapterEnd: Int?
    let estimatedMinutes: Int
    let roadmapMaterialId: Int
}
```

---

## 10. DB保存フロー

**ファイル:** `Services/Roadmap/RoadmapService.swift`（1029行）

### 10.1 保存順序

```swift
func createRoadmap(
    userId: UUID,
    params: RoadmapInputParams,
    generatedRoadmap: GeneratedRoadmap
) async throws -> UserRoadmap {

    // 1. メインロードマップを作成
    let roadmap = try await insertRoadmap(userId, params, generatedRoadmap)

    // 2. ステージを作成（複数レコード）
    try await insertStages(roadmap.id, generatedRoadmap.stages)

    // 3. 教材を作成（複数レコード）
    let materialIdMap = try await insertMaterials(roadmap.id, generatedRoadmap.materials)

    // 4. デイリータスクを作成（500件ずつバッチ）
    try await insertDailyTasks(roadmap.id, generatedRoadmap.dailyTasks, materialIdMap)

    // 5. 進捗ログを記録
    try await insertProgressLog(roadmap.id, "created")

    return roadmap
}
```

### 10.2 DBテーブル構造

#### mukimuki_user_roadmaps

| カラム | 型 | 説明 |
|-------|-----|------|
| id | INT (PK) | ロードマップID |
| user_id | UUID (FK) | ユーザーID |
| current_level | TEXT | 開始ステージ（E3など） |
| target_stage | TEXT | 目標ステージ（E7など） |
| daily_study_minutes | INT | 1日の学習時間 |
| days_until_exam | INT | 試験までの日数 |
| target_level | TEXT | 志望レベル（MARCHなど） |
| status | TEXT | active/completed/cancelled |
| progress_percentage | DOUBLE | 進捗率 |
| estimated_completion_date | DATE | 予想完了日 |

#### mukimuki_roadmap_stages

| カラム | 型 | 説明 |
|-------|-----|------|
| id | INT (PK) | ステージレコードID |
| roadmap_id | INT (FK) | ロードマップID |
| stage_id | TEXT | E3など |
| stage_order | INT | 順序 |
| planned_start_date | DATE | 開始予定日 |
| planned_end_date | DATE | 終了予定日 |

#### mukimuki_roadmap_materials

| カラム | 型 | 説明 |
|-------|-----|------|
| id | INT (PK) | 教材レコードID |
| roadmap_id | INT (FK) | ロードマップID |
| stage_id | TEXT | ステージID |
| material_id | INT (FK) | 教材マスタID |
| material_order | INT | 順序 |
| planned_start_date | DATE | 開始予定日 |
| planned_end_date | DATE | 終了予定日 |
| total_cycles | INT | 周回数 |
| status | TEXT | pending/in_progress/completed |

#### mukimuki_roadmap_daily_tasks

| カラム | 型 | 説明 |
|-------|-----|------|
| id | INT (PK) | タスクID |
| roadmap_id | INT (FK) | ロードマップID |
| roadmap_material_id | INT (FK) | 教材レコードID |
| task_date | DATE | タスク日 |
| material_name | TEXT | 教材名 |
| chapter_start | INT | 開始章 |
| chapter_end | INT | 終了章 |
| estimated_minutes | INT | 予想時間 |
| status | TEXT | pending/completed/skipped |
| completed_at | TIMESTAMP | 完了日時 |
| actual_minutes | INT | 実際の時間 |

---

## 11. ファイル構成

### Models/Roadmap/

| ファイル | 行数 | 役割 |
|---------|-----|------|
| `UserRoadmap.swift` | 179 | ロードマップメインモデル |
| `EnglishMaterial.swift` | 210 | 教材マスタモデル |
| `RoadmapMaterial.swift` | 89 | ロードマップ内教材モデル |
| `RoadmapDailyTask.swift` | 152 | デイリータスクモデル |
| `RoadmapProgressLog.swift` | 156 | 進捗ログモデル |
| `MaterialSelection.swift` | 153 | 教材選択UI用構造体 |
| `CategoryRules.swift` | 142 | **カテゴリ間制約ルール** |
| `StageDetermination.swift` | 160 | **ステージ判定ロジック** |
| `RoadmapStage.swift` | 98 | ステージモデル |

### Services/Roadmap/

| ファイル | 行数 | 役割 |
|---------|-----|------|
| `RoadmapGeneratorService.swift` | 591 | **コアロジック（最重要）** |
| `RoadmapService.swift` | 1029 | DB操作（CRUD） |
| `MaterialService.swift` | 71 | 教材データ取得 |

### ViewModels/Roadmap/

| ファイル | 役割 |
|---------|------|
| `RoadmapInputViewModel.swift` | 入力画面のViewModel |
| `RoadmapProgressViewModel.swift` | 進捗画面のViewModel |
| `MaterialManagementViewModel.swift` | 教材管理のViewModel |

---

## 12. カスタマイズポイント

### 12.1 ステージ判定のしきい値を変更

**ファイル:** `Models/Roadmap/StageDetermination.swift`

```swift
// 変更箇所: determineBaseStage()
switch adjustedDeviation {
case ..<40:   return 1  // ← しきい値を変更
case 40..<45: return 1
// ...
}
```

### 12.2 模試の補正値を変更

**ファイル:** `Models/Roadmap/StageDetermination.swift`

```swift
// 変更箇所: MockExamType.deviationAdjustment
enum MockExamType {
    var deviationAdjustment: Double {
        switch self {
        case .kawazen: return 0    // ← 補正値を変更
        case .sundai: return 5
        // ...
        }
    }
}
```

### 12.3 志望校と目標ステージの対応を変更

**ファイル:** `Models/Roadmap/StageDetermination.swift`

```swift
// 変更箇所: TargetLevel.requiredStage
enum TargetLevel {
    var requiredStage: Int {
        switch self {
        case .nittouKomaSen: return 6  // ← 目標ステージを変更
        case .march: return 7
        // ...
        }
    }
}
```

### 12.4 カテゴリの制約ルールを変更

**ファイル:** `Models/Roadmap/CategoryRules.swift`

```swift
// 同時進行禁止ペアを追加/削除
static let exclusivePairs: [[String]] = [
    ["文法", "解釈"],
    // ["長文", "リスニング"],  // 追加例
]

// 並行進行カテゴリを変更
static let parallelCategories = ["単語", "熟語"]
// static let parallelCategories = ["単語", "熟語", "リスニング"]  // 追加例
```

### 12.5 長文の週回ペースを変更

**ファイル:** `Services/Roadmap/RoadmapGeneratorService.swift`

```swift
// 変更箇所: ReadingScheduleHelper
static func generateWeeklySchedule(
    startDate: Date,
    totalTasks: Int,
    preferredDays: [Int] = [3, 7]  // ← 曜日を変更（1=日, 2=月, ...7=土）
)
```

### 12.6 所要日数の計算式を変更

**ファイル:** `Services/Roadmap/RoadmapGeneratorService.swift`

```swift
// 変更箇所: calculateMaterialDays()
func calculateMaterialDays(...) -> Int {
    // デフォルト日数を変更
    return 30 * cycles  // ← 30を変更
}
```

### 12.7 リスニングの時間上限を変更

**ファイル:** `Services/Roadmap/RoadmapGeneratorService.swift`

```swift
// 変更箇所: generateSchedule()内
if phase == "リスニング" {
    let listeningMinutes = min(30, dailyMinutes / 3)  // ← 30を変更
}
```

---

## 付録: よく使う計算式

### A. 教材の所要日数

```
所要日数 = ceil(総章数 × 1章あたりの時間 × 周回数 / 1日の学習時間)
```

### B. 週2回ペースの総日数

```
総日数 = ceil(タスク数 / 2) × 7
```

### C. 進捗率

```
進捗率 = 完了タスク数 / 総タスク数 × 100
```

### D. 補正後偏差値

```
補正後偏差値 = 入力偏差値 + 模試補正値
```

### E. 最終ステージ

```
最終ステージ = min(max(ベースステージ + 学年補正, 1), 10)
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-08 | 初版作成 |
