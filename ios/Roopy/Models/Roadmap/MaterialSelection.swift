import Foundation

/// 教材グループ（同じステージ+カテゴリの教材をグループ化）
struct MaterialGroup: Identifiable {
    let id: String // stageId + category
    let stageId: String
    let stageName: String
    let category: String
    let materials: [EnglishMaterial]
    let isParallel: Bool // 常時（並行進行）か

    init(stageId: String, stageName: String, category: String, materials: [EnglishMaterial]) {
        self.id = "\(stageId)_\(category)"
        self.stageId = stageId
        self.stageName = stageName
        self.category = category
        self.materials = materials
        // 単語・熟語は並行進行
        self.isParallel = ["単語", "熟語"].contains(category)
    }

    /// カテゴリのアイコン
    var categoryIcon: String {
        switch category {
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

    /// カテゴリの説明
    var categoryDescription: String {
        switch category {
        case "単語": return "毎日コツコツ進める"
        case "熟語": return "毎日コツコツ進める"
        case "文法": return "基礎から順番に"
        case "解釈": return "長文読解の基礎"
        case "長文": return "実践的な読解力"
        case "英作文": return "アウトプット力"
        case "リスニング": return "リスニング対策"
        case "過去問": return "実践的な演習"
        default: return ""
        }
    }
}

/// ユーザーの教材選択
struct MaterialSelections {
    /// stageId_category -> 選択されたmaterial.id
    var selections: [String: Int] = [:]

    /// グループで選択された教材を取得（未選択ならnil）
    func selectedMaterial(for group: MaterialGroup) -> EnglishMaterial? {
        guard let selectedId = selections[group.id] else {
            return nil  // 未選択の場合はnilを返す
        }
        return group.materials.first { $0.id == selectedId }
    }

    /// グループが選択済みかどうか
    func isSelected(for group: MaterialGroup) -> Bool {
        selections[group.id] != nil
    }

    /// すべてのグループが選択済みかどうか
    func allSelected(groups: [MaterialGroup]) -> Bool {
        groups.allSatisfy { isSelected(for: $0) }
    }

    /// 教材を選択
    mutating func select(_ material: EnglishMaterial, for group: MaterialGroup) {
        selections[group.id] = material.id
    }

    /// すべての選択された教材を取得
    func allSelectedMaterials(from groups: [MaterialGroup]) -> [EnglishMaterial] {
        groups.compactMap { selectedMaterial(for: $0) }
    }
}

/// 並行進行の設定
struct ParallelSettings {
    /// 同時に進める教材カテゴリの組み合わせ
    /// 例: [["英単語", "文法"], ["解釈", "長文"]]
    var parallelPairs: [[String]] = [
        ["英単語", "英熟語"],       // 単語・熟語は常に並行
        ["文法", "文法演習"],       // 文法と演習は並行可能
        ["解釈", "長文"]            // 解釈と長文は並行可能
    ]

    /// カテゴリが並行進行可能か
    func isParallelCategory(_ category: String) -> Bool {
        parallelPairs.flatMap { $0 }.contains(category)
    }

    /// 並行で進めるカテゴリのペアを取得
    func parallelPair(for category: String) -> [String]? {
        parallelPairs.first { $0.contains(category) }
    }
}

/// 進行フェーズ（学習の段階）
enum StudyPhase: Int, CaseIterable, Identifiable {
    case vocabulary = 1    // 単語・熟語フェーズ（常時）
    case grammar = 2       // 文法フェーズ
    case interpretation = 3 // 解釈フェーズ
    case reading = 4       // 長文フェーズ
    case advanced = 5      // 発展フェーズ（英作文・リスニング等）

    var id: Int { rawValue }

    var displayName: String {
        switch self {
        case .vocabulary: return "語彙"
        case .grammar: return "文法"
        case .interpretation: return "英文解釈"
        case .reading: return "長文読解"
        case .advanced: return "発展"
        }
    }

    var categories: [String] {
        switch self {
        case .vocabulary: return ["英単語", "英熟語"]
        case .grammar: return ["文法", "文法演習"]
        case .interpretation: return ["解釈"]
        case .reading: return ["長文"]
        case .advanced: return ["英作文", "リスニング"]
        }
    }

    /// このフェーズは他と並行して進めるか
    var runsInParallel: Bool {
        self == .vocabulary
    }

    /// 前提となるフェーズ
    var prerequisitePhases: [StudyPhase] {
        switch self {
        case .vocabulary: return []
        case .grammar: return []
        case .interpretation: return [.grammar]
        case .reading: return [.interpretation]
        case .advanced: return [.reading]
        }
    }
}
