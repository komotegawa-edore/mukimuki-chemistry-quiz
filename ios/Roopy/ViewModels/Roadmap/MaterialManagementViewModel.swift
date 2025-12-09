import Foundation
import SwiftUI

/// 教材管理画面のViewModel
@MainActor
final class MaterialManagementViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var materials: [RoadmapMaterial] = []
    @Published var availableMaterials: [EnglishMaterial] = []  // 代替候補
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var successMessage: String?

    // MARK: - Private Properties

    private let roadmapService = RoadmapService.shared
    private let roadmapId: Int
    let currentStage: String

    // MARK: - Init

    init(roadmapId: Int, currentStage: String) {
        self.roadmapId = roadmapId
        self.currentStage = currentStage
    }

    // MARK: - Data Loading

    /// 教材データを読み込む
    func loadData() async {
        isLoading = true
        errorMessage = nil

        do {
            // 現在のロードマップ教材を取得
            materials = try await roadmapService.fetchRoadmapMaterials(roadmapId: roadmapId, stageId: nil)
            print("📚 MaterialManagement: loaded \(materials.count) materials")
        } catch {
            errorMessage = "教材の読み込みに失敗しました: \(error.localizedDescription)"
            print("❌ MaterialManagement error: \(error)")
        }

        isLoading = false
    }

    /// 代替候補の教材を読み込む（同じカテゴリ・同じステージ）
    func loadAlternativeMaterials(for material: RoadmapMaterial) async {
        guard let currentMaterial = material.material else { return }

        do {
            // 同じステージ・同じカテゴリの教材を取得
            let allMaterials = try await roadmapService.fetchMaterialsForStage(stageId: material.stageId)
            availableMaterials = allMaterials.filter {
                $0.materialCategory == currentMaterial.materialCategory && $0.id != currentMaterial.id
            }
            print("📚 Alternative materials found: \(availableMaterials.count)")
        } catch {
            print("❌ Failed to load alternative materials: \(error)")
            availableMaterials = []
        }
    }

    // MARK: - Actions

    /// 教材を削除（スキップ扱いにする）
    func removeMaterial(_ material: RoadmapMaterial) async {
        isLoading = true
        errorMessage = nil

        do {
            try await roadmapService.skipMaterial(materialId: material.id)

            // ローカル状態を更新
            if let index = materials.firstIndex(where: { $0.id == material.id }) {
                materials[index].status = .skipped
            }

            successMessage = "「\(material.material?.materialName ?? "教材")」をスキップしました"
            print("✅ Material skipped: \(material.id)")
        } catch {
            errorMessage = "教材の削除に失敗しました: \(error.localizedDescription)"
            print("❌ Skip material error: \(error)")
        }

        isLoading = false
    }

    /// 教材を別の教材に変更
    func replaceMaterial(_ oldMaterial: RoadmapMaterial, with newMaterial: EnglishMaterial) async {
        isLoading = true
        errorMessage = nil

        do {
            try await roadmapService.replaceMaterial(
                roadmapMaterialId: oldMaterial.id,
                newMaterialId: newMaterial.id,
                roadmapId: roadmapId
            )

            // データを再読み込み
            await loadData()

            successMessage = "教材を「\(newMaterial.materialName)」に変更しました"
            print("✅ Material replaced: \(oldMaterial.id) -> \(newMaterial.id)")
        } catch {
            errorMessage = "教材の変更に失敗しました: \(error.localizedDescription)"
            print("❌ Replace material error: \(error)")
        }

        isLoading = false
    }

    /// 教材のステータスを元に戻す（スキップ解除）
    func restoreMaterial(_ material: RoadmapMaterial) async {
        isLoading = true
        errorMessage = nil

        do {
            try await roadmapService.updateRoadmapMaterial(id: material.id, status: .pending, currentCycle: nil)

            // ローカル状態を更新
            if let index = materials.firstIndex(where: { $0.id == material.id }) {
                materials[index].status = .pending
            }

            successMessage = "「\(material.material?.materialName ?? "教材")」を復元しました"
        } catch {
            errorMessage = "教材の復元に失敗しました: \(error.localizedDescription)"
        }

        isLoading = false
    }

    // MARK: - Computed Properties

    /// 現在のステージの教材
    var currentStageMaterials: [RoadmapMaterial] {
        materials.filter { $0.stageId == currentStage }
    }

    /// ステージごとにグループ化した教材
    var materialsByStage: [(stageId: String, materials: [RoadmapMaterial])] {
        let grouped = Dictionary(grouping: materials) { $0.stageId }
        return grouped.keys.sorted().map { stageId in
            (stageId: stageId, materials: grouped[stageId]?.sorted { $0.materialOrder < $1.materialOrder } ?? [])
        }
    }

    /// アクティブな教材（スキップされていない）
    var activeMaterials: [RoadmapMaterial] {
        materials.filter { $0.status != .skipped }
    }

    /// スキップされた教材
    var skippedMaterials: [RoadmapMaterial] {
        materials.filter { $0.status == .skipped }
    }
}
