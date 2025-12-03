import Foundation
import SwiftUI

/// ロードマップ結果画面のViewModel
@MainActor
final class RoadmapResultViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var roadmap: UserRoadmap?
    @Published var stages: [RoadmapStage] = []
    @Published var materials: [RoadmapMaterial] = []
    @Published var warnings: [String] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Private Properties

    private let roadmapService = RoadmapService.shared

    // MARK: - Computed Properties

    /// ステージ別の教材をグループ化
    var materialsByStage: [(stage: RoadmapStage, materials: [RoadmapMaterial])] {
        stages.map { stage in
            let stageMaterials = materials.filter { $0.stageId == stage.stageId }
            return (stage: stage, materials: stageMaterials)
        }
    }

    /// 総学習日数
    var totalDays: Int {
        guard let roadmap = roadmap else { return 0 }
        return roadmap.daysUntilExam
    }

    /// 予定完了日
    var estimatedEndDateText: String {
        guard let roadmap = roadmap, let date = roadmap.estimatedCompletionDate else { return "-" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy年M月d日"
        return formatter.string(from: date)
    }

    /// 開始ステージから目標ステージの表示
    var stageRangeText: String {
        guard let roadmap = roadmap else { return "-" }
        return "\(roadmap.startStage) → \(roadmap.targetStage)"
    }

    /// 教材の総数
    var totalMaterialCount: Int {
        materials.count
    }

    /// 日別の学習時間
    var dailyStudyTimeText: String {
        guard let roadmap = roadmap else { return "-" }
        let hours = roadmap.dailyStudyMinutes / 60
        let minutes = roadmap.dailyStudyMinutes % 60
        if hours > 0 && minutes > 0 {
            return "\(hours)時間\(minutes)分/日"
        } else if hours > 0 {
            return "\(hours)時間/日"
        } else {
            return "\(minutes)分/日"
        }
    }

    // MARK: - Initialization

    init(generatedRoadmap: GeneratedRoadmap? = nil) {
        if let generated = generatedRoadmap {
            self.warnings = generated.warnings
        }
    }

    // MARK: - Methods

    /// ロードマップ詳細を取得
    func fetchRoadmapDetails(roadmapId: Int) async {
        isLoading = true
        errorMessage = nil

        do {
            async let fetchedStages = roadmapService.fetchStages(roadmapId: roadmapId)
            async let fetchedMaterials = roadmapService.fetchRoadmapMaterials(roadmapId: roadmapId, stageId: nil)

            stages = try await fetchedStages
            materials = try await fetchedMaterials

        } catch {
            errorMessage = "詳細の取得に失敗しました: \(error.localizedDescription)"
        }

        isLoading = false
    }

    /// 生成結果から初期化（保存前のプレビュー用）
    func initializeFromGenerated(_ generated: GeneratedRoadmap, params: RoadmapInputParams) {
        // 一時的なステージデータを作成
        stages = generated.stages.enumerated().map { index, schedule in
            RoadmapStage(
                id: -(index + 1), // 一時的な負のID
                roadmapId: 0,
                stageId: schedule.stageId,
                stageOrder: index + 1,
                plannedStartDate: schedule.startDate,
                plannedEndDate: schedule.endDate,
                actualStartDate: nil,
                actualEndDate: nil,
                status: .pending,
                createdAt: nil,
                updatedAt: nil
            )
        }

        // 一時的な教材データを作成
        materials = generated.materials.enumerated().map { index, schedule in
            RoadmapMaterial(
                id: -(index + 1),
                roadmapId: 0,
                stageId: schedule.material.stageId,
                materialId: schedule.material.id,
                materialOrder: index + 1,
                plannedStartDate: schedule.startDate,
                plannedEndDate: schedule.endDate,
                actualStartDate: nil,
                actualEndDate: nil,
                currentCycle: 0,
                totalCycles: schedule.cycles,
                status: .pending,
                createdAt: nil,
                updatedAt: nil,
                material: schedule.material
            )
        }

        warnings = generated.warnings
    }

    /// Gantt表示用のデータを取得
    func ganttData(for stage: RoadmapStage) -> (progress: Double, daysRemaining: Int) {
        let now = Date()
        let totalDays = Calendar.current.dateComponents(
            [.day],
            from: stage.plannedStartDate,
            to: stage.plannedEndDate
        ).day ?? 1

        let elapsed = Calendar.current.dateComponents(
            [.day],
            from: stage.plannedStartDate,
            to: now
        ).day ?? 0

        let progress = min(1.0, max(0, Double(elapsed) / Double(totalDays)))
        let remaining = max(0, Calendar.current.dateComponents(
            [.day],
            from: now,
            to: stage.plannedEndDate
        ).day ?? 0)

        return (progress, remaining)
    }

    /// 週別スケジュールを取得
    func weeklySchedule() -> [[RoadmapMaterial]] {
        guard let startDate = stages.first?.plannedStartDate else { return [] }

        var weeks: [[RoadmapMaterial]] = []
        var currentWeekStart = startDate
        let calendar = Calendar.current

        // 最大12週間分
        for _ in 0..<12 {
            guard let weekEnd = calendar.date(byAdding: .day, value: 7, to: currentWeekStart) else { break }

            let weekMaterials = materials.filter { material in
                material.plannedStartDate < weekEnd && material.plannedEndDate > currentWeekStart
            }

            if !weekMaterials.isEmpty {
                weeks.append(weekMaterials)
            }

            currentWeekStart = weekEnd

            // 全ステージ終了後は終了
            if let lastEndDate = stages.last?.plannedEndDate, currentWeekStart > lastEndDate {
                break
            }
        }

        return weeks
    }
}
