import Foundation

/// クエスト画面のViewModel
@MainActor
final class QuestViewModel: ObservableObject {
    @Published var subjects: [Subject] = []
    @Published var chaptersBySubject: [Int: [Chapter]] = [:]
    @Published var latestResults: [Int: TestResult] = [:]
    @Published var clearedTodayIds: Set<Int> = []
    @Published var isLoading = false
    @Published var error: Error?

    func loadData() async {
        isLoading = true
        error = nil

        do {
            // 教科一覧と全章を並列で取得（2回のAPIコール）
            async let subjectsTask = QuizService.shared.fetchSubjects()
            async let chaptersTask = QuizService.shared.fetchAllPublishedChapters()

            let (fetchedSubjects, allChapters) = try await (subjectsTask, chaptersTask)

            subjects = fetchedSubjects

            // 科目ごとにグループ化（クライアント側で処理）
            chaptersBySubject = Dictionary(grouping: allChapters) { $0.subjectId }

            // UIをすぐに表示
            isLoading = false

            // ユーザーデータはバックグラウンドで取得
            if let userId = AuthService.shared.currentUserId {
                await loadUserDataInBackground(userId: userId)
            }

        } catch {
            self.error = error
            self.isLoading = false
            print("QuestViewModel error: \(error)")
        }
    }

    /// ユーザーの進捗データをバックグラウンドで取得
    private func loadUserDataInBackground(userId: UUID) async {
        do {
            // テスト結果と今日のクリアを並列で取得
            async let resultsTask = fetchLatestResults(userId: userId)
            async let clearedTask = fetchClearedToday(userId: userId)

            let (results, cleared) = try await (resultsTask, clearedTask)

            latestResults = results
            clearedTodayIds = cleared

        } catch {
            print("QuestViewModel: failed to load user data - \(error)")
        }
    }

    private func fetchLatestResults(userId: UUID) async throws -> [Int: TestResult] {
        let results: [TestResult] = try await supabase
            .from("mukimuki_test_results")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .execute()
            .value

        // 章ごとの最新結果を抽出
        var latestMap: [Int: TestResult] = [:]
        for result in results {
            if latestMap[result.chapterId] == nil {
                latestMap[result.chapterId] = result
            }
        }
        return latestMap
    }

    private func fetchClearedToday(userId: UUID) async throws -> Set<Int> {
        let today = DateFormatter.yyyyMMdd.string(from: Date())

        struct ClearedChapter: Codable {
            let chapterId: Int

            enum CodingKeys: String, CodingKey {
                case chapterId = "chapter_id"
            }
        }

        let cleared: [ClearedChapter] = try await supabase
            .from("mukimuki_chapter_clears")
            .select("chapter_id")
            .eq("user_id", value: userId)
            .eq("cleared_date", value: today)
            .execute()
            .value

        return Set(cleared.map { $0.chapterId })
    }
}
