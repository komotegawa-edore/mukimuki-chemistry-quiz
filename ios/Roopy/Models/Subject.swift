import Foundation

/// 科目（教科）
struct Subject: Codable, Identifiable {
    let id: Int
    let name: String
    let description: String?
    let mediaType: String
    let displayOrder: Int
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case mediaType = "media_type"
        case displayOrder = "display_order"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
