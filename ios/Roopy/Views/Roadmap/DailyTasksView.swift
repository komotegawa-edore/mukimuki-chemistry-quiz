import SwiftUI

/// デイリータスク画面
struct DailyTasksView: View {

    @StateObject private var viewModel = DailyTasksViewModel()
    let roadmapId: Int

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // 今日のサマリー
                todaySummaryCard

                // 遅延タスク
                if viewModel.hasOverdueTasks {
                    overdueSection
                }

                // 今日のタスク
                todayTasksSection

                // 完了済みタスク
                if !viewModel.completedTodayTasks.isEmpty {
                    completedSection
                }
            }
            .padding()
        }
        .navigationTitle("今日のタスク")
        .navigationBarTitleDisplayMode(.large)
        .refreshable {
            await viewModel.fetchTasks()
        }
        .onAppear {
            viewModel.initialize(roadmapId: roadmapId)
            Task {
                await viewModel.fetchTasks()
            }
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .sheet(item: $viewModel.showingTaskDetail) { task in
            TaskDetailSheet(task: task, viewModel: viewModel)
        }
    }

    // MARK: - Sections

    private var todaySummaryCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(viewModel.todayDateText)
                        .font(.title2)
                        .fontWeight(.bold)

                    Text(viewModel.remainingTaskCount == 0 ? "全て完了!" : "残り \(viewModel.remainingTaskCount) タスク")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // 進捗リング
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 8)

                    Circle()
                        .trim(from: 0, to: viewModel.todayProgress)
                        .stroke(Color.blue, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                        .rotationEffect(.degrees(-90))

                    Text("\(Int(viewModel.todayProgress * 100))%")
                        .font(.caption)
                        .fontWeight(.bold)
                }
                .frame(width: 60, height: 60)
            }

            if viewModel.remainingMinutes > 0 {
                HStack {
                    Image(systemName: "clock")
                        .foregroundColor(.blue)
                    Text("残り約 \(viewModel.remainingTimeText)")
                        .font(.subheadline)
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }

    private var overdueSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("遅延タスク", systemImage: "exclamationmark.triangle.fill")
                    .font(.headline)
                    .foregroundColor(.orange)

                Spacer()

                Button("一括リスケ") {
                    Task {
                        await viewModel.rescheduleAllOverdueTasks()
                    }
                }
                .font(.caption)
                .foregroundColor(.orange)
            }

            ForEach(viewModel.overdueTasks) { task in
                TaskRow(task: task, isOverdue: true) {
                    viewModel.showingTaskDetail = task
                } onComplete: {
                    Task {
                        await viewModel.completeTask(task)
                    }
                }
            }
        }
        .padding()
        .background(Color.orange.opacity(0.1))
        .cornerRadius(12)
    }

    private var todayTasksSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("今日のタスク", systemImage: "list.bullet.circle.fill")
                .font(.headline)

            if viewModel.todayTasks.isEmpty && viewModel.completedTodayTasks.isEmpty {
                EmptyTaskView()
            } else {
                ForEach(viewModel.todayTasks) { task in
                    TaskRow(task: task, isOverdue: false) {
                        viewModel.showingTaskDetail = task
                    } onComplete: {
                        Task {
                            await viewModel.completeTask(task)
                        }
                    }
                }
            }
        }
    }

    private var completedSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("完了済み", systemImage: "checkmark.circle.fill")
                .font(.headline)
                .foregroundColor(.green)

            ForEach(viewModel.completedTodayTasks) { task in
                CompletedTaskRow(task: task) {
                    Task {
                        await viewModel.uncompleteTask(task)
                    }
                }
            }
        }
    }
}

// MARK: - Sub Components

struct TaskRow: View {
    let task: RoadmapDailyTask
    let isOverdue: Bool
    let onTap: () -> Void
    let onComplete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // 完了ボタン
            Button(action: onComplete) {
                Image(systemName: "circle")
                    .font(.title2)
                    .foregroundColor(isOverdue ? .orange : .blue)
            }

            // タスク情報
            VStack(alignment: .leading, spacing: 4) {
                Text(task.materialName)
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack(spacing: 8) {
                    if !task.chapterRangeText.isEmpty {
                        Text(task.chapterRangeText)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Text(task.estimatedTimeText)
                        .font(.caption)
                        .foregroundColor(.blue)

                    if task.wasRescheduled {
                        Label("再調整", systemImage: "arrow.2.squarepath")
                            .font(.caption2)
                            .foregroundColor(.orange)
                    }
                }
            }

            Spacer()

            // 詳細ボタン
            Button(action: onTap) {
                Image(systemName: "chevron.right")
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct CompletedTaskRow: View {
    let task: RoadmapDailyTask
    var onUncomplete: (() -> Void)? = nil

    var body: some View {
        HStack(spacing: 12) {
            Button {
                onUncomplete?()
            } label: {
                Image(systemName: "checkmark.circle.fill")
                    .font(.title2)
                    .foregroundColor(.green)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 4) {
                Text(task.materialName)
                    .font(.subheadline)
                    .strikethrough()
                    .foregroundColor(.secondary)

                if let actualMinutes = task.actualMinutes {
                    Text("実績: \(actualMinutes)分")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            if onUncomplete != nil {
                Text("タップで取消")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(12)
    }
}

struct EmptyTaskView: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 48))
                .foregroundColor(.green)

            Text("今日のタスクはありません")
                .font(.headline)

            Text("明日に備えて休憩しましょう")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
    }
}

struct TaskDetailSheet: View {
    let task: RoadmapDailyTask
    @ObservedObject var viewModel: DailyTasksViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var actualMinutes: String = ""
    @State private var notes: String = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("タスク情報") {
                    LabeledContent("教材", value: task.materialName)
                    if !task.chapterRangeText.isEmpty {
                        LabeledContent("範囲", value: task.chapterRangeText)
                    }
                    LabeledContent("予想時間", value: task.estimatedTimeText)
                }

                Section("完了記録") {
                    TextField("実際の学習時間（分）", text: $actualMinutes)
                        .keyboardType(.numberPad)

                    TextField("メモ（任意）", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section {
                    Button {
                        Task {
                            await viewModel.completeTask(
                                task,
                                actualMinutes: Int(actualMinutes),
                                notes: notes.isEmpty ? nil : notes
                            )
                            dismiss()
                        }
                    } label: {
                        HStack {
                            Spacer()
                            Label("完了", systemImage: "checkmark.circle.fill")
                            Spacer()
                        }
                    }
                    .disabled(viewModel.isCompletingTask)

                    Button(role: .destructive) {
                        Task {
                            await viewModel.skipTask(task)
                            dismiss()
                        }
                    } label: {
                        HStack {
                            Spacer()
                            Label("明日に延期", systemImage: "arrow.forward.circle")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("タスク詳細")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("閉じる") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }
}

#Preview {
    NavigationStack {
        DailyTasksView(roadmapId: 1)
    }
}
