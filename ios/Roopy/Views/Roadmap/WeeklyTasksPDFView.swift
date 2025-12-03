import SwiftUI

/// 週間タスクPDF用View（A4縦向き対応）
struct WeeklyTasksPDFView: View {
    let weekDays: [DayTasks]
    let weekStartDate: Date
    let weekEndDate: Date

    // A4縦向き: 210mm x 297mm (72dpi: 595.28 x 841.89 points)
    private let pageWidth: CGFloat = 595.28
    private let pageHeight: CGFloat = 841.89
    private let margin: CGFloat = 30

    var body: some View {
        VStack(spacing: 0) {
            // タイトル
            titleSection

            // 週間カレンダー
            weeklyCalendar

            Spacer()

            // フッター
            footerSection
        }
        .frame(width: pageWidth, height: pageHeight)
        .background(Color.white)
    }

    // MARK: - Title Section

    private var titleSection: some View {
        VStack(spacing: 8) {
            Text("週間学習スケジュール")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(.black)

            Text(weekRangeText)
                .font(.system(size: 14))
                .foregroundColor(.gray)
        }
        .padding(.top, margin)
        .padding(.bottom, 20)
    }

    private var weekRangeText: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy年M月d日"
        return "\(formatter.string(from: weekStartDate)) 〜 \(formatter.string(from: weekEndDate))"
    }

    // MARK: - Weekly Calendar

    private var weeklyCalendar: some View {
        VStack(spacing: 0) {
            ForEach(weekDays, id: \.date) { dayTasks in
                dayRow(dayTasks)
            }
        }
        .padding(.horizontal, margin)
    }

    private func dayRow(_ dayTasks: DayTasks) -> some View {
        VStack(spacing: 0) {
            HStack(alignment: .top, spacing: 12) {
                // 日付ラベル
                VStack(spacing: 2) {
                    Text(dayTasks.dayOfWeekText)
                        .font(.system(size: 10))
                        .foregroundColor(dayOfWeekColor(dayTasks))

                    Text(dayTasks.dateText)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(dayTasks.isToday ? .blue : .black)
                }
                .frame(width: 40)
                .padding(.vertical, 8)

                // タスクリスト
                VStack(alignment: .leading, spacing: 4) {
                    if dayTasks.tasks.isEmpty {
                        Text("タスクなし")
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                            .padding(.vertical, 8)
                    } else {
                        ForEach(dayTasks.tasks) { task in
                            taskRow(task)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.vertical, 8)

                // 進捗
                if dayTasks.totalCount > 0 {
                    VStack(spacing: 2) {
                        Text("\(dayTasks.completedCount)/\(dayTasks.totalCount)")
                            .font(.system(size: 10))
                            .foregroundColor(.gray)

                        if dayTasks.isCompleted {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.green)
                        }
                    }
                    .frame(width: 30)
                    .padding(.vertical, 8)
                }
            }

            Rectangle()
                .fill(Color(white: 0.9))
                .frame(height: 1)
        }
    }

    private func taskRow(_ task: RoadmapDailyTask) -> some View {
        HStack(spacing: 6) {
            // チェックボックス
            Image(systemName: task.status == .completed ? "checkmark.square.fill" : "square")
                .font(.system(size: 10))
                .foregroundColor(task.status == .completed ? .green : .gray)

            // 教材名
            Text(task.materialName)
                .font(.system(size: 11))
                .strikethrough(task.status == .completed)
                .foregroundColor(task.status == .completed ? .gray : .black)
                .lineLimit(1)

            // 範囲
            if !task.chapterRangeText.isEmpty {
                Text("(\(task.chapterRangeText))")
                    .font(.system(size: 9))
                    .foregroundColor(.gray)
            }

            Spacer()

            // 時間
            Text(task.estimatedTimeText)
                .font(.system(size: 9))
                .foregroundColor(.blue)
        }
        .padding(.vertical, 2)
    }

    private func dayOfWeekColor(_ dayTasks: DayTasks) -> Color {
        let weekday = Calendar.current.component(.weekday, from: dayTasks.date)
        if weekday == 1 { return .red } // 日曜
        if weekday == 7 { return .blue } // 土曜
        return .gray
    }

    // MARK: - Footer Section

    private var footerSection: some View {
        HStack {
            // 凡例
            HStack(spacing: 12) {
                HStack(spacing: 4) {
                    Image(systemName: "checkmark.square.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.green)
                    Text("完了")
                        .font(.system(size: 9))
                        .foregroundColor(.gray)
                }

                HStack(spacing: 4) {
                    Image(systemName: "square")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                    Text("未完了")
                        .font(.system(size: 9))
                        .foregroundColor(.gray)
                }
            }

            Spacer()

            Text("Roopy - 学習ロードマップ")
                .font(.system(size: 8))
                .foregroundColor(.gray)
        }
        .padding(.horizontal, margin)
        .padding(.bottom, margin)
    }
}

// MARK: - PDF Export Sheet

struct WeeklyTasksPDFExportSheet: View {
    let weekDays: [DayTasks]
    let weekStartDate: Date
    let weekEndDate: Date

    @Environment(\.dismiss) private var dismiss
    @State private var isGenerating = false
    @State private var showShareSheet = false
    @State private var pdfURL: URL?
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // プレビュー
                previewSection

                // 情報
                infoSection

                Spacer()

                // アクションボタン
                actionButtons
            }
            .padding()
            .navigationTitle("週間タスクPDF出力")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("閉じる") {
                        dismiss()
                    }
                }
            }
            .overlay {
                if isGenerating {
                    generatingOverlay
                }
            }
            .sheet(isPresented: $showShareSheet) {
                if let url = pdfURL {
                    ShareSheet(activityItems: [url])
                }
            }
            .alert("エラー", isPresented: .constant(errorMessage != nil)) {
                Button("OK") {
                    errorMessage = nil
                }
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    // MARK: - Preview Section

    private var previewSection: some View {
        VStack(spacing: 12) {
            Text("プレビュー")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)

            // A4縦向きミニプレビュー
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.white)
                    .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)

                VStack(spacing: 6) {
                    // タイトル
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 80, height: 10)

                    // 週間カレンダープレビュー
                    ForEach(0..<7, id: \.self) { index in
                        HStack(spacing: 8) {
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color.gray.opacity(0.2))
                                .frame(width: 20, height: 8)

                            VStack(spacing: 2) {
                                ForEach(0..<min(2, index + 1), id: \.self) { _ in
                                    RoundedRectangle(cornerRadius: 1)
                                        .fill(Color.blue.opacity(0.3))
                                        .frame(height: 4)
                                }
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                }
                .padding(12)
            }
            .frame(height: 160)
            .aspectRatio(210/297, contentMode: .fit) // A4縦向き比率
        }
    }

    // MARK: - Info Section

    private var infoSection: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "doc.text")
                    .foregroundColor(.blue)
                Text("A4縦向き")
                    .font(.subheadline)
                Spacer()
                Text("210 × 297 mm")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Divider()

            HStack {
                Image(systemName: "calendar")
                    .foregroundColor(.blue)
                Text("期間")
                    .font(.subheadline)
                Spacer()
                Text(weekRangeText)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Divider()

            HStack {
                Image(systemName: "list.bullet")
                    .foregroundColor(.blue)
                Text("総タスク数")
                    .font(.subheadline)
                Spacer()
                Text("\(totalTaskCount) タスク")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var weekRangeText: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M/d"
        return "\(formatter.string(from: weekStartDate)) 〜 \(formatter.string(from: weekEndDate))"
    }

    private var totalTaskCount: Int {
        weekDays.reduce(0) { $0 + $1.tasks.count }
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        VStack(spacing: 12) {
            Button {
                generateAndSharePDF()
            } label: {
                HStack {
                    Image(systemName: "square.and.arrow.up")
                    Text("PDFを共有")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .cornerRadius(12)
            }

            Button {
                generateAndPrintPDF()
            } label: {
                HStack {
                    Image(systemName: "printer")
                    Text("印刷")
                }
                .font(.headline)
                .foregroundColor(.blue)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(12)
            }
        }
    }

    // MARK: - Generating Overlay

    private var generatingOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.5)

                Text("PDFを生成中...")
                    .font(.subheadline)
                    .foregroundColor(.white)
            }
            .padding(32)
            .background(Color(.systemBackground))
            .cornerRadius(16)
        }
    }

    // MARK: - Actions

    private func generateAndSharePDF() {
        isGenerating = true

        Task {
            if let url = await generatePDF() {
                await MainActor.run {
                    self.pdfURL = url
                    self.isGenerating = false
                    self.showShareSheet = true
                }
            } else {
                await MainActor.run {
                    self.isGenerating = false
                    self.errorMessage = "PDFの生成に失敗しました"
                }
            }
        }
    }

    private func generateAndPrintPDF() {
        isGenerating = true

        Task {
            if let url = await generatePDF() {
                await MainActor.run {
                    self.isGenerating = false
                    printPDF(url: url)
                }
            } else {
                await MainActor.run {
                    self.isGenerating = false
                    self.errorMessage = "PDFの生成に失敗しました"
                }
            }
        }
    }

    private func generatePDF() async -> URL? {
        return await MainActor.run {
            WeeklyTasksPDFGenerator.savePDF(
                weekDays: weekDays,
                weekStartDate: weekStartDate,
                weekEndDate: weekEndDate
            )
        }
    }

    private func printPDF(url: URL) {
        guard UIPrintInteractionController.canPrint(url) else {
            errorMessage = "このデバイスでは印刷できません"
            return
        }

        let printController = UIPrintInteractionController.shared
        printController.printingItem = url

        let printInfo = UIPrintInfo(dictionary: nil)
        printInfo.outputType = .general
        printInfo.jobName = "週間学習スケジュール"
        printInfo.orientation = .portrait
        printController.printInfo = printInfo

        printController.present(animated: true)
    }
}

// MARK: - PDF Generator

@MainActor
class WeeklyTasksPDFGenerator {

    static func generatePDF(
        weekDays: [DayTasks],
        weekStartDate: Date,
        weekEndDate: Date
    ) -> Data? {
        let pdfView = WeeklyTasksPDFView(
            weekDays: weekDays,
            weekStartDate: weekStartDate,
            weekEndDate: weekEndDate
        )

        // A4縦向きサイズ
        let pageSize = CGSize(width: 595.28, height: 841.89)

        let renderer = ImageRenderer(content: pdfView)
        renderer.scale = 2.0

        let pdfData = NSMutableData()

        renderer.render { size, context in
            var box = CGRect(origin: .zero, size: pageSize)

            guard let consumer = CGDataConsumer(data: pdfData as CFMutableData),
                  let pdfContext = CGContext(consumer: consumer, mediaBox: &box, nil) else {
                return
            }

            pdfContext.beginPDFPage(nil)
            context(pdfContext)
            pdfContext.endPDFPage()
            pdfContext.closePDF()
        }

        return pdfData as Data
    }

    static func savePDF(
        weekDays: [DayTasks],
        weekStartDate: Date,
        weekEndDate: Date
    ) -> URL? {
        guard let pdfData = generatePDF(
            weekDays: weekDays,
            weekStartDate: weekStartDate,
            weekEndDate: weekEndDate
        ) else {
            return nil
        }

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyyMMdd"
        let filename = "WeeklyTasks_\(formatter.string(from: weekStartDate)).pdf"

        let tempDir = FileManager.default.temporaryDirectory
        let fileURL = tempDir.appendingPathComponent(filename)

        do {
            try pdfData.write(to: fileURL)
            return fileURL
        } catch {
            print("PDF保存エラー: \(error)")
            return nil
        }
    }
}

#Preview {
    WeeklyTasksPDFView(
        weekDays: [],
        weekStartDate: Date(),
        weekEndDate: Calendar.current.date(byAdding: .day, value: 6, to: Date())!
    )
}
