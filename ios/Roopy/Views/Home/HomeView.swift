import SwiftUI

/// ホーム画面
struct HomeView: View {
    @EnvironmentObject var authService: AuthService
    @StateObject private var viewModel = HomeViewModel()
    @State private var showingReview = false
    @State private var showingRoadmapInput = false
    @State private var showingTaskCompletion: RoadmapDailyTask?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Roopy挨拶カード
                    WelcomeCard()

                    // 次のタスク（ロードマップがある場合）
                    if !viewModel.nextTasks.isEmpty {
                        NextTasksCard(
                            nextTasks: viewModel.nextTasks,
                            dateText: viewModel.nextTaskDateText,
                            totalMinutes: viewModel.nextTasksMinutes,
                            onTaskTap: { task in
                                showingTaskCompletion = task
                            },
                            onUncomplete: { task in
                                Task {
                                    await viewModel.uncompleteTask(task)
                                }
                            }
                        )
                    } else if viewModel.activeRoadmap == nil {
                        // ロードマップカード（ホームから導線）
                        RoadmapShortcutCard(onTap: { showingRoadmapInput = true })
                    }

                    // 現在取り組み中の参考書
                    if !viewModel.currentMaterials.isEmpty {
                        CurrentMaterialsCard(
                            materials: viewModel.currentMaterials,
                            progressForMaterial: viewModel.progressForMaterial,
                            daysRemainingForMaterial: viewModel.daysRemainingForMaterial
                        )
                    }

                    // お知らせ（あれば表示）
                    if !viewModel.announcements.isEmpty {
                        AnnouncementsSection(announcements: viewModel.announcements)
                    }

                    // 復習ボタン
                    ReviewCard(onTap: { showingReview = true })

                    // デイリーミッション
                    if let mission = viewModel.dailyMission {
                        DailyMissionCard(mission: mission)
                    }

                    // ポイント表示
                    PointsCard(points: viewModel.totalPoints)

                    // 連続ログイン
                    StreakCard(
                        currentStreak: authService.profile?.currentStreak ?? 0,
                        longestStreak: authService.profile?.longestStreak ?? 0
                    )

                    // バッジ表示
                    if !viewModel.badges.isEmpty {
                        BadgeSection(badges: viewModel.badges)
                    }
                }
                .padding()
            }
            .background(Color.roopyBackgroundLight)
            .navigationTitle("Roopy")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    NavigationLink(destination: HistoryView()) {
                        Text("履歴")
                            .foregroundColor(.roopyPrimary)
                            .fontWeight(.medium)
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .sheet(isPresented: $showingReview) {
                ReviewView()
            }
            .sheet(isPresented: $showingRoadmapInput) {
                RoadmapInputView()
            }
            .sheet(item: $showingTaskCompletion) { task in
                TaskCompletionSheet(
                    task: task,
                    onComplete: { actualMinutes, notes in
                        Task {
                            await viewModel.completeTask(task, actualMinutes: actualMinutes, notes: notes)
                        }
                    },
                    onPartialComplete: { completedChapter, actualMinutes, notes in
                        Task {
                            await viewModel.partialCompleteTask(task, completedChapter: completedChapter, actualMinutes: actualMinutes, notes: notes)
                        }
                    }
                )
            }
        }
        .task {
            await viewModel.loadData()
        }
    }
}

/// ロードマップショートカットカード
struct RoadmapShortcutCard: View {
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                Image(systemName: "map.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.blue)

                VStack(alignment: .leading, spacing: 4) {
                    Text("学習ロードマップ")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.roopyText)

                    Text("目標に合わせた学習計画を作成")
                        .font(.caption)
                        .foregroundColor(.roopyText.opacity(0.7))
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.blue)
            }
            .padding()
            .background(
                LinearGradient(
                    colors: [Color.blue.opacity(0.1), Color.blue.opacity(0.05)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.blue.opacity(0.3), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

/// 復習カード
struct ReviewCard: View {
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                Image(systemName: "arrow.triangle.2.circlepath.circle.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.roopyPrimary)

                VStack(alignment: .leading, spacing: 4) {
                    Text("復習モード")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.roopyText)

                    Text("間違えた問題を復習しよう")
                        .font(.caption)
                        .foregroundColor(.roopyText.opacity(0.7))
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.roopyPrimary)
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

/// Roopy挨拶カード
struct WelcomeCard: View {
    var body: some View {
        HStack(spacing: 16) {
            // Roopyイメージ（アセットに追加が必要）
            Image("Roopy")
                .resizable()
                .scaledToFit()
                .frame(width: 80, height: 80)
                .background(Color.roopyBackground)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text("ようこそ、受験の森へ！")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.roopyText)

                Text("今日も一緒に頑張りましょう 🌱")
                    .font(.subheadline)
                    .foregroundColor(.roopyText.opacity(0.8))
            }

            Spacer()
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.roopyBackground, .white],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
}

/// ポイント表示カード
struct PointsCard: View {
    let points: Int

    var body: some View {
        HStack {
            Image(systemName: "star.circle.fill")
                .font(.title)
                .foregroundColor(.roopyGold)

            VStack(alignment: .leading) {
                Text("獲得ポイント")
                    .font(.caption)
                    .foregroundColor(.roopyText.opacity(0.7))
                Text("\(points) pt")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.roopyText)
            }

            Spacer()
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

/// 連続ログインカード
struct StreakCard: View {
    let currentStreak: Int
    let longestStreak: Int

    var body: some View {
        HStack {
            Image(systemName: "flame.fill")
                .font(.title)
                .foregroundColor(.orange)

            VStack(alignment: .leading) {
                Text("連続ログイン")
                    .font(.caption)
                    .foregroundColor(.roopyText.opacity(0.7))
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("\(currentStreak)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.roopyText)
                    Text("日")
                        .font(.subheadline)
                        .foregroundColor(.roopyText)
                }
            }

            Spacer()

            VStack(alignment: .trailing) {
                Text("最長記録")
                    .font(.caption)
                    .foregroundColor(.roopyText.opacity(0.7))
                Text("\(longestStreak) 日")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyPrimary)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

/// 次のタスクカード（前倒し対応）
struct NextTasksCard: View {
    let nextTasks: [RoadmapDailyTask]
    let dateText: String  // 「今日」「明日」「12/15」など
    let totalMinutes: Int
    let onTaskTap: (RoadmapDailyTask) -> Void
    let onUncomplete: (RoadmapDailyTask) -> Void

    private var timeText: String {
        if totalMinutes >= 60 {
            let hours = totalMinutes / 60
            let minutes = totalMinutes % 60
            return minutes > 0 ? "\(hours)時間\(minutes)分" : "\(hours)時間"
        }
        return "\(totalMinutes)分"
    }

    var body: some View {
        VStack(spacing: 12) {
            // ヘッダー
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text("次のタスク")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.roopyText)

                        // 日付バッジ
                        Text(dateText)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(dateText == "今日" ? .white : .blue)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(dateText == "今日" ? Color.blue : Color.blue.opacity(0.1))
                            .cornerRadius(8)
                    }

                    Text("\(nextTasks.count)件 • 約\(timeText)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // タスク数表示
                ZStack {
                    Circle()
                        .fill(Color.blue.opacity(0.1))

                    Text("\(nextTasks.count)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                }
                .frame(width: 44, height: 44)
            }

            // タスクリスト
            ForEach(nextTasks) { task in
                HomeTaskRow(task: task) {
                    onTaskTap(task)
                }
            }

            // もっと見るリンク
            NavigationLink {
                RoadmapTabView()
            } label: {
                Text("ロードマップを見る →")
                    .font(.caption)
                    .foregroundColor(.blue)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

/// ホーム画面用タスク行
struct HomeTaskRow: View {
    let task: RoadmapDailyTask
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                Image(systemName: "circle")
                    .font(.title3)
                    .foregroundColor(.blue)

                VStack(alignment: .leading, spacing: 2) {
                    Text(task.materialName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                        .lineLimit(1)

                    HStack(spacing: 6) {
                        if !task.chapterRangeText.isEmpty {
                            Text(task.chapterRangeText)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        Text(task.estimatedTimeText)
                            .font(.caption2)
                            .foregroundColor(.blue)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .background(Color(.systemGray6))
            .cornerRadius(10)
        }
        .buttonStyle(.plain)
    }
}

/// ホーム画面用完了済みタスク行
struct HomeCompletedTaskRow: View {
    let task: RoadmapDailyTask
    let onUncomplete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button(action: onUncomplete) {
                Image(systemName: task.isPartiallyCompleted ? "circle.lefthalf.filled" : "checkmark.circle.fill")
                    .font(.title3)
                    .foregroundColor(task.isPartiallyCompleted ? .orange : .green)
            }

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(task.materialName)
                        .font(.subheadline)
                        .strikethrough()
                        .foregroundColor(.secondary)
                        .lineLimit(1)

                    if task.isPartiallyCompleted {
                        Text(task.completedChapterText)
                            .font(.caption2)
                            .foregroundColor(.orange)
                    }
                }

                HStack(spacing: 6) {
                    if let actualMinutes = task.actualMinutes {
                        Text("実績: \(actualMinutes)分")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }

                    if task.isPartiallyCompleted {
                        Text("残り\(task.remainingChapters)章は明日へ")
                            .font(.caption2)
                            .foregroundColor(.orange)
                    }
                }
            }

            Spacer()
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(task.isPartiallyCompleted ? Color.orange.opacity(0.1) : Color.green.opacity(0.1))
        .cornerRadius(10)
    }
}

/// タスク完了シート（所要時間入力＋部分完了対応）
struct TaskCompletionSheet: View {
    let task: RoadmapDailyTask
    let onComplete: (Int?, String?) -> Void
    var onPartialComplete: ((Int, Int?, String?) -> Void)? = nil

    @Environment(\.dismiss) private var dismiss
    @State private var actualMinutes: String = ""
    @State private var notes: String = ""
    @State private var useTimer = false
    @State private var timerSeconds: Int = 0
    @State private var isTimerRunning = false
    @State private var timer: Timer?
    @State private var isPartialCompletion = false
    @State private var selectedChapter: Int = 0

    /// 選択可能な章のリスト（開始章から終了章-1まで）
    private var selectableChapters: [Int] {
        guard let start = task.chapterStart, let end = task.chapterEnd, start < end else {
            return []
        }
        return Array(start..<end)
    }

    /// 部分完了が可能か（章範囲が2章以上ある場合）
    private var canPartialComplete: Bool {
        task.hasChapterRange && task.totalChapters > 1
    }

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

                Section("学習時間の記録") {
                    Toggle("タイマーを使う", isOn: $useTimer)

                    if useTimer {
                        // タイマー表示
                        VStack(spacing: 16) {
                            Text(timerText)
                                .font(.system(size: 48, weight: .light, design: .monospaced))
                                .foregroundColor(isTimerRunning ? .blue : .primary)

                            HStack(spacing: 20) {
                                Button {
                                    if isTimerRunning {
                                        stopTimer()
                                    } else {
                                        startTimer()
                                    }
                                } label: {
                                    Image(systemName: isTimerRunning ? "pause.circle.fill" : "play.circle.fill")
                                        .font(.system(size: 44))
                                        .foregroundColor(isTimerRunning ? .orange : .green)
                                }

                                Button {
                                    resetTimer()
                                } label: {
                                    Image(systemName: "arrow.counterclockwise.circle.fill")
                                        .font(.system(size: 44))
                                        .foregroundColor(.gray)
                                }
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                    } else {
                        // 手動入力
                        HStack {
                            TextField("学習時間", text: $actualMinutes)
                                .keyboardType(.numberPad)
                            Text("分")
                                .foregroundColor(.secondary)
                        }
                    }
                }

                // 部分完了セクション（章範囲がある場合のみ）
                if canPartialComplete {
                    Section {
                        Toggle("途中まで完了", isOn: $isPartialCompletion)

                        if isPartialCompletion {
                            VStack(alignment: .leading, spacing: 12) {
                                // 章選択Picker
                                Picker("何章まで完了しましたか？", selection: $selectedChapter) {
                                    ForEach(selectableChapters, id: \.self) { chapter in
                                        Text("第\(chapter)章まで").tag(chapter)
                                    }
                                }
                                .pickerStyle(.wheel)
                                .frame(height: 120)

                                // 残り章数の説明
                                if let end = task.chapterEnd {
                                    let remaining = end - selectedChapter
                                    let remainingMinutes = task.remainingMinutes(completedChapter: selectedChapter)

                                    HStack(spacing: 8) {
                                        Image(systemName: "info.circle")
                                            .foregroundColor(.orange)
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text("残り\(remaining)章は明日のタスクに追加されます")
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                            Text("（約\(remainingMinutes)分）")
                                                .font(.caption2)
                                                .foregroundColor(.secondary)
                                        }
                                    }
                                }
                            }
                        }
                    } header: {
                        Text("進捗状況")
                    }
                }

                Section("メモ（任意）") {
                    TextField("気づきや感想を記録", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section {
                    Button {
                        let minutes: Int?
                        if useTimer {
                            minutes = timerSeconds / 60
                        } else {
                            minutes = Int(actualMinutes)
                        }

                        if isPartialCompletion && canPartialComplete, let partialHandler = onPartialComplete {
                            partialHandler(selectedChapter, minutes, notes.isEmpty ? nil : notes)
                        } else {
                            onComplete(minutes, notes.isEmpty ? nil : notes)
                        }
                        dismiss()
                    } label: {
                        HStack {
                            Spacer()
                            if isPartialCompletion && canPartialComplete {
                                Label("第\(selectedChapter)章まで完了", systemImage: "checkmark.circle")
                                    .font(.headline)
                            } else {
                                Label("完了", systemImage: "checkmark.circle.fill")
                                    .font(.headline)
                            }
                            Spacer()
                        }
                    }
                    .foregroundColor(.white)
                    .listRowBackground(isPartialCompletion && canPartialComplete ? Color.orange : Color.blue)
                }
            }
            .navigationTitle("タスク完了")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        stopTimer()
                        dismiss()
                    }
                }
            }
            .onAppear {
                // 予想時間をデフォルト値として設定
                actualMinutes = "\(task.estimatedMinutes)"
                // 初期選択章を設定（開始章）
                if let start = task.chapterStart {
                    selectedChapter = start
                }
            }
            .onDisappear {
                stopTimer()
            }
        }
        .presentationDetents([.medium, .large])
    }

    private var timerText: String {
        let hours = timerSeconds / 3600
        let minutes = (timerSeconds % 3600) / 60
        let seconds = timerSeconds % 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        }
        return String(format: "%02d:%02d", minutes, seconds)
    }

    private func startTimer() {
        isTimerRunning = true
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            timerSeconds += 1
        }
    }

    private func stopTimer() {
        isTimerRunning = false
        timer?.invalidate()
        timer = nil
    }

    private func resetTimer() {
        stopTimer()
        timerSeconds = 0
    }
}

/// 現在取り組み中の参考書カード
struct CurrentMaterialsCard: View {
    let materials: [RoadmapMaterial]
    let progressForMaterial: (Int) -> Double
    let daysRemainingForMaterial: (Int) -> Int

    /// カテゴリでグループ化した教材
    private var groupedMaterials: [(category: String, materials: [RoadmapMaterial])] {
        let grouped = Dictionary(grouping: materials) { $0.material?.materialCategory ?? "その他" }
        // カテゴリの表示順序（8つのパート）
        let order = ["単語", "熟語", "文法", "解釈", "長文", "英作文", "リスニング", "過去問", "その他"]
        return order.compactMap { category in
            if let mats = grouped[category], !mats.isEmpty {
                return (category, mats)
            }
            return nil
        }
    }

    var body: some View {
        VStack(spacing: 16) {
            // ヘッダー
            HStack {
                Image(systemName: "books.vertical.fill")
                    .font(.title2)
                    .foregroundColor(.blue)
                VStack(alignment: .leading, spacing: 2) {
                    Text("現在の参考書")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.roopyText)
                    Text("\(materials.count)冊取り組み中")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()

                NavigationLink {
                    RoadmapTabView()
                } label: {
                    Text("詳細")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }

            // カテゴリ別に表示
            ForEach(groupedMaterials, id: \.category) { group in
                VStack(alignment: .leading, spacing: 8) {
                    // カテゴリラベル
                    HStack(spacing: 4) {
                        Image(systemName: categoryIcon(for: group.category))
                            .font(.caption)
                            .foregroundColor(categoryColor(for: group.category))
                        Text(group.category)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(categoryColor(for: group.category))
                    }

                    // 教材リスト
                    ForEach(group.materials) { material in
                        CurrentMaterialRow(
                            material: material,
                            progress: progressForMaterial(material.id),
                            daysRemaining: daysRemainingForMaterial(material.id)
                        )
                    }
                }
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color.white, Color.blue.opacity(0.03)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.08), radius: 6, x: 0, y: 3)
    }

    private func categoryIcon(for category: String) -> String {
        switch category {
        case "単語": return "textformat.abc"
        case "熟語": return "text.word.spacing"
        case "文法": return "text.book.closed"
        case "解釈": return "magnifyingglass"
        case "長文": return "doc.text"
        case "英作文": return "pencil"
        case "リスニング": return "headphones"
        default: return "book"
        }
    }

    private func categoryColor(for category: String) -> Color {
        switch category {
        case "単語": return .blue
        case "熟語": return .purple
        case "文法": return .green
        case "解釈": return .orange
        case "長文": return .red
        case "英作文": return .pink
        case "リスニング": return .cyan
        default: return .gray
        }
    }
}

/// 教材行
struct CurrentMaterialRow: View {
    let material: RoadmapMaterial
    let progress: Double  // タスクベースの進捗率（外部から渡される）
    let daysRemaining: Int  // タスクベースの残り日数（外部から渡される）

    var body: some View {
        HStack(spacing: 12) {
            // 書籍画像
            if let imageUrl = material.material?.imageUrl, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    case .failure:
                        Image(systemName: "book.closed.fill")
                            .foregroundColor(.gray)
                    case .empty:
                        ProgressView()
                    @unknown default:
                        Image(systemName: "book.closed.fill")
                            .foregroundColor(.gray)
                    }
                }
                .frame(width: 44, height: 60)
                .background(Color(.systemGray6))
                .cornerRadius(4)
            } else {
                Image(systemName: "book.closed.fill")
                    .font(.title2)
                    .foregroundColor(.gray)
                    .frame(width: 44, height: 60)
                    .background(Color(.systemGray6))
                    .cornerRadius(4)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(material.material?.materialName ?? "教材")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                    .lineLimit(1)

                HStack(spacing: 8) {
                    // 周回
                    Text(material.cycleText)
                        .font(.caption2)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(4)

                    // 残り日数
                    if daysRemaining > 0 {
                        Text("残り\(daysRemaining)日")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    } else if material.isDelayed {
                        Text("期限超過")
                            .font(.caption2)
                            .foregroundColor(.red)
                    }
                }

                // 進捗バー
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 4)

                        RoundedRectangle(cornerRadius: 2)
                            .fill(material.isDelayed ? Color.red : Color.blue)
                            .frame(width: geo.size.width * progress, height: 4)
                    }
                }
                .frame(height: 4)
            }

            Spacer()
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(Color(.systemGray6).opacity(0.5))
        .cornerRadius(10)
    }
}

/// プレビュー
#Preview {
    HomeView()
        .environmentObject(AuthService.shared)
}
