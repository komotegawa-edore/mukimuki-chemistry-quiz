import Foundation

/// 単語カード学習のViewModel
@MainActor
final class FlashcardViewModel: ObservableObject {
    let deck: FlashcardDeck

    @Published var cards: [Flashcard] = []
    @Published var originalCards: [Flashcard] = []
    @Published var currentIndex = 0
    @Published var isFlipped = false
    @Published var isCompleted = false
    @Published var isLoading = false
    @Published var error: Error?
    @Published var isShuffled = false

    // 再開機能
    @Published var showResumeModal = false
    @Published var savedIndex = 0

    private let storageKey: String

    var currentCard: Flashcard? {
        guard currentIndex < cards.count else { return nil }
        return cards[currentIndex]
    }

    init(deck: FlashcardDeck) {
        self.deck = deck
        self.storageKey = "flashcard_progress_\(deck.id)"
    }

    func loadCards() async {
        isLoading = true
        defer { isLoading = false }

        do {
            print("FlashcardViewModel: loading cards for deck \(deck.id)")
            let fetchedCards = try await FlashcardService.shared.fetchCards(deckId: deck.id)
            cards = fetchedCards
            originalCards = fetchedCards
            print("FlashcardViewModel: loaded \(cards.count) cards")

            // 保存された進捗をチェック
            checkSavedProgress()
        } catch {
            self.error = error
            print("FlashcardViewModel error: \(error)")
        }
    }

    // MARK: - 進捗管理

    private func checkSavedProgress() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let saved = try? JSONDecoder().decode(SavedProgress.self, from: data) else {
            return
        }

        // カード数が変わっていないかチェック
        if saved.totalCards == cards.count && saved.currentIndex > 0 && saved.currentIndex < cards.count {
            savedIndex = saved.currentIndex
            showResumeModal = true
        }
    }

    private func saveProgress() {
        guard !isCompleted else { return }
        let progress = SavedProgress(
            currentIndex: currentIndex,
            totalCards: cards.count,
            timestamp: Date()
        )
        if let data = try? JSONEncoder().encode(progress) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func clearProgress() {
        UserDefaults.standard.removeObject(forKey: storageKey)
    }

    func resumeFromSaved() {
        currentIndex = savedIndex
        showResumeModal = false
    }

    func startFromBeginning() {
        currentIndex = 0
        clearProgress()
        showResumeModal = false
    }

    // MARK: - カード操作

    func flipCard() {
        isFlipped.toggle()
    }

    func goToNext() {
        if currentIndex < cards.count - 1 {
            currentIndex += 1
            isFlipped = false
            saveProgress()
        } else {
            // セッション完了
            isCompleted = true
            clearProgress()
        }
    }

    func goToPrev() {
        if currentIndex > 0 {
            currentIndex -= 1
            isFlipped = false
            saveProgress()
        }
    }

    func toggleShuffle() {
        if isShuffled {
            // 元の順番に戻す
            cards = originalCards
            isShuffled = false
        } else {
            // シャッフル
            cards = cards.shuffled()
            isShuffled = true
        }
        currentIndex = 0
        isFlipped = false
        clearProgress()
    }

    func resetSession() {
        currentIndex = 0
        isFlipped = false
        isCompleted = false
        clearProgress()
    }
}

// MARK: - 保存用の構造体

private struct SavedProgress: Codable {
    let currentIndex: Int
    let totalCards: Int
    let timestamp: Date
}
