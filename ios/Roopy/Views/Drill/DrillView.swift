import SwiftUI

/// ドリル画面（単語カード一覧）
struct DrillView: View {
    @StateObject private var viewModel = DrillViewModel()

    var body: some View {
        NavigationStack {
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
            .background(Color.roopyBackgroundLight)
            .navigationTitle("ドリル")
            .refreshable {
                await viewModel.loadData()
            }
        }
        .task {
            await viewModel.loadData()
        }
    }
}

/// 科目別デッキセクション
struct SubjectDeckSection: View {
    let subject: String
    let decks: [FlashcardDeck]
    let progress: [Int: DeckProgress]

    @State private var isExpanded = false

    // 科目名からカテゴリをグループ化
    private var decksByCategory: [String: [FlashcardDeck]] {
        var result: [String: [FlashcardDeck]] = [:]
        for deck in decks {
            let category = deck.category ?? "その他"
            result[category, default: []].append(deck)
        }
        return result
    }

    var body: some View {
        VStack(spacing: 0) {
            // 科目ヘッダー
            Button(action: {
                withAnimation(.spring(response: 0.3)) {
                    isExpanded.toggle()
                }
            }) {
                HStack {
                    Text(subject)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(.roopyText)

                    Spacer()

                    HStack(spacing: 8) {
                        Text("\(decks.count)デッキ")
                            .font(.caption)
                            .foregroundColor(.roopyText.opacity(0.6))

                        Image(systemName: "chevron.down")
                            .foregroundColor(.roopyPrimary)
                            .rotationEffect(.degrees(isExpanded ? 180 : 0))
                    }
                }
                .padding()
            }

            // デッキ一覧
            if isExpanded {
                VStack(spacing: 12) {
                    ForEach(decksByCategory.keys.sorted(), id: \.self) { category in
                        if let categoryDecks = decksByCategory[category] {
                            CategorySection(
                                category: category,
                                decks: categoryDecks,
                                progress: progress
                            )
                        }
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

/// カテゴリセクション
struct CategorySection: View {
    let category: String
    let decks: [FlashcardDeck]
    let progress: [Int: DeckProgress]

    @State private var isExpanded = false

    var body: some View {
        VStack(spacing: 8) {
            // カテゴリヘッダー
            Button(action: {
                withAnimation(.spring(response: 0.3)) {
                    isExpanded.toggle()
                }
            }) {
                HStack {
                    Text(category)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.roopyText.opacity(0.8))

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.roopyPrimary)
                        .rotationEffect(.degrees(isExpanded ? 90 : 0))
                }
                .padding(.vertical, 8)
            }

            // デッキ一覧
            if isExpanded {
                ForEach(decks) { deck in
                    NavigationLink(destination: FlashcardView(deck: deck)) {
                        DeckCard(deck: deck, progress: progress[deck.id])
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
        }
    }
}

/// デッキカード
struct DeckCard: View {
    let deck: FlashcardDeck
    let progress: DeckProgress?

    var body: some View {
        HStack(spacing: 12) {
            // アイコン
            ZStack {
                Circle()
                    .fill(Color.roopyBackground)
                    .frame(width: 44, height: 44)
                Image(systemName: "rectangle.stack.fill")
                    .foregroundColor(.roopyPrimary)
            }

            // デッキ情報
            VStack(alignment: .leading, spacing: 4) {
                Text(deck.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.roopyText)
                    .lineLimit(1)

                if let description = deck.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.roopyText.opacity(0.6))
                        .lineLimit(1)
                }
            }

            Spacer()

            // 進捗表示
            if let p = progress {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(p.knownCount)/\(p.totalCount)")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.roopyPrimary)
                    Text("習得済み")
                        .font(.caption2)
                        .foregroundColor(.roopyText.opacity(0.5))
                }
            }

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.roopyText.opacity(0.3))
        }
        .padding()
        .background(Color.roopyBackgroundLight)
        .cornerRadius(8)
    }
}

/// デッキの進捗データ
struct DeckProgress {
    let totalCount: Int
    let knownCount: Int
    let learningCount: Int
    let unknownCount: Int
}

#Preview {
    DrillView()
        .environmentObject(AuthService.shared)
}
