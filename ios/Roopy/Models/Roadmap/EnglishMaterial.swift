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
        case "単語": return "textformat.abc"
        case "熟語": return "text.word.spacing"
        case "文法": return "text.book.closed"
        case "解釈": return "magnifyingglass"
        case "長文": return "doc.text"
        case "英作文": return "pencil"
        case "リスニング": return "headphones"
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

/// 教材カテゴリ（8つのパート）
///
/// ## ステージ範囲:
/// - 単語: E1〜E10（常時進行）
/// - 熟語: E5〜E10（常時進行）
/// - 文法: E1〜E4
/// - 解釈: E4〜E10
/// - 長文: E5〜E10（週2回ペース、解釈と同時進行OK）
/// - 英作文: E6〜E10（受験で使う人のみ）
/// - リスニング: E8〜E10 or 共通テスト3ヶ月前（1日30分以下）
/// - 過去問: E9〜E10（最終段階）
enum MaterialCategory: String, CaseIterable {
    case vocabulary = "単語"
    case idiom = "熟語"
    case grammar = "文法"
    case interpretation = "解釈"
    case reading = "長文"
    case writing = "英作文"
    case listening = "リスニング"
    case pastExam = "過去問"

    var displayName: String { rawValue }

    /// このカテゴリが有効なステージ範囲
    var stageRange: ClosedRange<Int> {
        switch self {
        case .vocabulary:
            return 1...10      // E1〜E10（常時進行）
        case .idiom:
            return 5...10      // E5〜E10（常時進行）
        case .grammar:
            return 1...4       // E1〜E4
        case .interpretation:
            return 4...10      // E4〜E10
        case .reading:
            return 5...10      // E5〜E10（週2回、解釈と並行）
        case .writing:
            return 6...10      // E6〜E10（受験で使う人のみ）
        case .listening:
            return 8...10      // E8〜E10（または共通テスト3ヶ月前）
        case .pastExam:
            return 9...10      // E9〜E10（最終段階）
        }
    }

    /// このカテゴリが指定ステージで利用可能か
    func isAvailable(at stageNumber: Int) -> Bool {
        stageRange.contains(stageNumber)
    }

    /// このカテゴリは毎日コツコツ進めるタイプか（並行進行）
    var isDaily: Bool {
        switch self {
        case .vocabulary, .idiom:
            return true
        default:
            return false
        }
    }

    /// このカテゴリは週何回のペースで進めるか（nilは毎日）
    var weeklyFrequency: Int? {
        switch self {
        case .reading:
            return 2  // 週2回
        default:
            return nil  // 毎日
        }
    }

    /// 1日の最大学習時間（分）、nilは制限なし
    var maxDailyMinutes: Int? {
        switch self {
        case .listening:
            return 30  // リスニングは1日30分以上は設定しない
        default:
            return nil
        }
    }

    /// 条件付きカテゴリか
    var isConditional: Bool {
        switch self {
        case .writing, .listening:
            return true
        default:
            return false
        }
    }

    /// 条件の説明
    var conditionDescription: String? {
        switch self {
        case .writing:
            return "受験で英作文を使う場合のみ"
        case .listening:
            return "共通テスト3ヶ月前から開始推奨"
        default:
            return nil
        }
    }

    /// アイコン
    var icon: String {
        switch self {
        case .vocabulary: return "textformat.abc"
        case .idiom: return "text.word.spacing"
        case .grammar: return "text.book.closed"
        case .interpretation: return "magnifyingglass"
        case .reading: return "doc.text"
        case .writing: return "pencil"
        case .listening: return "headphones"
        case .pastExam: return "doc.badge.clock"
        }
    }

    /// ステージIDからステージ番号を取得
    static func stageNumber(from stageId: String) -> Int? {
        guard stageId.hasPrefix("E"),
              let number = Int(stageId.dropFirst()) else { return nil }
        return number
    }
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
