import Foundation

/// ユーザー学習ロードマップ
struct UserRoadmap: Codable, Identifiable {
    let id: Int
    let userId: UUID

    // 入力パラメータ
    let currentLevel: String
    let currentDeviationValue: Double?
    let weakAreas: [String]?
    let dailyStudyMinutes: Int
    let daysUntilExam: Int
    let targetUniversity: String?
    let targetLevel: String

    // 生成結果
    let startStage: String
    let targetStage: String
    let estimatedCompletionDate: Date?

    // ステータス
    var status: RoadmapStatus
    var progressPercentage: Double
    var currentStage: String?

    // AI分析用
    let aiAnalysisJson: String?
    let lastAiAnalysisAt: Date?

    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case currentLevel = "current_level"
        case currentDeviationValue = "current_deviation_value"
        case weakAreas = "weak_areas"
        case dailyStudyMinutes = "daily_study_minutes"
        case daysUntilExam = "days_until_exam"
        case targetUniversity = "target_university"
        case targetLevel = "target_level"
        case startStage = "start_stage"
        case targetStage = "target_stage"
        case estimatedCompletionDate = "estimated_completion_date"
        case status
        case progressPercentage = "progress_percentage"
        case currentStage = "current_stage"
        case aiAnalysisJson = "ai_analysis_json"
        case lastAiAnalysisAt = "last_ai_analysis_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    /// アクティブかどうか
    var isActive: Bool {
        status == .active
    }
}

/// ロードマップステータス
enum RoadmapStatus: String, Codable {
    case active = "active"
    case paused = "paused"
    case completed = "completed"
    case cancelled = "cancelled"
    case abandoned = "abandoned"

    var displayName: String {
        switch self {
        case .active: return "進行中"
        case .paused: return "一時停止"
        case .completed: return "完了"
        case .cancelled: return "キャンセル"
        case .abandoned: return "中断"
        }
    }

    var icon: String {
        switch self {
        case .active: return "play.circle.fill"
        case .paused: return "pause.circle.fill"
        case .completed: return "checkmark.circle.fill"
        case .cancelled, .abandoned: return "xmark.circle.fill"
        }
    }
}

/// 志望レベル
enum TargetLevel: String, CaseIterable, Codable {
    case nittouKomaSen = "日東駒専"
    case march = "MARCH"
    case kanKanDouRitsu = "関関同立"
    case earlyKeio = "早慶"
    case osaka = "阪大"
    case kyoto = "京大"
    case tokyo = "東大"

    var displayName: String { rawValue }

    /// このレベルに必要な最低ステージ
    var requiredStage: String {
        switch self {
        case .nittouKomaSen: return "E6"
        case .march, .kanKanDouRitsu: return "E7"
        case .earlyKeio: return "E8"
        case .osaka: return "E9"
        case .kyoto, .tokyo: return "E10"
        }
    }

    /// UI表示用ラベル
    var stageLabel: String {
        "→\(requiredStage)"
    }
}

/// ロードマップ入力パラメータ
struct RoadmapInputParams: Encodable {
    let currentLevel: String
    let currentDeviationValue: Double?
    let weakAreas: [String]
    let dailyStudyMinutes: Int
    let daysUntilExam: Int
    let targetUniversity: String?
    let targetLevel: String

    enum CodingKeys: String, CodingKey {
        case currentLevel = "current_level"
        case currentDeviationValue = "current_deviation_value"
        case weakAreas = "weak_areas"
        case dailyStudyMinutes = "daily_study_minutes"
        case daysUntilExam = "days_until_exam"
        case targetUniversity = "target_university"
        case targetLevel = "target_level"
    }
}

/// 現在のレベル選択肢
enum CurrentLevelOption: String, CaseIterable {
    case e1 = "E1"
    case e2 = "E2"
    case e3 = "E3"
    case e4 = "E4"
    case e5 = "E5"
    case e6 = "E6"
    case e7 = "E7"
    case e8 = "E8"
    case e9 = "E9"
    case e10 = "E10"

    var displayName: String {
        switch self {
        case .e1: return "E1: 中学レベル"
        case .e2: return "E2: 高1基礎"
        case .e3: return "E3: 高1〜2基礎文法"
        case .e4: return "E4: 文法演習中"
        case .e5: return "E5: 標準文法完了"
        case .e6: return "E6: 英文解釈入門中"
        case .e7: return "E7: 英文解釈基礎完了"
        case .e8: return "E8: 長文応用中"
        case .e9: return "E9: 難関対策中"
        case .e10: return "E10: 最終仕上げ"
        }
    }
}

/// 苦手分野
enum WeakArea: String, CaseIterable {
    case vocabulary = "英単語"
    case grammar = "文法"
    case reading = "長文"
    case interpretation = "英文解釈"
    case listening = "リスニング"
    case writing = "英作文"

    var displayName: String { rawValue }
}
