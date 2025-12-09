import SwiftUI

/// 履歴画面
struct HistoryView: View {
    @StateObject private var viewModel = HistoryViewModel()
    @State private var selectedFilter: HistoryFilter = .all

    var body: some View {
        VStack(spacing: 0) {
            // フィルター
            Picker("フィルター", selection: $selectedFilter) {
                ForEach(HistoryFilter.allCases, id: \.self) { filter in
                    Text(filter.displayName).tag(filter)
                }
            }
            .pickerStyle(.segmented)
            .padding()

            if viewModel.isLoading {
                Spacer()
                ProgressView()
                    .scaleEffect(1.5)
                Spacer()
            } else if filteredResults.isEmpty {
                Spacer()
                VStack(spacing: 16) {
                    Image(systemName: "doc.text.magnifyingglass")
                        .font(.system(size: 48))
                        .foregroundColor(.gray)

                    Text("まだ履歴がありません")
                        .font(.headline)
                        .foregroundColor(.secondary)

                    Text("クイズに挑戦すると履歴が表示されます")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                Spacer()
            } else {
                List {
                    ForEach(groupedResults, id: \.0) { date, results in
                        Section(header: Text(date)) {
                            ForEach(results) { result in
                                HistoryRow(result: result)
                            }
                        }
                    }
                }
                .listStyle(.insetGrouped)
            }
        }
        .background(Color.roopyBackgroundLight)
        .navigationTitle("履歴")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadHistory()
        }
    }

    private var filteredResults: [TestResult] {
        switch selectedFilter {
        case .all:
            return viewModel.results
        case .passed:
            return viewModel.results.filter { $0.percentage >= 80 }
        case .failed:
            return viewModel.results.filter { $0.percentage < 80 }
        }
    }

    private var groupedResults: [(String, [TestResult])] {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy年M月d日"
        formatter.locale = Locale(identifier: "ja_JP")

        let grouped = Dictionary(grouping: filteredResults) { result -> String in
            formatter.string(from: result.createdAt ?? Date())
        }

        return grouped.sorted { $0.key > $1.key }
    }
}

/// 履歴フィルター
enum HistoryFilter: CaseIterable {
    case all
    case passed
    case failed

    var displayName: String {
        switch self {
        case .all: return "すべて"
        case .passed: return "合格 (80%+)"
        case .failed: return "不合格"
        }
    }
}

/// 履歴行
struct HistoryRow: View {
    let result: TestResult

    private var scoreColor: Color {
        if result.percentage >= 80 {
            return .green
        } else if result.percentage >= 60 {
            return .orange
        }
        return .red
    }

    private var timeText: String {
        guard let date = result.createdAt else { return "" }
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }

    var body: some View {
        HStack(spacing: 16) {
            // スコア
            ZStack {
                Circle()
                    .stroke(scoreColor.opacity(0.3), lineWidth: 4)
                    .frame(width: 50, height: 50)

                Circle()
                    .trim(from: 0, to: result.percentage / 100)
                    .stroke(scoreColor, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .frame(width: 50, height: 50)
                    .rotationEffect(.degrees(-90))

                Text("\(Int(result.percentage))%")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(scoreColor)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("第\(result.chapterId)章")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)

                HStack(spacing: 8) {
                    Text("\(result.score)/\(result.total)問")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(timeText)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            // 合格/不合格バッジ
            if result.percentage >= 80 {
                Text("合格")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(8)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    NavigationStack {
        HistoryView()
    }
}
