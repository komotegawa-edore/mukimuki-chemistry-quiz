import SwiftUI

/// ロードマップ結果画面
struct RoadmapResultView: View {

    @StateObject private var viewModel: RoadmapResultViewModel
    @Environment(\.dismiss) private var dismiss

    let generatedRoadmap: GeneratedRoadmap
    let inputParams: RoadmapInputParams
    let onConfirm: () -> Void

    init(generatedRoadmap: GeneratedRoadmap, inputParams: RoadmapInputParams, onConfirm: @escaping () -> Void) {
        self.generatedRoadmap = generatedRoadmap
        self.inputParams = inputParams
        self.onConfirm = onConfirm
        _viewModel = StateObject(wrappedValue: RoadmapResultViewModel(generatedRoadmap: generatedRoadmap))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // サマリーカード
                    summaryCard

                    // 警告
                    if !viewModel.warnings.isEmpty {
                        warningsSection
                    }

                    // ステージ一覧
                    stagesSection

                    // 週間スケジュール
                    weeklyScheduleSection

                    // 確定ボタン
                    confirmButton
                }
                .padding()
            }
            .navigationTitle("ロードマップ")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("戻る") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                viewModel.initializeFromGenerated(generatedRoadmap, params: inputParams)
            }
        }
    }

    // MARK: - Sections

    private var summaryCard: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "checkmark.seal.fill")
                    .font(.title)
                    .foregroundColor(.green)
                Text("ロードマップが完成しました")
                    .font(.headline)
            }

            Divider()

            HStack(spacing: 24) {
                SummaryItem(
                    icon: "arrow.right.circle.fill",
                    title: "ステージ",
                    value: "\(generatedRoadmap.startStage) → \(generatedRoadmap.targetStage)"
                )

                SummaryItem(
                    icon: "book.fill",
                    title: "教材数",
                    value: "\(generatedRoadmap.materials.count)冊"
                )
            }

            HStack(spacing: 24) {
                SummaryItem(
                    icon: "calendar",
                    title: "完了予定",
                    value: formatDate(generatedRoadmap.estimatedCompletionDate)
                )

                SummaryItem(
                    icon: "clock.fill",
                    title: "学習時間",
                    value: "\(inputParams.dailyStudyMinutes)分/日"
                )
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var warningsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("注意", systemImage: "exclamationmark.triangle.fill")
                .font(.headline)
                .foregroundColor(.orange)

            ForEach(viewModel.warnings, id: \.self) { warning in
                HStack(alignment: .top) {
                    Image(systemName: "exclamationmark.circle")
                        .foregroundColor(.orange)
                    Text(warning)
                        .font(.subheadline)
                }
            }
        }
        .padding()
        .background(Color.orange.opacity(0.1))
        .cornerRadius(12)
    }

    private var stagesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("ステージ別スケジュール", systemImage: "chart.gantt")
                .font(.headline)

            ForEach(viewModel.materialsByStage, id: \.stage.id) { item in
                StageCard(stage: item.stage, materials: item.materials)
            }
        }
    }

    private var weeklyScheduleSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("週間プレビュー", systemImage: "calendar.badge.clock")
                .font(.headline)

            let weeks = viewModel.weeklySchedule()
            ForEach(Array(weeks.enumerated()), id: \.offset) { index, materials in
                WeekCard(weekNumber: index + 1, materials: materials)
            }
        }
    }

    private var confirmButton: some View {
        VStack(spacing: 12) {
            Button(action: onConfirm) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                    Text("このプランで開始")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .cornerRadius(12)
            }

            Button {
                dismiss()
            } label: {
                Text("入力に戻る")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.top)
    }

    // MARK: - Helper

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M/d"
        return formatter.string(from: date)
    }
}

// MARK: - Sub Components

struct SummaryItem: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundColor(.blue)
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity)
    }
}

struct StageCard: View {
    let stage: RoadmapStage
    let materials: [RoadmapMaterial]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(stage.stageId)
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(stageColor)
                    .cornerRadius(8)

                Text(stage.stageName)
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Spacer()

                Text(formatDateRange(stage.plannedStartDate, stage.plannedEndDate))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            ForEach(materials) { material in
                HStack {
                    Image(systemName: categoryIcon(material.material?.materialCategory ?? ""))
                        .foregroundColor(.gray)
                        .frame(width: 20)
                    Text(material.material?.materialName ?? "不明な教材")
                        .font(.subheadline)
                    Spacer()
                    if material.totalCycles > 1 {
                        Text("\(material.totalCycles)周")
                            .font(.caption)
                            .foregroundColor(.orange)
                    }
                }
                .padding(.leading, 8)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var stageColor: Color {
        let stageNumber = Int(stage.stageId.dropFirst()) ?? 1
        let hue = Double(stageNumber - 1) / 10.0 * 0.6 // 0 to 0.6 (red to cyan)
        return Color(hue: hue, saturation: 0.6, brightness: 0.7)
    }

    private func formatDateRange(_ start: Date, _ end: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M/d"
        return "\(formatter.string(from: start)) - \(formatter.string(from: end))"
    }

    private func categoryIcon(_ category: String) -> String {
        switch category {
        case "英単語": return "textformat.abc"
        case "英文法": return "text.book.closed"
        case "英文解釈": return "doc.text.magnifyingglass"
        case "長文読解": return "doc.richtext"
        case "リスニング": return "ear"
        default: return "book"
        }
    }
}

struct WeekCard: View {
    let weekNumber: Int
    let materials: [RoadmapMaterial]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Week \(weekNumber)")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.blue)

            HStack(spacing: 8) {
                ForEach(materials.prefix(3)) { material in
                    Text(material.material?.materialName ?? "-")
                        .font(.caption)
                        .lineLimit(1)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(4)
                }

                if materials.count > 3 {
                    Text("+\(materials.count - 3)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

#Preview {
    RoadmapResultView(
        generatedRoadmap: GeneratedRoadmap(
            startStage: "E3",
            targetStage: "E7",
            stages: [],
            materials: [],
            dailyTasks: [],
            estimatedCompletionDate: Date(),
            warnings: ["予定日数が30日オーバーしています"]
        ),
        inputParams: RoadmapInputParams(
            currentLevel: "",
            currentDeviationValue: 50,
            weakAreas: [],
            dailyStudyMinutes: 90,
            daysUntilExam: 180,
            targetUniversity: nil,
            targetLevel: "MARCH"
        ),
        onConfirm: {}
    )
}
