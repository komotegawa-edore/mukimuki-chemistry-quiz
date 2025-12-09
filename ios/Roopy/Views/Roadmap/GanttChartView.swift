import SwiftUI

/// ガントチャート表示View
/// ヘッダー固定・左カラム固定・スクロール連動対応
struct GanttChartView: View {
    let stages: [RoadmapStage]
    let materials: [RoadmapMaterial]
    let futureStages: [FutureStageEstimate]  // 将来のステージ予測
    let startDate: Date
    let endDate: Date
    let examDate: Date?  // 入試日

    @State private var selectedMaterial: RoadmapMaterial?
    @State private var contentOffset: CGPoint = .zero

    // 表示設定
    private let dayWidth: CGFloat = 12
    private let rowHeight: CGFloat = 40
    private let stageHeaderHeight: CGFloat = 32
    private let headerHeight: CGFloat = 56
    private let leftColumnWidth: CGFloat = 110

    private var totalDays: Int {
        max(1, Calendar.current.dateComponents([.day], from: startDate, to: endDate).day ?? 1)
    }

    private var chartWidth: CGFloat {
        CGFloat(totalDays) * dayWidth
    }

    private var totalRowHeight: CGFloat {
        var height: CGFloat = 0
        for group in groupedMaterials {
            height += stageHeaderHeight
            height += CGFloat(group.materials.count) * rowHeight
        }
        // 将来のステージの高さを追加（通常の教材と同じ高さ）
        if !futureStages.isEmpty {
            height += stageHeaderHeight  // "将来の予定"ヘッダー
            height += CGFloat(futureStages.count) * rowHeight
        }
        return max(height, 100)
    }

    var body: some View {
        GeometryReader { geometry in
            let visibleWidth = geometry.size.width - leftColumnWidth
            let visibleHeight = geometry.size.height - headerHeight

            VStack(spacing: 0) {
                // 上部: ヘッダー行
                HStack(spacing: 0) {
                    // 左上コーナー（完全固定）
                    cornerHeader
                        .frame(width: leftColumnWidth, height: headerHeight)

                    // 上部ヘッダー（横スクロール連動）
                    headerView
                        .frame(width: chartWidth, height: headerHeight)
                        .offset(x: -contentOffset.x)
                        .frame(width: visibleWidth, height: headerHeight, alignment: .leading)
                        .clipped()
                }

                // 下部: 左カラム + チャートエリア
                HStack(spacing: 0) {
                    // 左カラム（縦スクロール連動）
                    leftColumn
                        .frame(width: leftColumnWidth, height: totalRowHeight)
                        .offset(y: -contentOffset.y)
                        .frame(width: leftColumnWidth, height: visibleHeight, alignment: .top)
                        .clipped()

                    // メインチャートエリア（スクロール可能）
                    ScrollViewWithOffset(offset: $contentOffset) {
                        chartContent
                            .frame(width: chartWidth, height: totalRowHeight)
                    }
                    .frame(width: visibleWidth, height: visibleHeight)
                    .clipped()
                }
            }
        }
        .sheet(item: $selectedMaterial) { material in
            MaterialDetailSheet(material: material)
        }
    }

    // MARK: - Corner Header

    private var cornerHeader: some View {
        VStack {
            Spacer()
            Text("教材")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGray6))
        .overlay(
            Rectangle()
                .stroke(Color(.systemGray4), lineWidth: 0.5)
        )
    }

    // MARK: - Header

    private var headerView: some View {
        VStack(spacing: 0) {
            monthHeaderRow
            dayHeaderRow
        }
        .background(Color(.systemBackground))
    }

    private var monthHeaderRow: some View {
        HStack(spacing: 0) {
            ForEach(Array(monthRanges.enumerated()), id: \.offset) { _, range in
                Text(monthText(range.month))
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .frame(width: CGFloat(range.days) * dayWidth, height: 28)
                    .background(Color(.systemGray5))
                    .overlay(
                        Rectangle()
                            .stroke(Color(.systemGray4), lineWidth: 0.5)
                    )
            }
        }
    }

    private var dayHeaderRow: some View {
        HStack(spacing: 0) {
            ForEach(0..<totalDays, id: \.self) { dayIndex in
                let date = Calendar.current.date(byAdding: .day, value: dayIndex, to: startDate) ?? startDate
                let isToday = Calendar.current.isDateInToday(date)
                let isWeekend = Calendar.current.isDateInWeekend(date)
                let day = Calendar.current.component(.day, from: date)

                ZStack {
                    Rectangle()
                        .fill(isToday ? Color.blue : Color(.systemGray6))

                    if day == 1 || day % 5 == 0 || isToday {
                        Text("\(day)")
                            .font(.system(size: 10))
                            .fontWeight(isToday ? .bold : .regular)
                            .foregroundColor(isToday ? .white : (isWeekend ? .red : .secondary))
                    }
                }
                .frame(width: dayWidth, height: 28)
                .overlay(
                    Rectangle()
                        .stroke(Color(.systemGray5), lineWidth: 0.5)
                )
            }
        }
    }

    // MARK: - Left Column

    private var leftColumn: some View {
        VStack(spacing: 0) {
            ForEach(groupedMaterials, id: \.stage.id) { group in
                // ステージヘッダー
                leftColumnStageHeader(stageId: group.stage.stageId)

                // 教材行（タップで詳細表示）
                ForEach(group.materials) { material in
                    leftColumnMaterialRow(material: material)
                }
            }

            // 将来のステージ（予測）
            if !futureStages.isEmpty {
                // 将来の予定ヘッダー
                leftColumnFutureHeader

                // 将来のステージ行
                ForEach(futureStages) { stage in
                    leftColumnFutureRow(stage: stage)
                }
            }
        }
        .background(Color(.systemBackground))
    }

    /// 左カラム - ステージヘッダー
    private func leftColumnStageHeader(stageId: String) -> some View {
        ZStack {
            Rectangle()
                .fill(Color(.systemGray6))

            HStack {
                Text(stageId)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(stageColor(stageId))
                    .cornerRadius(4)
                Spacer()
            }
            .padding(.horizontal, 8)
        }
        .frame(width: leftColumnWidth, height: stageHeaderHeight)
        .overlay(
            Rectangle()
                .stroke(Color(.systemGray5), lineWidth: 0.5)
        )
    }

    /// 左カラム - 教材行
    private func leftColumnMaterialRow(material: RoadmapMaterial) -> some View {
        Button {
            selectedMaterial = material
        } label: {
            ZStack {
                Rectangle()
                    .fill(Color(.systemBackground))

                HStack {
                    Text(material.material?.materialName ?? "不明")
                        .font(.system(size: 12))
                        .lineLimit(1)
                        .foregroundColor(.primary)
                    Spacer()
                    Image(systemName: "info.circle")
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal, 8)
            }
            .frame(width: leftColumnWidth, height: rowHeight)
            .overlay(
                Rectangle()
                    .stroke(Color(.systemGray5), lineWidth: 0.5)
            )
        }
        .buttonStyle(.plain)
    }

    /// 左カラム - 将来の予定ヘッダー
    private var leftColumnFutureHeader: some View {
        ZStack {
            LinearGradient(
                colors: [Color.orange.opacity(0.15), Color.orange.opacity(0.08)],
                startPoint: .leading,
                endPoint: .trailing
            )

            HStack(spacing: 6) {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.caption)
                    .foregroundColor(.orange)
                Text("将来の予測")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
                Spacer()
                Text("(\(futureStages.count)件)")
                    .font(.system(size: 10))
                    .foregroundColor(.orange.opacity(0.7))
            }
            .padding(.horizontal, 8)
        }
        .frame(width: leftColumnWidth, height: stageHeaderHeight)
        .overlay(
            Rectangle()
                .stroke(Color.orange.opacity(0.4), lineWidth: 0.5)
        )
    }

    /// 左カラム - 将来のステージ行
    private func leftColumnFutureRow(stage: FutureStageEstimate) -> some View {
        let stageClr = stageColor(stage.stageId)

        return ZStack {
            Rectangle()
                .fill(Color(.systemGray6).opacity(0.3))

            HStack(spacing: 6) {
                Text(stage.stageId)
                    .font(.system(size: 11))
                    .fontWeight(.semibold)
                    .foregroundColor(stageClr)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(
                        RoundedRectangle(cornerRadius: 4)
                            .strokeBorder(stageClr, style: StrokeStyle(lineWidth: 1, dash: [3, 2]))
                            .background(stageClr.opacity(0.1).clipShape(RoundedRectangle(cornerRadius: 4)))
                    )
                Spacer()
                Text(stage.dateRangeText)
                    .font(.system(size: 9))
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 8)
        }
        .frame(width: leftColumnWidth, height: rowHeight)
        .overlay(
            Rectangle()
                .stroke(Color(.systemGray5), lineWidth: 0.5)
        )
    }

    // MARK: - Chart Content

    private var chartContent: some View {
        ZStack(alignment: .topLeading) {
            // グリッド背景
            gridBackground

            // バー
            VStack(spacing: 0) {
                ForEach(groupedMaterials, id: \.stage.id) { group in
                    // ステージヘッダー行
                    chartStageHeader

                    // 教材バー
                    ForEach(group.materials) { material in
                        materialBar(material)
                    }
                }

                // 将来のステージ（予測）
                if !futureStages.isEmpty {
                    // 将来の予定ヘッダー行
                    chartFutureHeader

                    // 将来のステージバー
                    ForEach(futureStages) { stage in
                        futureStageBar(stage)
                    }
                }
            }

            // 入試日ライン
            examDateLine

            // 今日のライン（最前面）
            todayLine
        }
    }

    /// チャート - ステージヘッダー行
    private var chartStageHeader: some View {
        Rectangle()
            .fill(Color(.systemGray6))
            .frame(width: chartWidth, height: stageHeaderHeight)
            .overlay(
                Rectangle()
                    .stroke(Color(.systemGray5), lineWidth: 0.5)
            )
    }

    /// チャート - 将来の予定ヘッダー行
    private var chartFutureHeader: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    colors: [Color.orange.opacity(0.15), Color.orange.opacity(0.08)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .frame(width: chartWidth, height: stageHeaderHeight)
            .overlay(
                Rectangle()
                    .stroke(Color.orange.opacity(0.4), lineWidth: 0.5)
            )
    }

    private var gridBackground: some View {
        Canvas { context, size in
            for i in 0...totalDays {
                let x = CGFloat(i) * dayWidth
                let date = Calendar.current.date(byAdding: .day, value: i, to: startDate) ?? startDate
                let weekday = Calendar.current.component(.weekday, from: date)
                let isWeekStart = weekday == 1

                var path = Path()
                path.move(to: CGPoint(x: x, y: 0))
                path.addLine(to: CGPoint(x: x, y: size.height))

                context.stroke(
                    path,
                    with: .color(isWeekStart ? Color(.systemGray3) : Color(.systemGray5)),
                    lineWidth: isWeekStart ? 1 : 0.5
                )
            }
        }
        .frame(width: chartWidth, height: totalRowHeight)
        .background(Color(.systemBackground))
    }

    private var todayLine: some View {
        let todayOffset = Calendar.current.dateComponents([.day], from: startDate, to: Date()).day ?? 0

        return Group {
            if todayOffset >= 0 && todayOffset <= totalDays {
                Rectangle()
                    .fill(Color.red)
                    .frame(width: 2, height: totalRowHeight)
                    .offset(x: CGFloat(todayOffset) * dayWidth - 1)
            }
        }
    }

    /// 入試日ライン
    private var examDateLine: some View {
        Group {
            if let exam = examDate {
                let examOffset = Calendar.current.dateComponents([.day], from: startDate, to: exam).day ?? 0
                if examOffset >= 0 && examOffset <= totalDays {
                    VStack(spacing: 0) {
                        // 入試日ラベル
                        Text("入試")
                            .font(.system(size: 9))
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(Color.purple)
                            .cornerRadius(4)
                            .offset(y: -2)

                        Rectangle()
                            .fill(Color.purple)
                            .frame(width: 2, height: totalRowHeight)
                    }
                    .offset(x: CGFloat(examOffset) * dayWidth - 1)
                }
            }
        }
    }

    /// 将来のステージバー（予測スタイル - ストライプパターン）
    private func futureStageBar(_ stage: FutureStageEstimate) -> some View {
        let startOffset = max(0, Calendar.current.dateComponents([.day], from: startDate, to: stage.estimatedStartDate).day ?? 0)
        let duration = max(1, Calendar.current.dateComponents([.day], from: stage.estimatedStartDate, to: stage.estimatedEndDate).day ?? 1)
        let barWidth = CGFloat(duration) * dayWidth
        let barOffset = CGFloat(startOffset) * dayWidth
        let stageClr = stageColor(stage.stageId)

        return ZStack(alignment: .leading) {
            // 背景行
            Rectangle()
                .fill(Color(.systemGray6).opacity(0.3))
                .frame(width: chartWidth, height: rowHeight)
                .overlay(
                    Rectangle()
                        .stroke(Color(.systemGray5), lineWidth: 0.5)
                )

            // バー（予測スタイル - ストライプ + 破線枠）
            ZStack {
                // 斜線パターン背景
                RoundedRectangle(cornerRadius: 4)
                    .fill(stageClr.opacity(0.25))

                // ストライプパターン（予測を示す）
                DiagonalStripePattern(color: stageClr.opacity(0.4), lineWidth: 2, spacing: 6)
                    .clipShape(RoundedRectangle(cornerRadius: 4))

                // 破線の枠
                RoundedRectangle(cornerRadius: 4)
                    .strokeBorder(stageClr, style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))

                // テキスト
                HStack(spacing: 4) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(size: 9))
                        .foregroundColor(stageClr)
                    Text(stage.stageId)
                        .font(.system(size: 10))
                        .fontWeight(.semibold)
                        .foregroundColor(stageClr)
                    Spacer()
                    if barWidth > 60 {
                        Text("\(stage.estimatedDays)日")
                            .font(.system(size: 10))
                            .fontWeight(.medium)
                            .foregroundColor(stageClr)
                    }
                }
                .padding(.horizontal, 6)
            }
            .frame(width: max(barWidth - 6, 30), height: rowHeight - 10)
            .offset(x: barOffset + 3)
        }
        .frame(width: chartWidth, height: rowHeight)
    }

    private func materialBar(_ material: RoadmapMaterial) -> some View {
        let startOffset = max(0, Calendar.current.dateComponents([.day], from: startDate, to: material.plannedStartDate).day ?? 0)
        let duration = max(1, Calendar.current.dateComponents([.day], from: material.plannedStartDate, to: material.plannedEndDate).day ?? 1)
        let barWidth = CGFloat(duration) * dayWidth
        let barOffset = CGFloat(startOffset) * dayWidth

        return ZStack(alignment: .leading) {
            // 背景行
            Rectangle()
                .fill(Color(.systemBackground))
                .frame(width: chartWidth, height: rowHeight)
                .overlay(
                    Rectangle()
                        .stroke(Color(.systemGray5), lineWidth: 0.5)
                )

            // バー
            Button {
                selectedMaterial = material
            } label: {
                HStack(spacing: 2) {
                    if material.totalCycles > 1 && barWidth > 35 {
                        Text("\(material.totalCycles)周")
                            .font(.system(size: 10))
                            .foregroundColor(.white)
                    }
                    Spacer()
                    if material.status == .completed {
                        Image(systemName: "checkmark")
                            .font(.system(size: 10))
                            .foregroundColor(.white)
                    } else if material.status == .inProgress && barWidth > 45 {
                        Text("\(material.currentCycle)/\(material.totalCycles)")
                            .font(.system(size: 10))
                            .foregroundColor(.white)
                    }
                }
                .padding(.horizontal, 4)
                .frame(width: max(barWidth - 6, 10), height: rowHeight - 12)
                .background(
                    RoundedRectangle(cornerRadius: 4)
                        .fill(barColor(material))
                        .shadow(color: .black.opacity(0.1), radius: 1, x: 0, y: 1)
                )
            }
            .buttonStyle(.plain)
            .offset(x: barOffset + 3)
        }
        .frame(width: chartWidth, height: rowHeight)
    }

    // MARK: - Helpers

    private var groupedMaterials: [(stage: RoadmapStage, materials: [RoadmapMaterial])] {
        stages.map { stage in
            let stageMaterials = materials
                .filter { $0.stageId == stage.stageId }
                .sorted { $0.materialOrder < $1.materialOrder }
            return (stage: stage, materials: stageMaterials)
        }
    }

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
        formatter.dateFormat = "M月"
        return formatter.string(from: date)
    }

    private func stageColor(_ stageId: String) -> Color {
        // 過去問演習フェーズは紫色
        if stageId == "過去問" || stageId == "EXAM" {
            return .purple
        }
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

// MARK: - Scroll Offset Preference Key

struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGPoint = .zero
    static func reduce(value: inout CGPoint, nextValue: () -> CGPoint) {
        value = nextValue()
    }
}

// MARK: - ScrollView with Offset Tracking (Legacy - UIKit版)

struct ScrollViewWithOffset<Content: View>: UIViewRepresentable {
    @Binding var offset: CGPoint
    let content: () -> Content

    func makeUIView(context: Context) -> UIScrollView {
        let scrollView = UIScrollView()
        scrollView.delegate = context.coordinator
        scrollView.showsHorizontalScrollIndicator = true
        scrollView.showsVerticalScrollIndicator = true
        scrollView.bounces = true
        scrollView.alwaysBounceHorizontal = true
        scrollView.alwaysBounceVertical = true
        scrollView.contentInsetAdjustmentBehavior = .never  // Safe area insetを無効化

        let hostingController = UIHostingController(rootView: content())
        hostingController.view.backgroundColor = .clear
        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        // Safe area marginを無効化
        if #available(iOS 16.4, *) {
            hostingController.safeAreaRegions = []
        }

        scrollView.addSubview(hostingController.view)

        NSLayoutConstraint.activate([
            hostingController.view.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor),
            hostingController.view.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor),
            hostingController.view.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
            hostingController.view.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor),
        ])

        context.coordinator.hostingController = hostingController

        return scrollView
    }

    func updateUIView(_ scrollView: UIScrollView, context: Context) {
        context.coordinator.hostingController?.rootView = content()
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(offset: $offset)
    }

    class Coordinator: NSObject, UIScrollViewDelegate {
        @Binding var offset: CGPoint
        var hostingController: UIHostingController<Content>?

        init(offset: Binding<CGPoint>) {
            _offset = offset
        }

        func scrollViewDidScroll(_ scrollView: UIScrollView) {
            let newOffset = scrollView.contentOffset
            if self.offset != newOffset {
                self.offset = newOffset
            }
        }
    }
}

// MARK: - Material Detail Sheet

struct MaterialDetailSheet: View {
    let material: RoadmapMaterial
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // 教材画像と基本情報
                    HStack(alignment: .top, spacing: 16) {
                        // 教材画像
                        if let imageUrl = material.material?.imageUrl, let url = URL(string: imageUrl) {
                            AsyncImage(url: url) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: 100, height: 140)
                                        .cornerRadius(8)
                                        .shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2)
                                case .failure:
                                    placeholderImage
                                case .empty:
                                    ProgressView()
                                        .frame(width: 100, height: 140)
                                @unknown default:
                                    placeholderImage
                                }
                            }
                        } else {
                            placeholderImage
                        }

                        // 教材名と基本情報
                        VStack(alignment: .leading, spacing: 8) {
                            Text(material.material?.materialName ?? "不明な教材")
                                .font(.headline)
                                .fontWeight(.bold)
                                .lineLimit(3)

                            if let category = material.material?.materialCategory {
                                HStack(spacing: 4) {
                                    Image(systemName: categoryIcon(category))
                                        .font(.caption)
                                    Text(category)
                                        .font(.caption)
                                }
                                .foregroundColor(.secondary)
                            }

                            StatusBadge(status: material.status)
                        }

                        Spacer()
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    // 詳細情報
                    VStack(spacing: 12) {
                        DetailRow(label: "ステージ", value: material.stageId)

                        Divider()

                        DetailRow(
                            label: "予定期間",
                            value: "\(formatDate(material.plannedStartDate)) 〜 \(formatDate(material.plannedEndDate))"
                        )

                        let days = Calendar.current.dateComponents([.day], from: material.plannedStartDate, to: material.plannedEndDate).day ?? 0
                        DetailRow(label: "期間", value: "\(days)日間")

                        Divider()

                        DetailRow(label: "周回数", value: "\(material.currentCycle) / \(material.totalCycles) 周")

                        if let chapters = material.material?.totalChapters, chapters > 0 {
                            DetailRow(label: "総章数", value: "\(chapters)章")
                        }

                        if let difficulty = material.material?.difficultyLevel {
                            DetailRow(label: "難易度", value: difficulty)
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    // 備考（あれば）
                    if let notes = material.material?.notes, !notes.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("備考")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)

                            Text(notes)
                                .font(.subheadline)
                                .foregroundColor(.primary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                }
                .padding()
            }
            .navigationTitle("教材詳細")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("閉じる") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private var placeholderImage: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(.systemGray5))
            Image(systemName: "book.closed")
                .font(.system(size: 30))
                .foregroundColor(.gray)
        }
        .frame(width: 100, height: 140)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M/d"
        return formatter.string(from: date)
    }

    private func categoryIcon(_ category: String) -> String {
        switch category {
        case "英単語": return "textformat.abc"
        case "英熟語": return "text.word.spacing"
        case "文法": return "text.book.closed"
        case "文法演習": return "pencil.and.list.clipboard"
        case "解釈": return "magnifyingglass"
        case "長文": return "doc.text"
        case "英作文": return "pencil"
        case "リスニング": return "headphones"
        default: return "book"
        }
    }
}

struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}

struct StatusBadge: View {
    let status: TaskStatus

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)
            Text(statusText)
                .font(.caption)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(statusColor.opacity(0.1))
        .cornerRadius(8)
    }

    private var statusColor: Color {
        switch status {
        case .completed: return .green
        case .inProgress: return .blue
        case .pending: return .gray
        case .skipped: return .orange
        }
    }

    private var statusText: String {
        switch status {
        case .completed: return "完了"
        case .inProgress: return "進行中"
        case .pending: return "未着手"
        case .skipped: return "スキップ"
        }
    }
}

// MARK: - Diagonal Stripe Pattern

/// 斜線ストライプパターン（将来の予測を示すため）
struct DiagonalStripePattern: View {
    let color: Color
    let lineWidth: CGFloat
    let spacing: CGFloat

    var body: some View {
        GeometryReader { geometry in
            Canvas { context, size in
                let stripeSpacing = lineWidth + spacing
                let diagonal = sqrt(size.width * size.width + size.height * size.height)
                let numStripes = Int(diagonal / stripeSpacing) + 2

                for i in -numStripes...numStripes {
                    var path = Path()
                    let offset = CGFloat(i) * stripeSpacing
                    path.move(to: CGPoint(x: offset, y: 0))
                    path.addLine(to: CGPoint(x: offset + size.height, y: size.height))
                    context.stroke(path, with: .color(color), lineWidth: lineWidth)
                }
            }
        }
    }
}

#Preview {
    GanttChartView(
        stages: [],
        materials: [],
        futureStages: [
            FutureStageEstimate(
                id: "E7",
                stageId: "E7",
                stageName: "E7 発展",
                estimatedStartDate: Date(),
                estimatedEndDate: Calendar.current.date(byAdding: .day, value: 30, to: Date())!,
                estimatedDays: 30
            ),
            FutureStageEstimate(
                id: "E8",
                stageId: "E8",
                stageName: "E8 難関",
                estimatedStartDate: Calendar.current.date(byAdding: .day, value: 31, to: Date())!,
                estimatedEndDate: Calendar.current.date(byAdding: .day, value: 60, to: Date())!,
                estimatedDays: 29
            )
        ],
        startDate: Date(),
        endDate: Calendar.current.date(byAdding: .month, value: 3, to: Date())!,
        examDate: Calendar.current.date(byAdding: .month, value: 4, to: Date())
    )
}
