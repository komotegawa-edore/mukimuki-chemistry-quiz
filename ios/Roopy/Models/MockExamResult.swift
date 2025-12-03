import Foundation

/// 模試（複数科目の成績を含む）
struct MockExam: Codable, Identifiable {
    let id: Int
    let userId: UUID
    var examName: String
    var examDate: Date
    var notes: String?
    var scores: [MockExamScore]?
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case examName = "exam_name"
        case examDate = "exam_date"
        case notes
        case scores = "mukimuki_mock_exam_scores"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    /// 総合偏差値（全科目の平均）
    var averageDeviation: Double? {
        guard let scores = scores else { return nil }
        let deviations = scores.compactMap { $0.deviationValue }
        guard !deviations.isEmpty else { return nil }
        return deviations.reduce(0, +) / Double(deviations.count)
    }
}

/// 模試の科目別成績
struct MockExamScore: Codable, Identifiable {
    let id: Int
    var mockExamId: Int
    var subject: String
    var score: Int?
    var maxScore: Int?
    var deviationValue: Double?
    var rankPercentile: Double?
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case mockExamId = "mock_exam_id"
        case subject
        case score
        case maxScore = "max_score"
        case deviationValue = "deviation_value"
        case rankPercentile = "rank_percentile"
        case createdAt = "created_at"
    }

    /// 得点率（%）
    var scorePercentage: Double? {
        guard let score = score, let maxScore = maxScore, maxScore > 0 else { return nil }
        return Double(score) / Double(maxScore) * 100
    }
}

/// 模試登録用パラメータ
struct MockExamParams: Encodable {
    let userId: UUID
    var examName: String
    var examDate: String  // "YYYY-MM-DD" format
    var notes: String?

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case examName = "exam_name"
        case examDate = "exam_date"
        case notes
    }
}

/// 模試スコア登録用パラメータ
struct MockExamScoreParams: Encodable {
    var mockExamId: Int
    var subject: String
    var score: Int?
    var maxScore: Int?
    var deviationValue: Double?
    var rankPercentile: Double?

    enum CodingKeys: String, CodingKey {
        case mockExamId = "mock_exam_id"
        case subject
        case score
        case maxScore = "max_score"
        case deviationValue = "deviation_value"
        case rankPercentile = "rank_percentile"
    }
}

/// グラフ表示用のデータポイント
struct DeviationDataPoint: Identifiable {
    let id = UUID()
    let date: Date
    let subject: String
    let deviationValue: Double
}

// MARK: - 旧モデル（互換性のため残す）
/// 模試結果（旧形式 - 単一科目）
struct MockExamResult: Codable, Identifiable {
    let id: Int
    let userId: UUID
    var examName: String
    var examDate: Date
    var subject: String
    var score: Int?
    var maxScore: Int?
    var deviationValue: Double?
    var rankPercentile: Double?
    var notes: String?
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case examName = "exam_name"
        case examDate = "exam_date"
        case subject
        case score
        case maxScore = "max_score"
        case deviationValue = "deviation_value"
        case rankPercentile = "rank_percentile"
        case notes
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    /// 得点率（%）
    var scorePercentage: Double? {
        guard let score = score, let maxScore = maxScore, maxScore > 0 else { return nil }
        return Double(score) / Double(maxScore) * 100
    }
}

/// 模試結果登録・更新用パラメータ（旧形式）
struct MockExamResultParams: Encodable {
    let userId: UUID
    var examName: String
    var examDate: String  // "YYYY-MM-DD" format
    var subject: String
    var score: Int?
    var maxScore: Int?
    var deviationValue: Double?
    var rankPercentile: Double?
    var notes: String?

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case examName = "exam_name"
        case examDate = "exam_date"
        case subject
        case score
        case maxScore = "max_score"
        case deviationValue = "deviation_value"
        case rankPercentile = "rank_percentile"
        case notes
    }
}
