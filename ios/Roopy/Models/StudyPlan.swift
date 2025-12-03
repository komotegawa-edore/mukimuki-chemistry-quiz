import Foundation

/// 学習計画
struct StudyPlan: Codable, Identifiable {
    let id: Int
    let userId: UUID
    var title: String
    var description: String?
    var startDate: Date
    var endDate: Date?
    var status: String
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case title
        case description
        case startDate = "start_date"
        case endDate = "end_date"
        case status
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    var isActive: Bool {
        status == "active"
    }

    var isCompleted: Bool {
        status == "completed"
    }
}

/// 学習計画登録・更新用パラメータ
struct StudyPlanParams: Encodable {
    let userId: UUID
    var title: String
    var description: String?
    var startDate: String  // "YYYY-MM-DD" format
    var endDate: String?
    var status: String?

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case title
        case description
        case startDate = "start_date"
        case endDate = "end_date"
        case status
    }
}

/// 学習タスク
struct StudyTask: Codable, Identifiable {
    let id: Int
    var planId: Int?
    let userId: UUID
    var title: String
    var description: String?
    var subject: String?
    var dueDate: Date?
    var estimatedMinutes: Int?
    var actualMinutes: Int?
    var status: String
    var priority: Int
    var completedAt: Date?
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case planId = "plan_id"
        case userId = "user_id"
        case title
        case description
        case subject
        case dueDate = "due_date"
        case estimatedMinutes = "estimated_minutes"
        case actualMinutes = "actual_minutes"
        case status
        case priority
        case completedAt = "completed_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    var isPending: Bool {
        status == "pending"
    }

    var isInProgress: Bool {
        status == "in_progress"
    }

    var isCompleted: Bool {
        status == "completed"
    }
}

/// 学習タスク登録・更新用パラメータ
struct StudyTaskParams: Encodable {
    var planId: Int?
    let userId: UUID
    var title: String
    var description: String?
    var subject: String?
    var dueDate: String?  // "YYYY-MM-DD" format
    var estimatedMinutes: Int?
    var actualMinutes: Int?
    var status: String?
    var priority: Int?
    var completedAt: String?

    enum CodingKeys: String, CodingKey {
        case planId = "plan_id"
        case userId = "user_id"
        case title
        case description
        case subject
        case dueDate = "due_date"
        case estimatedMinutes = "estimated_minutes"
        case actualMinutes = "actual_minutes"
        case status
        case priority
        case completedAt = "completed_at"
    }
}
