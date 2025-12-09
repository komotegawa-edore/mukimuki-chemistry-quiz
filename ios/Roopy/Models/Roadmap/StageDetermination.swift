import Foundation

// MARK: - 学年

/// 学年
enum SchoolYear: String, CaseIterable, Codable {
    case firstYear = "高1"
    case secondYear = "高2"
    case thirdYear = "高3"
    case graduate = "既卒"

    var displayName: String { rawValue }

    /// ステージ判定時の補正値（学年が上がるほど同じ偏差値でも高いステージ）
    var stageOffset: Int {
        switch self {
        case .firstYear: return 0
        case .secondYear: return 1
        case .thirdYear: return 2
        case .graduate: return 2
        }
    }
}

// MARK: - 模試種類

/// 模試種類
enum MockExamType: String, CaseIterable, Codable {
    case kawaiZentou = "河合全統"
    case sundaiZenkoku = "駿台全国"
    case shinken = "進研"
    case toshin = "東進"
    case none = "模試未受験"

    var displayName: String { rawValue }

    /// 河合全統換算への補正値
    /// 河合全統を基準(0)として、他の模試の偏差値を補正
    var deviationAdjustment: Double {
        switch self {
        case .kawaiZentou: return 0      // 基準
        case .sundaiZenkoku: return 5    // 駿台は難しいので+5
        case .shinken: return -10        // 進研は易しいので-10
        case .toshin: return -3          // 東進は少し易しいので-3
        case .none: return 0
        }
    }
}

// MARK: - ステージ判定サービス

/// ステージ判定ロジック
struct StageDeterminationService {

    /// 学年 × 模試種類 × 偏差値 からステージを判定
    /// - Parameters:
    ///   - year: 学年
    ///   - examType: 模試種類
    ///   - deviation: 偏差値（その模試での値）
    /// - Returns: 判定されたステージ（E1〜E10）
    static func determineStage(
        year: SchoolYear,
        examType: MockExamType,
        deviation: Double
    ) -> String {
        // 1. 模試種類による補正（河合全統換算）
        let adjustedDeviation = deviation + examType.deviationAdjustment

        // 2. 補正後の偏差値からベースステージを決定
        let baseStage = getBaseStage(from: adjustedDeviation)

        // 3. 学年による補正
        let finalStageNumber = baseStage + year.stageOffset

        // 4. E1〜E10の範囲に収める
        let clampedStage = min(max(finalStageNumber, 1), 10)

        return "E\(clampedStage)"
    }

    /// 偏差値からベースステージを取得（高1・河合全統基準）
    private static func getBaseStage(from deviation: Double) -> Int {
        switch deviation {
        case ..<40:  return 1  // E1: 中学レベル
        case 40..<45: return 1  // E1
        case 45..<50: return 2  // E2: 高1基礎
        case 50..<55: return 2  // E2
        case 55..<60: return 3  // E3: 基礎文法
        case 60..<65: return 3  // E3
        case 65..<70: return 4  // E4: 文法演習
        default:      return 5  // E5以上
        }
    }

    /// ステージの説明を取得
    static func stageDescription(_ stage: String) -> String {
        switch stage {
        case "E1": return "中学〜高1基礎レベル"
        case "E2": return "高1〜高2基礎レベル"
        case "E3": return "基礎文法マスターレベル"
        case "E4": return "文法演習レベル"
        case "E5": return "英文解釈入門レベル"
        case "E6": return "英文解釈基礎レベル"
        case "E7": return "長文読解入門レベル（日東駒専〜）"
        case "E8": return "長文読解応用レベル（MARCH〜）"
        case "E9": return "難関大対策レベル（早慶〜）"
        case "E10": return "最難関大対策レベル（旧帝大〜）"
        default: return stage
        }
    }

    /// ステージから到達可能な大学レベルを取得
    static func achievableUniversityLevel(_ stage: String) -> String {
        switch stage {
        case "E1", "E2", "E3", "E4", "E5", "E6":
            return "基礎固め中"
        case "E7":
            return "日東駒専レベル"
        case "E8":
            return "MARCH・関関同立レベル"
        case "E9":
            return "早慶・上位国公立レベル"
        case "E10":
            return "旧帝大・東大京大レベル"
        default:
            return ""
        }
    }
}

// MARK: - ステージ判定結果

/// ステージ判定結果
struct StageDeterminationResult {
    let stage: String
    let description: String
    let achievableLevel: String
    let inputYear: SchoolYear
    let inputExamType: MockExamType
    let inputDeviation: Double
    let adjustedDeviation: Double

    init(
        year: SchoolYear,
        examType: MockExamType,
        deviation: Double
    ) {
        self.inputYear = year
        self.inputExamType = examType
        self.inputDeviation = deviation
        self.adjustedDeviation = deviation + examType.deviationAdjustment
        self.stage = StageDeterminationService.determineStage(
            year: year,
            examType: examType,
            deviation: deviation
        )
        self.description = StageDeterminationService.stageDescription(self.stage)
        self.achievableLevel = StageDeterminationService.achievableUniversityLevel(self.stage)
    }
}
