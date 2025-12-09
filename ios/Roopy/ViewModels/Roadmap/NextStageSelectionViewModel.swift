import Foundation

/// 次ステージ教材選択のViewModel
@MainActor
final class NextStageSelectionViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var availableMaterials: [EnglishMaterial] = []
    @Published var selectedMaterials: Set<Int> = []
    @Published var isLoading = false
    @Published var isSaving = false
    @Published var errorMessage: String?

    // MARK: - Private Properties

    private let roadmapService = RoadmapService.shared

    // MARK: - Computed Properties

    /// カテゴリ別にグループ化された教材
    var groupedMaterials: [MaterialGroup] {
        let grouped = Dictionary(grouping: availableMaterials) { $0.materialCategory }
        let orderedCategories = ["単語", "熟語", "文法", "解釈", "長文", "英作文", "リスニング", "過去問"]

        // 最初の教材からstageIdとstageNameを取得
        let stageId = availableMaterials.first?.stageId ?? ""
        let stageName = availableMaterials.first?.stageName ?? ""

        return orderedCategories.compactMap { category in
            guard let materials = grouped[category], !materials.isEmpty else { return nil }
            return MaterialGroup(
                stageId: stageId,
                stageName: stageName,
                category: category,
                materials: materials.sorted { $0.displayOrder < $1.displayOrder }
            )
        }
    }

    /// 選択した教材リスト
    var selectedMaterialsList: [EnglishMaterial] {
        availableMaterials.filter { selectedMaterials.contains($0.id) }
    }

    /// 推定日数
    var estimatedDays: Int {
        selectedMaterialsList.reduce(0) { total, material in
            let days = material.recommendedDays ?? 30
            let cycles = material.recommendedCycles ?? 1
            return total + (days * cycles)
        }
    }

    /// 推定日数テキスト
    var estimatedDaysText: String {
        if estimatedDays == 0 {
            return "教材を選択してください"
        }
        let weeks = estimatedDays / 7
        let remainingDays = estimatedDays % 7
        if weeks > 0 {
            return remainingDays > 0 ? "約\(weeks)週間\(remainingDays)日" : "約\(weeks)週間"
        }
        return "約\(estimatedDays)日"
    }

    // MARK: - Methods

    /// 指定ステージの教材を取得
    func fetchMaterials(for stageId: String) async {
        isLoading = true
        errorMessage = nil

        do {
            let materials = try await roadmapService.fetchMaterialsForStage(stageId: stageId)
            availableMaterials = materials.filter { $0.isPublished }

            // デフォルトで全教材を選択
            selectedMaterials = Set(availableMaterials.map { $0.id })
        } catch {
            errorMessage = "教材の取得に失敗しました: \(error.localizedDescription)"
        }

        isLoading = false
    }

    /// 教材の選択をトグル
    func toggleMaterial(_ material: EnglishMaterial) {
        if selectedMaterials.contains(material.id) {
            selectedMaterials.remove(material.id)
        } else {
            selectedMaterials.insert(material.id)
        }
    }

    /// 次ステージをロードマップに追加
    func addNextStageToRoadmap(roadmap: UserRoadmap, stageId: String) async {
        guard !selectedMaterials.isEmpty else { return }

        isSaving = true
        errorMessage = nil

        do {
            // 選択した教材でスケジュールを生成し、既存ロードマップに追加
            try await roadmapService.addStageToRoadmap(
                roadmapId: roadmap.id,
                stageId: stageId,
                materials: selectedMaterialsList,
                dailyMinutes: roadmap.dailyStudyMinutes
            )

            // 現在ステージを更新
            try await roadmapService.updateRoadmap(
                id: roadmap.id,
                status: nil,
                progressPercentage: nil,
                currentStage: stageId
            )

            print("✅ Next stage \(stageId) added to roadmap")
        } catch {
            errorMessage = "ステージの追加に失敗しました: \(error.localizedDescription)"
            print("❌ Failed to add next stage: \(error)")
        }

        isSaving = false
    }
}
