import Foundation

/// ロードマップ内教材
struct RoadmapMaterial: Codable, Identifiable {
    let id: Int
    let roadmapId: Int
    let stageId: String
    let materialId: Int
    let materialOrder: Int
    let plannedStartDate: Date
    let plannedEndDate: Date
    var actualStartDate: Date?
    var actualEndDate: Date?
    var currentCycle: Int
    let totalCycles: Int
    var status: TaskStatus
    let createdAt: Date?
    let updatedAt: Date?

    // JOINで取得する教材情報
    var material: EnglishMaterial?

    enum CodingKeys: String, CodingKey {
        case id
        case roadmapId = "roadmap_id"
        case stageId = "stage_id"
        case materialId = "material_id"
        case materialOrder = "material_order"
        case plannedStartDate = "planned_start_date"
        case plannedEndDate = "planned_end_date"
        case actualStartDate = "actual_start_date"
        case actualEndDate = "actual_end_date"
        case currentCycle = "current_cycle"
        case totalCycles = "total_cycles"
        case status
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case material
    }

    /// 周回進捗
    var cycleProgress: Double {
        guard totalCycles > 0 else { return 0 }
        return Double(currentCycle) / Double(totalCycles)
    }

    /// 周回表示テキスト
    var cycleText: String {
        "\(currentCycle)/\(totalCycles)周"
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

/// 教材選定結果（ロードマップ生成時に使用）
struct SelectedMaterial {
    let material: EnglishMaterial
    let cycles: Int
    let totalDays: Int
    let isPriority: Bool
}

/// 教材スケジュール（ロードマップ生成時に使用）
struct MaterialSchedule {
    let material: EnglishMaterial
    let startDate: Date
    let endDate: Date
    let cycles: Int
    let isParallel: Bool
    let isWeekly: Bool  // 週2回ペースか（長文用）

    init(material: EnglishMaterial, startDate: Date, endDate: Date, cycles: Int, isParallel: Bool, isWeekly: Bool = false) {
        self.material = material
        self.startDate = startDate
        self.endDate = endDate
        self.cycles = cycles
        self.isParallel = isParallel
        self.isWeekly = isWeekly
    }
}
