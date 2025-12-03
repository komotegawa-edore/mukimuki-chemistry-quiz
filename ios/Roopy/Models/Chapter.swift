import Foundation

/// 章（チャプター）
struct Chapter: Codable, Identifiable {
    let id: Int
    let title: String
    let orderNum: Int
    let subjectId: Int
    let isPublished: Bool
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case orderNum = "order_num"
        case subjectId = "subject_id"
        case isPublished = "is_published"
        case createdAt = "created_at"
    }
}
