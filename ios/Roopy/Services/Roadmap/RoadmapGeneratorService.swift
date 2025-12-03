import Foundation

/// ロードマップ生成サービス
final class RoadmapGeneratorService {

    static let shared = RoadmapGeneratorService()

    // MARK: - Constants

    /// ステージの順序マッピング
    private let stageOrder: [String: Int] = [
        "E1": 1, "E2": 2, "E3": 3, "E4": 4, "E5": 5,
        "E6": 6, "E7": 7, "E8": 8, "E9": 9, "E10": 10,
        "E11": 11, "E12": 12, "E13": 13, "E14": 14, "E15": 15
    ]

    /// 志望レベルに必要なステージ
    private let targetLevelRequirements: [String: String] = [
        "日東駒専": "E8",
        "MARCH": "E10",
        "関関同立": "E10",
        "早慶": "E13",
        "地方国公立": "E10",
        "旧帝大": "E13",
        "東大・京大": "E15"
    ]

    /// 並行進行するカテゴリ（毎日やる）
    private let parallelCategories: Set<String> = ["英単語", "英熟語"]

    /// 並行で進められるカテゴリのペア
    private let parallelPairs: [[String]] = [
        ["解釈", "長文"]  // 解釈と長文は同時進行可能
    ]

    private init() {}

    // MARK: - Main Algorithm

    /// ロードマップを生成
    func generateRoadmap(
        params: RoadmapInputParams,
        materials: [EnglishMaterial]
    ) -> GeneratedRoadmap {

        // 1. 開始ステージと目標ステージを決定
        let startStage = determineStartStage(
            currentLevel: params.currentLevel,
            deviationValue: params.currentDeviationValue
        )

        let targetStage = determineTargetStage(targetLevel: params.targetLevel)

        // 2. 必要なステージの範囲を取得
        let requiredStages = getStageRange(from: startStage, to: targetStage)

        // 3. 各ステージで使用する教材を選定
        let selectedMaterials = selectMaterialsForStages(
            stages: requiredStages,
            allMaterials: materials,
            weakAreas: params.weakAreas,
            dailyMinutes: params.dailyStudyMinutes
        )

        // 4. 日数を計算してスケジュールを生成
        let schedule = generateSchedule(
            materials: selectedMaterials,
            dailyMinutes: params.dailyStudyMinutes,
            totalDays: params.daysUntilExam,
            startDate: Date()
        )

        // 5. デイリータスクを生成
        let dailyTasks = generateDailyTasks(
            schedule: schedule,
            dailyMinutes: params.dailyStudyMinutes
        )

        return GeneratedRoadmap(
            startStage: startStage,
            targetStage: targetStage,
            stages: schedule.stages,
            materials: schedule.materials,
            dailyTasks: dailyTasks,
            estimatedCompletionDate: schedule.estimatedEndDate,
            warnings: schedule.warnings
        )
    }

    // MARK: - Step 1: ステージ決定

    /// 開始ステージを決定
    private func determineStartStage(currentLevel: String, deviationValue: Double?) -> String {
        // 偏差値ベースの判定
        if let deviation = deviationValue {
            switch deviation {
            case ..<40:  return "E1"
            case 40..<45: return "E3"
            case 45..<50: return "E5"
            case 50..<55: return "E6"
            case 55..<60: return "E7"
            case 60..<65: return "E8"
            case 65..<70: return "E9"
            default:      return "E10"
            }
        }

        // currentLevelがE1-E10形式ならそのまま使用
        if stageOrder[currentLevel] != nil {
            return currentLevel
        }

        return "E3" // デフォルト
    }

    /// 目標ステージを決定
    private func determineTargetStage(targetLevel: String) -> String {
        return targetLevelRequirements[targetLevel] ?? "E10"
    }

    // MARK: - Step 2: ステージ範囲取得

    /// 開始から目標までのステージ配列を取得
    private func getStageRange(from start: String, to target: String) -> [String] {
        guard let startOrder = stageOrder[start],
              let targetOrder = stageOrder[target] else {
            return []
        }

        return (startOrder...targetOrder).compactMap { order in
            stageOrder.first { $0.value == order }?.key
        }.sorted { (stageOrder[$0] ?? 0) < (stageOrder[$1] ?? 0) }
    }

    // MARK: - Step 3: 教材選定

    /// 各ステージの教材を選定
    private func selectMaterialsForStages(
        stages: [String],
        allMaterials: [EnglishMaterial],
        weakAreas: [String],
        dailyMinutes: Int
    ) -> [SelectedMaterial] {

        var selectedMaterials: [SelectedMaterial] = []

        for stage in stages {
            // このステージの教材を取得
            let stageMaterials = allMaterials
                .filter { $0.stageId == stage && $0.isPublished }
                .sorted { $0.displayOrder < $1.displayOrder }

            for material in stageMaterials {
                // 空の教材はスキップ
                guard !material.materialName.isEmpty else { continue }

                // 苦手分野に関連する教材は優先度を上げる
                let isPriority = weakAreas.contains { weakness in
                    material.materialCategory.contains(weakness) ||
                    material.stageName.contains(weakness)
                }

                // 必要周回数を決定
                let cycles = material.recommendedCycles ?? 1

                // 所要日数を計算
                let totalDays = calculateMaterialDays(
                    material: material,
                    dailyMinutes: dailyMinutes,
                    cycles: max(1, cycles)
                )

                selectedMaterials.append(SelectedMaterial(
                    material: material,
                    cycles: max(1, cycles),
                    totalDays: totalDays,
                    isPriority: isPriority
                ))
            }
        }

        return selectedMaterials
    }

    /// 教材の所要日数を計算
    private func calculateMaterialDays(
        material: EnglishMaterial,
        dailyMinutes: Int,
        cycles: Int
    ) -> Int {
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

    // MARK: - Step 4: スケジュール生成（並行進行対応）

    /// 全体スケジュールを生成
    private func generateSchedule(
        materials: [SelectedMaterial],
        dailyMinutes: Int,
        totalDays: Int,
        startDate: Date
    ) -> RoadmapSchedule {

        var warnings: [String] = []
        var currentDate = startDate
        var stageSchedules: [StageSchedule] = []
        var materialSchedules: [MaterialSchedule] = []

        // 教材をカテゴリで分類
        let (parallelMaterials, sequentialMaterials) = partitionByParallel(materials)

        // 順次処理する教材をフェーズごとにグループ化
        let groupedByPhase = Dictionary(grouping: sequentialMaterials) { material -> String in
            // 解釈と長文は同時進行可能なので「解釈・長文」フェーズとしてグループ化
            let category = material.material.materialCategory
            if category == "解釈" || category == "長文" {
                return "解釈・長文"
            }
            return category
        }

        // ステージごとにグループ化（ステージスケジュール用）
        let allStages = Set(materials.map { $0.material.stageId })
        let sortedStages = allStages.sorted { (stageOrder[$0] ?? 0) < (stageOrder[$1] ?? 0) }

        // 並行教材（単語・熟語）は試験日まで毎日
        let examDate = Calendar.current.date(byAdding: .day, value: totalDays, to: startDate) ?? startDate
        for parallel in parallelMaterials {
            let vocabDays = calculateParallelDays(
                material: parallel.material,
                dailyMinutes: 20,
                cycles: parallel.cycles,
                totalDays: totalDays
            )
            let endDate = Calendar.current.date(byAdding: .day, value: vocabDays, to: startDate) ?? examDate

            materialSchedules.append(MaterialSchedule(
                material: parallel.material,
                startDate: startDate,
                endDate: endDate,
                cycles: parallel.cycles,
                isParallel: true
            ))
        }

        // フェーズ順に処理
        let orderedPhases = ["文法", "文法演習", "解釈・長文", "英作文", "リスニング"]
        for phase in orderedPhases {
            guard let phaseMaterials = groupedByPhase[phase] else { continue }

            // 解釈・長文フェーズは並行して進める
            if phase == "解釈・長文" {
                let interpretationMaterials = phaseMaterials.filter { $0.material.materialCategory == "解釈" }
                let readingMaterials = phaseMaterials.filter { $0.material.materialCategory == "長文" }

                // 解釈と長文を同時にスタート
                var maxEndDate = currentDate

                for material in interpretationMaterials {
                    let endDate = Calendar.current.date(
                        byAdding: .day,
                        value: material.totalDays,
                        to: currentDate
                    ) ?? currentDate

                    materialSchedules.append(MaterialSchedule(
                        material: material.material,
                        startDate: currentDate,
                        endDate: endDate,
                        cycles: material.cycles,
                        isParallel: true
                    ))

                    if endDate > maxEndDate { maxEndDate = endDate }
                }

                for material in readingMaterials {
                    let endDate = Calendar.current.date(
                        byAdding: .day,
                        value: material.totalDays,
                        to: currentDate
                    ) ?? currentDate

                    materialSchedules.append(MaterialSchedule(
                        material: material.material,
                        startDate: currentDate,
                        endDate: endDate,
                        cycles: material.cycles,
                        isParallel: true
                    ))

                    if endDate > maxEndDate { maxEndDate = endDate }
                }

                currentDate = maxEndDate
            } else {
                // その他のフェーズは順次処理
                for material in phaseMaterials {
                    let endDate = Calendar.current.date(
                        byAdding: .day,
                        value: material.totalDays,
                        to: currentDate
                    ) ?? currentDate

                    materialSchedules.append(MaterialSchedule(
                        material: material.material,
                        startDate: currentDate,
                        endDate: endDate,
                        cycles: material.cycles,
                        isParallel: false
                    ))

                    currentDate = endDate
                }
            }
        }

        // ステージスケジュールを生成
        for stage in sortedStages {
            let stageMaterials = materialSchedules.filter { $0.material.stageId == stage }
            guard !stageMaterials.isEmpty else { continue }

            let stageStart = stageMaterials.map { $0.startDate }.min() ?? startDate
            let stageEnd = stageMaterials.map { $0.endDate }.max() ?? currentDate

            stageSchedules.append(StageSchedule(
                stageId: stage,
                startDate: stageStart,
                endDate: stageEnd
            ))
        }

        // 日数オーバーチェック
        let totalScheduledDays = Calendar.current.dateComponents(
            [.day],
            from: startDate,
            to: currentDate
        ).day ?? 0

        if totalScheduledDays > totalDays {
            let overDays = totalScheduledDays - totalDays
            warnings.append("予定日数が \(overDays) 日オーバーしています。毎日の学習時間を増やすか、一部の教材をスキップする必要があります。")
        }

        // 終了日は試験日または最後の教材終了日の遅い方
        let finalEndDate = max(currentDate, examDate)

        return RoadmapSchedule(
            stages: stageSchedules,
            materials: materialSchedules,
            estimatedEndDate: finalEndDate,
            warnings: warnings
        )
    }

    /// 並列教材（語彙など）の所要日数を計算
    /// 「常時」の教材は試験日まで毎日やるので、totalDaysを返す
    private func calculateParallelDays(material: EnglishMaterial, dailyMinutes: Int, cycles: Int, totalDays: Int) -> Int {
        // 推奨日数がない（常時の教材）は試験日までやる
        if material.recommendedDays == nil {
            return totalDays
        }

        // 語数から計算（1日50〜100語目安）
        if let totalWords = material.totalChapters, totalWords > 0 {
            let wordsPerDay = 100 // 1日100語目安
            let calculatedDays = Int(ceil(Double(totalWords * cycles) / Double(wordsPerDay)))
            return min(calculatedDays, totalDays)
        }

        return min(60 * cycles, totalDays) // デフォルト60日、試験日を超えない
    }

    /// 教材を並行進行（単語・熟語）とそれ以外に分類
    private func partitionByParallel(_ materials: [SelectedMaterial]) -> (parallel: [SelectedMaterial], sequential: [SelectedMaterial]) {
        let parallel = materials.filter { parallelCategories.contains($0.material.materialCategory) }
        let sequential = materials.filter { !parallelCategories.contains($0.material.materialCategory) }
        return (parallel, sequential)
    }

    /// 教材を語彙系とその他に分類（後方互換用）
    private func partitionMaterials(_ materials: [SelectedMaterial]) -> ([SelectedMaterial], [SelectedMaterial]) {
        let vocabulary = materials.filter { $0.material.materialCategory == "英単語" }
        let others = materials.filter { $0.material.materialCategory != "英単語" }
        return (vocabulary, others)
    }

    // MARK: - Step 5: デイリータスク生成

    /// デイリータスクを生成
    private func generateDailyTasks(
        schedule: RoadmapSchedule,
        dailyMinutes: Int
    ) -> [DailyTaskTemplate] {

        var tasks: [DailyTaskTemplate] = []

        for materialSchedule in schedule.materials {
            let material = materialSchedule.material
            let totalDays = max(1, Calendar.current.dateComponents(
                [.day],
                from: materialSchedule.startDate,
                to: materialSchedule.endDate
            ).day ?? 1)

            // 章数がある場合は章ごとに分割
            if let totalChapters = material.totalChapters, totalChapters > 0, material.materialCategory != "英単語" {
                let chaptersPerDay = max(1, Int(ceil(Double(totalChapters * materialSchedule.cycles) / Double(totalDays))))
                var currentChapter = 1
                var currentDate = materialSchedule.startDate

                while currentChapter <= totalChapters * materialSchedule.cycles {
                    let effectiveChapter = ((currentChapter - 1) % totalChapters) + 1
                    let endChapter = min(effectiveChapter + chaptersPerDay - 1, totalChapters)
                    let minutesForTask = chaptersPerDay * (material.standardMinutesPerChapter ?? 20)

                    tasks.append(DailyTaskTemplate(
                        date: currentDate,
                        materialName: material.materialName,
                        chapterStart: effectiveChapter,
                        chapterEnd: endChapter,
                        estimatedMinutes: minutesForTask,
                        roadmapMaterialId: material.id
                    ))

                    currentChapter += chaptersPerDay
                    currentDate = Calendar.current.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
                }
            } else {
                // 章数がない場合（英単語など）は日数で分割
                var currentDate = materialSchedule.startDate
                let minutesPerDay = material.materialCategory == "英単語" ? 20 : (dailyMinutes / max(1, schedule.materials.count))

                while currentDate < materialSchedule.endDate {
                    tasks.append(DailyTaskTemplate(
                        date: currentDate,
                        materialName: material.materialName,
                        chapterStart: nil,
                        chapterEnd: nil,
                        estimatedMinutes: minutesPerDay,
                        roadmapMaterialId: material.id
                    ))

                    currentDate = Calendar.current.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
                }
            }
        }

        // 日付でソート
        return tasks.sorted { $0.date < $1.date }
    }

    // MARK: - Reschedule Algorithm

    /// 遅延時の自動リスケジュール
    func rescheduleFromDelay(
        delayedTasks: [RoadmapDailyTask]
    ) -> [(task: RoadmapDailyTask, newDate: Date)] {

        var rescheduledTasks: [(task: RoadmapDailyTask, newDate: Date)] = []
        var nextAvailableDate = Calendar.current.startOfDay(for: Date())

        // 遅延タスクを次の空き日に再配置
        for task in delayedTasks.sorted(by: { $0.taskDate < $1.taskDate }) {
            rescheduledTasks.append((task: task, newDate: nextAvailableDate))

            // 次の日へ
            nextAvailableDate = Calendar.current.date(
                byAdding: .day,
                value: 1,
                to: nextAvailableDate
            ) ?? nextAvailableDate
        }

        return rescheduledTasks
    }
}
