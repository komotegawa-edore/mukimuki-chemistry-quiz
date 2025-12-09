import Foundation

/// 履歴画面のViewModel
@MainActor
final class HistoryViewModel: ObservableObject {
    @Published var results: [TestResult] = []
    @Published var isLoading = false
    @Published var error: Error?

    private let quizService = QuizService.shared

    /// 履歴を読み込み
    func loadHistory() async {
        guard let userId = AuthService.shared.currentUserId else { return }

        isLoading = true
        error = nil

        do {
            results = try await quizService.fetchTestHistory(userId: userId, limit: 100)
        } catch {
            self.error = error
            print("HistoryViewModel error: \(error)")
        }

        isLoading = false
    }

    /// 統計情報
    var totalTests: Int {
        results.count
    }

    var averageScore: Int {
        guard !results.isEmpty else { return 0 }
        let total = results.reduce(0.0) { $0 + $1.percentage }
        return Int(total / Double(results.count))
    }

    var passedTests: Int {
        results.filter { $0.percentage >= 80 }.count
    }

    var passRate: Int {
        guard !results.isEmpty else { return 0 }
        return passedTests * 100 / results.count
    }
}
