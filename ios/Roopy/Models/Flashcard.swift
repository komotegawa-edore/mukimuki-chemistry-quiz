import Foundation

/// 単語カードデッキ
struct FlashcardDeck: Codable, Identifiable {
    let id: Int
    let name: String
    let description: String?
    let subject: String
    let category: String?
    let displayOrder: Int?
    let isPublished: Bool?
    let createdBy: UUID?
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case subject
        case category
        case displayOrder = "display_order"
        case isPublished = "is_published"
        case createdBy = "created_by"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

/// 単語カード
struct Flashcard: Codable, Identifiable {
    let id: Int
    let deckId: Int
    let frontText: String
    let backText: String
    let frontImageUrl: String?
    let backImageUrl: String?
    let orderNum: Int?
    let isPublished: Bool?
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case deckId = "deck_id"
        case frontText = "front_text"
        case backText = "back_text"
        case frontImageUrl = "front_image_url"
        case backImageUrl = "back_image_url"
        case orderNum = "order_num"
        case isPublished = "is_published"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

/// 単語カードの学習進捗
struct FlashcardProgress: Codable, Identifiable {
    let id: Int
    let userId: UUID
    let cardId: Int
    var status: FlashcardStatus
    var reviewCount: Int?
    let lastReviewedAt: Date?
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case cardId = "card_id"
        case status
        case reviewCount = "review_count"
        case lastReviewedAt = "last_reviewed_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

/// 学習ステータス
enum FlashcardStatus: String, Codable {
    case unknown
    case learning
    case known
}

/// 学習セッション記録
struct FlashcardSession: Codable, Identifiable {
    let id: Int
    let userId: UUID
    let deckId: Int
    let totalCards: Int
    var knownCount: Int?
    var learningCount: Int?
    var unknownCount: Int?
    let sessionDate: String?
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case deckId = "deck_id"
        case totalCards = "total_cards"
        case knownCount = "known_count"
        case learningCount = "learning_count"
        case unknownCount = "unknown_count"
        case sessionDate = "session_date"
        case createdAt = "created_at"
    }
}
