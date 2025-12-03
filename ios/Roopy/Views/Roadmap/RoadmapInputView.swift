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

                    // 志望校レベル
                    targetLevelSection

                    // 現在のレベル
                    currentLevelSection

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
                            Task {
                                if let userId = authService.currentUserId,
                                   let _ = await viewModel.saveRoadmap(userId: userId) {
                                    dismiss()
                                }
                            }
                        }
                    )
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

    private var currentLevelSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("現在のレベル", systemImage: "chart.bar.fill")
                .font(.headline)

            Picker("入力方法", selection: $viewModel.selectedCurrentLevel) {
                ForEach(CurrentLevelMode.allCases, id: \.self) { option in
                    Text(option.displayName).tag(option)
                }
            }
            .pickerStyle(.segmented)

            if viewModel.selectedCurrentLevel == .deviationBased {
                VStack(spacing: 8) {
                    HStack {
                        Text("偏差値")
                        Spacer()
                        Text(viewModel.deviationDisplayText)
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                    }

                    Slider(value: $viewModel.deviationValue, in: 30...75, step: 1)
                        .tint(.blue)

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
            } else {
                Picker("現在のステージ", selection: $viewModel.currentStage) {
                    ForEach(viewModel.stageOptions, id: \.self) { stage in
                        Text(stage).tag(stage)
                    }
                }
                .pickerStyle(.menu)
            }
        }
        .padding()
        .background(Color(.systemGray6))
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
