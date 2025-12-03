import Foundation

/// 学年
enum Grade: String, CaseIterable, Codable {
    case high1 = "high1"
    case high2 = "high2"
    case high3 = "high3"
    case ronin = "ronin"
    case other = "other"

    var displayName: String {
        switch self {
        case .high1: return "高校1年"
        case .high2: return "高校2年"
        case .high3: return "高校3年"
        case .ronin: return "浪人"
        case .other: return "その他"
        }
    }
}

/// ユーザープロフィール
struct Profile: Codable, Identifiable {
    let id: UUID
    var name: String?
    var nickname: String?
    var avatarUrl: String?
    var role: String?
    var grade: String?
    var targetUniversity: String?
    var targetFaculty: String?
    var bio: String?
    let createdAt: Date?
    let updatedAt: Date?
    var currentStreak: Int?
    var longestStreak: Int?
    var lastLoginDate: String?
    var referralCode: String?
    var referredBy: UUID?
    var referralCompleted: Bool?
    var bonusDailyQuests: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case nickname
        case avatarUrl = "avatar_url"
        case role
        case grade
        case targetUniversity = "target_university"
        case targetFaculty = "target_faculty"
        case bio
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case currentStreak = "current_streak"
        case longestStreak = "longest_streak"
        case lastLoginDate = "last_login_date"
        case referralCode = "referral_code"
        case referredBy = "referred_by"
        case referralCompleted = "referral_completed"
        case bonusDailyQuests = "bonus_daily_quests"
    }

    var isTeacher: Bool {
        role == "teacher"
    }

    var isStudent: Bool {
        role == "student"
    }

    var gradeEnum: Grade? {
        guard let grade = grade else { return nil }
        return Grade(rawValue: grade)
    }

    var displayName: String {
        nickname ?? name ?? "ユーザー"
    }
}

/// プロフィール更新用パラメータ
struct UpdateProfileParams: Encodable {
    var name: String?
    var nickname: String?
    var avatarUrl: String?
    var grade: String?
    var targetUniversity: String?
    var targetFaculty: String?
    var bio: String?
    var currentStreak: Int?
    var longestStreak: Int?
    var lastLoginDate: String?

    enum CodingKeys: String, CodingKey {
        case name
        case nickname
        case avatarUrl = "avatar_url"
        case grade
        case targetUniversity = "target_university"
        case targetFaculty = "target_faculty"
        case bio
        case currentStreak = "current_streak"
        case longestStreak = "longest_streak"
        case lastLoginDate = "last_login_date"
    }
}
