import SwiftUI

/// 教材選択画面
struct MaterialSelectionView: View {
    let materialGroups: [MaterialGroup]
    @Binding var selections: MaterialSelections
    let onConfirm: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var expandedPhases: Set<StudyPhase> = Set(StudyPhase.allCases)

    /// フェーズごとにグループ化
    private var groupedByPhase: [(phase: StudyPhase, groups: [MaterialGroup])] {
        StudyPhase.allCases.compactMap { phase in
            let groups = materialGroups.filter { group in
                phase.categories.contains(group.category)
            }
            return groups.isEmpty ? nil : (phase: phase, groups: groups)
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // ヘッダー説明
                    headerSection

                    // フェーズごとに表示
                    ForEach(groupedByPhase, id: \.phase.id) { item in
                        PhaseSelectionSection(
                            phase: item.phase,
                            groups: item.groups,
                            selections: $selections,
                            isExpanded: expandedPhases.contains(item.phase)
                        ) {
                            withAnimation {
                                if expandedPhases.contains(item.phase) {
                                    expandedPhases.remove(item.phase)
                                } else {
                                    expandedPhases.insert(item.phase)
                                }
                            }
                        }
                    }

                    // 確定ボタン
                    confirmButton
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("教材を選択")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("戻る") {
                        dismiss()
                    }
                }
            }
        }
    }

    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "books.vertical.fill")
                .font(.system(size: 40))
                .foregroundColor(.blue)

            Text("使用する教材を選択")
                .font(.title3)
                .fontWeight(.bold)

            Text("各カテゴリから1冊ずつ選んでください\n同じレベルの教材から好みのものを選べます")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(12)
    }

    private var confirmButton: some View {
        Button {
            onConfirm()
        } label: {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                Text("この教材でロードマップを作成")
            }
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue)
            .cornerRadius(12)
        }
    }
}

/// フェーズごとの選択セクション
struct PhaseSelectionSection: View {
    let phase: StudyPhase
    let groups: [MaterialGroup]
    @Binding var selections: MaterialSelections
    let isExpanded: Bool
    let onToggle: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // ヘッダー
            Button(action: onToggle) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            Text(phase.displayName)
                                .font(.headline)
                                .fontWeight(.bold)

                            if phase.runsInParallel {
                                Text("常時")
                                    .font(.caption2)
                                    .fontWeight(.medium)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color.orange)
                                    .cornerRadius(4)
                            }
                        }

                        Text("\(groups.count)カテゴリ")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundColor(.gray)
                }
                .padding()
                .background(Color.white)
            }
            .buttonStyle(.plain)

            // コンテンツ
            if isExpanded {
                VStack(spacing: 16) {
                    ForEach(groups) { group in
                        MaterialGroupCard(
                            group: group,
                            selectedMaterial: selections.selectedMaterial(for: group),
                            onSelect: { material in
                                selections.select(material, for: group)
                            }
                        )
                    }
                }
                .padding()
                .background(Color(.systemGray6))
            }
        }
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

/// 教材グループカード
struct MaterialGroupCard: View {
    let group: MaterialGroup
    let selectedMaterial: EnglishMaterial?
    let onSelect: (EnglishMaterial) -> Void

    @State private var isExpanded = true

    var body: some View {
        VStack(spacing: 12) {
            // グループヘッダー
            Button {
                withAnimation(.spring(response: 0.3)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack {
                    Image(systemName: group.categoryIcon)
                        .font(.title3)
                        .foregroundColor(.blue)
                        .frame(width: 32)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(group.stageName)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.primary)

                        Text(group.categoryDescription)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    // 選択中の教材
                    if let selected = selectedMaterial {
                        Text(selected.materialName)
                            .font(.caption)
                            .foregroundColor(.blue)
                            .lineLimit(1)
                    }

                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            .buttonStyle(.plain)

            // 教材リスト（展開時）
            if isExpanded {
                VStack(spacing: 8) {
                    ForEach(group.materials) { material in
                        MaterialSelectableRow(
                            material: material,
                            isSelected: selectedMaterial?.id == material.id,
                            onTap: { onSelect(material) }
                        )
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(10)
    }
}

/// 教材選択行（画像付き）
struct MaterialSelectableRow: View {
    let material: EnglishMaterial
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // 選択状態
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundColor(isSelected ? .blue : .gray)

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
                                .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                        case .failure:
                            placeholderImage
                        case .empty:
                            ProgressView()
                                .frame(width: 50, height: 70)
                        @unknown default:
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
                        .multilineTextAlignment(.leading)

                    HStack(spacing: 8) {
                        // 難易度
                        if let level = material.difficultyLevel {
                            Text(level)
                                .font(.caption2)
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(difficultyColor(level))
                                .cornerRadius(4)
                        }

                        // 総章数/語数
                        if let chapters = material.totalChapters {
                            Text(material.materialCategory == "英単語" ? "\(chapters)語" : "\(chapters)章")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }

                    // 備考
                    if let notes = material.notes, !notes.isEmpty {
                        Text(notes)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }
                }

                Spacer()
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .background(isSelected ? Color.blue.opacity(0.1) : Color(.systemGray6))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
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

    private func difficultyColor(_ level: String) -> Color {
        switch level {
        case "初級": return .green
        case "中級": return .blue
        case "上級": return .purple
        case "最上級": return .red
        default: return .gray
        }
    }
}

#Preview {
    MaterialSelectionView(
        materialGroups: [],
        selections: .constant(MaterialSelections()),
        onConfirm: {}
    )
}
