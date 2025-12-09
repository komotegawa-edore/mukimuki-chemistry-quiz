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
        print("🔍 fetchActiveRoadmap: userId=\(userId)")

        // まず全ロードマップを確認（デバッグ用）
        let allRoadmaps: [UserRoadmap] = try await supabase
            .from("mukimuki_user_roadmaps")
            .select()
            .eq("user_id", value: userId.uuidString)
            .execute()
            .value

        print("📋 All roadmaps for user: \(allRoadmaps.count)")
        for rm in allRoadmaps {
            print("   - id=\(rm.id), status=\(rm.status.rawValue), progress=\(rm.progressPercentage)")
        }

        let response: [UserRoadmap] = try await supabase
            .from("mukimuki_user_roadmaps")
            .select()
            .eq("user_id", value: userId.uuidString)
            .eq("status", value: "active")
            .order("created_at", ascending: false)
            .limit(1)
            .execute()
            .value

        print("✅ Active roadmaps found: \(response.count)")
        if let first = response.first {
            print("   Using roadmap id=\(first.id)")
        }
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
        print("🚀 createRoadmap started")
        print("   - stages: \(generatedRoadmap.stages.count)")
        print("   - materials: \(generatedRoadmap.materials.count)")
        print("   - dailyTasks: \(generatedRoadmap.dailyTasks.count)")

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
            "current_stage": .string(generatedRoadmap.startStage),
            "status": .string("active"),
            "progress_percentage": .double(0)
        ]

        print("📝 Inserting roadmap with params: \(roadmapParams)")
        let roadmap: UserRoadmap
        do {
            roadmap = try await supabase
                .from("mukimuki_user_roadmaps")
                .insert(roadmapParams)
                .select()
                .single()
                .execute()
                .value
            print("✅ Roadmap inserted: id=\(roadmap.id)")
        } catch {
            print("❌ Failed to insert roadmap: \(error)")
            throw error
        }

        // 2. ステージを作成
        do {
            try await createStages(roadmapId: roadmap.id, stages: generatedRoadmap.stages)
            print("✅ Stages created")
        } catch {
            print("❌ Failed to create stages: \(error)")
            throw error
        }

        // 3. 教材を作成し、IDマッピングを取得
        let materialIdMap: [Int: Int]
        do {
            materialIdMap = try await createMaterials(roadmapId: roadmap.id, materials: generatedRoadmap.materials)
            print("✅ Materials created, map: \(materialIdMap)")
        } catch {
            print("❌ Failed to create materials: \(error)")
            throw error
        }

        // 4. デイリータスクを作成
        do {
            try await createDailyTasks(roadmapId: roadmap.id, tasks: generatedRoadmap.dailyTasks, materialIdMap: materialIdMap)
            print("✅ Daily tasks created")
        } catch {
            print("❌ Failed to create daily tasks: \(error)")
            throw error
        }

        // 5. 進捗ログを記録
        do {
            try await logProgress(roadmapId: roadmap.id, taskId: nil, actionType: .roadmapStarted)
            print("✅ Progress log created")
        } catch {
            print("❌ Failed to log progress: \(error)")
            throw error
        }

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
        // 空配列の場合はスキップ
        guard !stages.isEmpty else {
            print("⚠️ createStages: stages is empty, skipping")
            return
        }

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

        print("📝 createStages: inserting \(stageParams.count) stages")
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

    /// 進行中の教材を取得（完了していない教材を表示）
    func fetchCurrentMaterials(roadmapId: Int) async throws -> [RoadmapMaterial] {
        print("📚 fetchCurrentMaterials: roadmapId=\(roadmapId)")

        // 完了していない教材をすべて取得
        let materials: [RoadmapMaterial] = try await supabase
            .from("mukimuki_roadmap_materials")
            .select("*, material:mukimuki_english_materials(*)")
            .eq("roadmap_id", value: roadmapId)
            .neq("status", value: "completed")
            .order("material_order")
            .execute()
            .value

        print("📚 fetchCurrentMaterials: DB returned \(materials.count) materials")
        for m in materials {
            print("  - \(m.material?.materialName ?? "?") | category=\(m.material?.materialCategory ?? "?") | status=\(m.status)")
        }

        return materials
    }

    private func createMaterials(roadmapId: Int, materials: [MaterialSchedule]) async throws -> [Int: Int] {
        // 空配列の場合は空のマップを返す
        guard !materials.isEmpty else {
            print("⚠️ createMaterials: materials is empty, skipping")
            return [:]
        }

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

        print("📝 createMaterials: inserting \(materialParams.count) materials")
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

    /// 教材をスキップ（削除扱い）
    func skipMaterial(materialId: Int) async throws {
        // 1. 教材のステータスをskippedに更新
        try await updateRoadmapMaterial(id: materialId, status: .skipped, currentCycle: nil)

        // 2. 関連する未完了タスクもスキップ
        try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .update([
                "status": AnyJSON.string("skipped"),
                "updated_at": AnyJSON.string(isoFormatter.string(from: Date()))
            ])
            .eq("roadmap_material_id", value: materialId)
            .eq("status", value: "pending")
            .execute()

        print("✅ Material skipped: \(materialId)")
    }

    /// 教材を別の教材に変更
    func replaceMaterial(roadmapMaterialId: Int, newMaterialId: Int, roadmapId: Int) async throws {
        // 1. 現在の教材情報を取得
        let currentMaterials: [RoadmapMaterial] = try await supabase
            .from("mukimuki_roadmap_materials")
            .select("*, material:mukimuki_english_materials(*)")
            .eq("id", value: roadmapMaterialId)
            .execute()
            .value

        guard let currentMaterial = currentMaterials.first else {
            throw NSError(domain: "RoadmapService", code: 404, userInfo: [NSLocalizedDescriptionKey: "教材が見つかりません"])
        }

        // 2. 新しい教材情報を取得
        let newMaterials: [EnglishMaterial] = try await supabase
            .from("mukimuki_english_materials")
            .select()
            .eq("id", value: newMaterialId)
            .execute()
            .value

        guard let newMaterial = newMaterials.first else {
            throw NSError(domain: "RoadmapService", code: 404, userInfo: [NSLocalizedDescriptionKey: "新しい教材が見つかりません"])
        }

        // 3. 教材IDを更新
        try await supabase
            .from("mukimuki_roadmap_materials")
            .update([
                "material_id": AnyJSON.integer(newMaterialId),
                "updated_at": AnyJSON.string(isoFormatter.string(from: Date()))
            ])
            .eq("id", value: roadmapMaterialId)
            .execute()

        // 4. 関連する未完了タスクのタスク名を更新
        let taskPrefix = newMaterial.materialName
        try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .update([
                "task_name": AnyJSON.string(taskPrefix),
                "updated_at": AnyJSON.string(isoFormatter.string(from: Date()))
            ])
            .eq("roadmap_material_id", value: roadmapMaterialId)
            .eq("status", value: "pending")
            .execute()

        print("✅ Material replaced: \(roadmapMaterialId) -> \(newMaterialId)")
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
        print("📝 createDailyTasks: \(tasks.count) tasks, materialIdMap: \(materialIdMap)")

        // 空配列の場合はスキップ
        guard !tasks.isEmpty else {
            print("⚠️ createDailyTasks: tasks is empty, skipping")
            return
        }

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
        // 1. タスクを完了にする
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

        // 2. このタスクの情報を取得
        let tasks: [RoadmapDailyTask] = try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .select()
            .eq("id", value: taskId)
            .execute()
            .value

        guard let task = tasks.first else { return }

        // 3. 同じ教材の全タスクを確認
        try await checkAndUpdateMaterialCompletion(roadmapMaterialId: task.roadmapMaterialId)
    }

    /// 教材の全タスクが完了したかチェックし、完了していれば教材ステータスを更新
    private func checkAndUpdateMaterialCompletion(roadmapMaterialId: Int) async throws {
        // この教材に紐づく全タスクを取得
        let allTasks: [RoadmapDailyTask] = try await supabase
            .from("mukimuki_roadmap_daily_tasks")
            .select()
            .eq("roadmap_material_id", value: roadmapMaterialId)
            .execute()
            .value

        // 全タスクが completed または skipped なら教材も完了
        let allDone = allTasks.allSatisfy { $0.status == .completed || $0.status == .skipped }

        if allDone && !allTasks.isEmpty {
            print("✅ All tasks completed for material \(roadmapMaterialId), updating material status")
            try await updateRoadmapMaterial(id: roadmapMaterialId, status: .completed, currentCycle: nil)
        }
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

    // MARK: - Stage Addition (B案: 段階的アプローチ)

    /// 指定ステージの教材を取得
    func fetchMaterialsForStage(stageId: String) async throws -> [EnglishMaterial] {
        try await supabase
            .from("mukimuki_english_materials")
            .select()
            .eq("stage_id", value: stageId)
            .eq("is_published", value: true)
            .order("display_order")
            .execute()
            .value
    }

    /// 既存ロードマップに新しいステージを追加
    func addStageToRoadmap(
        roadmapId: Int,
        stageId: String,
        materials: [EnglishMaterial],
        dailyMinutes: Int
    ) async throws {
        print("📝 addStageToRoadmap: roadmapId=\(roadmapId), stageId=\(stageId), materials=\(materials.count)")

        // 1. 既存の最終日を取得
        let existingMaterials = try await fetchRoadmapMaterials(roadmapId: roadmapId, stageId: nil)
        let lastEndDate = existingMaterials.map { $0.plannedEndDate }.max() ?? Date()

        // 開始日は最終日の翌日
        var currentStartDate = Calendar.current.date(byAdding: .day, value: 1, to: lastEndDate) ?? Date()

        // 2. 新しいステージを作成
        let existingStages = try await fetchStages(roadmapId: roadmapId)
        let newStageOrder = (existingStages.map { $0.stageOrder }.max() ?? 0) + 1

        // ステージの終了日は全教材の最大終了日で後で更新
        var stageEndDate = currentStartDate

        // 3. 教材を作成
        var materialIdMap: [Int: Int] = [:]
        let existingMaterialCount = existingMaterials.count

        for (index, material) in materials.enumerated() {
            let cycles = material.recommendedCycles ?? 1
            let totalDays = calculateMaterialDays(material: material, dailyMinutes: dailyMinutes, cycles: cycles)
            let endDate = Calendar.current.date(byAdding: .day, value: totalDays, to: currentStartDate) ?? currentStartDate

            let materialParams: [String: AnyJSON] = [
                "roadmap_id": .integer(roadmapId),
                "stage_id": .string(stageId),
                "material_id": .integer(material.id),
                "material_order": .integer(existingMaterialCount + index + 1),
                "planned_start_date": .string(dateFormatter.string(from: currentStartDate)),
                "planned_end_date": .string(dateFormatter.string(from: endDate)),
                "total_cycles": .integer(cycles)
            ]

            let insertedMaterial: [RoadmapMaterial] = try await supabase
                .from("mukimuki_roadmap_materials")
                .insert(materialParams)
                .select()
                .execute()
                .value

            if let inserted = insertedMaterial.first {
                materialIdMap[material.id] = inserted.id
            }

            // 並行カテゴリ（英単語、英熟語）は開始日を変えない
            let parallelCategories: Set<String> = ["英単語", "英熟語"]
            if !parallelCategories.contains(material.materialCategory) {
                currentStartDate = endDate
            }

            if endDate > stageEndDate {
                stageEndDate = endDate
            }
        }

        // 4. ステージレコードを作成
        let stageParams: [String: AnyJSON] = [
            "roadmap_id": .integer(roadmapId),
            "stage_id": .string(stageId),
            "stage_order": .integer(newStageOrder),
            "planned_start_date": .string(dateFormatter.string(from: Calendar.current.date(byAdding: .day, value: 1, to: lastEndDate) ?? Date())),
            "planned_end_date": .string(dateFormatter.string(from: stageEndDate))
        ]

        try await supabase
            .from("mukimuki_roadmap_stages")
            .insert(stageParams)
            .execute()

        // 5. デイリータスクを生成
        try await generateAndInsertDailyTasks(
            roadmapId: roadmapId,
            materials: materials,
            materialIdMap: materialIdMap,
            startDate: Calendar.current.date(byAdding: .day, value: 1, to: lastEndDate) ?? Date(),
            dailyMinutes: dailyMinutes
        )

        // 6. 進捗ログを記録
        try await logProgress(roadmapId: roadmapId, taskId: nil, actionType: .stageStarted, details: ["stage_id": stageId])

        print("✅ Stage \(stageId) added successfully")
    }

    /// 教材の所要日数を計算（公開版）
    func calculateMaterialDays(material: EnglishMaterial, dailyMinutes: Int, cycles: Int) -> Int {
        // 1. 推奨日数が設定されている場合はそれを優先使用
        if let recommendedDays = material.recommendedDays, recommendedDays > 0 {
            return recommendedDays * cycles
        }

        // 2. 総章数と1章あたりの時間から計算
        if let totalChapters = material.totalChapters,
           let minutesPerChapter = material.standardMinutesPerChapter,
           totalChapters > 0, minutesPerChapter > 0 {

            let totalMinutes = totalChapters * minutesPerChapter * cycles
            let daysNeeded = Int(ceil(Double(totalMinutes) / Double(dailyMinutes)))
            return max(daysNeeded, 1)
        }

        // 3. デフォルト: 30日
        return 30 * cycles
    }

    /// デイリータスクを生成して挿入
    private func generateAndInsertDailyTasks(
        roadmapId: Int,
        materials: [EnglishMaterial],
        materialIdMap: [Int: Int],
        startDate: Date,
        dailyMinutes: Int
    ) async throws {
        var tasks: [[String: AnyJSON]] = []
        var currentDate = startDate

        for material in materials {
            guard let roadmapMaterialId = materialIdMap[material.id] else { continue }

            let cycles = material.recommendedCycles ?? 1
            let totalDays = calculateMaterialDays(material: material, dailyMinutes: dailyMinutes, cycles: cycles)

            // 章数がある場合は章ごとに分割
            if let totalChapters = material.totalChapters, totalChapters > 0, material.materialCategory != "英単語" {
                let chaptersPerDay = max(1, Int(ceil(Double(totalChapters * cycles) / Double(totalDays))))
                var currentChapter = 1
                var taskDate = currentDate

                while currentChapter <= totalChapters * cycles {
                    let effectiveChapter = ((currentChapter - 1) % totalChapters) + 1
                    let endChapter = min(effectiveChapter + chaptersPerDay - 1, totalChapters)
                    let minutesForTask = chaptersPerDay * (material.standardMinutesPerChapter ?? 20)

                    var taskParams: [String: AnyJSON] = [
                        "roadmap_id": .integer(roadmapId),
                        "roadmap_material_id": .integer(roadmapMaterialId),
                        "task_date": .string(dateFormatter.string(from: taskDate)),
                        "material_name": .string(material.materialName),
                        "estimated_minutes": .integer(minutesForTask),
                        "chapter_start": .integer(effectiveChapter),
                        "chapter_end": .integer(endChapter)
                    ]

                    tasks.append(taskParams)

                    currentChapter += chaptersPerDay
                    taskDate = Calendar.current.date(byAdding: .day, value: 1, to: taskDate) ?? taskDate
                }

                // 並行カテゴリ以外は開始日を更新
                let parallelCategories: Set<String> = ["英単語", "英熟語"]
                if !parallelCategories.contains(material.materialCategory) {
                    currentDate = taskDate
                }
            } else {
                // 章数がない場合は日数で分割
                var taskDate = currentDate
                let minutesPerDay = material.materialCategory == "英単語" ? 20 : 30

                for _ in 0..<totalDays {
                    let taskParams: [String: AnyJSON] = [
                        "roadmap_id": .integer(roadmapId),
                        "roadmap_material_id": .integer(roadmapMaterialId),
                        "task_date": .string(dateFormatter.string(from: taskDate)),
                        "material_name": .string(material.materialName),
                        "estimated_minutes": .integer(minutesPerDay)
                    ]

                    tasks.append(taskParams)
                    taskDate = Calendar.current.date(byAdding: .day, value: 1, to: taskDate) ?? taskDate
                }
            }
        }

        // バッチ挿入
        if !tasks.isEmpty {
            let batchSize = 500
            for batchStart in stride(from: 0, to: tasks.count, by: batchSize) {
                let batchEnd = min(batchStart + batchSize, tasks.count)
                let batch = Array(tasks[batchStart..<batchEnd])

                try await supabase
                    .from("mukimuki_roadmap_daily_tasks")
                    .insert(batch)
                    .execute()
            }
        }

        print("✅ Generated \(tasks.count) daily tasks for new stage")
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
