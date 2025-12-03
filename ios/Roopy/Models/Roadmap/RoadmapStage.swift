import Foundation

/// ロードマップ内ステージ
struct RoadmapStage: Codable, Identifiable {
    let id: Int
    let roadmapId: Int
    let stageId: String
    let stageOrder: Int
    let plannedStartDate: Date
    let plannedEndDate: Date
    var actualStartDate: Date?
    var actualEndDate: Date?
    var status: TaskStatus
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case roadmapId = "roadmap_id"
        case stageId = "stage_id"
        case stageOrder = "stage_order"
        case plannedStartDate = "planned_start_date"
        case plannedEndDate = "planned_end_date"
        case actualStartDate = "actual_start_date"
        case actualEndDate = "actual_end_date"
        case status
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    /// ステージの表示名
    var displayName: String {
        "ステージ \(stageId)"
    }

    /// ステージ名（E1-E10に対応する名前）
    var stageName: String {
        switch stageId {
        case "E1": return "英単語基礎"
        case "E2": return "英単語標準"
        case "E3": return "基礎文法"
        case "E4": return "基礎文法演習"
        case "E5": return "標準文法"
        case "E6": return "英文解釈入門"
        case "E7": return "英文解釈基礎"
        case "E8": return "長文応用"
        case "E9": return "難関対策"
        case "E10": return "最終仕上げ"
        default: return stageId
        }
    }

    /// 遅延しているか
    var isDelayed: Bool {
        guard status != .completed else { return false }
        return Date() > plannedEndDate
    }

    /// 予定日数
    var plannedDays: Int {
        Calendar.current.dateComponents([.day], from: plannedStartDate, to: plannedEndDate).day ?? 0
    }
}

/// タスクステータス（共通）
enum TaskStatus: String, Codable {
    case pending = "pending"
    case inProgress = "in_progress"
    case completed = "completed"
    case skipped = "skipped"

    var displayName: String {
        switch self {
        case .pending: return "未着手"
        case .inProgress: return "進行中"
        case .completed: return "完了"
        case .skipped: return "スキップ"
        }
    }

    var icon: String {
        switch self {
        case .pending: return "circle"
        case .inProgress: return "circle.lefthalf.filled"
        case .completed: return "checkmark.circle.fill"
        case .skipped: return "forward.circle"
        }
    }

    var color: String {
        switch self {
        case .pending: return "gray"
        case .inProgress: return "blue"
        case .completed: return "green"
        case .skipped: return "orange"
        }
    }
}
