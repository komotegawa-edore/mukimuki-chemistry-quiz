import Foundation
import Combine

/// ホーム画面のViewModel
@MainActor
final class HomeViewModel: ObservableObject {
    @Published var announcements: [Announcement] = []
    @Published var dailyMission: DailyMission?
    @Published var badges: [UserBadge] = []
    @Published var totalPoints: Int = 0
    @Published var nextTasks: [RoadmapDailyTask] = []  // 次にやるべきタスク（未完了の最も早いもの）
    @Published var activeRoadmap: UserRoadmap?
    @Published var currentMaterials: [RoadmapMaterial] = []
    @Published var allTasks: [RoadmapDailyTask] = []  // 全タスク（進捗計算用）
    @Published var isLoading = false
    @Published var error: Error?

    private let roadmapService = RoadmapService.shared

    /// 教材ごとの進捗率を取得
    func progressForMaterial(_ materialId: Int) -> Double {
        let materialTasks = allTasks.filter { $0.roadmapMaterialId == materialId }
        guard !materialTasks.isEmpty else { return 0 }
        let completedCount = materialTasks.filter { $0.status == .completed || $0.status == .skipped }.count
        return Double(completedCount) / Double(materialTasks.count)
    }

    /// 教材ごとの完了タスク数を取得
    func completedTaskCountForMaterial(_ materialId: Int) -> Int {
        allTasks.filter { $0.roadmapMaterialId == materialId && ($0.status == .completed || $0.status == .skipped) }.count
    }

    /// 教材ごとの総タスク数を取得
    func totalTaskCountForMaterial(_ materialId: Int) -> Int {
        allTasks.filter { $0.roadmapMaterialId == materialId }.count
    }

    /// 教材ごとの残り日数を動的計算
    func daysRemainingForMaterial(_ materialId: Int) -> Int {
        let materialTasks = allTasks.filter { $0.roadmapMaterialId == materialId }
        guard !materialTasks.isEmpty else { return 0 }

        let completedCount = materialTasks.filter { $0.status == .completed || $0.status == .skipped }.count
        let remainingCount = materialTasks.count - completedCount

        // 全部終わっていたら0日
        if remainingCount == 0 { return 0 }

        // 1日あたりの平均タスク数を計算
        let tasksByDate = Dictionary(grouping: materialTasks) { task -> String in
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            return formatter.string(from: task.taskDate)
        }
        let avgTasksPerDay = max(1.0, Double(materialTasks.count) / Double(max(1, tasksByDate.count)))

        // 残りタスク数 ÷ 1日あたりタスク数 = 残り日数
        return Int(ceil(Double(remainingCount) / avgTasksPerDay))
    }

    /// 次のタスク数
    var nextTaskCount: Int {
        nextTasks.count
    }

    /// 次のタスクの予想時間
    var nextTasksMinutes: Int {
        nextTasks.reduce(0) { $0 + $1.estimatedMinutes }
    }

    /// 次のタスクの日付テキスト
    var nextTaskDateText: String {
        guard let firstTask = nextTasks.first else { return "なし" }
        let calendar = Calendar.current
        if calendar.isDateInToday(firstTask.taskDate) {
            return "今日"
        } else if calendar.isDateInTomorrow(firstTask.taskDate) {
            return "明日"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "M/d"
            return formatter.string(from: firstTask.taskDate)
        }
    }

    func loadData() async {
        isLoading = true
        defer { isLoading = false }

        guard let userId = AuthService.shared.currentUserId else { return }

        async let announcementsTask = fetchAnnouncements()
        async let missionsTask = fetchDailyMission(userId: userId)
        async let badgesTask = fetchBadges(userId: userId)
        async let pointsTask = fetchTotalPoints(userId: userId)
        async let roadmapTask = fetchActiveRoadmap(userId: userId)

        do {
            announcements = try await announcementsTask
            dailyMission = try await missionsTask
            badges = try await badgesTask
            totalPoints = try await pointsTask
            activeRoadmap = try await roadmapTask

            // 現在取り組み中の教材とタスクを取得
            if let roadmap = activeRoadmap {
                currentMaterials = try await roadmapService.fetchCurrentMaterials(roadmapId: roadmap.id)
                allTasks = try await roadmapService.fetchAllTasks(roadmapId: roadmap.id)

                print("📚 HomeViewModel: currentMaterials count = \(currentMaterials.count)")
                print("📚 HomeViewModel: allTasks count = \(allTasks.count)")

                // 次にやるべきタスクを計算（未完了で最も早い日付のタスク）
                nextTasks = calculateNextTasks()
                print("📚 HomeViewModel: nextTasks count = \(nextTasks.count)")
            }
        } catch {
            self.error = error
            print("HomeViewModel error: \(error)")
        }
    }

    /// 次にやるべきタスクを計算（未完了の最も早い日付のタスク群）
    private func calculateNextTasks() -> [RoadmapDailyTask] {
        // 未完了タスクを日付順にソート
        let pendingTasks = allTasks
            .filter { $0.status != .completed && $0.status != .skipped }
            .sorted { $0.taskDate < $1.taskDate }

        guard let firstTask = pendingTasks.first else { return [] }

        // 最も早い日付のタスクをすべて取得
        let calendar = Calendar.current
        return pendingTasks.filter {
            calendar.isDate($0.taskDate, inSameDayAs: firstTask.taskDate)
        }
    }

    func refresh() async {
        await loadData()
    }

    // MARK: - Private Methods

    private func fetchAnnouncements() async throws -> [Announcement] {
        let now = ISO8601DateFormatter().string(from: Date())
        let announcements: [Announcement] = try await supabase
            .from("mukimuki_announcements")
            .select()
            .eq("is_published", value: true)
            .lte("valid_from", value: now)
            .order("created_at", ascending: false)
            .limit(5)
            .execute()
            .value
        return announcements
    }

    private func fetchDailyMission(userId: UUID) async throws -> DailyMission? {
        let today = DateFormatter.yyyyMMdd.string(from: Date())
        let missions: [DailyMission] = try await supabase
            .from("mukimuki_daily_missions")
            .select("*, chapter:mukimuki_chapters(*)")
            .eq("user_id", value: userId)
            .eq("mission_date", value: today)
            .eq("status", value: "active")
            .order("mission_number")
            .limit(1)
            .execute()
            .value
        return missions.first
    }

    private func fetchBadges(userId: UUID) async throws -> [UserBadge] {
        let badges: [UserBadge] = try await supabase
            .from("mukimuki_user_badges")
            .select("*, badge:mukimuki_badges(*)")
            .eq("user_id", value: userId)
            .order("earned_at", ascending: false)
            .limit(6)
            .execute()
            .value
        return badges
    }

    private func fetchTotalPoints(userId: UUID) async throws -> Int {
        // チャプタークリアポイント
        let chapterClears: [ChapterClear] = try await supabase
            .from("mukimuki_chapter_clears")
            .select("points")
            .eq("user_id", value: userId)
            .execute()
            .value

        // ログインボーナスポイント
        let loginBonuses: [LoginBonus] = try await supabase
            .from("mukimuki_login_bonuses")
            .select("points")
            .eq("user_id", value: userId)
            .execute()
            .value

        let chapterPoints = chapterClears.reduce(0) { $0 + $1.points }
        let loginPoints = loginBonuses.reduce(0) { $0 + $1.points }

        return chapterPoints + loginPoints
    }

    private func fetchActiveRoadmap(userId: UUID) async throws -> UserRoadmap? {
        try await roadmapService.fetchActiveRoadmap(userId: userId)
    }

    // MARK: - Task Actions

    /// タスクを完了
    func completeTask(_ task: RoadmapDailyTask, actualMinutes: Int?, notes: String?) async {
        do {
            try await roadmapService.completeTask(
                taskId: task.id,
                actualMinutes: actualMinutes,
                notes: notes
            )
            // ローカル状態更新
            if let index = allTasks.firstIndex(where: { $0.id == task.id }) {
                allTasks[index].status = .completed
                allTasks[index].completedAt = Date()
                allTasks[index].actualMinutes = actualMinutes
            }
            // 次のタスクを再計算
            nextTasks = calculateNextTasks()
        } catch {
            self.error = error
        }
    }

    /// タスクの完了を取り消し
    func uncompleteTask(_ task: RoadmapDailyTask) async {
        do {
            try await roadmapService.uncompleteTask(taskId: task.id)
            // ローカル状態更新
            if let index = allTasks.firstIndex(where: { $0.id == task.id }) {
                allTasks[index].status = .pending
                allTasks[index].completedAt = nil
                allTasks[index].actualMinutes = nil
            }
            // 次のタスクを再計算
            nextTasks = calculateNextTasks()
        } catch {
            self.error = error
        }
    }

    /// タスクを部分完了（残りは明日へ）
    func partialCompleteTask(_ task: RoadmapDailyTask, completedChapter: Int, actualMinutes: Int?, notes: String?) async {
        do {
            _ = try await roadmapService.partialCompleteTask(
                task: task,
                completedChapter: completedChapter,
                actualMinutes: actualMinutes,
                notes: notes
            )
            // ローカル状態更新
            if let index = allTasks.firstIndex(where: { $0.id == task.id }) {
                allTasks[index].status = .completed
                allTasks[index].completedAt = Date()
                allTasks[index].actualMinutes = actualMinutes
                allTasks[index].completedChapter = completedChapter
            }
            // 次のタスクを再計算
            nextTasks = calculateNextTasks()
        } catch {
            self.error = error
        }
    }
}

// MARK: - Additional Models

struct Announcement: Codable, Identifiable {
    let id: Int
    let title: String
    let content: String
    let priority: String
    let isPublished: Bool
    let validFrom: Date?
    let validUntil: Date?
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id, title, content, priority
        case isPublished = "is_published"
        case validFrom = "valid_from"
        case validUntil = "valid_until"
        case createdAt = "created_at"
    }
}

struct DailyMission: Codable, Identifiable {
    let id: Int
    let userId: UUID
    let chapterId: Int
    let missionDate: String
    let timeLimitSeconds: Int?
    let rewardPoints: Int?
    let status: String?
    let completedAt: Date?
    let missionNumber: Int?
    let chapter: Chapter?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case chapterId = "chapter_id"
        case missionDate = "mission_date"
        case timeLimitSeconds = "time_limit_seconds"
        case rewardPoints = "reward_points"
        case status
        case completedAt = "completed_at"
        case missionNumber = "mission_number"
        case chapter
    }
}

struct UserBadge: Codable, Identifiable {
    let id: Int
    let userId: UUID
    let badgeId: Int
    let earnedAt: Date?
    let badge: Badge?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case badgeId = "badge_id"
        case earnedAt = "earned_at"
        case badge
    }
}

struct Badge: Codable, Identifiable {
    let id: Int
    let name: String
    let description: String
    let icon: String
    let category: String
    let color: String?
}

struct ChapterClear: Codable {
    let points: Int
}

struct LoginBonus: Codable {
    let points: Int
}

// MARK: - Date Formatter Extension

extension DateFormatter {
    static let yyyyMMdd: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()
}
