import SwiftUI
import Charts

/// ロードマップ進捗画面
struct RoadmapProgressView: View {

    @StateObject private var viewModel = RoadmapProgressViewModel()
    @EnvironmentObject var authService: AuthService

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let _ = viewModel.roadmap {
                    // 全体進捗
                    overallProgressCard

                    // ステータス
                    statusCard

                    // ステージ進捗
                    stageProgressSection

                    // 学習時間グラフ
                    studyTimeChartSection

                    // バッジ
                    achievementsSection

                    // アクションボタン
                    actionButtons
                } else if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, minHeight: 200)
                } else {
                    noRoadmapView
                }
            }
            .padding()
        }
        .navigationTitle("学習進捗")
        .refreshable {
            if let userId = authService.currentUserId {
                await viewModel.refresh(userId: userId)
            }
        }
        .onAppear {
            if let userId = authService.currentUserId {
                Task {
                    await viewModel.fetchData(userId: userId)
                }
            }
        }
    }

    // MARK: - Sections

    private var overallProgressCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("全体進捗")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    Text(viewModel.progressText)
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.blue)
                }

                Spacer()

                // 円形プログレス
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 12)

                    Circle()
                        .trim(from: 0, to: viewModel.overallProgress)
                        .stroke(
                            LinearGradient(
                                colors: [.blue, .purple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            style: StrokeStyle(lineWidth: 12, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))

                    VStack {
                        Text(viewModel.currentStage)
                            .font(.headline)
                        Image(systemName: "arrow.down")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(viewModel.targetStage)
                            .font(.headline)
                            .foregroundColor(.blue)
                    }
                }
                .frame(width: 100, height: 100)
            }

            Divider()

            HStack(spacing: 24) {
                StatItem(title: "経過日数", value: "\(viewModel.daysElapsed)日")
                StatItem(title: "残り日数", value: "\(viewModel.daysRemaining)日")
                StatItem(title: "週間学習", value: viewModel.weeklyStudyTimeText)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }

    private var statusCard: some View {
        HStack {
            Image(systemName: viewModel.isOnSchedule ? "checkmark.shield.fill" : "exclamationmark.shield.fill")
                .font(.title2)
                .foregroundColor(viewModel.statusColor)

            VStack(alignment: .leading, spacing: 2) {
                Text("ステータス")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(viewModel.statusText)
                    .font(.headline)
                    .foregroundColor(viewModel.statusColor)
            }

            Spacer()

            if !viewModel.isOnSchedule {
                NavigationLink(destination: DailyTasksView(roadmapId: viewModel.roadmap?.id ?? 0)) {
                    Text("タスク確認")
                        .font(.subheadline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.orange)
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(viewModel.statusColor.opacity(0.1))
        .cornerRadius(12)
    }

    private var stageProgressSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("ステージ進捗", systemImage: "chart.bar.fill")
                .font(.headline)

            ForEach(viewModel.stageProgressList) { info in
                StageProgressRow(info: info)
            }
        }
    }

    private var studyTimeChartSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("学習時間（過去2週間）", systemImage: "chart.line.uptrend.xyaxis")
                .font(.headline)

            if #available(iOS 16.0, *) {
                Chart(viewModel.studyTimeData) { data in
                    BarMark(
                        x: .value("日付", data.date, unit: .day),
                        y: .value("分", data.minutes)
                    )
                    .foregroundStyle(Color.blue.gradient)
                }
                .frame(height: 150)
                .chartXAxis {
                    AxisMarks(values: .stride(by: .day, count: 3)) { value in
                        if let date = value.as(Date.self) {
                            AxisValueLabel {
                                Text(formatChartDate(date))
                            }
                        }
                    }
                }
            } else {
                // iOS 16未満のフォールバック
                SimpleBarChart(data: viewModel.studyTimeData)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var achievementsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("バッジ", systemImage: "trophy.fill")
                .font(.headline)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(viewModel.achievements) { achievement in
                    AchievementBadge(achievement: achievement)
                }
            }
        }
    }

    private var actionButtons: some View {
        HStack(spacing: 12) {
            if viewModel.roadmap?.status == .active {
                Button {
                    Task {
                        await viewModel.pauseRoadmap()
                    }
                } label: {
                    Label("一時停止", systemImage: "pause.circle.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            } else if viewModel.roadmap?.status == .paused {
                Button {
                    Task {
                        await viewModel.resumeRoadmap()
                    }
                } label: {
                    Label("再開", systemImage: "play.circle.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
            }
        }
    }

    private var noRoadmapView: some View {
        VStack(spacing: 16) {
            Image(systemName: "map")
                .font(.system(size: 64))
                .foregroundColor(.gray)

            Text("ロードマップがありません")
                .font(.headline)

            Text("新しいロードマップを作成して\n学習を始めましょう")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
    }

    // MARK: - Helper

    private func formatChartDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M/d"
        return formatter.string(from: date)
    }
}

// MARK: - Sub Components

struct StatItem: View {
    let title: String
    let value: String

    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity)
    }
}

struct StageProgressRow: View {
    let info: StageProgressInfo

    var body: some View {
        HStack(spacing: 12) {
            Text(info.stageId)
                .font(.subheadline)
                .fontWeight(.medium)
                .frame(width: 40)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.2))

                    RoundedRectangle(cornerRadius: 4)
                        .fill(progressColor(info.status))
                        .frame(width: geo.size.width * info.progress)
                }
            }
            .frame(height: 8)

            Image(systemName: statusIcon(info.status))
                .foregroundColor(progressColor(info.status))
                .frame(width: 20)
        }
        .padding(.vertical, 4)
    }

    private func progressColor(_ status: TaskStatus) -> Color {
        switch status {
        case .completed: return .green
        case .inProgress: return .blue
        case .pending: return .gray
        case .skipped: return .orange
        }
    }

    private func statusIcon(_ status: TaskStatus) -> String {
        switch status {
        case .completed: return "checkmark.circle.fill"
        case .inProgress: return "circle.lefthalf.filled"
        case .pending: return "circle"
        case .skipped: return "forward.circle"
        }
    }
}

struct AchievementBadge: View {
    let achievement: RoadmapAchievement

    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(achievement.isUnlocked ? Color.yellow.opacity(0.2) : Color.gray.opacity(0.1))
                    .frame(width: 50, height: 50)

                Image(systemName: achievement.icon)
                    .font(.title2)
                    .foregroundColor(achievement.isUnlocked ? .yellow : .gray)
            }

            Text(achievement.name)
                .font(.caption2)
                .lineLimit(1)
                .foregroundColor(achievement.isUnlocked ? .primary : .secondary)
        }
    }
}

struct SimpleBarChart: View {
    let data: [StudyTimeDataPoint]

    var maxMinutes: Int {
        data.map { $0.minutes }.max() ?? 120
    }

    var body: some View {
        HStack(alignment: .bottom, spacing: 4) {
            ForEach(data) { point in
                VStack {
                    Spacer()
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.blue)
                        .frame(height: CGFloat(point.minutes) / CGFloat(maxMinutes) * 100)
                }
            }
        }
        .frame(height: 120)
    }
}

#Preview {
    NavigationStack {
        RoadmapProgressView()
            .environmentObject(AuthService.shared)
    }
}
