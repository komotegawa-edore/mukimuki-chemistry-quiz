import Foundation

/// ロードマップ関連のAPI操作を管理するサービス
final class RoadmapService {

    static let shared = RoadmapService()

    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(identifier: "UTC")
        return formatter
    }()

    private let isoFormatter = ISO8601DateFormatter()

    private init() {}

    // MARK: - Roadmap CRUD

    /// アクティブなロードマップを取得
    func fetchActiveRoadmap(userId: UUID) async throws -> UserRoadmap? {
        let response: [UserRoadmap] = try await supabase
            .from("mukimuki_user_roadmaps")
            .select()
            .eq("user_id", value: userId.uuidString)
            .eq("status", value: "active")
            .limit(1)
            .execute()
            .value

        return response.first
    }

    /// ユーザーの全ロードマップを取得
    func fetchRoadmaps(userId: UUID) async throws -> [UserRoadmap] {
        try await supabase
            .from("mukimuki_user_roadmaps")
            .select()
            .eq("user_id", value: userId.uuidString)
            .order("created_at", ascending: false)
            .execute()
            .value
    }

    /// ロードマップを作成
    func createRoadmap(
        userId: UUID,
        params: RoadmapInputParams,
        generatedRoadmap: GeneratedRoadmap
    ) async throws -> UserRoadmap {

        // 1. メインロードマップを作成
        let roadmapParams: [String: AnyJSON] = [
            "user_id": .string(userId.uuidString),
            "current_level": .string(params.currentLevel),
            "current_deviation_value": params.currentDeviationValue.map { .double($0) } ?? .null,
            "weak_areas": .array(params.weakAreas.map { .string($0) }),
            "daily_study_minutes": .integer(params.dailyStudyMinutes),
            "days_until_exam": .integer(params.daysUntilExam),
            "target_university": params.targetUniversity.map { .string($0) } ?? .null,
            "target_level": .string(params.targetLevel),
            "start_stage": .string(generatedRoadmap.startStage),
            "target_stage": .string(generatedRoadmap.targetStage),
            "estimated_completion_date": .string(dateFormatter.string(from: generatedRoadmap.estimatedCompletionDate)),
            "current_stage": .string(generatedRoadmap.startStage)
        ]

        let roadmap: UserRoadmap = try await supabase
            .from("mukimuki_user_roadmaps")
            .insert(roadmapParams)
            .select()
            .single()
            .execute()
            .value

        // 2. ステージを作成
        try await createStages(roadmapId: roadmap.id, stages: generatedRoadmap.stages)

        // 3. 教材を作成し、IDマッピングを取得
        let materialIdMap = try await createMaterials(roadmapId: roadmap.id, materials: generatedRoadmap.materials)

        // 4. デイリータスクを作成
        try await createDailyTasks(roadmapId: roadmap.id, tasks: generatedRoadmap.dailyTasks, materialIdMap: materialIdMap)

        // 5. 進捗ログを記録
        try await logProgress(roadmapId: roadmap.id, taskId: nil, actionType: .roadmapStarted)

        return roadmap
    }

    /// ロードマップを更新
    func updateRoadmap(id: Int, status: RoadmapStatus? = nil, progressPercentage: Double? = nil, currentStage: String? = nil) async throws {
        var updates: [String: AnyJSON] = [:]

        if let status = status {
            updates["status"] = .string(status.rawValue)
        }
        if let progress = progressPercentage {
            updates["progress_percentage"] = .double(progress)
        }
        if let stage = currentStage {
            updates["current_stage"] = .string(stage)
        }
        updates["updated_at"] = .string(isoFormatter.string(from: Date()))

        try await supabase
            .from("mukimuki_user_roadmaps")
            .update(updates)
            .eq("id", value: id)
            .execute()
    }

    /// ロードマップをキャンセル
    func cancelRoadmap(id: Int) async throws {
        try await updateRoadmap(id: id, status: .cancelled)
    }

    // MARK: - Stages

    /// ステージ一覧を取得
    func fetchStages(roadmapId: Int) async throws -> [RoadmapStage] {
        try await supabase
            .from("mukimuki_roadmap_stages")
            .select()
            .eq("roadmap_id", value: roadmapId)
            .order("stage_order")
            .execute()
            .value
    }

    private func createStages(roadmapId: Int, stages: [StageSchedule]) async throws {
        var stageParams: [[String: AnyJSON]] = []

        for (index, stage) in stages.enumerated() {
            stageParams.append([
                "roadmap_id": .integer(roadmapId),
                "stage_id": .string(stage.stageId),
                "stage_order": .integer(index + 1),
                "planned_start_date": .string(dateFormatter.string(from: stage.startDate)),
                "planned_end_date": .string(dateFormatter.string(from: stage.endDate))
            ])
        }

        try await supabase
            .from("mukimuki_roadmap_stages")
            .insert(stageParams)
            .execute()
    }

    /// ステージを更新
    func updateStage(id: Int, status: TaskStatus? = nil, actualStartDate: Date? = nil, actualEndDate: Date? = nil) async throws {
        var updates: [String: AnyJSON] = [:]

        if let status = status {
            updates["status"] = .string(status.rawValue)
        }
        if let startDate = actualStartDate {
            updates["actual_start_date"] = .string(dateFormatter.string(from: startDate))
        }
        if let endDate = actualEndDate {
            updates["actual_end_date"] = .string(dateFormatter.string(from: endDate))
        }
        updates["updated_at"] = .string(isoFormatter.string(from: Date()))

        try await supabase
            .from("mukimuki_roadmap_stages")
            .update(updates)
            .eq("id", value: id)
            .execute()
    }

    // MARK: - Materials

    /// 教材一覧を取得
    func fetchRoadmapMaterials(roadmapId: Int, stageId: String? = nil) async throws -> [RoadmapMaterial] {
        var query = supabase
            .from("mukimuki_roadmap_materials")
            .select("*, material:mukimuki_english_materials(*)")
            .eq("roadmap_id", value: roadmapId)

        if let stageId = stageId {
            query = query.eq("stage_id", value: stageId)
        }

        return try await query
            .order("material_order")
            .execute()
            .value
    }

    /// 進行中の教材を取得（開始日≤今日≤終了日、またはstatus=in_progress）
    func fetchCurrentMaterials(roadmapId: Int) async throws -> [RoadmapMaterial] {
        let today = dateFormatter.string(from: Date())

        // 開始日が今日以前で、終了日が今日以降、かつ完了していない教材
        return try await supabase
            .from("mukimuki_roadmap_materials")
            .select("*, material:mukimuki_english_materials(*)")
            .eq("roadmap_id", value: roadmapId)
            .lte("planned_start_date", value: today)
            .gte("planned_end_date", value: today)
            .neq("status", value: "completed")
            .order("material_order")
            .execute()
            .value
    }

    private func createMaterials(roadmapId: Int, materials: [MaterialSchedule]) async throws -> [Int: Int] {
        var materialParams: [[String: AnyJSON]] = []
        var tempIdToMaterialId: [Int: Int] = [:] // インデックス -> material.id

        for (index, material) in materials.enumerated() {
            materialParams.append([
                "roadmap_id": .integer(roadmapId),
                "stage_id": .string(material.material.stageId),
                "material_id": .integer(material.material.id),
                "material_order": .integer(index + 1),
                "planned_start_date": .string(dateFormatter.string(from: material.startDate)),
                "planned_end_date": .string(dateFormatter.string(from: material.endDate)),
                "total_cycles": .integer(material.cycles)
            ])
            tempIdToMaterialId[material.material.id] = index
        }

        let insertedMaterials: [RoadmapMaterial] = try await supabase
            .from("mukimuki_roadmap_materials")
            .insert(materialParams)
            .select()
            .execute()
            .value

        // material_id -> roadmap_material.id のマッピングを作成
        var materialIdMap: [Int: Int] = [:]
        for insertedMaterial in insertedMaterials {
            materialIdMap[insertedMaterial.materialId] = insertedMaterial.id
        }

        return materialIdMap
    }

    /// 教材を更新
    func updateRoadmapMaterial(id: Int, status: TaskStatus? = nil, currentCycle: Int? = nil) async throws {
        var updates: [String: AnyJSON] = [:]

        if let status = status {
            updates["status"] = .string(status.rawValue)
        }
        if let cycle = currentCycle {
            updates["current_cycle"] = .integer(cycle)
        }
        updates["updated_at"] = .string(isoFormatter.string(from: Date()))

        try await supabase
            .from("mukimuki_roadmap_materials")
            .update(updates)
            .eq("id", value: id)
            .execute()
    }

    // MARK: - Daily Tasks

    /// 今日のタスクを取得
    func fetchTodayTasks(roadmapId: Int) async throws -> [RoadmapDailyTask] {
        let today = dateFormatter.string(from: Date())

        return try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .select()
            .eq("roadmap_id", value: roadmapId)
            .eq("task_date", value: today)
            .order("id")
            .execute()
            .value
    }

    /// 遅延タスクを取得
    func fetchOverdueTasks(roadmapId: Int) async throws -> [RoadmapDailyTask] {
        let today = dateFormatter.string(from: Date())

        return try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .select()
            .eq("roadmap_id", value: roadmapId)
            .lt("task_date", value: today)
            .eq("status", value: "pending")
            .order("task_date")
            .execute()
            .value
    }

    /// 期間指定でタスクを取得
    func fetchTasks(roadmapId: Int, from startDate: Date, to endDate: Date) async throws -> [RoadmapDailyTask] {
        try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .select()
            .eq("roadmap_id", value: roadmapId)
            .gte("task_date", value: dateFormatter.string(from: startDate))
            .lte("task_date", value: dateFormatter.string(from: endDate))
            .order("task_date")
            .execute()
            .value
    }

    /// 全タスクを取得
    func fetchAllTasks(roadmapId: Int) async throws -> [RoadmapDailyTask] {
        try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .select()
            .eq("roadmap_id", value: roadmapId)
            .order("task_date")
            .execute()
            .value
    }

    private func createDailyTasks(roadmapId: Int, tasks: [DailyTaskTemplate], materialIdMap: [Int: Int]) async throws {
        // バッチで作成（500件ずつ）
        let batchSize = 500

        for batchStart in stride(from: 0, to: tasks.count, by: batchSize) {
            let batchEnd = min(batchStart + batchSize, tasks.count)
            let batchTasks = Array(tasks[batchStart..<batchEnd])

            var taskParams: [[String: AnyJSON]] = []

            for task in batchTasks {
                guard let roadmapMaterialId = materialIdMap[task.roadmapMaterialId] else {
                    continue
                }

                var params: [String: AnyJSON] = [
                    "roadmap_id": .integer(roadmapId),
                    "roadmap_material_id": .integer(roadmapMaterialId),
                    "task_date": .string(dateFormatter.string(from: task.date)),
                    "material_name": .string(task.materialName),
                    "estimated_minutes": .integer(task.estimatedMinutes)
                ]

                if let chapterStart = task.chapterStart {
                    params["chapter_start"] = .integer(chapterStart)
                }
                if let chapterEnd = task.chapterEnd {
                    params["chapter_end"] = .integer(chapterEnd)
                }

                taskParams.append(params)
            }

            if !taskParams.isEmpty {
                try await supabase
                    .from("mukimuki_roadmap_daily_tasks")
                    .insert(taskParams)
                    .execute()
            }
        }
    }

    /// タスクを完了としてマーク
    func completeTask(taskId: Int, actualMinutes: Int?, notes: String?) async throws {
        var updates: [String: AnyJSON] = [
            "status": .string("completed"),
            "completed_at": .string(isoFormatter.string(from: Date())),
            "updated_at": .string(isoFormatter.string(from: Date()))
        ]

        if let minutes = actualMinutes {
            updates["actual_minutes"] = .integer(minutes)
        }

        if let notes = notes, !notes.isEmpty {
            updates["notes"] = .string(notes)
        }

        try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .update(updates)
            .eq("id", value: taskId)
            .execute()
    }

    /// タスクをスキップ
    func skipTask(taskId: Int) async throws {
        let updates: [String: AnyJSON] = [
            "status": .string("skipped"),
            "updated_at": .string(isoFormatter.string(from: Date()))
        ]

        try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .update(updates)
            .eq("id", value: taskId)
            .execute()
    }

    /// タスクの完了を取り消し
    func uncompleteTask(taskId: Int) async throws {
        let updates: [String: AnyJSON] = [
            "status": .string("pending"),
            "completed_at": .null,
            "actual_minutes": .null,
            "updated_at": .string(isoFormatter.string(from: Date()))
        ]

        try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .update(updates)
            .eq("id", value: taskId)
            .execute()
    }

    /// ユーザーの今日のタスク（ロードマップIDなしで全て取得）
    func fetchTodayTasksForUser(userId: UUID) async throws -> [RoadmapDailyTask] {
        let today = dateFormatter.string(from: Date())

        // まずアクティブなロードマップを取得
        guard let roadmap = try await fetchActiveRoadmap(userId: userId) else {
            return []
        }

        return try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .select()
            .eq("roadmap_id", value: roadmap.id)
            .eq("task_date", value: today)
            .order("id")
            .execute()
            .value
    }

    /// ユーザーの遅延タスク（ロードマップIDなしで全て取得）
    func fetchOverdueTasksForUser(userId: UUID) async throws -> [RoadmapDailyTask] {
        let today = dateFormatter.string(from: Date())

        // まずアクティブなロードマップを取得
        guard let roadmap = try await fetchActiveRoadmap(userId: userId) else {
            return []
        }

        return try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .select()
            .eq("roadmap_id", value: roadmap.id)
            .lt("task_date", value: today)
            .eq("status", value: "pending")
            .order("task_date")
            .execute()
            .value
    }

    /// タスクを部分完了としてマークし、残りを翌日にリスケジュール
    /// - Parameters:
    ///   - task: 部分完了するタスク
    ///   - completedChapter: 何章まで完了したか
    ///   - actualMinutes: 実際にかかった時間
    ///   - notes: メモ
    /// - Returns: 作成された残りタスク
    func partialCompleteTask(
        task: RoadmapDailyTask,
        completedChapter: Int,
        actualMinutes: Int?,
        notes: String?
    ) async throws -> RoadmapDailyTask? {
        // 1. 現在のタスクを部分完了としてマーク
        var updates: [String: AnyJSON] = [
            "status": .string("completed"),
            "completed_at": .string(isoFormatter.string(from: Date())),
            "completed_chapter": .integer(completedChapter),
            "updated_at": .string(isoFormatter.string(from: Date()))
        ]

        if let minutes = actualMinutes {
            updates["actual_minutes"] = .integer(minutes)
        }

        if let notes = notes, !notes.isEmpty {
            updates["notes"] = .string(notes)
        }

        try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .update(updates)
            .eq("id", value: task.id)
            .execute()

        // 2. 残りの章がある場合、翌日のタスクとして作成
        guard let end = task.chapterEnd, completedChapter < end else {
            return nil
        }

        let remainingChapterStart = completedChapter + 1
        let remainingChapterEnd = end
        let remainingMinutes = task.remainingMinutes(completedChapter: completedChapter)
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()

        let newTaskParams: [String: AnyJSON] = [
            "roadmap_id": .integer(task.roadmapId),
            "roadmap_material_id": .integer(task.roadmapMaterialId),
            "task_date": .string(dateFormatter.string(from: tomorrow)),
            "material_name": .string(task.materialName),
            "chapter_start": .integer(remainingChapterStart),
            "chapter_end": .integer(remainingChapterEnd),
            "chapter_description": .null,
            "estimated_minutes": .integer(max(remainingMinutes, 10)),
            "status": .string("pending"),
            "parent_task_id": .integer(task.id),
            "reschedule_count": .integer(0)
        ]

        let createdTasks: [RoadmapDailyTask] = try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .insert(newTaskParams)
            .select()
            .execute()
            .value

        return createdTasks.first
    }

    /// タスクをリスケジュール
    func rescheduleTask(taskId: Int, newDate: Date, originalDate: Date?, currentRescheduleCount: Int) async throws {
        var updates: [String: AnyJSON] = [
            "task_date": .string(dateFormatter.string(from: newDate)),
            "reschedule_count": .integer(currentRescheduleCount + 1),
            "updated_at": .string(isoFormatter.string(from: Date()))
        ]

        if let original = originalDate {
            updates["original_date"] = .string(dateFormatter.string(from: original))
        }

        try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .update(updates)
            .eq("id", value: taskId)
            .execute()
    }

    // MARK: - Progress

    /// 進捗を計算して更新
    func calculateAndUpdateProgress(roadmapId: Int) async throws -> Double {
        let tasks = try await fetchAllTasks(roadmapId: roadmapId)

        let total = tasks.count
        let completed = tasks.filter { $0.status == .completed }.count

        let progress = total > 0 ? (Double(completed) / Double(total)) * 100 : 0

        try await updateRoadmap(id: roadmapId, progressPercentage: progress)

        return progress
    }

    /// 進捗ログを記録
    func logProgress(roadmapId: Int, taskId: Int?, actionType: ProgressActionType, details: [String: Any]? = nil) async throws {
        var params: [String: AnyJSON] = [
            "roadmap_id": .integer(roadmapId),
            "action_type": .string(actionType.rawValue)
        ]

        if let taskId = taskId {
            params["daily_task_id"] = .integer(taskId)
        }

        if let details = details, let jsonData = try? JSONSerialization.data(withJSONObject: details),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            params["details"] = .string(jsonString)
        }

        try await supabase
            .from("mukimuki_roadmap_progress_logs")
            .insert(params)
            .execute()
    }

    // MARK: - Summary

    /// ロードマップサマリーを取得
    func fetchRoadmapSummary(roadmap: UserRoadmap) async throws -> RoadmapSummary {
        async let stages = fetchStages(roadmapId: roadmap.id)
        async let todayTasks = fetchTodayTasks(roadmapId: roadmap.id)
        async let overdueTasks = fetchOverdueTasks(roadmapId: roadmap.id)
        async let currentMaterials = fetchCurrentMaterials(roadmapId: roadmap.id)

        return try await RoadmapSummary(
            roadmap: roadmap,
            stages: stages,
            todayTasks: todayTasks,
            overdueTasks: overdueTasks,
            currentMaterials: currentMaterials
        )
    }
}

// MARK: - AnyJSON Helper

enum AnyJSON: Encodable {
    case string(String)
    case integer(Int)
    case double(Double)
    case bool(Bool)
    case array([AnyJSON])
    case dictionary([String: AnyJSON])
    case null

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let value):
            try container.encode(value)
        case .integer(let value):
            try container.encode(value)
        case .double(let value):
            try container.encode(value)
        case .bool(let value):
            try container.encode(value)
        case .array(let value):
            try container.encode(value)
        case .dictionary(let value):
            try container.encode(value)
        case .null:
            try container.encodeNil()
        }
    }
}
