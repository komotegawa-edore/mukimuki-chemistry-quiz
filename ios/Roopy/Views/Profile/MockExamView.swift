import SwiftUI
import Charts

/// 模試成績管理画面
struct MockExamView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = MockExamViewModel()
    @State private var showingAddSheet = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("読み込み中...")
                } else if viewModel.exams.isEmpty {
                    EmptyMockExamView(onAdd: { showingAddSheet = true })
                } else {
                    MockExamContentView(viewModel: viewModel, showingAddSheet: $showingAddSheet)
                }
            }
            .navigationTitle("模試成績")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("閉じる") {
                        dismiss()
                    }
                    .foregroundColor(.roopyText.opacity(0.7))
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddSheet = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(.roopyPrimary)
                    }
                }
            }
            .sheet(isPresented: $showingAddSheet) {
                AddMockExamView(viewModel: viewModel, isPresented: $showingAddSheet)
            }
        }
        .task {
            await viewModel.loadExams()
        }
    }
}

/// 模試結果がない場合の表示
struct EmptyMockExamView: View {
    let onAdd: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 60))
                .foregroundColor(.roopyPrimary.opacity(0.5))

            Text("まだ模試の記録がありません")
                .font(.headline)
                .foregroundColor(.roopyText)

            Text("模試の結果を記録して\n成績の推移を確認しましょう")
                .font(.subheadline)
                .foregroundColor(.roopyText.opacity(0.7))
                .multilineTextAlignment(.center)

            Button(action: onAdd) {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("模試を追加")
                }
                .fontWeight(.semibold)
                .padding()
                .background(Color.roopyPrimary)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
        }
        .padding()
    }
}

/// 模試結果コンテンツ
struct MockExamContentView: View {
    @ObservedObject var viewModel: MockExamViewModel
    @Binding var showingAddSheet: Bool

    var body: some View {
        List {
            // 偏差値推移グラフ
            if !viewModel.deviationHistory.isEmpty {
                Section(header: Text("偏差値推移")) {
                    VStack(alignment: .leading, spacing: 12) {
                        DeviationChartView(viewModel: viewModel)
                            .frame(height: 200)

                        // 科目フィルター
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(viewModel.availableSubjectsWithData, id: \.self) { subject in
                                    SubjectFilterChip(
                                        subject: subject,
                                        isSelected: viewModel.selectedSubjects.contains(subject),
                                        color: viewModel.subjectColors[subject] ?? .gray
                                    ) {
                                        if viewModel.selectedSubjects.contains(subject) {
                                            viewModel.selectedSubjects.remove(subject)
                                        } else {
                                            viewModel.selectedSubjects.insert(subject)
                                        }
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    .padding(.vertical, 8)
                }
            }

            // 科目別サマリー
            Section(header: Text("科目別の最新偏差値")) {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(viewModel.availableSubjectsWithData, id: \.self) { subject in
                            if let deviation = viewModel.latestDeviationValue(for: subject) {
                                SubjectDeviationCard(
                                    subject: subject,
                                    deviation: deviation,
                                    color: viewModel.subjectColors[subject] ?? .gray
                                )
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))

            // 模試結果一覧
            Section(header: Text("模試の記録")) {
                ForEach(viewModel.exams) { exam in
                    MockExamRow(exam: exam, subjectColors: viewModel.subjectColors)
                }
                .onDelete { offsets in
                    Task {
                        for offset in offsets {
                            let exam = viewModel.exams[offset]
                            await viewModel.deleteExam(exam: exam)
                        }
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
    }
}

/// 偏差値推移グラフ
struct DeviationChartView: View {
    @ObservedObject var viewModel: MockExamViewModel

    var body: some View {
        Chart {
            ForEach(viewModel.filteredDeviationHistory) { point in
                LineMark(
                    x: .value("日付", point.date),
                    y: .value("偏差値", point.deviationValue)
                )
                .foregroundStyle(by: .value("科目", point.subject))

                PointMark(
                    x: .value("日付", point.date),
                    y: .value("偏差値", point.deviationValue)
                )
                .foregroundStyle(by: .value("科目", point.subject))
            }

            // 偏差値50の基準線
            RuleMark(y: .value("基準", 50))
                .foregroundStyle(.gray.opacity(0.5))
                .lineStyle(StrokeStyle(lineWidth: 1, dash: [5]))
        }
        .chartYScale(domain: 30...80)
        .chartForegroundStyleScale { subject in
            viewModel.subjectColors[subject] ?? .gray
        }
        .chartLegend(.hidden)
    }
}

/// 科目フィルターチップ
struct SubjectFilterChip: View {
    let subject: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(subject)
                .font(.caption)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundColor(isSelected ? .white : color)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? color : color.opacity(0.1))
                .cornerRadius(16)
        }
    }
}

/// 科目別偏差値カード
struct SubjectDeviationCard: View {
    let subject: String
    let deviation: Double
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(subject)
                .font(.caption)
                .foregroundColor(.roopyText.opacity(0.7))

            Text(String(format: "%.1f", deviation))
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
        }
        .frame(width: 70)
        .padding(.vertical, 12)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

/// 模試結果行（複数科目対応）
struct MockExamRow: View {
    let exam: MockExam
    let subjectColors: [String: Color]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(exam.examName)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyText)

                Spacer()

                if let avg = exam.averageDeviation {
                    Text(String(format: "平均 %.1f", avg))
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.roopyPrimary)
                        .cornerRadius(4)
                }
            }

            // 日付
            Label {
                Text(formatDate(exam.examDate))
                    .font(.caption)
            } icon: {
                Image(systemName: "calendar")
                    .font(.caption)
            }
            .foregroundColor(.roopyText.opacity(0.6))

            // 科目スコア
            if let scores = exam.scores, !scores.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(scores) { score in
                            ScoreChip(score: score, color: subjectColors[score.subject] ?? .gray)
                        }
                    }
                }
            }

            if let notes = exam.notes, !notes.isEmpty {
                Text(notes)
                    .font(.caption)
                    .foregroundColor(.roopyText.opacity(0.5))
                    .lineLimit(1)
            }
        }
        .padding(.vertical, 4)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy/MM/dd"
        return formatter.string(from: date)
    }
}

/// 科目スコアチップ
struct ScoreChip: View {
    let score: MockExamScore
    let color: Color

    var body: some View {
        HStack(spacing: 4) {
            Text(score.subject)
                .font(.caption2)
                .fontWeight(.medium)

            if let deviation = score.deviationValue {
                Text(String(format: "%.1f", deviation))
                    .font(.caption2)
                    .fontWeight(.bold)
            }
        }
        .foregroundColor(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(color.opacity(0.1))
        .cornerRadius(4)
    }
}

/// 模試追加シート（複数科目対応）
struct AddMockExamView: View {
    @ObservedObject var viewModel: MockExamViewModel
    @Binding var isPresented: Bool
    @State private var showingAlert = false
    @State private var alertMessage = ""

    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("模試情報")) {
                    TextField("模試名", text: $viewModel.examName)
                        .textContentType(.name)

                    DatePicker("受験日", selection: $viewModel.examDate, displayedComponents: .date)
                }

                Section(header: HStack {
                    Text("科目別成績")
                    Spacer()
                    Button(action: { viewModel.addSubjectScore() }) {
                        HStack(spacing: 4) {
                            Image(systemName: "plus.circle.fill")
                            Text("追加")
                        }
                        .font(.caption)
                        .foregroundColor(.roopyPrimary)
                    }
                }) {
                    if viewModel.subjectScores.isEmpty {
                        Text("科目を追加してください")
                            .font(.caption)
                            .foregroundColor(.roopyText.opacity(0.5))
                    } else {
                        ForEach(viewModel.subjectScores.indices, id: \.self) { index in
                            SubjectScoreInputRow(
                                input: $viewModel.subjectScores[index],
                                availableSubjects: viewModel.availableSubjects,
                                onDelete: {
                                    viewModel.removeSubjectScore(at: index)
                                }
                            )
                        }
                    }
                }

                Section(header: Text("メモ（任意）")) {
                    TextEditor(text: $viewModel.notes)
                        .frame(minHeight: 80)
                }
            }
            .navigationTitle("模試を追加")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        viewModel.clearForm()
                        isPresented = false
                    }
                    .foregroundColor(.roopyText.opacity(0.7))
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("保存") {
                        Task {
                            if validateForm() {
                                let success = await viewModel.addExam()
                                if success {
                                    isPresented = false
                                } else {
                                    alertMessage = "保存に失敗しました"
                                    showingAlert = true
                                }
                            }
                        }
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyPrimary)
                    .disabled(viewModel.isSaving)
                }
            }
            .alert("エラー", isPresented: $showingAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(alertMessage)
            }
            .overlay {
                if viewModel.isSaving {
                    ProgressView("保存中...")
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)
                        .shadow(radius: 10)
                }
            }
            .onAppear {
                // 最初に1つ科目を追加
                if viewModel.subjectScores.isEmpty {
                    viewModel.addSubjectScore()
                }
            }
        }
    }

    private func validateForm() -> Bool {
        if viewModel.examName.isEmpty {
            alertMessage = "模試名を入力してください"
            showingAlert = true
            return false
        }
        let validScores = viewModel.subjectScores.filter { !$0.subject.isEmpty }
        if validScores.isEmpty {
            alertMessage = "少なくとも1科目は入力してください"
            showingAlert = true
            return false
        }
        return true
    }
}

/// 科目スコア入力行
struct SubjectScoreInputRow: View {
    @Binding var input: SubjectScoreInput
    let availableSubjects: [String]
    let onDelete: () -> Void

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Picker("科目", selection: $input.subject) {
                    Text("選択").tag("")
                    ForEach(availableSubjects, id: \.self) { subject in
                        Text(subject).tag(subject)
                    }
                }
                .pickerStyle(.menu)

                Spacer()

                Button(action: onDelete) {
                    Image(systemName: "trash")
                        .foregroundColor(.red.opacity(0.7))
                }
            }

            HStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("得点")
                        .font(.caption2)
                        .foregroundColor(.roopyText.opacity(0.5))
                    HStack {
                        TextField("--", text: $input.score)
                            .keyboardType(.numberPad)
                            .frame(width: 50)
                        Text("/")
                            .foregroundColor(.roopyText.opacity(0.3))
                        TextField("--", text: $input.maxScore)
                            .keyboardType(.numberPad)
                            .frame(width: 50)
                    }
                }

                Spacer()

                VStack(alignment: .leading, spacing: 2) {
                    Text("偏差値")
                        .font(.caption2)
                        .foregroundColor(.roopyText.opacity(0.5))
                    TextField("--", text: $input.deviationValue)
                        .keyboardType(.decimalPad)
                        .frame(width: 60)
                }
            }
            .font(.subheadline)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    MockExamView()
}
