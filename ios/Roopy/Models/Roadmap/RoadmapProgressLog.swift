import Foundation

/// 進捗ログ
struct RoadmapProgressLog: Codable, Identifiable {
    let id: Int
    let roadmapId: Int
    let dailyTaskId: Int?
    let logDate: Date
    let actionType: String
    let details: String?
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case roadmapId = "roadmap_id"
        case dailyTaskId = "daily_task_id"
        case logDate = "log_date"
        case actionType = "action_type"
        case details
        case createdAt = "created_at"
    }
}

/// 進捗アクションタイプ
enum ProgressActionType: String, Codable {
    case taskCompleted = "task_completed"
    case taskSkipped = "task_skipped"
    case stageStarted = "stage_started"
    case stageCompleted = "stage_completed"
    case reschedule = "reschedule"
    case roadmapStarted = "roadmap_started"
    case roadmapCompleted = "roadmap_completed"

    var displayName: String {
        switch self {
        case .taskCompleted: return "タスク完了"
        case .taskSkipped: return "タスクスキップ"
        case .stageStarted: return "ステージ開始"
        case .stageCompleted: return "ステージ完了"
        case .reschedule: return "リスケジュール"
        case .roadmapStarted: return "ロードマップ開始"
        case .roadmapCompleted: return "ロードマップ完了"
        }
    }

    var icon: String {
        switch self {
        case .taskCompleted: return "checkmark.circle.fill"
        case .taskSkipped: return "forward.circle.fill"
        case .stageStarted: return "play.circle.fill"
        case .stageCompleted: return "flag.checkered"
        case .reschedule: return "calendar.badge.clock"
        case .roadmapStarted: return "play.circle.fill"
        case .roadmapCompleted: return "trophy.fill"
        }
    }
}

/// ロードマップサマリー（画面表示用）
struct RoadmapSummary {
    let roadmap: UserRoadmap
    let stages: [RoadmapStage]
    let todayTasks: [RoadmapDailyTask]
    let overdueTasks: [RoadmapDailyTask]
    let currentMaterials: [RoadmapMaterial]

    /// 全体進捗率
    var overallProgress: Double {
        roadmap.progressPercentage / 100
    }

    /// 今日のタスク数
    var todayTaskCount: Int {
        todayTasks.count
    }

    /// 今日の完了タスク数
    var todayCompletedCount: Int {
        todayTasks.filter { $0.status == .completed }.count
    }

    /// 遅延日数
    var delayDays: Int {
        overdueTasks.count
    }

    /// スケジュール通りか
    var isOnSchedule: Bool {
        overdueTasks.isEmpty
    }

    /// 今日の残り予想時間（分）
    var todayRemainingMinutes: Int {
        todayTasks
            .filter { $0.status != .completed }
            .reduce(0) { $0 + $1.estimatedMinutes }
    }

    /// 今日の進捗率
    var todayProgress: Double {
        guard !todayTasks.isEmpty else { return 1.0 }
        return Double(todayCompletedCount) / Double(todayTaskCount)
    }
}

/// ステージ進捗情報（表示用）
struct StageProgressInfo: Identifiable {
    let id = UUID()
    let stageId: String
    let stageName: String
    let progress: Double
    let status: TaskStatus
}

/// 学習時間データポイント（グラフ用）
struct StudyTimeDataPoint: Identifiable {
    let id = UUID()
    let date: Date
    let minutes: Int
}

/// ロードマップ達成バッジ
struct RoadmapAchievement: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let icon: String
    let isUnlocked: Bool
    let unlockedAt: Date?
}

/// 生成されたロードマップ（一時的な構造体）
struct GeneratedRoadmap {
    let startStage: String
    let targetStage: String
    let stages: [StageSchedule]
    let materials: [MaterialSchedule]
    let dailyTasks: [DailyTaskTemplate]
    let estimatedCompletionDate: Date
    let warnings: [String]
}

/// ステージスケジュール（ロードマップ生成時に使用）
struct StageSchedule {
    let stageId: String
    let startDate: Date
    let endDate: Date
}

/// ロードマップスケジュール（ロードマップ生成時に使用）
struct RoadmapSchedule {
    let stages: [StageSchedule]
    let materials: [MaterialSchedule]
    let estimatedEndDate: Date
    let warnings: [String]
}
