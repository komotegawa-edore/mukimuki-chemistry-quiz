import Foundation

/// テスト結果
struct TestResult: Codable, Identifiable {
    let id: Int
    let userId: UUID
    let chapterId: Int
    let subjectId: Int
    let score: Int
    let total: Int
    let answers: AnswerData?
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case chapterId = "chapter_id"
        case subjectId = "subject_id"
        case score
        case total
        case answers
        case createdAt = "created_at"
    }

    /// 正答率（%）
    var percentage: Double {
        guard total > 0 else { return 0 }
        return Double(score) / Double(total) * 100
    }
}

/// 回答データ（JSONB）
struct AnswerData: Codable {
    let details: [AnswerDetail]?
}

/// 各問題への回答詳細
struct AnswerDetail: Codable {
    let questionId: Int
    let selected: String
    let correct: Bool

    enum CodingKeys: String, CodingKey {
        case questionId = "question_id"
        case selected
        case correct
    }
}

/// テスト結果登録用パラメータ
struct TestResultParams: Encodable {
    let userId: UUID
    let chapterId: Int
    let subjectId: Int
    let score: Int
    let total: Int
    let answers: AnswerData?

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case chapterId = "chapter_id"
        case subjectId = "subject_id"
        case score
        case total
        case answers
    }
}
