import Foundation

/// ロードマップ生成サービス
///
/// ## カテゴリ別ステージ範囲:
/// - 単語: E1〜E10
/// - 熟語: E5〜E10
/// - 文法: E1〜E4
/// - 解釈: E4〜E10
/// - 長文: E5〜E10（週2回ペース、文法・解釈と並行OK）
/// - 英作文: E6〜E10（受験で使う人のみ）
/// - リスニング: E8〜E10 or 共通テスト3ヶ月前（1日30分以下）
///
/// ## 制約:
/// - 文法と解釈は同時進行しない
/// - 長文は週2回ペース（文法・解釈とは同時進行OK）
/// - リスニングは1日30分以上設定しない
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

    /// 並行進行するカテゴリ（毎日やる、常時進行）
    private let dailyCategories: Set<String> = ["単語", "熟語"]

    /// 週2回ペースで進めるカテゴリ
    private let weeklyCategories: Set<String> = ["長文"]

    /// 同時進行できないカテゴリのペア
    private let exclusivePairs: [[String]] = [
        ["文法", "解釈"]  // 文法と解釈は同時進行しない
    ]

    /// カテゴリ別の1日最大学習時間
    private let maxDailyMinutes: [String: Int] = [
        "リスニング": 30  // リスニングは1日30分以下
    ]

    private init() {}

    // MARK: - Main Algorithm

    /// ロードマップを生成
    /// 現在のステージの教材のみでスケジュールを作成する（段階的アプローチ）
    func generateRoadmap(
        params: RoadmapInputParams,
        materials: [EnglishMaterial]
    ) -> GeneratedRoadmap {

        print("📊 generateRoadmap called with \(materials.count) materials")
        print("   - currentLevel: \(params.currentLevel)")
        print("   - materials stages: \(Set(materials.map { $0.stageId }))")

        // 1. 開始ステージと目標ステージを決定
        // currentLevelを直接使用（すでに判定済み）
        let startStage = params.currentLevel

        let targetStage = determineTargetStage(targetLevel: params.targetLevel)

        print("   - startStage: \(startStage), targetStage: \(targetStage)")

        // 2. 渡された教材からSelectedMaterialを作成（すでに選択済みなのでフィルタ不要）
        let selectedMaterials = materials.map { material -> SelectedMaterial in
            let cycles = material.recommendedCycles ?? 1
            let totalDays = calculateMaterialDays(
                material: material,
                dailyMinutes: params.dailyStudyMinutes,
                cycles: max(1, cycles)
            )
            return SelectedMaterial(
                material: material,
                cycles: max(1, cycles),
                totalDays: totalDays,
                isPriority: false
            )
        }

        print("   - selectedMaterials: \(selectedMaterials.count)")

        // 3. 日数を計算してスケジュールを生成
        let schedule = generateSchedule(
            materials: selectedMaterials,
            dailyMinutes: params.dailyStudyMinutes,
            totalDays: params.daysUntilExam,
            startDate: Date()
        )

        // 4. デイリータスクを生成
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

    // MARK: - Step 4: スケジュール生成（新ルール対応）

    /// 全体スケジュールを生成
    /// - 文法と解釈は同時進行しない
    /// - 長文は週2回ペース
    /// - リスニングは1日30分以下
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
        let (dailyMaterials, otherMaterials) = partitionByDaily(materials)

        // 順次処理する教材をフェーズごとにグループ化
        // 文法 → 解釈 → 長文（週2回）の順で進める
        let groupedByCategory = Dictionary(grouping: otherMaterials) { $0.material.materialCategory }

        // ステージごとにグループ化（ステージスケジュール用）
        let allStages = Set(materials.map { $0.material.stageId })
        let sortedStages = allStages.sorted { (stageOrder[$0] ?? 0) < (stageOrder[$1] ?? 0) }

        // 並行教材（単語・熟語）は試験日まで毎日
        let examDate = Calendar.current.date(byAdding: .day, value: totalDays, to: startDate) ?? startDate
        for daily in dailyMaterials {
            let vocabDays = calculateParallelDays(
                material: daily.material,
                dailyMinutes: 20,
                cycles: daily.cycles,
                totalDays: totalDays
            )
            let endDate = Calendar.current.date(byAdding: .day, value: vocabDays, to: startDate) ?? examDate

            materialSchedules.append(MaterialSchedule(
                material: daily.material,
                startDate: startDate,
                endDate: endDate,
                cycles: daily.cycles,
                isParallel: true,
                isWeekly: false
            ))
        }

        // 長文の開始日を記録するための変数
        var readingStartDate = startDate

        // フェーズ順に処理（文法 → 解釈の順、同時進行しない）
        // 長文は解釈と同時開始するので、解釈の開始日を記録
        let orderedPhases = ["文法", "解釈", "英作文", "リスニング", "過去問"]
        for phase in orderedPhases {
            guard let phaseMaterials = groupedByCategory[phase], !phaseMaterials.isEmpty else { continue }

            // 解釈の開始日を長文の開始日として記録
            if phase == "解釈" && readingStartDate == startDate {
                readingStartDate = currentDate
            }

            for material in phaseMaterials {
                // リスニングの場合は1日30分以下に制限
                var adjustedDays = material.totalDays
                if phase == "リスニング" {
                    let listeningMinutes = min(30, dailyMinutes / 3)  // 全体の1/3以下で30分上限
                    adjustedDays = calculateMaterialDays(
                        material: material.material,
                        dailyMinutes: listeningMinutes,
                        cycles: material.cycles
                    )
                }

                let endDate = Calendar.current.date(
                    byAdding: .day,
                    value: adjustedDays,
                    to: currentDate
                ) ?? currentDate

                materialSchedules.append(MaterialSchedule(
                    material: material.material,
                    startDate: currentDate,
                    endDate: endDate,
                    cycles: material.cycles,
                    isParallel: false,
                    isWeekly: false
                ))

                currentDate = endDate
            }
        }

        // 長文は解釈と同時進行で週2回ペース
        // ※文法と解釈は同時進行しないが、長文は解釈と並行OK
        if let readingMaterials = groupedByCategory["長文"], !readingMaterials.isEmpty {
            for material in readingMaterials {
                let totalTasks = (material.material.totalChapters ?? 30) * material.cycles
                let weeklyDays = ReadingScheduleHelper.calculateTotalDays(totalTasks: totalTasks)
                let endDate = Calendar.current.date(
                    byAdding: .day,
                    value: weeklyDays,
                    to: readingStartDate
                ) ?? currentDate

                materialSchedules.append(MaterialSchedule(
                    material: material.material,
                    startDate: readingStartDate,
                    endDate: endDate,
                    cycles: material.cycles,
                    isParallel: true,  // 解釈と並行
                    isWeekly: true     // 週2回ペース
                ))

                // currentDateを更新（長文の終了日が最終日になる可能性）
                if endDate > currentDate {
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

    /// 教材を毎日進行（単語・熟語）とそれ以外に分類
    private func partitionByDaily(_ materials: [SelectedMaterial]) -> (daily: [SelectedMaterial], others: [SelectedMaterial]) {
        let daily = materials.filter { dailyCategories.contains($0.material.materialCategory) }
        let others = materials.filter { !dailyCategories.contains($0.material.materialCategory) }
        return (daily, others)
    }

    /// 教材が週2回ペースか判定
    private func isWeeklyPace(_ material: EnglishMaterial) -> Bool {
        weeklyCategories.contains(material.materialCategory)
    }

    /// 2つのカテゴリが同時進行可能か判定
    private func canRunInParallel(_ category1: String, _ category2: String) -> Bool {
        !exclusivePairs.contains { pair in
            pair.contains(category1) && pair.contains(category2)
        }
    }

    // MARK: - Step 5: デイリータスク生成

    /// デイリータスクを生成
    /// - 長文は週2回（火・土）のスケジュール
    /// - リスニングは1日30分以下
    private func generateDailyTasks(
        schedule: RoadmapSchedule,
        dailyMinutes: Int
    ) -> [DailyTaskTemplate] {

        var tasks: [DailyTaskTemplate] = []

        for materialSchedule in schedule.materials {
            let material = materialSchedule.material
            let category = material.materialCategory

            // 週2回ペースの教材（長文）
            if materialSchedule.isWeekly {
                tasks.append(contentsOf: generateWeeklyTasks(
                    materialSchedule: materialSchedule,
                    dailyMinutes: dailyMinutes
                ))
                continue
            }

            // リスニングは1日30分制限
            let effectiveMinutes: Int
            if category == "リスニング" {
                effectiveMinutes = min(30, dailyMinutes / 3)
            } else if dailyCategories.contains(category) {
                effectiveMinutes = 20  // 単語・熟語は固定20分
            } else {
                effectiveMinutes = dailyMinutes
            }

            let totalDays = max(1, Calendar.current.dateComponents(
                [.day],
                from: materialSchedule.startDate,
                to: materialSchedule.endDate
            ).day ?? 1)

            // 章数がある場合は章ごとに分割
            if let totalChapters = material.totalChapters, totalChapters > 0, !dailyCategories.contains(category) {
                let chaptersPerDay = max(1, Int(ceil(Double(totalChapters * materialSchedule.cycles) / Double(totalDays))))
                var currentChapter = 1
                var currentDate = materialSchedule.startDate

                while currentChapter <= totalChapters * materialSchedule.cycles {
                    let effectiveChapter = ((currentChapter - 1) % totalChapters) + 1
                    let endChapter = min(effectiveChapter + chaptersPerDay - 1, totalChapters)
                    let minutesForTask = min(chaptersPerDay * (material.standardMinutesPerChapter ?? 20), effectiveMinutes)

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

                while currentDate < materialSchedule.endDate {
                    tasks.append(DailyTaskTemplate(
                        date: currentDate,
                        materialName: material.materialName,
                        chapterStart: nil,
                        chapterEnd: nil,
                        estimatedMinutes: effectiveMinutes,
                        roadmapMaterialId: material.id
                    ))

                    currentDate = Calendar.current.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
                }
            }
        }

        // 日付でソート
        return tasks.sorted { $0.date < $1.date }
    }

    /// 週2回ペースのタスクを生成（長文用）
    private func generateWeeklyTasks(
        materialSchedule: MaterialSchedule,
        dailyMinutes: Int
    ) -> [DailyTaskTemplate] {
        let material = materialSchedule.material
        let totalChapters = material.totalChapters ?? 30
        let totalTasks = totalChapters * materialSchedule.cycles

        // 週2回の日程を生成（火曜・土曜）
        let taskDates = ReadingScheduleHelper.generateWeeklySchedule(
            startDate: materialSchedule.startDate,
            totalTasks: totalTasks,
            preferredDays: [3, 7]  // 火曜(3)、土曜(7)
        )

        var tasks: [DailyTaskTemplate] = []
        var currentChapter = 1

        for date in taskDates {
            let effectiveChapter = ((currentChapter - 1) % totalChapters) + 1
            let minutesForTask = material.standardMinutesPerChapter ?? 45  // 長文は1章45分目安

            tasks.append(DailyTaskTemplate(
                date: date,
                materialName: material.materialName,
                chapterStart: effectiveChapter,
                chapterEnd: effectiveChapter,  // 長文は1日1章
                estimatedMinutes: minutesForTask,
                roadmapMaterialId: material.id
            ))

            currentChapter += 1
        }

        return tasks
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
