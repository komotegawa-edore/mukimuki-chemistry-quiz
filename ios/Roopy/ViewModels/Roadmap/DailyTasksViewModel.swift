import Foundation
import SwiftUI

/// デイリータスク画面のViewModel
@MainActor
final class DailyTasksViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var todayTasks: [RoadmapDailyTask] = []
    @Published var overdueTasks: [RoadmapDailyTask] = []
    @Published var upcomingTasks: [RoadmapDailyTask] = []
    @Published var completedTodayTasks: [RoadmapDailyTask] = []

    @Published var isLoading = false
    @Published var isCompletingTask = false
    @Published var errorMessage: String?
    @Published var showingTaskDetail: RoadmapDailyTask?
    @Published var showingRescheduleSheet = false

    // MARK: - Private Properties

    private let roadmapService = RoadmapService.shared
    private var roadmapId: Int?

    // MARK: - Computed Properties

    /// 今日の進捗率
    var todayProgress: Double {
        let total = todayTasks.count + completedTodayTasks.count
        guard total > 0 else { return 1.0 }
        return Double(completedTodayTasks.count) / Double(total)
    }

    /// 今日の残りタスク数
    var remainingTaskCount: Int {
        todayTasks.filter { $0.status != .completed }.count
    }

    /// 今日の残り予想時間
    var remainingMinutes: Int {
        todayTasks
            .filter { $0.status != .completed }
            .reduce(0) { $0 + $1.estimatedMinutes }
    }

    /// 残り時間の表示テキスト
    var remainingTimeText: String {
        if remainingMinutes >= 60 {
            let hours = remainingMinutes / 60
            let minutes = remainingMinutes % 60
            return minutes > 0 ? "\(hours)時間\(minutes)分" : "\(hours)時間"
        }
        return "\(remainingMinutes)分"
    }

    /// 遅延タスクがあるか
    var hasOverdueTasks: Bool {
        !overdueTasks.isEmpty
    }

    /// 遅延日数
    var delayDays: Int {
        overdueTasks.count
    }

    /// 今日の日付テキスト
    var todayDateText: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M月d日(E)"
        formatter.locale = Locale(identifier: "ja_JP")
        return formatter.string(from: Date())
    }

    // MARK: - Methods

    /// 初期化
    func initialize(roadmapId: Int) {
        self.roadmapId = roadmapId
    }

    /// タスクを取得
    func fetchTasks() async {
        guard let roadmapId = roadmapId else { return }

        isLoading = true
        errorMessage = nil

        do {
            async let fetchedToday = roadmapService.fetchTodayTasks(roadmapId: roadmapId)
            async let fetchedOverdue = roadmapService.fetchOverdueTasks(roadmapId: roadmapId)

            let today = try await fetchedToday
            let overdue = try await fetchedOverdue

            // 今日のタスクを完了/未完了で分類
            todayTasks = today.filter { $0.status != .completed }
            completedTodayTasks = today.filter { $0.status == .completed }
            overdueTasks = overdue

        } catch {
            errorMessage = "タスクの取得に失敗しました: \(error.localizedDescription)"
        }

        isLoading = false
    }

    /// タスクを完了
    func completeTask(_ task: RoadmapDailyTask, actualMinutes: Int? = nil, notes: String? = nil) async {
        isCompletingTask = true

        do {
            try await roadmapService.completeTask(
                taskId: task.id,
                actualMinutes: actualMinutes,
                notes: notes
            )

            // ローカルの状態を更新
            if let index = todayTasks.firstIndex(where: { $0.id == task.id }) {
                var completedTask = todayTasks.remove(at: index)
                completedTask.status = .completed
                completedTask.completedAt = Date()
                completedTask.actualMinutes = actualMinutes
                completedTodayTasks.append(completedTask)
            }

            // 全体進捗を更新
            if let roadmapId = roadmapId {
                _ = try await roadmapService.calculateAndUpdateProgress(roadmapId: roadmapId)
            }

        } catch {
            errorMessage = "完了処理に失敗しました: \(error.localizedDescription)"
        }

        isCompletingTask = false
    }

    /// タスクをリスケジュール
    func rescheduleTask(_ task: RoadmapDailyTask, to newDate: Date) async {
        do {
            try await roadmapService.rescheduleTask(
                taskId: task.id,
                newDate: newDate,
                originalDate: task.originalDate ?? task.taskDate,
                currentRescheduleCount: task.rescheduleCount
            )

            // ローカルの状態を更新
            await fetchTasks()

        } catch {
            errorMessage = "リスケジュールに失敗しました: \(error.localizedDescription)"
        }
    }

    /// 遅延タスクを一括リスケジュール
    func rescheduleAllOverdueTasks() async {
        guard !overdueTasks.isEmpty else { return }

        isLoading = true

        let generator = RoadmapGeneratorService.shared
        let rescheduled = generator.rescheduleFromDelay(delayedTasks: overdueTasks)

        for (task, newDate) in rescheduled {
            try? await roadmapService.rescheduleTask(
                taskId: task.id,
                newDate: newDate,
                originalDate: task.originalDate ?? task.taskDate,
                currentRescheduleCount: task.rescheduleCount
            )
        }

        await fetchTasks()
        isLoading = false
    }

    /// タスクをスキップ
    func skipTask(_ task: RoadmapDailyTask) async {
        // 明日にリスケジュール
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
        await rescheduleTask(task, to: tomorrow)
    }

    /// 完了タスクを取り消し
    func uncompleteTask(_ task: RoadmapDailyTask) async {
        do {
            try await roadmapService.uncompleteTask(taskId: task.id)

            // ローカルの状態を更新
            if let index = completedTodayTasks.firstIndex(where: { $0.id == task.id }) {
                var uncompletedTask = completedTodayTasks.remove(at: index)
                uncompletedTask.status = .pending
                uncompletedTask.completedAt = nil
                uncompletedTask.actualMinutes = nil
                todayTasks.append(uncompletedTask)
            }

            // 全体進捗を再計算
            if let roadmapId = roadmapId {
                _ = try await roadmapService.calculateAndUpdateProgress(roadmapId: roadmapId)
            }
        } catch {
            errorMessage = "取り消しに失敗しました: \(error.localizedDescription)"
        }
    }
}

// MARK: - タスクグループ化

extension DailyTasksViewModel {
    /// 教材別にグループ化したタスク
    var tasksByMaterial: [(materialName: String, tasks: [RoadmapDailyTask])] {
        let allTasks = todayTasks + overdueTasks
        let grouped = Dictionary(grouping: allTasks) { $0.materialName }
        return grouped.map { (materialName: $0.key, tasks: $0.value) }
            .sorted { $0.materialName < $1.materialName }
    }
}
