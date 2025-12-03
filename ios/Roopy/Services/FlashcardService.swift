import Foundation

// MARK: - Insert/Update Models

/// 学習進捗の更新用
struct FlashcardProgressUpsert: Encodable {
    let userId: UUID
    let cardId: Int
    let status: String
    let reviewCount: Int
    let lastReviewedAt: String

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case cardId = "card_id"
        case status
        case reviewCount = "review_count"
        case lastReviewedAt = "last_reviewed_at"
    }
}

/// セッション登録用
struct FlashcardSessionInsert: Encodable {
    let userId: UUID
    let deckId: Int
    let totalCards: Int
    let knownCount: Int
    let learningCount: Int
    let unknownCount: Int

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case deckId = "deck_id"
        case totalCards = "total_cards"
        case knownCount = "known_count"
        case learningCount = "learning_count"
        case unknownCount = "unknown_count"
    }
}

/// 単語カード関連のサービス
final class FlashcardService {
    static let shared = FlashcardService()
    private init() {}

    // MARK: - Decks

    /// 全デッキを取得
    func fetchDecks() async throws -> [FlashcardDeck] {
        print("FlashcardService: fetching decks from mukimuki_flashcard_decks...")
        do {
            let decks: [FlashcardDeck] = try await supabase
                .from("mukimuki_flashcard_decks")
                .select()
                .eq("is_published", value: true)
                .order("display_order")
                .execute()
                .value
            print("FlashcardService: successfully fetched \(decks.count) decks")
            return decks
        } catch {
            print("FlashcardService: error fetching decks - \(error)")
            throw error
        }
    }

    /// 科目別のデッキを取得
    func fetchDecks(subject: String) async throws -> [FlashcardDeck] {
        let decks: [FlashcardDeck] = try await supabase
            .from("mukimuki_flashcard_decks")
            .select()
            .eq("subject", value: subject)
            .eq("is_published", value: true)
            .order("display_order")
            .execute()
            .value
        return decks
    }

    // MARK: - Flashcards

    /// デッキのカード一覧を取得
    func fetchCards(deckId: Int) async throws -> [Flashcard] {
        let cards: [Flashcard] = try await supabase
            .from("mukimuki_flashcards")
            .select()
            .eq("deck_id", value: deckId)
            .eq("is_published", value: true)
            .order("order_num")
            .execute()
            .value
        return cards
    }

    // MARK: - Progress

    /// ユーザーの学習進捗を取得
    func fetchProgress(userId: UUID, cardIds: [Int]) async throws -> [FlashcardProgress] {
        guard !cardIds.isEmpty else { return [] }

        let progress: [FlashcardProgress] = try await supabase
            .from("mukimuki_flashcard_progress")
            .select()
            .eq("user_id", value: userId)
            .in("card_id", values: cardIds)
            .execute()
            .value
        return progress
    }

    /// ユーザーの全進捗を一括取得
    func fetchAllProgress(userId: UUID) async throws -> [FlashcardProgress] {
        let progress: [FlashcardProgress] = try await supabase
            .from("mukimuki_flashcard_progress")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value
        return progress
    }

    /// デッキごとのカード数を取得（効率化版）
    func fetchDeckCardCounts() async throws -> [Int: Int] {
        struct CardCount: Decodable {
            let deckId: Int
            let count: Int

            enum CodingKeys: String, CodingKey {
                case deckId = "deck_id"
                case count
            }
        }

        // RPCまたは集計クエリで取得したいが、
        // Supabase Swift SDKの制限により、シンプルに全カードを取得してカウント
        let cards: [Flashcard] = try await supabase
            .from("mukimuki_flashcards")
            .select("id, deck_id")
            .eq("is_published", value: true)
            .execute()
            .value

        var counts: [Int: Int] = [:]
        for card in cards {
            counts[card.deckId, default: 0] += 1
        }
        return counts
    }

    /// 学習進捗を更新（upsert）
    func updateProgress(userId: UUID, cardId: Int, status: FlashcardStatus) async throws {
        let params = FlashcardProgressUpsert(
            userId: userId,
            cardId: cardId,
            status: status.rawValue,
            reviewCount: 1,
            lastReviewedAt: ISO8601DateFormatter().string(from: Date())
        )

        try await supabase
            .from("mukimuki_flashcard_progress")
            .upsert(params, onConflict: "user_id,card_id")
            .execute()
    }

    /// 複数カードの進捗を一括更新
    func batchUpdateProgress(userId: UUID, updates: [(cardId: Int, status: FlashcardStatus)]) async throws {
        for update in updates {
            try await updateProgress(userId: userId, cardId: update.cardId, status: update.status)
        }
    }

    // MARK: - Sessions

    /// 学習セッションを記録
    func saveSession(
        userId: UUID,
        deckId: Int,
        totalCards: Int,
        knownCount: Int,
        learningCount: Int,
        unknownCount: Int
    ) async throws {
        let params = FlashcardSessionInsert(
            userId: userId,
            deckId: deckId,
            totalCards: totalCards,
            knownCount: knownCount,
            learningCount: learningCount,
            unknownCount: unknownCount
        )

        try await supabase
            .from("mukimuki_flashcard_sessions")
            .insert(params)
            .execute()
    }

    /// ユーザーのセッション履歴を取得
    func fetchSessions(userId: UUID, limit: Int = 20) async throws -> [FlashcardSession] {
        let sessions: [FlashcardSession] = try await supabase
            .from("mukimuki_flashcard_sessions")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .limit(limit)
            .execute()
            .value
        return sessions
    }
}
