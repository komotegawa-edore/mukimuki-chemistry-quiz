import Foundation

/// クイズの問題
struct Question: Codable, Identifiable {
    let id: Int
    let chapterId: Int
    let questionText: String
    let choiceA: String
    let choiceB: String
    let choiceC: String
    let choiceD: String
    let correctAnswer: String
    let updatedBy: UUID?
    let createdAt: Date?
    let updatedAt: Date?
    let explanation: String?
    let questionImageUrl: String?
    let questionAudioUrl: String?
    let choiceAImageUrl: String?
    let choiceBImageUrl: String?
    let choiceCImageUrl: String?
    let choiceDImageUrl: String?
    let mediaType: String
    let explanationImageUrl: String?
    let isPublished: Bool

    enum CodingKeys: String, CodingKey {
        case id
        case chapterId = "chapter_id"
        case questionText = "question_text"
        case choiceA = "choice_a"
        case choiceB = "choice_b"
        case choiceC = "choice_c"
        case choiceD = "choice_d"
        case correctAnswer = "correct_answer"
        case updatedBy = "updated_by"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case explanation
        case questionImageUrl = "question_image_url"
        case questionAudioUrl = "question_audio_url"
        case choiceAImageUrl = "choice_a_image_url"
        case choiceBImageUrl = "choice_b_image_url"
        case choiceCImageUrl = "choice_c_image_url"
        case choiceDImageUrl = "choice_d_image_url"
        case mediaType = "media_type"
        case explanationImageUrl = "explanation_image_url"
        case isPublished = "is_published"
    }

    /// 選択肢を配列で取得
    var choices: [String] {
        [choiceA, choiceB, choiceC, choiceD]
    }

    /// 選択肢のラベル付き配列
    var labeledChoices: [(label: String, text: String)] {
        [
            ("A", choiceA),
            ("B", choiceB),
            ("C", choiceC),
            ("D", choiceD)
        ]
    }

    /// 選択肢画像のURL配列
    var choiceImageUrls: [String?] {
        [choiceAImageUrl, choiceBImageUrl, choiceCImageUrl, choiceDImageUrl]
    }
}

/// 問題作成・更新用パラメータ
struct QuestionParams: Encodable {
    var chapterId: Int
    var questionText: String
    var choiceA: String
    var choiceB: String
    var choiceC: String
    var choiceD: String
    var correctAnswer: String
    var explanation: String?
    var mediaType: String = "text"
    var isPublished: Bool = true

    enum CodingKeys: String, CodingKey {
        case chapterId = "chapter_id"
        case questionText = "question_text"
        case choiceA = "choice_a"
        case choiceB = "choice_b"
        case choiceC = "choice_c"
        case choiceD = "choice_d"
        case correctAnswer = "correct_answer"
        case explanation
        case mediaType = "media_type"
        case isPublished = "is_published"
    }
}
