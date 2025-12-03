import SwiftUI
import UIKit

/// PDF出力オプションシート
struct PDFExportSheet: View {
    let stages: [RoadmapStage]
    let materials: [RoadmapMaterial]
    let startDate: Date
    let endDate: Date
    let roadmapTitle: String

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
            .navigationTitle("PDF出力")
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

            // ミニプレビュー
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.white)
                    .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)

                // A4横向きの縮小版
                VStack(spacing: 4) {
                    // タイトル行
                    HStack {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.gray.opacity(0.3))
                            .frame(width: 80, height: 8)
                        Spacer()
                    }

                    // ヘッダー行
                    HStack(spacing: 2) {
                        RoundedRectangle(cornerRadius: 1)
                            .fill(Color.gray.opacity(0.2))
                            .frame(width: 40, height: 12)

                        ForEach(0..<8, id: \.self) { _ in
                            RoundedRectangle(cornerRadius: 1)
                                .fill(Color.gray.opacity(0.15))
                                .frame(height: 12)
                        }
                    }

                    // コンテンツ行
                    ForEach(0..<min(stages.count, 5), id: \.self) { index in
                        HStack(spacing: 2) {
                            RoundedRectangle(cornerRadius: 1)
                                .fill(Color.gray.opacity(0.2))
                                .frame(width: 40, height: 8)

                            GeometryReader { geo in
                                let offset = CGFloat(index) * 0.1
                                let width = 0.3 + CGFloat(index) * 0.05

                                RoundedRectangle(cornerRadius: 2)
                                    .fill(stagePreviewColor(index))
                                    .frame(width: geo.size.width * width, height: 6)
                                    .offset(x: geo.size.width * offset)
                            }
                            .frame(height: 8)
                        }
                    }
                }
                .padding(12)
            }
            .frame(height: 120)
            .aspectRatio(297/210, contentMode: .fit) // A4横向き比率
        }
    }

    private func stagePreviewColor(_ index: Int) -> Color {
        let colors: [Color] = [.blue, .green, .purple, .orange, .pink]
        return colors[index % colors.count].opacity(0.6)
    }

    // MARK: - Info Section

    private var infoSection: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "doc.text")
                    .foregroundColor(.blue)
                Text("A4横向き")
                    .font(.subheadline)
                Spacer()
                Text("297 × 210 mm")
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
                Text("\(formatDate(startDate)) 〜 \(formatDate(endDate))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Divider()

            HStack {
                Image(systemName: "square.stack.3d.up")
                    .foregroundColor(.blue)
                Text("ステージ数")
                    .font(.subheadline)
                Spacer()
                Text("\(stages.count) ステージ")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Divider()

            HStack {
                Image(systemName: "book.closed")
                    .foregroundColor(.blue)
                Text("教材数")
                    .font(.subheadline)
                Spacer()
                Text("\(materials.count) 冊")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        VStack(spacing: 12) {
            // PDF生成＆共有ボタン
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

            // 印刷ボタン
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
            GanttChartPDFGenerator.savePDF(
                stages: stages,
                materials: materials,
                startDate: startDate,
                endDate: endDate,
                roadmapTitle: roadmapTitle
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
        printInfo.jobName = "学習ロードマップ"
        printInfo.orientation = .landscape
        printController.printInfo = printInfo

        printController.present(animated: true)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy/M/d"
        return formatter.string(from: date)
    }
}

// MARK: - Share Sheet

struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        let controller = UIActivityViewController(
            activityItems: activityItems,
            applicationActivities: nil
        )
        return controller
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    PDFExportSheet(
        stages: [],
        materials: [],
        startDate: Date(),
        endDate: Calendar.current.date(byAdding: .month, value: 3, to: Date())!,
        roadmapTitle: "英語学習ロードマップ"
    )
}
