import SwiftUI

/// 学習タブ（クエスト + ドリル統合）
struct StudyTabView: View {
    @State private var selectedSegment: StudySegment = .quest

    enum StudySegment: String, CaseIterable {
        case quest = "クエスト"
        case drill = "ドリル"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // セグメントピッカー
                Picker("学習タイプ", selection: $selectedSegment) {
                    ForEach(StudySegment.allCases, id: \.self) { segment in
                        Text(segment.rawValue).tag(segment)
                    }
                }
                .pickerStyle(.segmented)
                .padding()

                // コンテンツ
                switch selectedSegment {
                case .quest:
                    QuestContentView()
                case .drill:
                    DrillContentView()
                }
            }
            .background(Color.roopyBackgroundLight)
            .navigationTitle("学習")
        }
    }
}

/// クエストコンテンツ（QuestViewから抽出）
struct QuestContentView: View {
    @StateObject private var viewModel = QuestViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // 復習モードカード
                NavigationLink(destination: ReviewView()) {
                    ReviewModeCard()
                }
                .buttonStyle(PlainButtonStyle())

                // 教科セクション
                ForEach(viewModel.subjects) { subject in
                    SubjectSection(
                        subject: subject,
                        chapters: viewModel.chaptersBySubject[subject.id] ?? [],
                        latestResults: viewModel.latestResults,
                        clearedTodayIds: viewModel.clearedTodayIds
                    )
                }
            }
            .padding()
        }
        .refreshable {
            await viewModel.loadData()
        }
        .task {
            await viewModel.loadData()
        }
    }
}

/// ドリルコンテンツ（DrillViewから抽出）
struct DrillContentView: View {
    @StateObject private var viewModel = DrillViewModel()

    var body: some View {
        ScrollView {
            if viewModel.isLoading {
                VStack(spacing: 16) {
                    ProgressView()
                    Text("読み込み中...")
                        .font(.caption)
                        .foregroundColor(.roopyText.opacity(0.6))
                }
                .padding(.top, 100)
            } else if let errorMessage = viewModel.errorMessage {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundColor(.orange)
                    Text("エラーが発生しました")
                        .font(.headline)
                        .foregroundColor(.roopyText)
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundColor(.roopyText.opacity(0.6))
                        .multilineTextAlignment(.center)
                    Button("再読み込み") {
                        Task {
                            await viewModel.loadData()
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.roopyPrimary)
                }
                .padding()
                .padding(.top, 60)
            } else if viewModel.groupedDecks.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "rectangle.stack")
                        .font(.largeTitle)
                        .foregroundColor(.roopyText.opacity(0.4))
                    Text("デッキがありません")
                        .font(.headline)
                        .foregroundColor(.roopyText.opacity(0.6))
                }
                .padding(.top, 100)
            } else {
                VStack(spacing: 16) {
                    ForEach(viewModel.groupedDecks.keys.sorted(), id: \.self) { subject in
                        if let decks = viewModel.groupedDecks[subject] {
                            SubjectDeckSection(
                                subject: subject,
                                decks: decks,
                                progress: viewModel.progress
                            )
                        }
                    }
                }
                .padding()
            }
        }
        .refreshable {
            await viewModel.loadData()
        }
        .task {
            await viewModel.loadData()
        }
    }
}

#Preview {
    StudyTabView()
        .environmentObject(AuthService.shared)
}
