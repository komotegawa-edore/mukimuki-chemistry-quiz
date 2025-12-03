import Foundation
import SwiftUI

/// ロードマップ進捗画面のViewModel
@MainActor
final class RoadmapProgressViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var roadmap: UserRoadmap?
    @Published var summary: RoadmapSummary?
    @Published var stages: [RoadmapStage] = []
    @Published var materials: [RoadmapMaterial] = []
    @Published var recentLogs: [RoadmapProgressLog] = []
    @Published var studyTimeData: [StudyTimeDataPoint] = []

    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Private Properties

    private let roadmapService = RoadmapService.shared

    // MARK: - Computed Properties

    /// 全体進捗率
    var overallProgress: Double {
        roadmap?.progressPercentage ?? 0 / 100
    }

    /// 進捗率のテキスト
    var progressText: String {
        String(format: "%.0f%%", (roadmap?.progressPercentage ?? 0))
    }

    /// 現在のステージ
    var currentStage: String {
        roadmap?.currentStage ?? "-"
    }

    /// 目標ステージ
    var targetStage: String {
        roadmap?.targetStage ?? "-"
    }

    /// 残り日数
    var daysRemaining: Int {
        guard let roadmap = roadmap, let targetDate = roadmap.estimatedCompletionDate else { return 0 }
        let days = Calendar.current.dateComponents(
            [.day],
            from: Date(),
            to: targetDate
        ).day ?? 0
        return max(0, days)
    }

    /// 経過日数
    var daysElapsed: Int {
        guard let roadmap = roadmap, let startDate = roadmap.createdAt else { return 0 }
        let days = Calendar.current.dateComponents(
            [.day],
            from: startDate,
            to: Date()
        ).day ?? 0
        return max(0, days)
    }

    /// スケジュール通りか
    var isOnSchedule: Bool {
        summary?.isOnSchedule ?? true
    }

    /// 遅延日数
    var delayDays: Int {
        summary?.delayDays ?? 0
    }

    /// ステータステキスト
    var statusText: String {
        guard let roadmap = roadmap else { return "-" }
        switch roadmap.status {
        case .active:
            return isOnSchedule ? "順調に進行中" : "\(delayDays)日遅延"
        case .paused:
            return "一時停止中"
        case .completed:
            return "完了"
        case .cancelled:
            return "キャンセル"
        case .abandoned:
            return "中断"
        }
    }

    /// ステータスカラー
    var statusColor: Color {
        guard let roadmap = roadmap else { return .gray }
        switch roadmap.status {
        case .active:
            return isOnSchedule ? .green : .orange
        case .paused:
            return .yellow
        case .completed:
            return .blue
        case .cancelled, .abandoned:
            return .red
        }
    }

    /// 週間学習時間
    var weeklyStudyMinutes: Int {
        let weekAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        return studyTimeData
            .filter { $0.date >= weekAgo }
            .reduce(0) { $0 + $1.minutes }
    }

    /// 週間学習時間テキスト
    var weeklyStudyTimeText: String {
        let hours = weeklyStudyMinutes / 60
        let minutes = weeklyStudyMinutes % 60
        if hours > 0 {
            return minutes > 0 ? "\(hours)時間\(minutes)分" : "\(hours)時間"
        }
        return "\(minutes)分"
    }

    /// ステージ進捗情報
    var stageProgressList: [StageProgressInfo] {
        stages.map { stage in
            let progress: Double
            switch stage.status {
            case .completed:
                progress = 1.0
            case .inProgress:
                let total = Calendar.current.dateComponents(
                    [.day],
                    from: stage.plannedStartDate,
                    to: stage.plannedEndDate
                ).day ?? 1
                let elapsed = Calendar.current.dateComponents(
                    [.day],
                    from: stage.actualStartDate ?? stage.plannedStartDate,
                    to: Date()
                ).day ?? 0
                progress = min(1.0, max(0, Double(elapsed) / Double(total)))
            case .pending, .skipped:
                progress = 0
            }

            return StageProgressInfo(
                stageId: stage.stageId,
                stageName: stage.stageName,
                progress: progress,
                status: stage.status
            )
        }
    }

    // MARK: - Methods

    /// データを取得
    func fetchData(userId: UUID) async {
        isLoading = true
        errorMessage = nil

        do {
            // アクティブなロードマップを取得
            if let activeRoadmap = try await roadmapService.fetchActiveRoadmap(userId: userId) {
                roadmap = activeRoadmap

                // サマリーを取得
                summary = try await roadmapService.fetchRoadmapSummary(roadmap: activeRoadmap)

                // ステージを取得
                stages = try await roadmapService.fetchStages(roadmapId: activeRoadmap.id)

                // 教材を取得（ガントチャート用）
                materials = try await roadmapService.fetchRoadmapMaterials(roadmapId: activeRoadmap.id, stageId: nil)

                // 学習時間データを生成（仮実装）
                generateStudyTimeData()
            }

        } catch {
            errorMessage = "データの取得に失敗しました: \(error.localizedDescription)"
        }

        isLoading = false
    }

    /// ロードマップを一時停止
    func pauseRoadmap() async {
        guard let roadmap = roadmap else { return }

        do {
            try await roadmapService.updateRoadmap(
                id: roadmap.id,
                status: .paused,
                progressPercentage: nil,
                currentStage: nil
            )
            self.roadmap?.status = .paused
        } catch {
            errorMessage = "停止に失敗しました"
        }
    }

    /// ロードマップを再開
    func resumeRoadmap() async {
        guard let roadmap = roadmap else { return }

        do {
            try await roadmapService.updateRoadmap(
                id: roadmap.id,
                status: .active,
                progressPercentage: nil,
                currentStage: nil
            )
            self.roadmap?.status = .active
        } catch {
            errorMessage = "再開に失敗しました"
        }
    }

    /// ロードマップをキャンセル（作り直しのため）
    func cancelRoadmap() async {
        guard let roadmap = roadmap else { return }

        do {
            try await roadmapService.cancelRoadmap(id: roadmap.id)
            self.roadmap = nil
            self.summary = nil
            self.stages = []
            self.materials = []
        } catch {
            errorMessage = "キャンセルに失敗しました"
        }
    }

    /// 学習時間データを生成（仮実装 - 後でログから計算）
    private func generateStudyTimeData() {
        var data: [StudyTimeDataPoint] = []
        let calendar = Calendar.current

        for i in 0..<14 {
            guard let date = calendar.date(byAdding: .day, value: -i, to: Date()) else { continue }
            // 仮のデータ（実際はcompletedタスクのactualMinutesから計算）
            let minutes = Int.random(in: 60...120)
            data.append(StudyTimeDataPoint(date: date, minutes: minutes))
        }

        studyTimeData = data.reversed()
    }

    /// リフレッシュ
    func refresh(userId: UUID) async {
        await fetchData(userId: userId)
    }
}

// MARK: - Achievement

extension RoadmapProgressViewModel {
    /// 達成バッジ一覧
    var achievements: [RoadmapAchievement] {
        var badges: [RoadmapAchievement] = []

        // 開始バッジ
        badges.append(RoadmapAchievement(
            name: "スタート",
            description: "ロードマップを開始した",
            icon: "play.circle.fill",
            isUnlocked: roadmap != nil,
            unlockedAt: roadmap?.createdAt
        ))

        // 1週間継続
        let oneWeekAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date())
        let hasOneWeek = roadmap?.createdAt ?? Date() <= (oneWeekAgo ?? Date())
        badges.append(RoadmapAchievement(
            name: "1週間継続",
            description: "1週間学習を続けた",
            icon: "flame.fill",
            isUnlocked: hasOneWeek,
            unlockedAt: hasOneWeek ? oneWeekAgo : nil
        ))

        // 50%達成
        let halfwayDone = (roadmap?.progressPercentage ?? 0) >= 50
        badges.append(RoadmapAchievement(
            name: "折り返し",
            description: "進捗50%を達成",
            icon: "flag.checkered",
            isUnlocked: halfwayDone,
            unlockedAt: nil
        ))

        // ステージ完了
        let completedStages = stages.filter { $0.status == .completed }.count
        badges.append(RoadmapAchievement(
            name: "ステージマスター",
            description: "\(completedStages)ステージを完了",
            icon: "star.fill",
            isUnlocked: completedStages > 0,
            unlockedAt: nil
        ))

        return badges
    }
}
