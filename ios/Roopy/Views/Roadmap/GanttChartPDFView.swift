import SwiftUI
import PDFKit

/// PDF出力用のガントチャートView（A4横向き対応）
struct GanttChartPDFView: View {
    let stages: [RoadmapStage]
    let materials: [RoadmapMaterial]
    let startDate: Date
    let endDate: Date
    let roadmapTitle: String

    // A4横向き: 297mm x 210mm (72dpi: 841.89 x 595.28 points)
    // マージンを考慮したサイズ
    private let pageWidth: CGFloat = 841.89
    private let pageHeight: CGFloat = 595.28
    private let margin: CGFloat = 30

    // レイアウト設定
    private let titleHeight: CGFloat = 50
    private let headerHeight: CGFloat = 40
    private let rowHeight: CGFloat = 28
    private let stageHeaderHeight: CGFloat = 24
    private let leftColumnWidth: CGFloat = 140

    private var contentWidth: CGFloat {
        pageWidth - margin * 2 - leftColumnWidth
    }

    private var totalDays: Int {
        max(1, Calendar.current.dateComponents([.day], from: startDate, to: endDate).day ?? 1)
    }

    private var dayWidth: CGFloat {
        contentWidth / CGFloat(totalDays)
    }

    private var groupedMaterials: [(stage: RoadmapStage, materials: [RoadmapMaterial])] {
        stages.map { stage in
            let stageMaterials = materials
                .filter { $0.stageId == stage.stageId }
                .sorted { $0.materialOrder < $1.materialOrder }
            return (stage: stage, materials: stageMaterials)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // タイトル
            titleSection

            // ヘッダー（月・日）
            headerSection

            // コンテンツ
            contentSection

            // フッター
            footerSection

            Spacer()
        }
        .frame(width: pageWidth, height: pageHeight)
        .background(Color.white)
    }

    // MARK: - Title Section

    private var titleSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(roadmapTitle)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.black)

                Text("学習ロードマップ")
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("作成日: \(formatDate(Date()))")
                    .font(.system(size: 10))
                    .foregroundColor(.gray)

                Text("\(formatDate(startDate)) 〜 \(formatDate(endDate))")
                    .font(.system(size: 10))
                    .foregroundColor(.gray)
            }
        }
        .padding(.horizontal, margin)
        .frame(height: titleHeight)
    }

    // MARK: - Header Section

    private var headerSection: some View {
        HStack(spacing: 0) {
            // 左カラムヘッダー
            Text("教材")
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.gray)
                .frame(width: leftColumnWidth, height: headerHeight)
                .background(Color(white: 0.95))
                .overlay(Rectangle().stroke(Color(white: 0.8), lineWidth: 0.5))

            // 月・日ヘッダー
            VStack(spacing: 0) {
                monthHeaderRow
                dayHeaderRow
            }
            .frame(width: contentWidth)
        }
        .padding(.horizontal, margin)
    }

    private var monthHeaderRow: some View {
        HStack(spacing: 0) {
            ForEach(Array(monthRanges.enumerated()), id: \.offset) { _, range in
                Text(monthText(range.month))
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(.black)
                    .frame(width: CGFloat(range.days) * dayWidth, height: headerHeight / 2)
                    .background(Color(white: 0.9))
                    .overlay(Rectangle().stroke(Color(white: 0.8), lineWidth: 0.5))
            }
        }
    }

    private var dayHeaderRow: some View {
        HStack(spacing: 0) {
            ForEach(0..<totalDays, id: \.self) { dayIndex in
                let date = Calendar.current.date(byAdding: .day, value: dayIndex, to: startDate) ?? startDate
                let isToday = Calendar.current.isDateInToday(date)
                let day = Calendar.current.component(.day, from: date)
                let showDay = day == 1 || (dayWidth >= 8 && day % 5 == 0) || (dayWidth >= 15)

                ZStack {
                    Rectangle()
                        .fill(isToday ? Color.blue.opacity(0.3) : Color(white: 0.95))

                    if showDay {
                        Text("\(day)")
                            .font(.system(size: 7))
                            .foregroundColor(isToday ? .blue : .gray)
                    }
                }
                .frame(width: dayWidth, height: headerHeight / 2)
                .overlay(Rectangle().stroke(Color(white: 0.85), lineWidth: 0.5))
            }
        }
    }

    // MARK: - Content Section

    private var contentSection: some View {
        VStack(spacing: 0) {
            ForEach(groupedMaterials, id: \.stage.id) { group in
                // ステージヘッダー
                stageHeaderRow(group.stage)

                // 教材行
                ForEach(group.materials) { material in
                    materialRow(material)
                }
            }
        }
        .padding(.horizontal, margin)
    }

    private func stageHeaderRow(_ stage: RoadmapStage) -> some View {
        HStack(spacing: 0) {
            HStack {
                Text(stage.stageId)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(stageColor(stage.stageId))
                    .cornerRadius(3)
                Spacer()
            }
            .frame(width: leftColumnWidth, height: stageHeaderHeight)
            .padding(.horizontal, 4)
            .background(Color(white: 0.95))
            .overlay(Rectangle().stroke(Color(white: 0.85), lineWidth: 0.5))

            // チャート部分（空白）
            Rectangle()
                .fill(Color(white: 0.95))
                .frame(width: contentWidth, height: stageHeaderHeight)
                .overlay(Rectangle().stroke(Color(white: 0.85), lineWidth: 0.5))
        }
    }

    private func materialRow(_ material: RoadmapMaterial) -> some View {
        let startOffset = max(0, Calendar.current.dateComponents([.day], from: startDate, to: material.plannedStartDate).day ?? 0)
        let duration = max(1, Calendar.current.dateComponents([.day], from: material.plannedStartDate, to: material.plannedEndDate).day ?? 1)
        let barWidth = CGFloat(duration) * dayWidth
        let barOffset = CGFloat(startOffset) * dayWidth

        return HStack(spacing: 0) {
            // 教材名
            Text(material.material?.materialName ?? "不明")
                .font(.system(size: 9))
                .lineLimit(1)
                .foregroundColor(.black)
                .frame(width: leftColumnWidth, height: rowHeight, alignment: .leading)
                .padding(.horizontal, 8)
                .background(Color.white)
                .overlay(Rectangle().stroke(Color(white: 0.85), lineWidth: 0.5))

            // バー
            ZStack(alignment: .leading) {
                // グリッド背景
                gridRow

                // 今日のライン
                todayLineForRow

                // バー
                HStack(spacing: 2) {
                    if material.totalCycles > 1 && barWidth > 30 {
                        Text("\(material.totalCycles)周")
                            .font(.system(size: 7))
                            .foregroundColor(.white)
                    }
                    Spacer()
                    if material.status == .completed {
                        Image(systemName: "checkmark")
                            .font(.system(size: 7))
                            .foregroundColor(.white)
                    }
                }
                .padding(.horizontal, 3)
                .frame(width: max(barWidth - 4, 8), height: rowHeight - 8)
                .background(
                    RoundedRectangle(cornerRadius: 3)
                        .fill(barColor(material))
                )
                .offset(x: barOffset + 2)
            }
            .frame(width: contentWidth, height: rowHeight)
        }
    }

    private var gridRow: some View {
        HStack(spacing: 0) {
            ForEach(0..<totalDays, id: \.self) { dayIndex in
                let date = Calendar.current.date(byAdding: .day, value: dayIndex, to: startDate) ?? startDate
                let weekday = Calendar.current.component(.weekday, from: date)
                let isWeekend = weekday == 1 || weekday == 7

                Rectangle()
                    .fill(isWeekend ? Color(white: 0.97) : Color.white)
                    .frame(width: dayWidth, height: rowHeight)
                    .overlay(Rectangle().stroke(Color(white: 0.9), lineWidth: 0.5))
            }
        }
    }

    private var todayLineForRow: some View {
        let todayOffset = Calendar.current.dateComponents([.day], from: startDate, to: Date()).day ?? 0

        return Group {
            if todayOffset >= 0 && todayOffset <= totalDays {
                Rectangle()
                    .fill(Color.red)
                    .frame(width: 1, height: rowHeight)
                    .offset(x: CGFloat(todayOffset) * dayWidth)
            }
        }
    }

    // MARK: - Footer Section

    private var footerSection: some View {
        HStack(spacing: 16) {
            // 凡例
            HStack(spacing: 12) {
                legendItem(color: .green, label: "完了")
                legendItem(color: .blue, label: "進行中")
                legendItem(color: .gray, label: "未着手")
                legendItem(color: .red.opacity(0.6), label: "今日")
            }

            Spacer()

            Text("Roopy - 学習ロードマップ")
                .font(.system(size: 8))
                .foregroundColor(.gray)
        }
        .padding(.horizontal, margin)
        .padding(.top, 8)
    }

    private func legendItem(color: Color, label: String) -> some View {
        HStack(spacing: 4) {
            RoundedRectangle(cornerRadius: 2)
                .fill(color)
                .frame(width: 12, height: 8)
            Text(label)
                .font(.system(size: 8))
                .foregroundColor(.gray)
        }
    }

    // MARK: - Helpers

    private var monthRanges: [(month: Date, days: Int)] {
        var ranges: [(month: Date, days: Int)] = []
        var currentMonth: Date?
        var daysInMonth = 0

        for i in 0..<totalDays {
            let date = Calendar.current.date(byAdding: .day, value: i, to: startDate) ?? startDate
            let monthStart = Calendar.current.date(from: Calendar.current.dateComponents([.year, .month], from: date))!

            if currentMonth == nil {
                currentMonth = monthStart
                daysInMonth = 1
            } else if monthStart == currentMonth {
                daysInMonth += 1
            } else {
                ranges.append((month: currentMonth!, days: daysInMonth))
                currentMonth = monthStart
                daysInMonth = 1
            }
        }

        if let month = currentMonth {
            ranges.append((month: month, days: daysInMonth))
        }

        return ranges
    }

    private func monthText(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy年M月"
        return formatter.string(from: date)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy/M/d"
        return formatter.string(from: date)
    }

    private func stageColor(_ stageId: String) -> Color {
        let stageNumber = Int(stageId.dropFirst()) ?? 1
        let hue = Double(stageNumber - 1) / 10.0 * 0.6
        return Color(hue: hue, saturation: 0.6, brightness: 0.7)
    }

    private func barColor(_ material: RoadmapMaterial) -> Color {
        switch material.status {
        case .completed:
            return .green
        case .inProgress:
            return .blue
        case .pending:
            return stageColor(material.stageId)
        case .skipped:
            return .orange
        }
    }
}

// MARK: - PDF Generator

@MainActor
class GanttChartPDFGenerator {

    /// ガントチャートをPDFとして生成
    static func generatePDF(
        stages: [RoadmapStage],
        materials: [RoadmapMaterial],
        startDate: Date,
        endDate: Date,
        roadmapTitle: String
    ) -> Data? {
        let pdfView = GanttChartPDFView(
            stages: stages,
            materials: materials,
            startDate: startDate,
            endDate: endDate,
            roadmapTitle: roadmapTitle
        )

        // A4横向きサイズ
        let pageSize = CGSize(width: 841.89, height: 595.28)

        let renderer = ImageRenderer(content: pdfView)
        renderer.scale = 2.0 // 高解像度

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

    /// PDFをファイルに保存
    static func savePDF(
        stages: [RoadmapStage],
        materials: [RoadmapMaterial],
        startDate: Date,
        endDate: Date,
        roadmapTitle: String
    ) -> URL? {
        guard let pdfData = generatePDF(
            stages: stages,
            materials: materials,
            startDate: startDate,
            endDate: endDate,
            roadmapTitle: roadmapTitle
        ) else {
            return nil
        }

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyyMMdd_HHmmss"
        let filename = "Roadmap_\(formatter.string(from: Date())).pdf"

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
    GanttChartPDFView(
        stages: [],
        materials: [],
        startDate: Date(),
        endDate: Calendar.current.date(byAdding: .month, value: 3, to: Date())!,
        roadmapTitle: "英語学習ロードマップ"
    )
}
