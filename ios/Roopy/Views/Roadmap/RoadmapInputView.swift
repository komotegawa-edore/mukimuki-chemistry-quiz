import SwiftUI

/// ロードマップ入力画面
struct RoadmapInputView: View {

    @StateObject private var viewModel = RoadmapInputViewModel()
    @EnvironmentObject var authService: AuthService
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // ヘッダー
                    headerSection

                    // 現在の学力（学年・模試・偏差値）
                    currentAbilitySection

                    // ステージ判定結果
                    if viewModel.stageDeterminationResult != nil {
                        stageResultSection
                    }

                    // 志望校レベル
                    targetLevelSection

                    // 苦手分野
                    weakAreasSection

                    // 学習時間
                    studyTimeSection

                    // 試験日
                    examDateSection

                    // 生成ボタン
                    generateButton
                }
                .padding()
            }
            .navigationTitle("ロードマップ作成")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }
            }
            .alert("エラー", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
            .sheet(isPresented: $viewModel.showingMaterialSelection) {
                MaterialSelectionView(
                    materialGroups: viewModel.materialGroups,
                    currentStage: viewModel.currentStage,
                    selections: $viewModel.materialSelections,
                    onConfirm: {
                        Task {
                            await viewModel.generateRoadmapWithSelectedMaterials()
                        }
                    }
                )
            }
            .sheet(isPresented: $viewModel.showingResult) {
                if let generated = viewModel.generatedRoadmap {
                    RoadmapResultView(
                        generatedRoadmap: generated,
                        inputParams: viewModel.inputParams,
                        onConfirm: {
                            dismiss()
                        }
                    )
                    .environmentObject(authService)
                }
            }
        }
    }

    // MARK: - Sections

    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "map.fill")
                .font(.system(size: 48))
                .foregroundColor(.blue)

            Text("学習ロードマップを作成")
                .font(.title2)
                .fontWeight(.bold)

            Text("あなたに最適な学習計画を自動生成します")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding(.vertical)
    }

    private var targetLevelSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("志望校レベル", systemImage: "graduationcap.fill")
                .font(.headline)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 8) {
                ForEach(TargetLevel.allCases, id: \.self) { level in
                    TargetLevelButton(
                        level: level,
                        isSelected: viewModel.selectedTargetLevel == level
                    ) {
                        viewModel.selectedTargetLevel = level
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var currentAbilitySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Label("現在の学力", systemImage: "chart.bar.fill")
                .font(.headline)

            // 学年選択
            VStack(alignment: .leading, spacing: 8) {
                Text("学年")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                HStack(spacing: 8) {
                    ForEach(SchoolYear.allCases, id: \.self) { year in
                        Button {
                            viewModel.selectedYear = year
                            viewModel.determineStage()
                        } label: {
                            Text(year.displayName)
                                .font(.subheadline)
                                .fontWeight(viewModel.selectedYear == year ? .bold : .regular)
                                .foregroundColor(viewModel.selectedYear == year ? .white : .primary)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(viewModel.selectedYear == year ? Color.blue : Color.white)
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(viewModel.selectedYear == year ? Color.blue : Color.gray.opacity(0.3), lineWidth: 1)
                                )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // 模試種類選択
            VStack(alignment: .leading, spacing: 8) {
                Text("模試")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Picker("模試種類", selection: $viewModel.selectedExamType) {
                    ForEach(MockExamType.allCases, id: \.self) { exam in
                        Text(exam.displayName).tag(exam)
                    }
                }
                .pickerStyle(.menu)
                .onChange(of: viewModel.selectedExamType) { _, _ in
                    viewModel.determineStage()
                }
            }

            // 偏差値スライダー
            VStack(spacing: 8) {
                HStack {
                    Text("偏差値")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(viewModel.deviationDisplayText)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                }

                Slider(value: $viewModel.deviationValue, in: 30...75, step: 1)
                    .tint(.blue)
                    .onChange(of: viewModel.deviationValue) { _, _ in
                        viewModel.determineStage()
                    }

                HStack {
                    Text("30")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("75")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .onAppear {
            viewModel.determineStage()
        }
    }

    private var stageResultSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("判定結果", systemImage: "checkmark.seal.fill")
                .font(.headline)
                .foregroundColor(.green)

            if let result = viewModel.stageDeterminationResult {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("現在のステージ")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(result.stage)
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 4) {
                        Text("レベル")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(result.description)
                            .font(.subheadline)
                            .foregroundColor(.primary)
                            .multilineTextAlignment(.trailing)
                    }
                }

                if !result.achievableLevel.isEmpty {
                    HStack {
                        Image(systemName: "info.circle")
                            .foregroundColor(.blue)
                        Text("現在到達可能: \(result.achievableLevel)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                // 補正情報（デバッグ用、本番では非表示にしてもOK）
                if result.inputExamType != .kawaiZentou {
                    Text("※ \(result.inputExamType.displayName)の偏差値\(Int(result.inputDeviation))を河合換算\(Int(result.adjustedDeviation))で判定")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(12)
    }

    private var weakAreasSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("苦手分野（複数選択可）", systemImage: "exclamationmark.triangle.fill")
                .font(.headline)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 8) {
                ForEach(WeakArea.allCases, id: \.self) { area in
                    WeakAreaButton(
                        area: area,
                        isSelected: viewModel.selectedWeakAreas.contains(area)
                    ) {
                        viewModel.toggleWeakArea(area)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var studyTimeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("1日の学習時間", systemImage: "clock.fill")
                .font(.headline)

            HStack(spacing: 8) {
                ForEach(viewModel.studyTimeOptions, id: \.self) { minutes in
                    StudyTimeButton(
                        minutes: minutes,
                        isSelected: viewModel.dailyStudyMinutes == minutes
                    ) {
                        viewModel.dailyStudyMinutes = minutes
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var examDateSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("試験日", systemImage: "calendar")
                .font(.headline)

            DatePicker(
                "試験日を選択",
                selection: $viewModel.examDate,
                in: Date()...,
                displayedComponents: .date
            )
            .datePickerStyle(.compact)

            HStack {
                Image(systemName: "info.circle")
                    .foregroundColor(.blue)
                Text("試験まで \(viewModel.daysUntilExam) 日")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var generateButton: some View {
        Button {
            Task {
                await viewModel.loadMaterialsAndShowSelection()
            }
        } label: {
            HStack {
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Image(systemName: "books.vertical.fill")
                }
                Text(viewModel.isLoading ? "読み込み中..." : "教材を選択して作成")
            }
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(viewModel.isValid ? Color.blue : Color.gray)
            .cornerRadius(12)
        }
        .disabled(!viewModel.isValid || viewModel.isLoading)
    }
}

// MARK: - Sub Components

struct TargetLevelButton: View {
    let level: TargetLevel
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Text(level.displayName)
                    .font(.subheadline)
                    .fontWeight(isSelected ? .bold : .regular)

                Text(level.stageLabel)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(isSelected ? Color.blue.opacity(0.2) : Color.white)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color.blue : Color.gray.opacity(0.3), lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}

struct WeakAreaButton: View {
    let area: WeakArea
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .blue : .gray)
                Text(area.displayName)
                    .font(.subheadline)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(isSelected ? Color.blue.opacity(0.1) : Color.white)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color.blue : Color.gray.opacity(0.3), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

struct StudyTimeButton: View {
    let minutes: Int
    let isSelected: Bool
    let action: () -> Void

    var displayText: String {
        if minutes >= 60 {
            let hours = minutes / 60
            let mins = minutes % 60
            return mins > 0 ? "\(hours)h\(mins)m" : "\(hours)h"
        }
        return "\(minutes)m"
    }

    var body: some View {
        Button(action: action) {
            Text(displayText)
                .font(.subheadline)
                .fontWeight(isSelected ? .bold : .regular)
                .foregroundColor(isSelected ? .white : .primary)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(isSelected ? Color.blue : Color.white)
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(isSelected ? Color.blue : Color.gray.opacity(0.3), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    RoadmapInputView()
        .environmentObject(AuthService.shared)
}
