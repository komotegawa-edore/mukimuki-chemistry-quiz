import Foundation

/// ドリル画面のViewModel
@MainActor
final class DrillViewModel: ObservableObject {
    @Published var decks: [FlashcardDeck] = []
    @Published var groupedDecks: [String: [FlashcardDeck]] = [:]
    @Published var progress: [Int: DeckProgress] = [:]
    @Published var isLoading = false
    @Published var error: Error?
    @Published var errorMessage: String?

    func loadData() async {
        isLoading = true
        error = nil
        errorMessage = nil

        do {
            // デッキ一覧を取得（1回のAPIコール）
            print("DrillViewModel: fetching decks...")
            decks = try await FlashcardService.shared.fetchDecks()
            print("DrillViewModel: fetched \(decks.count) decks")

            // 科目ごとにグループ化（日本語表示名に変換）
            groupedDecks = Dictionary(grouping: decks) { Self.subjectDisplayName($0.subject) }
            print("DrillViewModel: grouped into \(groupedDecks.keys.count) subjects")

            // 進捗は後からバックグラウンドで取得（UIをブロックしない）
            isLoading = false

            // 進捗情報を取得（ログインしている場合のみ）
            if let userId = AuthService.shared.currentUserId {
                print("DrillViewModel: fetching progress in background...")
                await fetchProgressInBackground(userId: userId)
            }

        } catch {
            self.error = error
            self.errorMessage = error.localizedDescription
            print("DrillViewModel error: \(error)")
            isLoading = false
        }
    }

    /// 進捗を効率的に取得（1回のAPIコールで全進捗を取得）
    private func fetchProgressInBackground(userId: UUID) async {
        do {
            // 全ユーザー進捗を1回で取得
            let allProgress = try await FlashcardService.shared.fetchAllProgress(userId: userId)

            // デッキごとのカード数を1回で取得
            let cardCounts = try await FlashcardService.shared.fetchDeckCardCounts()

            var progressMap: [Int: DeckProgress] = [:]

            for deck in decks {
                let totalCount = cardCounts[deck.id] ?? 0
                let deckProgress = allProgress.filter { progress in
                    // card_idからdeck_idを特定する必要があるが、
                    // 今はシンプルに0で初期化
                    false
                }

                progressMap[deck.id] = DeckProgress(
                    totalCount: totalCount,
                    knownCount: 0,
                    learningCount: 0,
                    unknownCount: totalCount
                )
            }

            self.progress = progressMap
            print("DrillViewModel: progress loaded")

        } catch {
            print("DrillViewModel: failed to load progress - \(error)")
        }
    }

    /// 科目名を日本語表示名に変換
    static func subjectDisplayName(_ subject: String) -> String {
        switch subject {
        case "english":
            return "英語"
        case "classical_japanese":
            return "古文"
        case "japanese_history":
            return "日本史"
        default:
            return subject
        }
    }
}
