import SwiftUI

/// ロードマップタブのルートビュー
struct RoadmapTabView: View {

    @EnvironmentObject var authService: AuthService
    @StateObject private var viewModel = RoadmapProgressViewModel()
    @State private var showingCreateRoadmap = false
    @State private var selectedView: RoadmapViewType = .overview
    @State private var showingCancelConfirmation = false
    @State private var showingPDFExport = false
    @State private var showingNextStageSelection = false
    @State private var showingMaterialManagement = false

    enum RoadmapViewType: String, CaseIterable {
        case overview = "概要"
        case gantt = "ガントチャート"
        case tasks = "タスク"
    }

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    loadingView
                } else if let roadmap = viewModel.roadmap {
                    // ロードマップがある場合
                    roadmapMainView(roadmap: roadmap)
                } else {
                    // ロードマップがない場合
                    noRoadmapView
                }
            }
            .navigationTitle("学習ロードマップ")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                if viewModel.roadmap != nil {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Menu {
                            if viewModel.roadmap?.status == .active {
                                Button {
                                    Task {
                                        await viewModel.pauseRoadmap()
                                    }
                                } label: {
                                    Label("一時停止", systemImage: "pause.circle")
                                }
                            } else if viewModel.roadmap?.status == .paused {
                                Button {
                                    Task {
                                        await viewModel.resumeRoadmap()
                                    }
                                } label: {
                                    Label("再開", systemImage: "play.circle")
                                }
                            }

                            Divider()

                            Button(role: .destructive) {
                                showingCancelConfirmation = true
                            } label: {
                                Label("カリキュラムを作り直す", systemImage: "arrow.counterclockwise")
                            }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                }
            }
            .alert("カリキュラムを作り直しますか？", isPresented: $showingCancelConfirmation) {
                Button("キャンセル", role: .cancel) { }
                Button("作り直す", role: .destructive) {
                    Task {
                        await viewModel.cancelRoadmap()
                        showingCreateRoadmap = true
                    }
                }
            } message: {
                Text("現在のカリキュラムは削除されます。\n\n進捗データはリセットされ、元に戻すことはできません。本当によろしいですか？")
            }
            .refreshable {
                if let userId = authService.currentUserId {
                    await viewModel.fetchData(userId: userId)
                }
            }
            .sheet(isPresented: $showingCreateRoadmap) {
                RoadmapInputView()
            }
            .sheet(isPresented: $showingPDFExport) {
                if let roadmap = viewModel.roadmap {
                    PDFExportSheet(
                        stages: viewModel.stages,
                        materials: viewModel.materials,
                        startDate: roadmap.createdAt ?? Date(),
                        endDate: calculateGanttEndDate(roadmap: roadmap),
                        roadmapTitle: "英語学習ロードマップ"
                    )
                }
            }
            .sheet(isPresented: $showingNextStageSelection) {
                if let roadmap = viewModel.roadmap,
                   let nextStage = viewModel.nextStageId {
                    NextStageSelectionSheet(
                        roadmap: roadmap,
                        nextStageId: nextStage,
                        onComplete: {
                            // データをリロード
                            if let userId = authService.currentUserId {
                                Task {
                                    await viewModel.fetchData(userId: userId)
                                }
                            }
                        }
                    )
                }
            }
            .onChange(of: showingCreateRoadmap) { _, isPresented in
                if !isPresented {
                    // シートを閉じたらリロード
                    if let userId = authService.currentUserId {
                        Task {
                            await viewModel.fetchData(userId: userId)
                        }
                    }
                }
            }
            .sheet(isPresented: $showingMaterialManagement) {
                if let roadmap = viewModel.roadmap {
                    MaterialManagementView(
                        roadmapId: roadmap.id,
                        currentStage: roadmap.currentStage ?? roadmap.startStage
                    )
                }
            }
            .onChange(of: showingMaterialManagement) { _, isPresented in
                if !isPresented {
                    // 教材管理シートを閉じたらリロード
                    if let userId = authService.currentUserId {
                        Task {
                            await viewModel.fetchData(userId: userId)
                        }
                    }
                }
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

    // MARK: - Main View with Segments

    private func roadmapMainView(roadmap: UserRoadmap) -> some View {
        VStack(spacing: 0) {
            // セグメントピッカー
            Picker("表示", selection: $selectedView) {
                ForEach(RoadmapViewType.allCases, id: \.self) { type in
                    Text(type.rawValue).tag(type)
                }
            }
            .pickerStyle(.segmented)
            .padding()

            // コンテンツ
            switch selectedView {
            case .overview:
                overviewContent(roadmap: roadmap)
            case .gantt:
                ganttChartContent(roadmap: roadmap)
            case .tasks:
                tasksContent(roadmap: roadmap)
            }
        }
    }

    // MARK: - Overview Content

    private func overviewContent(roadmap: UserRoadmap) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                // 今日のタスクサマリー
                if let summary = viewModel.summary {
                    TodayTaskSummaryCard(summary: summary, roadmapId: roadmap.id)
                }

                // 全体進捗（現在ステージの教材完了率ベース）
                OverallProgressCard(
                    progress: viewModel.overallProgress,
                    currentStage: roadmap.currentStage ?? roadmap.startStage,
                    targetStage: roadmap.targetStage,
                    daysRemaining: viewModel.daysRemaining,
                    status: roadmap.status,
                    completedCount: viewModel.currentStageCompletedCount,
                    totalCount: viewModel.currentStageTotalCount,
                    isStageCompleted: viewModel.isCurrentStageCompleted,
                    hasNextStage: viewModel.hasNextStage,
                    stageEndDateText: viewModel.currentStageEndDateText,
                    daysUntilStageEnd: viewModel.daysUntilStageEnd,
                    onNextStage: {
                        showingNextStageSelection = true
                    }
                )

                // 教材管理カード
                MaterialManagementCard {
                    showingMaterialManagement = true
                }
            }
            .padding()
        }
    }

    // MARK: - Gantt Chart Content

    /// ガントチャートの終了日を計算（教材の最大終了日、将来ステージの終了日、ロードマップの推定完了日の大きい方）
    private func calculateGanttEndDate(roadmap: UserRoadmap) -> Date {
        // 教材の最大終了日
        let maxMaterialEndDate = viewModel.materials.map { $0.plannedEndDate }.max()

        // 将来ステージの最大終了日
        let maxFutureStageEndDate = viewModel.futureStages.map { $0.estimatedEndDate }.max()

        // ロードマップの推定完了日
        let estimatedEnd = roadmap.estimatedCompletionDate

        // デフォルト（3ヶ月後）
        let defaultEnd = Calendar.current.date(byAdding: .month, value: 3, to: Date())!

        // 最も遅い日付を採用
        var endDate = defaultEnd
        if let materialEnd = maxMaterialEndDate {
            endDate = max(endDate, materialEnd)
        }
        if let futureEnd = maxFutureStageEndDate {
            endDate = max(endDate, futureEnd)
        }
        if let estimated = estimatedEnd {
            endDate = max(endDate, estimated)
        }

        // 少し余裕を持たせる（1週間後）
        return Calendar.current.date(byAdding: .day, value: 7, to: endDate) ?? endDate
    }

    private func ganttChartContent(roadmap: UserRoadmap) -> some View {
        VStack(spacing: 0) {
            // 凡例
            ganttLegend

            // ガントチャート
            if !viewModel.stages.isEmpty {
                GanttChartView(
                    stages: viewModel.stages,
                    materials: viewModel.materials,
                    futureStages: viewModel.futureStages,
                    startDate: roadmap.createdAt ?? Date(),
                    endDate: calculateGanttEndDate(roadmap: roadmap),
                    examDate: roadmap.estimatedCompletionDate
                )
            } else {
                VStack(spacing: 16) {
                    ProgressView()
                    Text("データを読み込み中...")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
    }

    private var ganttLegend: some View {
        HStack {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    LegendItem(color: .green, label: "完了")
                    LegendItem(color: .blue, label: "進行中")
                    LegendItem(color: .gray, label: "未着手")
                    LegendItem(color: .red.opacity(0.6), label: "今日")
                    if !viewModel.futureStages.isEmpty {
                        LegendItem(color: .orange.opacity(0.7), label: "将来予測")
                        LegendItem(color: .purple, label: "入試日")
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
            }

            Spacer()

            // PDF出力ボタン
            Button {
                showingPDFExport = true
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "doc.text")
                    Text("PDF")
                }
                .font(.caption)
                .foregroundColor(.blue)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
            }
            .padding(.trailing)
        }
        .background(Color(.systemGray6))
    }

    // MARK: - Tasks Content

    private func tasksContent(roadmap: UserRoadmap) -> some View {
        WeeklyTasksView(roadmapId: roadmap.id)
    }

    // MARK: - Views

    private var loadingView: some View {
        VStack {
            ProgressView()
            Text("読み込み中...")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var noRoadmapView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "map.fill")
                .font(.system(size: 80))
                .foregroundColor(.roopyPrimary.opacity(0.6))

            VStack(spacing: 8) {
                Text("ロードマップを作成しよう")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("あなたの目標に合わせた\n最適な学習プランを自動生成します")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            Button {
                showingCreateRoadmap = true
            } label: {
                HStack {
                    Image(systemName: "sparkles")
                    Text("ロードマップを作成")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.roopyPrimary)
                .cornerRadius(12)
            }
            .padding(.horizontal, 32)

            Spacer()

            // 機能説明
            VStack(alignment: .leading, spacing: 12) {
                FeatureRow(icon: "target", title: "志望校レベルに最適化", description: "目標に応じた教材を自動選定")
                FeatureRow(icon: "calendar", title: "試験日から逆算", description: "無理のないスケジュールを作成")
                FeatureRow(icon: "chart.bar.fill", title: "進捗を可視化", description: "日々の学習を見える化")
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
            .padding(.horizontal)

            Spacer()
        }
        .padding()
    }
}

// MARK: - Sub Components

struct LegendItem: View {
    let color: Color
    let label: String

    var body: some View {
        HStack(spacing: 4) {
            RoundedRectangle(cornerRadius: 2)
                .fill(color)
                .frame(width: 16, height: 12)
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.roopyPrimary)
                .frame(width: 40)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct TodayTaskSummaryCard: View {
    let summary: RoadmapSummary
    let roadmapId: Int

    var body: some View {
        NavigationLink(destination: DailyTasksView(roadmapId: roadmapId)) {
            VStack(spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("今日のタスク")
                            .font(.headline)

                        if summary.todayTaskCount == 0 {
                            Text("タスクなし")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        } else {
                            Text("\(summary.todayCompletedCount) / \(summary.todayTaskCount) 完了")
                                .font(.subheadline)
                                .foregroundColor(summary.todayProgress >= 1 ? .green : .orange)
                        }
                    }

                    Spacer()

                    // 進捗リング
                    ZStack {
                        Circle()
                            .stroke(Color.gray.opacity(0.2), lineWidth: 6)

                        Circle()
                            .trim(from: 0, to: summary.todayProgress)
                            .stroke(summary.todayProgress >= 1 ? Color.green : Color.orange, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                            .rotationEffect(.degrees(-90))

                        if summary.todayProgress >= 1 {
                            Image(systemName: "checkmark")
                                .foregroundColor(.green)
                        } else {
                            Text("\(Int(summary.todayProgress * 100))%")
                                .font(.caption2)
                                .fontWeight(.bold)
                        }
                    }
                    .frame(width: 50, height: 50)

                    Image(systemName: "chevron.right")
                        .foregroundColor(.gray)
                }

                if !summary.isOnSchedule {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange)
                        Text("\(summary.delayDays) 件の遅延タスクがあります")
                            .font(.caption)
                            .foregroundColor(.orange)
                        Spacer()
                    }
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }
}

struct OverallProgressCard: View {
    let progress: Double
    let currentStage: String
    let targetStage: String
    let daysRemaining: Int
    let status: RoadmapStatus
    let completedCount: Int
    let totalCount: Int
    let isStageCompleted: Bool
    let hasNextStage: Bool
    let stageEndDateText: String
    let daysUntilStageEnd: Int
    var onNextStage: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(currentStage) 進捗")
                        .font(.headline)
                    Text("\(completedCount) / \(totalCount) 教材完了")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                Text(String(format: "%.0f%%", progress * 100))
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(isStageCompleted ? .green : .roopyPrimary)
            }

            // プログレスバー
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.gray.opacity(0.2))

                    RoundedRectangle(cornerRadius: 8)
                        .fill(
                            LinearGradient(
                                colors: isStageCompleted
                                    ? [.green, .green.opacity(0.7)]
                                    : [.roopyPrimary, .roopyPrimary.opacity(0.7)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geo.size.width * min(progress, 1.0))
                }
            }
            .frame(height: 12)

            // ステージ完了時のメッセージ
            if isStageCompleted {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("\(currentStage) 完了!")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.green)
                    Spacer()
                }
            }

            HStack {
                VStack(alignment: .leading) {
                    Text("現在")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(currentStage)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }

                Spacer()

                // ステージ終了予定日
                VStack {
                    Text("終了予定")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(stageEndDateText)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.orange)
                    if !isStageCompleted && daysUntilStageEnd > 0 {
                        Text("あと\(daysUntilStageEnd)日")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                VStack(alignment: .trailing) {
                    Text("目標")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(targetStage)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.roopyPrimary)
                }
            }

            Divider()

            HStack {
                Image(systemName: "calendar")
                    .foregroundColor(.gray)
                Text("全体 残り \(daysRemaining) 日")
                    .font(.subheadline)

                Spacer()

                HStack(spacing: 4) {
                    Circle()
                        .fill(statusColor)
                        .frame(width: 8, height: 8)
                    Text(statusText)
                        .font(.caption)
                        .foregroundColor(statusColor)
                }
            }

            // 次のステージへボタン
            if hasNextStage {
                Button {
                    onNextStage?()
                } label: {
                    HStack {
                        Image(systemName: isStageCompleted ? "arrow.right.circle.fill" : "lock.fill")
                        Text(isStageCompleted ? "次のステージへ進む" : "全ての教材を完了すると次へ進めます")
                    }
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(isStageCompleted ? .white : .gray)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(isStageCompleted ? Color.roopyPrimary : Color.gray.opacity(0.3))
                    .cornerRadius(10)
                }
                .disabled(!isStageCompleted)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var statusColor: Color {
        switch status {
        case .active: return .green
        case .paused: return .yellow
        case .completed: return .blue
        case .cancelled, .abandoned: return .red
        }
    }

    private var statusText: String {
        switch status {
        case .active: return "進行中"
        case .paused: return "一時停止"
        case .completed: return "完了"
        case .cancelled: return "キャンセル"
        case .abandoned: return "中断"
        }
    }
}

struct StageListCard: View {
    let stages: [RoadmapStage]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("ステージ進捗")
                .font(.headline)

            ForEach(stages) { stage in
                HStack {
                    Text(stage.stageId)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .frame(width: 40, alignment: .leading)

                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.gray.opacity(0.2))

                            RoundedRectangle(cornerRadius: 4)
                                .fill(stageColor(stage.status))
                                .frame(width: geo.size.width * stageProgress(stage))
                        }
                    }
                    .frame(height: 8)

                    Image(systemName: stageIcon(stage.status))
                        .foregroundColor(stageColor(stage.status))
                        .frame(width: 20)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private func stageProgress(_ stage: RoadmapStage) -> Double {
        switch stage.status {
        case .completed: return 1.0
        case .inProgress:
            let total = Calendar.current.dateComponents([.day], from: stage.plannedStartDate, to: stage.plannedEndDate).day ?? 1
            let elapsed = Calendar.current.dateComponents([.day], from: stage.actualStartDate ?? stage.plannedStartDate, to: Date()).day ?? 0
            return min(1.0, max(0, Double(elapsed) / Double(total)))
        case .pending, .skipped: return 0
        }
    }

    private func stageColor(_ status: TaskStatus) -> Color {
        switch status {
        case .completed: return .green
        case .inProgress: return .blue
        case .pending: return .gray
        case .skipped: return .orange
        }
    }

    private func stageIcon(_ status: TaskStatus) -> String {
        switch status {
        case .completed: return "checkmark.circle.fill"
        case .inProgress: return "circle.lefthalf.filled"
        case .pending: return "circle"
        case .skipped: return "forward.circle"
        }
    }
}

struct AchievementsCard: View {
    let achievements: [RoadmapAchievement]

    var unlockedAchievements: [RoadmapAchievement] {
        achievements.filter { $0.isUnlocked }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("獲得バッジ")
                    .font(.headline)
                Spacer()
                Text("\(unlockedAchievements.count) / \(achievements.count)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(unlockedAchievements) { achievement in
                        VStack(spacing: 4) {
                            ZStack {
                                Circle()
                                    .fill(Color.yellow.opacity(0.2))
                                    .frame(width: 50, height: 50)

                                Image(systemName: achievement.icon)
                                    .font(.title2)
                                    .foregroundColor(.yellow)
                            }

                            Text(achievement.name)
                                .font(.caption2)
                                .lineLimit(1)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

/// 教材管理カード
struct MaterialManagementCard: View {
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                // アイコン
                ZStack {
                    Circle()
                        .fill(Color.orange.opacity(0.15))
                        .frame(width: 50, height: 50)

                    Image(systemName: "slider.horizontal.3")
                        .font(.title2)
                        .foregroundColor(.orange)
                }

                // テキスト
                VStack(alignment: .leading, spacing: 4) {
                    Text("教材の管理")
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text("教材の変更・削除ができます")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    RoadmapTabView()
        .environmentObject(AuthService.shared)
}
