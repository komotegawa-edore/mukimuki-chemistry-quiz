import Foundation

/// クイズ関連のサービス
final class QuizService {
    static let shared = QuizService()
    private init() {}

    // MARK: - Subjects

    /// 全科目を取得
    func fetchSubjects() async throws -> [Subject] {
        let subjects: [Subject] = try await supabase
            .from("mukimuki_subjects")
            .select()
            .order("display_order")
            .execute()
            .value
        return subjects
    }

    // MARK: - Chapters

    /// 科目の章一覧を取得
    func fetchChapters(subjectId: Int) async throws -> [Chapter] {
        let chapters: [Chapter] = try await supabase
            .from("mukimuki_chapters")
            .select()
            .eq("subject_id", value: subjectId)
            .eq("is_published", value: true)
            .order("order_num")
            .execute()
            .value
        return chapters
    }

    /// 全科目の公開中の章を一括取得
    func fetchAllPublishedChapters() async throws -> [Chapter] {
        let chapters: [Chapter] = try await supabase
            .from("mukimuki_chapters")
            .select()
            .eq("is_published", value: true)
            .order("order_num")
            .execute()
            .value
        return chapters
    }

    /// 全章を取得（講師用）
    func fetchAllChapters(subjectId: Int) async throws -> [Chapter] {
        let chapters: [Chapter] = try await supabase
            .from("mukimuki_chapters")
            .select()
            .eq("subject_id", value: subjectId)
            .order("order_num")
            .execute()
            .value
        return chapters
    }

    // MARK: - Questions

    /// 章の問題一覧を取得
    func fetchQuestions(chapterId: Int) async throws -> [Question] {
        let questions: [Question] = try await supabase
            .from("mukimuki_questions")
            .select()
            .eq("chapter_id", value: chapterId)
            .eq("is_published", value: true)
            .execute()
            .value
        return questions
    }

    /// 章の全問題を取得（講師用）
    func fetchAllQuestions(chapterId: Int) async throws -> [Question] {
        let questions: [Question] = try await supabase
            .from("mukimuki_questions")
            .select()
            .eq("chapter_id", value: chapterId)
            .execute()
            .value
        return questions
    }

    /// ランダムに問題を取得
    func fetchRandomQuestions(chapterId: Int, count: Int) async throws -> [Question] {
        let allQuestions = try await fetchQuestions(chapterId: chapterId)
        return Array(allQuestions.shuffled().prefix(count))
    }

    // MARK: - Test Results

    /// テスト結果を保存
    func saveTestResult(_ result: TestResultParams) async throws -> TestResult {
        let savedResult: TestResult = try await supabase
            .from("mukimuki_test_results")
            .insert(result)
            .select()
            .single()
            .execute()
            .value
        return savedResult
    }

    /// ユーザーのテスト結果履歴を取得
    func fetchTestHistory(userId: UUID, limit: Int = 20) async throws -> [TestResult] {
        let results: [TestResult] = try await supabase
            .from("mukimuki_test_results")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .limit(limit)
            .execute()
            .value
        return results
    }

    /// 章ごとの最高スコアを取得
    func fetchBestScores(userId: UUID, subjectId: Int) async throws -> [Int: TestResult] {
        let results: [TestResult] = try await supabase
            .from("mukimuki_test_results")
            .select()
            .eq("user_id", value: userId)
            .eq("subject_id", value: subjectId)
            .execute()
            .value

        // 章ごとに最高スコアを抽出
        var bestScores: [Int: TestResult] = [:]
        for result in results {
            if let existing = bestScores[result.chapterId] {
                if result.percentage > existing.percentage {
                    bestScores[result.chapterId] = result
                }
            } else {
                bestScores[result.chapterId] = result
            }
        }
        return bestScores
    }

    // MARK: - Review (復習)

    /// 間違えた問題を取得
    func fetchIncorrectQuestions(userId: UUID) async throws -> [Question] {
        // 1. ユーザーのテスト結果を取得
        let results: [TestResult] = try await supabase
            .from("mukimuki_test_results")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value

        // 2. 間違えた問題IDを抽出
        var incorrectQuestionIds = Set<Int>()
        var questionCorrectAnswers: [Int: String] = [:]

        for result in results {
            guard let answers = result.answers,
                  let details = answers.details else { continue }
            for detail in details {
                if !detail.correct {
                    incorrectQuestionIds.insert(detail.questionId)
                }
            }
        }

        if incorrectQuestionIds.isEmpty {
            return []
        }

        // 3. 公開中の章IDを取得
        let chapters: [Chapter] = try await supabase
            .from("mukimuki_chapters")
            .select("id")
            .eq("is_published", value: true)
            .execute()
            .value

        let publishedChapterIds = Set(chapters.map { $0.id })

        // 4. 問題の詳細を取得
        let questions: [Question] = try await supabase
            .from("mukimuki_questions")
            .select()
            .in("id", values: Array(incorrectQuestionIds))
            .eq("is_published", value: true)
            .execute()
            .value

        // 5. 公開中の章に属する問題のみフィルタ
        let filteredQuestions = questions.filter { publishedChapterIds.contains($0.chapterId) }

        return filteredQuestions
    }
}
