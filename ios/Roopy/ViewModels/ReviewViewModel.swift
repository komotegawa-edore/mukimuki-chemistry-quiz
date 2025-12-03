import Foundation

/// 復習画面のViewModel
@MainActor
final class ReviewViewModel: ObservableObject {
    @Published var allQuestions: [Question] = []
    @Published var selectedQuestions: [Question] = []
    @Published var isLoading = false
    @Published var error: Error?

    // クイズ進行状態
    @Published var currentIndex = 0
    @Published var selectedAnswer: String?
    @Published var showAnswer = false
    @Published var isCompleted = false
    @Published var answers: [Int: String] = [:]

    private let reviewQuestionLimit = 20

    var currentQuestion: Question? {
        guard currentIndex < selectedQuestions.count else { return nil }
        return selectedQuestions[currentIndex]
    }

    var correctCount: Int {
        var count = 0
        for question in selectedQuestions {
            if answers[question.id] == question.correctAnswer {
                count += 1
            }
        }
        return count
    }

    var totalQuestions: Int {
        selectedQuestions.count
    }

    func loadData() async {
        guard let userId = AuthService.shared.currentUserId else { return }

        isLoading = true
        error = nil

        do {
            allQuestions = try await QuizService.shared.fetchIncorrectQuestions(userId: userId)
            reshuffleQuestions()
        } catch {
            self.error = error
            print("ReviewViewModel error: \(error)")
        }

        isLoading = false
    }

    func reshuffleQuestions() {
        let shuffled = allQuestions.shuffled()
        selectedQuestions = Array(shuffled.prefix(reviewQuestionLimit))
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
        if currentIndex + 1 < selectedQuestions.count {
            currentIndex += 1
            selectedAnswer = nil
            showAnswer = false
        } else {
            isCompleted = true
        }
    }

    func retry() {
        currentIndex = 0
        selectedAnswer = nil
        showAnswer = false
        isCompleted = false
        answers = [:]
        reshuffleQuestions()
    }

    func reset() {
        currentIndex = 0
        selectedAnswer = nil
        showAnswer = false
        isCompleted = false
        answers = [:]
    }
}
