import Foundation
import Combine

/// ホーム画面のViewModel
@MainActor
final class HomeViewModel: ObservableObject {
    @Published var announcements: [Announcement] = []
    @Published var dailyMission: DailyMission?
    @Published var badges: [UserBadge] = []
    @Published var totalPoints: Int = 0
    @Published var todayTasks: [RoadmapDailyTask] = []
    @Published var overdueTasks: [RoadmapDailyTask] = []
    @Published var activeRoadmap: UserRoadmap?
    @Published var currentMaterials: [RoadmapMaterial] = []
    @Published var isLoading = false
    @Published var error: Error?

    private let roadmapService = RoadmapService.shared

    /// 今日の未完了タスク数
    var pendingTaskCount: Int {
        todayTasks.filter { $0.status != .completed }.count
    }

    /// 今日の完了タスク数
    var completedTaskCount: Int {
        todayTasks.filter { $0.status == .completed }.count
    }

    /// 今日の進捗率
    var todayProgress: Double {
        guard !todayTasks.isEmpty else { return 0 }
        return Double(completedTaskCount) / Double(todayTasks.count)
    }

    /// 今日の残り予想時間
    var remainingMinutes: Int {
        todayTasks
            .filter { $0.status != .completed }
            .reduce(0) { $0 + $1.estimatedMinutes }
    }

    func loadData() async {
        isLoading = true
        defer { isLoading = false }

        guard let userId = AuthService.shared.currentUserId else { return }

        async let announcementsTask = fetchAnnouncements()
        async let missionsTask = fetchDailyMission(userId: userId)
        async let badgesTask = fetchBadges(userId: userId)
        async let pointsTask = fetchTotalPoints(userId: userId)
        async let tasksTask = fetchTodayTasks(userId: userId)
        async let roadmapTask = fetchActiveRoadmap(userId: userId)

        do {
            announcements = try await announcementsTask
            dailyMission = try await missionsTask
            badges = try await badgesTask
            totalPoints = try await pointsTask
            let (today, overdue) = try await tasksTask
            todayTasks = today
            overdueTasks = overdue
            activeRoadmap = try await roadmapTask

            // 現在取り組み中の教材を取得
            if let roadmap = activeRoadmap {
                currentMaterials = try await roadmapService.fetchCurrentMaterials(roadmapId: roadmap.id)
            }
        } catch {
            self.error = error
            print("HomeViewModel error: \(error)")
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

    private func fetchTodayTasks(userId: UUID) async throws -> (today: [RoadmapDailyTask], overdue: [RoadmapDailyTask]) {
        async let today = roadmapService.fetchTodayTasksForUser(userId: userId)
        async let overdue = roadmapService.fetchOverdueTasksForUser(userId: userId)
        return try await (today, overdue)
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
            if let index = todayTasks.firstIndex(where: { $0.id == task.id }) {
                todayTasks[index].status = .completed
                todayTasks[index].completedAt = Date()
                todayTasks[index].actualMinutes = actualMinutes
            }
        } catch {
            self.error = error
        }
    }

    /// タスクの完了を取り消し
    func uncompleteTask(_ task: RoadmapDailyTask) async {
        do {
            try await roadmapService.uncompleteTask(taskId: task.id)
            // ローカル状態更新
            if let index = todayTasks.firstIndex(where: { $0.id == task.id }) {
                todayTasks[index].status = .pending
                todayTasks[index].completedAt = nil
                todayTasks[index].actualMinutes = nil
            }
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
            if let index = todayTasks.firstIndex(where: { $0.id == task.id }) {
                todayTasks[index].status = .completed
                todayTasks[index].completedAt = Date()
                todayTasks[index].actualMinutes = actualMinutes
                todayTasks[index].completedChapter = completedChapter
            }
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
