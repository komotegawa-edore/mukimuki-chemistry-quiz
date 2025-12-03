import Foundation
import SwiftUI

/// 現在レベル入力モード
enum CurrentLevelMode: String, CaseIterable {
    case deviationBased = "偏差値"
    case stageBased = "ステージ"

    var displayName: String { rawValue }
}

/// ロードマップ入力画面のViewModel
@MainActor
final class RoadmapInputViewModel: ObservableObject {

    // MARK: - Published Properties (入力値)

    @Published var selectedTargetLevel: TargetLevel = .march
    @Published var selectedCurrentLevel: CurrentLevelMode = .deviationBased
    @Published var deviationValue: Double = 50
    @Published var currentStage: String = "E3"
    @Published var selectedWeakAreas: Set<WeakArea> = []
    @Published var dailyStudyMinutes: Int = 90
    @Published var examDate: Date = Calendar.current.date(byAdding: .month, value: 6, to: Date()) ?? Date()

    // MARK: - Published Properties (教材選択)

    @Published var allMaterials: [EnglishMaterial] = []
    @Published var materialGroups: [MaterialGroup] = []
    @Published var materialSelections = MaterialSelections()
    @Published var showingMaterialSelection = false

    // MARK: - Published Properties (状態)

    @Published var isLoading = false
    @Published var isGenerating = false
    @Published var errorMessage: String?
    @Published var generatedRoadmap: GeneratedRoadmap?
    @Published var showingResult = false

    // MARK: - Private Properties

    private let materialService = MaterialService.shared
    private let roadmapService = RoadmapService.shared
    private let generatorService = RoadmapGeneratorService.shared

    // MARK: - Computed Properties

    /// 試験までの日数
    var daysUntilExam: Int {
        let days = Calendar.current.dateComponents([.day], from: Date(), to: examDate).day ?? 0
        return max(1, days)
    }

    /// 選択された苦手分野の配列
    var weakAreasArray: [String] {
        selectedWeakAreas.map { $0.rawValue }
    }

    /// 入力パラメータ
    var inputParams: RoadmapInputParams {
        RoadmapInputParams(
            currentLevel: selectedCurrentLevel == .stageBased ? currentStage : "",
            currentDeviationValue: selectedCurrentLevel == .deviationBased ? deviationValue : nil,
            weakAreas: weakAreasArray,
            dailyStudyMinutes: dailyStudyMinutes,
            daysUntilExam: daysUntilExam,
            targetUniversity: nil,
            targetLevel: selectedTargetLevel.rawValue
        )
    }

    /// バリデーション
    var isValid: Bool {
        if selectedCurrentLevel == .deviationBased {
            return deviationValue >= 30 && deviationValue <= 80
        }
        return !currentStage.isEmpty
    }

    /// 偏差値スライダーの表示テキスト
    var deviationDisplayText: String {
        String(format: "%.0f", deviationValue)
    }

    /// 学習時間の選択肢
    var studyTimeOptions: [Int] {
        [30, 60, 90, 120, 150, 180]
    }

    /// ステージの選択肢
    var stageOptions: [String] {
        (1...10).map { "E\($0)" }
    }

    // MARK: - Methods

    /// 教材データを取得してグループ化（教材選択画面へ）
    func loadMaterialsAndShowSelection() async {
        guard isValid else {
            errorMessage = "入力内容を確認してください"
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            // 1. 教材データを取得
            let materials = try await materialService.fetchAllMaterials()

            guard !materials.isEmpty else {
                errorMessage = "教材データが見つかりません"
                isLoading = false
                return
            }

            allMaterials = materials

            // 2. 必要なステージ範囲を計算
            let startStage = determineStartStage()
            let targetStage = determineTargetStage()
            let requiredStages = getStageRange(from: startStage, to: targetStage)

            // 3. 教材をグループ化
            materialGroups = groupMaterials(materials, forStages: requiredStages)

            // 4. デフォルト選択を設定（各グループの最初の教材）
            for group in materialGroups {
                if let first = group.materials.first {
                    materialSelections.select(first, for: group)
                }
            }

            isLoading = false
            showingMaterialSelection = true

        } catch {
            errorMessage = "教材の取得に失敗しました: \(error.localizedDescription)"
            isLoading = false
        }
    }

    /// 教材選択後にロードマップを生成
    func generateRoadmapWithSelectedMaterials() async {
        isGenerating = true
        errorMessage = nil

        // 選択された教材のみでロードマップを生成
        let selectedMaterials = materialSelections.allSelectedMaterials(from: materialGroups)

        guard !selectedMaterials.isEmpty else {
            errorMessage = "教材が選択されていません"
            isGenerating = false
            return
        }

        // ロードマップを生成
        let roadmap = generatorService.generateRoadmap(
            params: inputParams,
            materials: selectedMaterials
        )

        generatedRoadmap = roadmap
        showingMaterialSelection = false
        showingResult = true
        isGenerating = false
    }

    /// ロードマップを生成（従来の自動選択モード）
    func generateRoadmap() async {
        guard isValid else {
            errorMessage = "入力内容を確認してください"
            return
        }

        isGenerating = true
        errorMessage = nil

        do {
            // 1. 教材データを取得
            let materials = try await materialService.fetchAllMaterials()

            guard !materials.isEmpty else {
                errorMessage = "教材データが見つかりません"
                isGenerating = false
                return
            }

            // 2. ロードマップを生成
            let roadmap = generatorService.generateRoadmap(
                params: inputParams,
                materials: materials
            )

            generatedRoadmap = roadmap
            showingResult = true

        } catch {
            errorMessage = "生成に失敗しました: \(error.localizedDescription)"
        }

        isGenerating = false
    }

    // MARK: - Private Helpers

    /// 開始ステージを決定
    private func determineStartStage() -> String {
        if selectedCurrentLevel == .stageBased {
            return currentStage
        }

        // 偏差値ベースの判定
        switch deviationValue {
        case ..<40:  return "E1"
        case 40..<45: return "E3"
        case 45..<50: return "E5"
        case 50..<55: return "E6"
        case 55..<60: return "E7"
        case 60..<65: return "E8"
        case 65..<70: return "E9"
        default:      return "E10"
        }
    }

    /// 目標ステージを決定
    private func determineTargetStage() -> String {
        let targetLevelRequirements: [String: String] = [
            "日東駒専": "E8",
            "MARCH": "E10",
            "関関同立": "E10",
            "早慶": "E13",
            "地方国公立": "E10",
            "旧帝大": "E13",
            "東大・京大": "E15"
        ]
        return targetLevelRequirements[selectedTargetLevel.rawValue] ?? "E10"
    }

    /// ステージ範囲を取得
    private func getStageRange(from start: String, to target: String) -> [String] {
        let stageOrder: [String: Int] = [
            "E1": 1, "E2": 2, "E3": 3, "E4": 4, "E5": 5,
            "E6": 6, "E7": 7, "E8": 8, "E9": 9, "E10": 10,
            "E11": 11, "E12": 12, "E13": 13, "E14": 14, "E15": 15
        ]

        guard let startOrder = stageOrder[start],
              let targetOrder = stageOrder[target] else {
            return []
        }

        return (startOrder...targetOrder).compactMap { order in
            stageOrder.first { $0.value == order }?.key
        }.sorted { (stageOrder[$0] ?? 0) < (stageOrder[$1] ?? 0) }
    }

    /// 教材をグループ化
    private func groupMaterials(_ materials: [EnglishMaterial], forStages stages: [String]) -> [MaterialGroup] {
        // 対象ステージの教材をフィルタ
        let filteredMaterials = materials.filter { material in
            stages.contains(material.stageId) && material.isPublished
        }

        // ステージ+カテゴリでグループ化
        var groups: [String: [EnglishMaterial]] = [:]

        for material in filteredMaterials {
            let key = "\(material.stageId)_\(material.materialCategory)"
            if groups[key] == nil {
                groups[key] = []
            }
            groups[key]?.append(material)
        }

        // MaterialGroupに変換
        return groups.compactMap { key, materials -> MaterialGroup? in
            guard let first = materials.first else { return nil }
            return MaterialGroup(
                stageId: first.stageId,
                stageName: first.stageName,
                category: first.materialCategory,
                materials: materials.sorted { $0.displayOrder < $1.displayOrder }
            )
        }.sorted { group1, group2 in
            // ステージ順 → カテゴリ順でソート
            if group1.stageId != group2.stageId {
                let order1 = Int(group1.stageId.dropFirst()) ?? 0
                let order2 = Int(group2.stageId.dropFirst()) ?? 0
                return order1 < order2
            }
            return group1.category < group2.category
        }
    }

    /// ロードマップをSupabaseに保存
    func saveRoadmap(userId: UUID) async -> UserRoadmap? {
        guard let generated = generatedRoadmap else { return nil }

        isLoading = true
        errorMessage = nil

        do {
            let roadmap = try await roadmapService.createRoadmap(
                userId: userId,
                params: inputParams,
                generatedRoadmap: generated
            )
            isLoading = false
            return roadmap
        } catch {
            errorMessage = "保存に失敗しました: \(error.localizedDescription)"
            isLoading = false
            return nil
        }
    }

    /// 入力をリセット
    func reset() {
        selectedTargetLevel = .march
        selectedCurrentLevel = .deviationBased
        deviationValue = 50
        currentStage = "E3"
        selectedWeakAreas = []
        dailyStudyMinutes = 90
        examDate = Calendar.current.date(byAdding: .month, value: 6, to: Date()) ?? Date()
        generatedRoadmap = nil
        showingResult = false
        errorMessage = nil
    }

    /// 苦手分野のトグル
    func toggleWeakArea(_ area: WeakArea) {
        if selectedWeakAreas.contains(area) {
            selectedWeakAreas.remove(area)
        } else {
            selectedWeakAreas.insert(area)
        }
    }
}
