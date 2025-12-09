import SwiftUI

/// 次ステージ開始を促すカード
struct NextStagePromptCard: View {
    let currentStage: String
    let nextStage: String
    let onStartNextStage: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            // 祝福メッセージ
            HStack {
                Image(systemName: "party.popper.fill")
                    .font(.title)
                    .foregroundColor(.yellow)

                VStack(alignment: .leading, spacing: 4) {
                    Text("\(currentStage)完了おめでとう!")
                        .font(.headline)
                        .fontWeight(.bold)

                    Text("次のステージに進む準備ができました")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Spacer()
            }

            Divider()

            // 次ステージ情報
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("次のステージ")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack(spacing: 8) {
                        Text(nextStage)
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.roopyPrimary)

                        Text(stageName(nextStage))
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                Button(action: onStartNextStage) {
                    HStack {
                        Text("開始する")
                        Image(systemName: "arrow.right")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(Color.roopyPrimary)
                    .cornerRadius(12)
                }
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color.yellow.opacity(0.1), Color.orange.opacity(0.1)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.yellow.opacity(0.3), lineWidth: 2)
        )
    }

    private func stageName(_ stageId: String) -> String {
        switch stageId {
        case "E1": return "英単語基礎"
        case "E2": return "英単語標準"
        case "E3": return "基礎文法"
        case "E4": return "基礎文法演習"
        case "E5": return "標準文法"
        case "E6": return "英文解釈入門"
        case "E7": return "英文解釈基礎"
        case "E8": return "長文応用"
        case "E9": return "難関対策"
        case "E10": return "最終仕上げ"
        default: return stageId
        }
    }
}

/// 次ステージ教材選択シート
struct NextStageSelectionSheet: View {
    let roadmap: UserRoadmap
    let nextStageId: String
    let onComplete: () -> Void

    @StateObject private var viewModel = NextStageSelectionViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("教材を読み込み中...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.availableMaterials.isEmpty {
                    noMaterialsView
                } else {
                    materialSelectionContent
                }
            }
            .navigationTitle("\(nextStageId)の教材選択")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("決定") {
                        Task {
                            await viewModel.addNextStageToRoadmap(
                                roadmap: roadmap,
                                stageId: nextStageId
                            )
                            onComplete()
                            dismiss()
                        }
                    }
                    .disabled(viewModel.selectedMaterials.isEmpty || viewModel.isSaving)
                }
            }
            .alert("エラー", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
        .onAppear {
            Task {
                await viewModel.fetchMaterials(for: nextStageId)
            }
        }
    }

    private var noMaterialsView: some View {
        VStack(spacing: 16) {
            Image(systemName: "tray")
                .font(.system(size: 48))
                .foregroundColor(.gray)

            Text("\(nextStageId)の教材がありません")
                .font(.headline)

            Text("このステージの教材は準備中です")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var materialSelectionContent: some View {
        ScrollView {
            VStack(spacing: 16) {
                // ステージ説明
                stageInfoCard

                // カテゴリ別教材
                ForEach(viewModel.groupedMaterials, id: \.category) { group in
                    materialCategorySection(group)
                }

                // 学習時間の目安
                estimatedTimeCard
            }
            .padding()
        }
    }

    private var stageInfoCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(nextStageId)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.roopyPrimary)

                Text(stageName(nextStageId))
                    .font(.headline)
            }

            Text(stageDescription(nextStageId))
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private func materialCategorySection(_ group: MaterialGroup) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(group.category)
                .font(.headline)
                .foregroundColor(.secondary)

            ForEach(group.materials) { material in
                MaterialSelectionRow(
                    material: material,
                    isSelected: viewModel.selectedMaterials.contains(material.id),
                    onToggle: {
                        viewModel.toggleMaterial(material)
                    }
                )
            }
        }
    }

    private var estimatedTimeCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "clock")
                    .foregroundColor(.blue)
                Text("推定学習期間")
                    .font(.subheadline)
                    .fontWeight(.medium)
            }

            Text(viewModel.estimatedDaysText)
                .font(.title3)
                .fontWeight(.bold)

            Text("1日\(roadmap.dailyStudyMinutes)分の学習で計算")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(12)
    }

    private func stageName(_ stageId: String) -> String {
        switch stageId {
        case "E1": return "英単語基礎"
        case "E2": return "英単語標準"
        case "E3": return "基礎文法"
        case "E4": return "基礎文法演習"
        case "E5": return "標準文法"
        case "E6": return "英文解釈入門"
        case "E7": return "英文解釈基礎"
        case "E8": return "長文応用"
        case "E9": return "難関対策"
        case "E10": return "最終仕上げ"
        default: return stageId
        }
    }

    private func stageDescription(_ stageId: String) -> String {
        switch stageId {
        case "E7": return "英文解釈の基礎を固め、構文把握力を養います。長文読解の土台となる重要なステージです。"
        case "E8": return "様々なテーマの長文に取り組み、読解スピードと正確性を高めます。"
        case "E9": return "難関大学レベルの問題に挑戦し、高度な読解力と思考力を養います。"
        case "E10": return "最終仕上げとして、志望校対策と弱点克服を行います。"
        default: return "このステージで学力をさらに伸ばしましょう。"
        }
    }
}

/// 教材選択行
struct MaterialSelectionRow: View {
    let material: EnglishMaterial
    let isSelected: Bool
    let onToggle: () -> Void

    var body: some View {
        Button(action: onToggle) {
            HStack(spacing: 12) {
                // チェックボックス
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundColor(isSelected ? .roopyPrimary : .gray)

                // 教材画像
                if let imageUrl = material.imageUrl, let url = URL(string: imageUrl) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 50, height: 70)
                                .cornerRadius(4)
                        default:
                            placeholderImage
                        }
                    }
                } else {
                    placeholderImage
                }

                // 教材情報
                VStack(alignment: .leading, spacing: 4) {
                    Text(material.materialName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                        .lineLimit(2)

                    HStack(spacing: 8) {
                        if let chapters = material.totalChapters {
                            Label("\(chapters)章", systemImage: "book.closed")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        if let cycles = material.recommendedCycles {
                            Label("\(cycles)周", systemImage: "repeat")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                Spacer()
            }
            .padding()
            .background(isSelected ? Color.roopyPrimary.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.roopyPrimary : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }

    private var placeholderImage: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 4)
                .fill(Color(.systemGray5))
            Image(systemName: "book.closed")
                .foregroundColor(.gray)
        }
        .frame(width: 50, height: 70)
    }
}

#Preview {
    NextStagePromptCard(
        currentStage: "E6",
        nextStage: "E7",
        onStartNextStage: {}
    )
    .padding()
}
