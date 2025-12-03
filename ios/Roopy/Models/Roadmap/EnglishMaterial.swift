import Foundation

/// 英語教材マスタ
struct EnglishMaterial: Codable, Identifiable {
    let id: Int
    let stageId: String
    let stageName: String
    let materialName: String
    let materialCategory: String
    let chapterRange: String?
    let chapterName: String?
    let recommendedDays: Int?
    let standardMinutesPerChapter: Int?
    let totalChapters: Int?
    let difficultyLevel: String?
    let recommendedCycles: Int?
    let notes: String?
    let imageUrl: String?
    let displayOrder: Int
    let isPublished: Bool
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case stageId = "stage_id"
        case stageName = "stage_name"
        case materialName = "material_name"
        case materialCategory = "material_category"
        case chapterRange = "chapter_range"
        case chapterName = "chapter_name"
        case recommendedDays = "recommended_days"
        case standardMinutesPerChapter = "standard_minutes_per_chapter"
        case totalChapters = "total_chapters"
        case difficultyLevel = "difficulty_level"
        case recommendedCycles = "recommended_cycles"
        case notes
        case imageUrl = "image_url"
        case displayOrder = "display_order"
        case isPublished = "is_published"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    /// カテゴリのアイコン
    var categoryIcon: String {
        switch materialCategory {
        case "英単語": return "textformat.abc"
        case "文法": return "text.book.closed"
        case "文法演習": return "pencil.and.list.clipboard"
        case "長文": return "doc.text"
        case "英文解釈": return "magnifyingglass"
        case "過去問": return "doc.badge.clock"
        default: return "book"
        }
    }

    /// 難易度の色
    var difficultyColor: String {
        switch difficultyLevel {
        case "初級": return "green"
        case "初級〜中級": return "teal"
        case "中級": return "blue"
        case "中級〜上級": return "indigo"
        case "上級": return "purple"
        case "難関": return "orange"
        case "最難関": return "red"
        default: return "gray"
        }
    }
}

/// 教材カテゴリ
enum MaterialCategory: String, CaseIterable {
    case vocabulary = "英単語"
    case grammar = "文法"
    case grammarExercise = "文法演習"
    case reading = "長文"
    case interpretation = "英文解釈"
    case pastExam = "過去問"

    var displayName: String { rawValue }
}

/// 難易度レベル
enum DifficultyLevel: String, CaseIterable {
    case beginner = "初級"
    case beginnerToIntermediate = "初級〜中級"
    case intermediate = "中級"
    case intermediateToAdvanced = "中級〜上級"
    case advanced = "上級"
    case difficult = "難関"
    case mostDifficult = "最難関"

    var displayName: String { rawValue }
}
