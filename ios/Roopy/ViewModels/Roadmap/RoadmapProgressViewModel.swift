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
    @Published var tasks: [RoadmapDailyTask] = []  // タスク一覧（進捗計算用）
    @Published var futureStages: [FutureStageEstimate] = []  // 将来のステージ予測
    @Published var recentLogs: [RoadmapProgressLog] = []
    @Published var studyTimeData: [StudyTimeDataPoint] = []

    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Private Properties

    private let roadmapService = RoadmapService.shared

    // MARK: - Stage Completion

    /// 現在のステージが完了しているか
    var isCurrentStageCompleted: Bool {
        guard let currentStageId = roadmap?.currentStage else { return false }

        // 現在ステージの全教材が完了しているか確認
        let currentStageMaterials = materials.filter { $0.stageId == currentStageId }
        guard !currentStageMaterials.isEmpty else { return false }

        return currentStageMaterials.allSatisfy { $0.status == .completed }
    }

    /// 次のステージがあるか
    var hasNextStage: Bool {
        guard let currentStageId = roadmap?.currentStage,
              let targetStageId = roadmap?.targetStage else { return false }

        let currentOrder = stageOrder(currentStageId)
        let targetOrder = stageOrder(targetStageId)

        return currentOrder < targetOrder
    }

    /// 次のステージID
    var nextStageId: String? {
        guard let currentStageId = roadmap?.currentStage else { return nil }
        let currentOrder = stageOrder(currentStageId)
        return "E\(currentOrder + 1)"
    }

    /// 次ステージへの遷移を表示すべきか
    var shouldShowNextStagePrompt: Bool {
        isCurrentStageCompleted && hasNextStage
    }

    /// ステージ順序を取得
    private func stageOrder(_ stageId: String) -> Int {
        guard stageId.hasPrefix("E"),
              let number = Int(stageId.dropFirst()) else { return 0 }
        return number
    }

    // MARK: - Computed Properties

    /// 現在ステージの教材IDリスト
    private var currentStageMaterialIds: Set<Int> {
        Set(materials.filter { $0.stageId == roadmap?.currentStage }.map { $0.id })
    }

    /// 現在ステージのタスク
    private var currentStageTasks: [RoadmapDailyTask] {
        tasks.filter { currentStageMaterialIds.contains($0.roadmapMaterialId) }
    }

    /// 全体進捗率（0.0〜1.0）- タスクベースで計算
    var overallProgress: Double {
        let stageTasks = currentStageTasks
        guard !stageTasks.isEmpty else {
            return (roadmap?.progressPercentage ?? 0) / 100
        }
        let completedCount = stageTasks.filter { $0.status == .completed || $0.status == .skipped }.count
        return Double(completedCount) / Double(stageTasks.count)
    }

    /// 現在ステージの完了タスク数
    var currentStageCompletedCount: Int {
        currentStageTasks.filter { $0.status == .completed || $0.status == .skipped }.count
    }

    /// 現在ステージの総タスク数
    var currentStageTotalCount: Int {
        currentStageTasks.count
    }

    /// 現在ステージの計画終了日（元の予定）
    var plannedStageEndDate: Date? {
        let currentStageMaterials = materials.filter { $0.stageId == roadmap?.currentStage }
        return currentStageMaterials.map { $0.plannedEndDate }.max()
    }

    /// 現在ステージの予測終了日（進捗ベースで動的計算）
    var currentStageEndDate: Date? {
        let stageTasks = currentStageTasks
        guard !stageTasks.isEmpty else { return plannedStageEndDate }

        let completedCount = stageTasks.filter { $0.status == .completed || $0.status == .skipped }.count
        let remainingCount = stageTasks.count - completedCount

        // 全部終わっていたら今日
        if remainingCount == 0 {
            return Date()
        }

        // 1日あたりの平均タスク数を計算（計画ベース）
        // 各日に割り当てられたタスク数から平均を算出
        let tasksByDate = Dictionary(grouping: stageTasks) { task -> String in
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            return formatter.string(from: task.taskDate)
        }
        let avgTasksPerDay = max(1.0, Double(stageTasks.count) / Double(max(1, tasksByDate.count)))

        // 残りタスク数 ÷ 1日あたりタスク数 = 残り日数
        let estimatedDaysRemaining = Int(ceil(Double(remainingCount) / avgTasksPerDay))

        return Calendar.current.date(byAdding: .day, value: estimatedDaysRemaining, to: Date())
    }

    /// 現在ステージの終了予定日テキスト
    var currentStageEndDateText: String {
        guard let endDate = currentStageEndDate else { return "-" }
        let formatter = DateFormatter()
        formatter.dateFormat = "M月d日"
        formatter.locale = Locale(identifier: "ja_JP")
        return formatter.string(from: endDate)
    }

    /// 現在ステージ終了までの残り日数（進捗ベース）
    var daysUntilStageEnd: Int {
        guard let endDate = currentStageEndDate else { return 0 }
        let days = Calendar.current.dateComponents([.day], from: Date(), to: endDate).day ?? 0
        return max(0, days)
    }

    /// 計画より早いか遅いか（日数差）
    var daysAheadOfSchedule: Int {
        guard let planned = plannedStageEndDate, let estimated = currentStageEndDate else { return 0 }
        let diff = Calendar.current.dateComponents([.day], from: estimated, to: planned).day ?? 0
        return diff  // 正なら早い、負なら遅い
    }

    /// 進捗率のテキスト
    var progressText: String {
        String(format: "%.0f%%", overallProgress * 100)
    }

    /// 現在ステージの進捗テキスト
    var currentStageProgressText: String {
        "\(currentStageCompletedCount) / \(currentStageTotalCount) タスク完了"
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
        print("📊 RoadmapProgressViewModel.fetchData called for userId: \(userId)")
        isLoading = true
        errorMessage = nil

        do {
            // アクティブなロードマップを取得
            if let activeRoadmap = try await roadmapService.fetchActiveRoadmap(userId: userId) {
                print("✅ Active roadmap found: id=\(activeRoadmap.id), status=\(activeRoadmap.status)")
                roadmap = activeRoadmap

                // サマリーを取得
                summary = try await roadmapService.fetchRoadmapSummary(roadmap: activeRoadmap)
                print("✅ Summary fetched")

                // ステージを取得
                stages = try await roadmapService.fetchStages(roadmapId: activeRoadmap.id)
                print("✅ Stages fetched: \(stages.count)")

                // 教材を取得（ガントチャート用）
                materials = try await roadmapService.fetchRoadmapMaterials(roadmapId: activeRoadmap.id, stageId: nil)
                print("✅ Materials fetched: \(materials.count)")

                // タスクを取得（進捗計算用）
                tasks = try await roadmapService.fetchAllTasks(roadmapId: activeRoadmap.id)
                print("✅ Tasks fetched: \(tasks.count)")

                // 将来のステージ予測を計算
                calculateFutureStages()
                print("✅ Future stages calculated: \(futureStages.count)")

                // 学習時間データを生成（仮実装）
                generateStudyTimeData()
            } else {
                print("⚠️ No active roadmap found for userId: \(userId)")
            }

        } catch {
            print("❌ fetchData error: \(error)")
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

// MARK: - Future Stage Estimate

/// 将来のステージ予測
struct FutureStageEstimate: Identifiable {
    let id: String  // E7, E8, etc.
    let stageId: String
    let stageName: String
    let estimatedStartDate: Date
    let estimatedEndDate: Date
    let estimatedDays: Int

    var dateRangeText: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M/d"
        return "\(formatter.string(from: estimatedStartDate)) 〜 \(formatter.string(from: estimatedEndDate))"
    }
}

extension RoadmapProgressViewModel {
    /// 将来のステージ予測を計算（現在ステージ〜目標ステージ）
    /// 各ステージは固定で2ヶ月（60日）
    /// E10の後は「過去問演習」フェーズ（E10終了〜入試日）
    func calculateFutureStages() {
        guard let roadmap = roadmap,
              let currentStage = roadmap.currentStage else {
            futureStages = []
            return
        }

        let targetStageNumber = stageOrder(roadmap.targetStage)
        let currentStageNumber = stageOrder(currentStage)

        guard targetStageNumber > currentStageNumber else {
            // 目標ステージに達している場合でも、過去問演習フェーズを追加
            addExamPracticePhase(estimates: &futureStages, startDate: currentStageEndDate ?? Date())
            return
        }

        // 固定で1ステージ2ヶ月（60日）
        let daysPerStage = 60

        var estimates: [FutureStageEstimate] = []
        var currentDate = currentStageEndDate ?? Date()

        // 現在ステージの次から目標ステージまで
        for stageNum in (currentStageNumber + 1)...targetStageNumber {
            let stageId = "E\(stageNum)"
            let stageName = stageDisplayName(stageNum)

            let startDate = currentDate
            let endDate = Calendar.current.date(byAdding: .day, value: daysPerStage, to: startDate) ?? startDate

            estimates.append(FutureStageEstimate(
                id: stageId,
                stageId: stageId,
                stageName: stageName,
                estimatedStartDate: startDate,
                estimatedEndDate: endDate,
                estimatedDays: daysPerStage
            ))

            currentDate = endDate
        }

        // E10の後に過去問演習フェーズを追加
        addExamPracticePhase(estimates: &estimates, startDate: currentDate)

        futureStages = estimates
    }

    /// 過去問演習フェーズを追加（E10終了後〜入試日）
    private func addExamPracticePhase(estimates: inout [FutureStageEstimate], startDate: Date) {
        guard let roadmap = roadmap,
              let examDate = roadmap.estimatedCompletionDate else {
            return
        }

        // 開始日が入試日より前の場合のみ追加
        guard startDate < examDate else { return }

        let days = Calendar.current.dateComponents([.day], from: startDate, to: examDate).day ?? 0
        guard days > 0 else { return }

        estimates.append(FutureStageEstimate(
            id: "EXAM",
            stageId: "過去問",
            stageName: "過去問演習",
            estimatedStartDate: startDate,
            estimatedEndDate: examDate,
            estimatedDays: days
        ))
    }

    /// 1ステージあたりの平均日数を計算
    private func calculateAvgDaysPerStage() -> Int {
        // 完了したステージから平均を計算
        let completedStages = stages.filter { $0.status == .completed }
        if !completedStages.isEmpty {
            let totalDays = completedStages.reduce(0) { total, stage in
                let days = Calendar.current.dateComponents([.day], from: stage.plannedStartDate, to: stage.plannedEndDate).day ?? 30
                return total + days
            }
            return totalDays / completedStages.count
        }

        // 現在ステージの予定日数を使用
        if let endDate = currentStageEndDate {
            let stageMaterials = materials.filter { $0.stageId == roadmap?.currentStage }
            if let startDate = stageMaterials.map({ $0.plannedStartDate }).min() {
                return Calendar.current.dateComponents([.day], from: startDate, to: endDate).day ?? 30
            }
        }

        // デフォルト: 30日
        return 30
    }

    /// ステージ番号から表示名を取得
    private func stageDisplayName(_ stageNum: Int) -> String {
        switch stageNum {
        case 1: return "E1 基礎"
        case 2: return "E2 基礎発展"
        case 3: return "E3 標準"
        case 4: return "E4 標準発展"
        case 5: return "E5 応用"
        case 6: return "E6 応用発展"
        case 7: return "E7 発展"
        case 8: return "E8 難関"
        case 9: return "E9 最難関"
        case 10: return "E10 東大京大"
        default: return "E\(stageNum)"
        }
    }

    /// 入試日までに間に合うか
    var willMeetDeadline: Bool {
        guard let targetDate = roadmap?.estimatedCompletionDate,
              let lastStage = futureStages.last else {
            return true
        }
        return lastStage.estimatedEndDate <= targetDate
    }

    /// 入試日との差（日数）
    var daysFromDeadline: Int {
        guard let targetDate = roadmap?.estimatedCompletionDate,
              let lastStage = futureStages.last else {
            return 0
        }
        return Calendar.current.dateComponents([.day], from: lastStage.estimatedEndDate, to: targetDate).day ?? 0
    }
}
