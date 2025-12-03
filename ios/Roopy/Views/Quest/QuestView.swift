import SwiftUI

/// クエスト画面（章一覧）
struct QuestView: View {
    @StateObject private var viewModel = QuestViewModel()

    var body: some View {
        NavigationStack {
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
            .background(Color.roopyBackgroundLight)
            .navigationTitle("クエスト")
            .refreshable {
                await viewModel.loadData()
            }
        }
        .task {
            await viewModel.loadData()
        }
    }
}

/// 復習モードカード
struct ReviewModeCard: View {
    var body: some View {
        HStack {
            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 48, height: 48)
                Image(systemName: "arrow.counterclockwise")
                    .font(.title2)
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("復習モード")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Text("間違えた問題を復習しましょう")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.9))
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundColor(.white)
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.roopyPrimary, .roopyPrimaryDark],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(16)
        .shadow(color: .roopyPrimary.opacity(0.3), radius: 8, x: 0, y: 4)
    }
}

/// 教科セクション
struct SubjectSection: View {
    let subject: Subject
    let chapters: [Chapter]
    let latestResults: [Int: TestResult]
    let clearedTodayIds: Set<Int>

    @State private var isExpanded = false

    var body: some View {
        VStack(spacing: 0) {
            // ヘッダー（トグル）
            Button(action: {
                withAnimation(.spring(response: 0.3)) {
                    isExpanded.toggle()
                }
            }) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            Text(subject.name)
                                .font(.title3)
                                .fontWeight(.semibold)
                                .foregroundColor(.roopyText)

                            if subject.id != 1 {
                                Text("実装中")
                                    .font(.caption2)
                                    .fontWeight(.semibold)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 2)
                                    .background(Color.yellow.opacity(0.2))
                                    .foregroundColor(.orange)
                                    .cornerRadius(4)
                            }
                        }

                        if let description = subject.description {
                            Text(description)
                                .font(.caption)
                                .foregroundColor(.roopyText.opacity(0.6))
                        }
                    }

                    Spacer()

                    HStack(spacing: 8) {
                        Text("\(chapters.count)章")
                            .font(.caption)
                            .foregroundColor(.roopyText.opacity(0.6))

                        Image(systemName: "chevron.down")
                            .foregroundColor(.roopyPrimary)
                            .rotationEffect(.degrees(isExpanded ? 180 : 0))
                    }
                }
                .padding()
            }

            // 章一覧（展開時）
            if isExpanded {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 12) {
                    ForEach(chapters) { chapter in
                        NavigationLink(destination: QuizView(chapter: chapter)) {
                            ChapterCard(
                                chapter: chapter,
                                result: latestResults[chapter.id],
                                canEarnPoints: !clearedTodayIds.contains(chapter.id)
                            )
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .padding(.horizontal)
                .padding(.bottom)
            }
        }
        .background(Color.white)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.roopyBackground, lineWidth: 2)
        )
    }
}

/// 章カード
struct ChapterCard: View {
    let chapter: Chapter
    let result: TestResult?
    let canEarnPoints: Bool

    private var percentage: Int? {
        guard let result = result, result.total > 0 else { return nil }
        return Int(result.percentage)
    }

    private var progressColor: Color {
        guard let p = percentage else { return .gray }
        if p >= 80 { return .roopySuccess }
        if p >= 60 { return .roopyWarning }
        return .roopyError
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // ポイント獲得可能バッジ
            if canEarnPoints {
                HStack {
                    Spacer()
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                        Text("+1pt")
                            .font(.caption2)
                            .fontWeight(.bold)
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        LinearGradient(
                            colors: [.roopyGold, .roopyOrange],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(8)
                }
            }

            // タイトル
            HStack {
                Text(chapter.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyText)
                    .lineLimit(2)

                Spacer()

                Text("#\(chapter.orderNum)")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyPrimary)
            }

            Spacer()

            // 進捗
            if let p = percentage {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("前回の結果")
                            .font(.caption2)
                            .foregroundColor(.roopyText.opacity(0.6))
                        Spacer()
                        Text("\(p)%")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(progressColor)
                    }

                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.roopyBackground)
                                .frame(height: 6)

                            RoundedRectangle(cornerRadius: 4)
                                .fill(progressColor)
                                .frame(width: geo.size.width * CGFloat(p) / 100, height: 6)
                        }
                    }
                    .frame(height: 6)
                }
            } else {
                Text("未挑戦")
                    .font(.caption)
                    .foregroundColor(.roopyText.opacity(0.5))
            }
        }
        .padding()
        .frame(height: 140)
        .background(
            LinearGradient(
                colors: [.white, .roopyBackgroundLight],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.roopyBackground, lineWidth: 2)
        )
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

#Preview {
    QuestView()
        .environmentObject(AuthService.shared)
}
