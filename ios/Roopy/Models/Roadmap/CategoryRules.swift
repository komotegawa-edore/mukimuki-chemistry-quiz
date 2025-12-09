import Foundation

/// カテゴリ間の制約
struct CategoryConstraints {

    /// 同時進行できないカテゴリの組み合わせ
    static let exclusivePairs: [[String]] = [
        ["文法", "解釈"]  // 文法と解釈は同時進行しない
    ]

    /// 指定カテゴリと同時進行できないカテゴリを取得
    static func exclusiveCategories(for category: String) -> [String] {
        exclusivePairs
            .filter { $0.contains(category) }
            .flatMap { $0 }
            .filter { $0 != category }
    }

    /// 2つのカテゴリが同時進行可能か
    static func canRunInParallel(_ category1: String, _ category2: String) -> Bool {
        !exclusivePairs.contains { pair in
            pair.contains(category1) && pair.contains(category2)
        }
    }
}

/// リスニング開始条件
struct ListeningCondition {
    /// 共通テストまでの日数がこの値以下ならリスニング開始
    static let daysBeforeCommonTest = 90  // 3ヶ月 = 約90日

    /// 共通テストを受験するか
    let takesCommonTest: Bool

    /// 共通テストの日付（受験する場合）
    let commonTestDate: Date?

    /// 早期開始を希望するか
    let wantsEarlyStart: Bool

    /// リスニングを開始すべきか判定
    func shouldStartListening(currentDate: Date = Date()) -> Bool {
        // 早期開始希望なら即開始
        if wantsEarlyStart {
            return true
        }

        // 共通テスト受験者で3ヶ月前なら開始
        if takesCommonTest, let testDate = commonTestDate {
            let daysUntilTest = Calendar.current.dateComponents([.day], from: currentDate, to: testDate).day ?? 0
            return daysUntilTest <= Self.daysBeforeCommonTest
        }

        return false
    }
}

/// 英作文条件
struct WritingCondition {
    /// 受験で英作文を使用するか
    let usesWritingInExam: Bool

    /// 英作文を含めるべきか
    var shouldIncludeWriting: Bool {
        usesWritingInExam
    }
}

/// ステージごとの学習設定
struct StageStudyConfig {
    let stageId: String
    let stageNumber: Int

    /// このステージで利用可能なカテゴリを取得
    func availableCategories(
        usesWriting: Bool = false,
        listeningCondition: ListeningCondition? = nil
    ) -> [MaterialCategory] {
        MaterialCategory.allCases.filter { category in
            // 基本のステージ範囲チェック
            guard category.isAvailable(at: stageNumber) else { return false }

            // 条件付きカテゴリの追加チェック
            switch category {
            case .writing:
                return usesWriting
            case .listening:
                // E8以上、または条件を満たす場合
                if stageNumber >= 8 {
                    return true
                }
                return listeningCondition?.shouldStartListening() ?? false
            default:
                return true
            }
        }
    }

    init(stageId: String) {
        self.stageId = stageId
        self.stageNumber = MaterialCategory.stageNumber(from: stageId) ?? 1
    }
}

/// 長文の週2回スケジュール生成ヘルパー
struct ReadingScheduleHelper {

    /// 週2回のペースでタスク日を生成
    /// - Parameters:
    ///   - startDate: 開始日
    ///   - totalTasks: 総タスク数
    ///   - preferredDays: 希望曜日（デフォルト: 火曜・土曜）
    /// - Returns: タスク実行日の配列
    static func generateWeeklySchedule(
        startDate: Date,
        totalTasks: Int,
        preferredDays: [Int] = [3, 7]  // 火曜(3)、土曜(7)
    ) -> [Date] {
        var taskDates: [Date] = []
        var currentDate = startDate
        let calendar = Calendar.current

        while taskDates.count < totalTasks {
            let weekday = calendar.component(.weekday, from: currentDate)

            if preferredDays.contains(weekday) {
                taskDates.append(currentDate)
            }

            currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
        }

        return taskDates
    }

    /// 週2回で進めた場合の総日数を計算
    static func calculateTotalDays(totalTasks: Int) -> Int {
        // 週2回なので、タスク数 / 2 * 7 日
        let weeks = (totalTasks + 1) / 2
        return weeks * 7
    }
}
