import SwiftUI

/// 今週のタスク画面（月曜〜日曜）
struct WeeklyTasksView: View {
    let roadmapId: Int

    @StateObject private var viewModel = WeeklyTasksViewModel()
    @State private var showingPDFExport = false

    var body: some View {
        VStack(spacing: 0) {
            // 週ヘッダー
            weekHeader

            // タスクリスト
            ScrollView {
                VStack(spacing: 16) {
                    ForEach(viewModel.weekDays, id: \.date) { dayTasks in
                        DayTasksCard(
                            dayTasks: dayTasks,
                            onComplete: { task in
                                Task {
                                    await viewModel.completeTask(task)
                                }
                            }
                        )
                    }
                }
                .padding()
            }
        }
        .onAppear {
            viewModel.initialize(roadmapId: roadmapId)
            Task {
                await viewModel.fetchWeeklyTasks()
            }
        }
        .refreshable {
            await viewModel.fetchWeeklyTasks()
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .sheet(isPresented: $showingPDFExport) {
            WeeklyTasksPDFExportSheet(
                weekDays: viewModel.weekDays,
                weekStartDate: viewModel.weekStartDate,
                weekEndDate: viewModel.weekEndDate
            )
        }
    }

    // MARK: - Week Header

    private var weekHeader: some View {
        HStack {
            // 前週ボタン
            Button {
                viewModel.previousWeek()
                Task {
                    await viewModel.fetchWeeklyTasks()
                }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.title3)
                    .foregroundColor(.blue)
            }

            Spacer()

            // 週表示
            VStack(spacing: 2) {
                Text(viewModel.weekRangeText)
                    .font(.headline)

                if viewModel.isCurrentWeek {
                    Text("今週")
                        .font(.caption)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(4)
                }
            }

            Spacer()

            // 次週ボタン
            Button {
                viewModel.nextWeek()
                Task {
                    await viewModel.fetchWeeklyTasks()
                }
            } label: {
                Image(systemName: "chevron.right")
                    .font(.title3)
                    .foregroundColor(.blue)
            }

            // PDF出力ボタン
            Button {
                showingPDFExport = true
            } label: {
                Image(systemName: "doc.text")
                    .font(.title3)
                    .foregroundColor(.blue)
            }
            .padding(.leading, 8)
        }
        .padding()
        .background(Color(.systemGray6))
    }
}

// MARK: - Day Tasks Card

struct DayTasksCard: View {
    let dayTasks: DayTasks
    let onComplete: (RoadmapDailyTask) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // 日付ヘッダー
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(dayTasks.dayOfWeekText)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(dayTasks.dateText)
                        .font(.headline)
                        .foregroundColor(dayTasks.isToday ? .blue : .primary)
                }

                Spacer()

                // 進捗
                if dayTasks.totalCount > 0 {
                    HStack(spacing: 4) {
                        Text("\(dayTasks.completedCount)/\(dayTasks.totalCount)")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        if dayTasks.isCompleted {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                        }
                    }
                }
            }

            if dayTasks.isToday {
                Divider()
                    .background(Color.blue)
            } else {
                Divider()
            }

            // タスクリスト
            if dayTasks.tasks.isEmpty {
                Text("タスクなし")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.vertical, 8)
            } else {
                ForEach(dayTasks.tasks) { task in
                    WeeklyTaskRow(task: task) {
                        onComplete(task)
                    }
                }
            }
        }
        .padding()
        .background(dayTasks.isToday ? Color.blue.opacity(0.05) : Color(.systemGray6))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(dayTasks.isToday ? Color.blue : Color.clear, lineWidth: 2)
        )
    }
}

// MARK: - Weekly Task Row

struct WeeklyTaskRow: View {
    let task: RoadmapDailyTask
    let onComplete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // 完了ボタン
            Button(action: onComplete) {
                Image(systemName: task.status == .completed ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundColor(task.status == .completed ? .green : .gray)
            }
            .disabled(task.status == .completed)

            // タスク情報
            VStack(alignment: .leading, spacing: 2) {
                Text(task.materialName)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .strikethrough(task.status == .completed)
                    .foregroundColor(task.status == .completed ? .secondary : .primary)

                HStack(spacing: 8) {
                    if !task.chapterRangeText.isEmpty {
                        Text(task.chapterRangeText)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Text(task.estimatedTimeText)
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

// MARK: - ViewModel

@MainActor
final class WeeklyTasksViewModel: ObservableObject {

    @Published var weekDays: [DayTasks] = []
    @Published var isLoading = false
    @Published var weekOffset = 0 // 0 = 今週、-1 = 先週、1 = 来週

    private var roadmapId: Int?
    private let roadmapService = RoadmapService.shared

    // 週の開始日（月曜日）
    var weekStartDate: Date {
        let calendar = Calendar(identifier: .gregorian)
        var cal = calendar
        cal.firstWeekday = 2 // 月曜始まり
        let today = Date()
        let weekStart = cal.date(from: cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        return cal.date(byAdding: .day, value: weekOffset * 7, to: weekStart)!
    }

    // 週の終了日（日曜日）
    var weekEndDate: Date {
        Calendar.current.date(byAdding: .day, value: 6, to: weekStartDate)!
    }

    // 今週かどうか
    var isCurrentWeek: Bool {
        weekOffset == 0
    }

    // 週の範囲テキスト
    var weekRangeText: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M/d"
        return "\(formatter.string(from: weekStartDate)) 〜 \(formatter.string(from: weekEndDate))"
    }

    func initialize(roadmapId: Int) {
        self.roadmapId = roadmapId
    }

    func previousWeek() {
        weekOffset -= 1
    }

    func nextWeek() {
        weekOffset += 1
    }

    func fetchWeeklyTasks() async {
        guard let roadmapId = roadmapId else { return }

        isLoading = true

        do {
            let tasks = try await roadmapService.fetchTasks(
                roadmapId: roadmapId,
                from: weekStartDate,
                to: weekEndDate
            )

            // 日付ごとにグループ化
            var dayTasksMap: [Date: [RoadmapDailyTask]] = [:]
            let calendar = Calendar.current

            // 週の各日を初期化
            for i in 0..<7 {
                let date = calendar.date(byAdding: .day, value: i, to: weekStartDate)!
                let startOfDay = calendar.startOfDay(for: date)
                dayTasksMap[startOfDay] = []
            }

            // タスクを日付ごとに振り分け
            for task in tasks {
                let startOfDay = calendar.startOfDay(for: task.taskDate)
                dayTasksMap[startOfDay, default: []].append(task)
            }

            // DayTasksに変換
            weekDays = dayTasksMap
                .sorted { $0.key < $1.key }
                .map { DayTasks(date: $0.key, tasks: $0.value) }

        } catch {
            print("Error fetching weekly tasks: \(error)")
        }

        isLoading = false
    }

    func completeTask(_ task: RoadmapDailyTask) async {
        do {
            try await roadmapService.completeTask(taskId: task.id, actualMinutes: nil, notes: nil)
            await fetchWeeklyTasks()
        } catch {
            print("Error completing task: \(error)")
        }
    }
}

// MARK: - DayTasks Model

struct DayTasks {
    let date: Date
    let tasks: [RoadmapDailyTask]

    var isToday: Bool {
        Calendar.current.isDateInToday(date)
    }

    var isPast: Bool {
        date < Calendar.current.startOfDay(for: Date())
    }

    var totalCount: Int {
        tasks.count
    }

    var completedCount: Int {
        tasks.filter { $0.status == .completed }.count
    }

    var isCompleted: Bool {
        !tasks.isEmpty && completedCount == totalCount
    }

    var dayOfWeekText: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "ja_JP")
        formatter.dateFormat = "E"
        return formatter.string(from: date)
    }

    var dateText: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M/d"
        return formatter.string(from: date)
    }
}

#Preview {
    NavigationStack {
        WeeklyTasksView(roadmapId: 1)
    }
}
