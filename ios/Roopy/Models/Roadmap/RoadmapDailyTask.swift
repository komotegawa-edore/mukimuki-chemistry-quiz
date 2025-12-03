import Foundation

/// デイリータスク
struct RoadmapDailyTask: Codable, Identifiable {
    let id: Int
    let roadmapId: Int
    let roadmapMaterialId: Int
    var taskDate: Date
    let materialName: String
    let chapterStart: Int?
    let chapterEnd: Int?
    let chapterDescription: String?
    let estimatedMinutes: Int
    var actualMinutes: Int?
    var status: TaskStatus
    var completedAt: Date?
    var notes: String?
    var originalDate: Date?
    var rescheduleCount: Int
    var completedChapter: Int?  // 何章まで完了したか
    var parentTaskId: Int?      // 部分完了で分割された場合の親タスクID
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case roadmapId = "roadmap_id"
        case roadmapMaterialId = "roadmap_material_id"
        case taskDate = "task_date"
        case materialName = "material_name"
        case chapterStart = "chapter_start"
        case chapterEnd = "chapter_end"
        case chapterDescription = "chapter_description"
        case estimatedMinutes = "estimated_minutes"
        case actualMinutes = "actual_minutes"
        case status
        case completedAt = "completed_at"
        case notes
        case originalDate = "original_date"
        case rescheduleCount = "reschedule_count"
        case completedChapter = "completed_chapter"
        case parentTaskId = "parent_task_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    /// 章の表示文字列
    var chapterRangeText: String {
        if let start = chapterStart, let end = chapterEnd {
            return start == end ? "第\(start)章" : "第\(start)〜\(end)章"
        }
        return chapterDescription ?? ""
    }

    /// 今日のタスクか
    var isToday: Bool {
        Calendar.current.isDateInToday(taskDate)
    }

    /// 遅延タスクか
    var isOverdue: Bool {
        status == .pending && !Calendar.current.isDateInToday(taskDate) && taskDate < Date()
    }

    /// 完了しているか
    var isCompleted: Bool {
        status == .completed
    }

    /// 予想時間の表示
    var estimatedTimeText: String {
        if estimatedMinutes >= 60 {
            let hours = estimatedMinutes / 60
            let minutes = estimatedMinutes % 60
            return minutes > 0 ? "\(hours)時間\(minutes)分" : "\(hours)時間"
        }
        return "\(estimatedMinutes)分"
    }

    /// リスケジュールされたか
    var wasRescheduled: Bool {
        rescheduleCount > 0
    }

    /// 部分完了か（章範囲がある場合のみ）
    var isPartiallyCompleted: Bool {
        guard status == .completed else { return false }
        guard let start = chapterStart, let end = chapterEnd, let completed = completedChapter else {
            return false
        }
        return completed < end && completed >= start
    }

    /// 完了した章の表示テキスト
    var completedChapterText: String {
        if let completed = completedChapter {
            return "第\(completed)章まで完了"
        }
        return status == .completed ? "全て完了" : ""
    }

    /// 残りの章数
    var remainingChapters: Int {
        guard let end = chapterEnd, let completed = completedChapter else { return 0 }
        return max(0, end - completed)
    }

    /// 残り作業の予想時間（章ベース）
    func remainingMinutes(completedChapter: Int) -> Int {
        guard let start = chapterStart, let end = chapterEnd else { return 0 }
        let totalChapters = end - start + 1
        let remainingChapters = end - completedChapter
        guard totalChapters > 0 else { return 0 }
        return Int(Double(estimatedMinutes) * Double(remainingChapters) / Double(totalChapters))
    }

    /// 総章数
    var totalChapters: Int {
        guard let start = chapterStart, let end = chapterEnd else { return 0 }
        return end - start + 1
    }

    /// 章範囲があるか
    var hasChapterRange: Bool {
        chapterStart != nil && chapterEnd != nil
    }
}

/// デイリータスクテンプレート（ロードマップ生成時に使用）
struct DailyTaskTemplate {
    let date: Date
    let materialName: String
    let chapterStart: Int?
    let chapterEnd: Int?
    let estimatedMinutes: Int
    let roadmapMaterialId: Int
}

/// タスク完了パラメータ
struct TaskCompletionParams: Encodable {
    let status: String
    let completedAt: String
    let actualMinutes: Int?
    let notes: String?

    enum CodingKeys: String, CodingKey {
        case status
        case completedAt = "completed_at"
        case actualMinutes = "actual_minutes"
        case notes
    }
}
