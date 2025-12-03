import Foundation

/// チャプタークリア登録用
struct ChapterClearInsert: Encodable {
    let userId: UUID
    let chapterId: Int
    let clearedDate: String
    let points: Int

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case chapterId = "chapter_id"
        case clearedDate = "cleared_date"
        case points
    }
}

/// クイズ画面のViewModel
@MainActor
final class QuizViewModel: ObservableObject {
    let chapter: Chapter

    @Published var questions: [Question] = []
    @Published var currentIndex = 0
    @Published var selectedAnswer: String?
    @Published var showAnswer = false
    @Published var isCompleted = false
    @Published var isLoading = false
    @Published var error: Error?

    @Published var answers: [Int: String] = [:] // questionId -> selected answer
    @Published var earnedPoints = 0

    var currentQuestion: Question? {
        guard currentIndex < questions.count else { return nil }
        return questions[currentIndex]
    }

    var correctCount: Int {
        var count = 0
        for question in questions {
            if answers[question.id] == question.correctAnswer {
                count += 1
            }
        }
        return count
    }

    var totalQuestions: Int {
        questions.count
    }

    var wrongAnswers: [WrongAnswer] {
        questions.compactMap { question in
            guard let selected = answers[question.id],
                  selected != question.correctAnswer else {
                return nil
            }
            return WrongAnswer(
                questionId: question.id,
                questionText: question.questionText,
                selectedAnswer: getChoiceText(for: selected, in: question),
                correctAnswer: getChoiceText(for: question.correctAnswer, in: question)
            )
        }
    }

    init(chapter: Chapter) {
        self.chapter = chapter
    }

    func loadQuestions() async {
        isLoading = true
        defer { isLoading = false }

        do {
            questions = try await QuizService.shared.fetchQuestions(chapterId: chapter.id)
            questions.shuffle()
        } catch {
            self.error = error
            print("QuizViewModel error: \(error)")
        }
    }

    func selectAnswer(_ answer: String) {
        guard !showAnswer else { return }

        selectedAnswer = answer
        showAnswer = true

        if let question = currentQuestion {
            answers[question.id] = answer
        }
    }

    func nextQuestion() {
        if currentIndex + 1 < questions.count {
            currentIndex += 1
            selectedAnswer = nil
            showAnswer = false
        } else {
            completeQuiz()
        }
    }

    func retry() {
        currentIndex = 0
        selectedAnswer = nil
        showAnswer = false
        isCompleted = false
        answers = [:]
        earnedPoints = 0
        questions.shuffle()
    }

    private func completeQuiz() {
        isCompleted = true
        saveResult()
    }

    private func saveResult() {
        Task {
            guard let userId = AuthService.shared.currentUserId else { return }

            do {
                // 結果を保存
                let answerDetails = questions.map { question in
                    AnswerDetail(
                        questionId: question.id,
                        selected: answers[question.id] ?? "",
                        correct: answers[question.id] == question.correctAnswer
                    )
                }

                let result = TestResultParams(
                    userId: userId,
                    chapterId: chapter.id,
                    subjectId: chapter.subjectId,
                    score: correctCount,
                    total: totalQuestions,
                    answers: AnswerData(details: answerDetails)
                )

                _ = try await QuizService.shared.saveTestResult(result)

                // 80%以上でポイント獲得チェック
                let percentage = Double(correctCount) / Double(totalQuestions) * 100
                if percentage >= 80 {
                    earnedPoints = try await checkAndAwardPoints(userId: userId)
                }

            } catch {
                print("Failed to save result: \(error)")
            }
        }
    }

    private func checkAndAwardPoints(userId: UUID) async throws -> Int {
        let today = DateFormatter.yyyyMMdd.string(from: Date())

        // 今日既にクリアしているかチェック
        struct ClearedCheck: Codable {
            let id: Int
        }

        let existing: [ClearedCheck] = try await supabase
            .from("mukimuki_chapter_clears")
            .select("id")
            .eq("user_id", value: userId)
            .eq("chapter_id", value: chapter.id)
            .eq("cleared_date", value: today)
            .execute()
            .value

        if existing.isEmpty {
            // 今日初めてのクリアなのでポイント付与
            let clearData = ChapterClearInsert(
                userId: userId,
                chapterId: chapter.id,
                clearedDate: today,
                points: 1
            )

            try await supabase
                .from("mukimuki_chapter_clears")
                .insert(clearData)
                .execute()

            return 1
        }

        return 0
    }

    private func getChoiceText(for label: String, in question: Question) -> String {
        switch label {
        case "A": return question.choiceA
        case "B": return question.choiceB
        case "C": return question.choiceC
        case "D": return question.choiceD
        default: return label
        }
    }
}
