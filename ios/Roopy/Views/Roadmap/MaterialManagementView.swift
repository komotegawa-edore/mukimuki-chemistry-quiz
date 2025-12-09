import SwiftUI

/// 教材管理画面
struct MaterialManagementView: View {
    @StateObject private var viewModel: MaterialManagementViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var selectedMaterial: RoadmapMaterial?
    @State private var showingReplaceSheet = false
    @State private var showingRemoveConfirmation = false
    @State private var materialToRemove: RoadmapMaterial?

    init(roadmapId: Int, currentStage: String) {
        _viewModel = StateObject(wrappedValue: MaterialManagementViewModel(
            roadmapId: roadmapId,
            currentStage: currentStage
        ))
    }

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.materials.isEmpty {
                    ProgressView("読み込み中...")
                } else {
                    materialList
                }
            }
            .navigationTitle("教材の管理")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("閉じる") {
                        dismiss()
                    }
                }
            }
            .task {
                await viewModel.loadData()
            }
            .alert("教材を削除", isPresented: $showingRemoveConfirmation) {
                Button("キャンセル", role: .cancel) {}
                Button("削除", role: .destructive) {
                    if let material = materialToRemove {
                        Task {
                            await viewModel.removeMaterial(material)
                        }
                    }
                }
            } message: {
                if let material = materialToRemove {
                    Text("「\(material.material?.materialName ?? "この教材")」を削除しますか？\n\n関連するタスクもスキップされます。")
                }
            }
            .sheet(isPresented: $showingReplaceSheet) {
                if let material = selectedMaterial {
                    MaterialReplaceSheet(
                        material: material,
                        viewModel: viewModel
                    )
                }
            }
            .overlay {
                if let message = viewModel.successMessage {
                    successToast(message: message)
                }
            }
        }
    }

    // MARK: - Material List

    private var materialList: some View {
        List {
            // 説明セクション
            Section {
                HStack(spacing: 12) {
                    Image(systemName: "info.circle.fill")
                        .foregroundColor(.blue)
                        .font(.title2)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("教材を変更・削除できます")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        Text("肌に合わない教材は別の教材に変更するか、削除してください")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical, 8)
            }

            // ステージごとに教材を表示
            ForEach(viewModel.materialsByStage, id: \.stageId) { stageGroup in
                Section(header: stageHeader(stageGroup.stageId)) {
                    ForEach(stageGroup.materials) { material in
                        MaterialManagementRow(
                            material: material,
                            onReplace: {
                                selectedMaterial = material
                                Task {
                                    await viewModel.loadAlternativeMaterials(for: material)
                                }
                                showingReplaceSheet = true
                            },
                            onRemove: {
                                materialToRemove = material
                                showingRemoveConfirmation = true
                            },
                            onRestore: {
                                Task {
                                    await viewModel.restoreMaterial(material)
                                }
                            }
                        )
                    }
                }
            }

            // スキップされた教材
            if !viewModel.skippedMaterials.isEmpty {
                Section(header: Text("スキップ済み")) {
                    ForEach(viewModel.skippedMaterials) { material in
                        MaterialManagementRow(
                            material: material,
                            onReplace: nil,
                            onRemove: nil,
                            onRestore: {
                                Task {
                                    await viewModel.restoreMaterial(material)
                                }
                            }
                        )
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
    }

    private func stageHeader(_ stageId: String) -> some View {
        HStack {
            Text(stageId)
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(stageColor(stageId))
                .cornerRadius(4)

            Text(viewModel.currentStage == stageId ? "(現在のステージ)" : "")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }

    private func stageColor(_ stageId: String) -> Color {
        let stageNumber = Int(stageId.dropFirst()) ?? 1
        let hue = Double(stageNumber - 1) / 10.0 * 0.6
        return Color(hue: hue, saturation: 0.6, brightness: 0.7)
    }

    private func successToast(message: String) -> some View {
        VStack {
            Spacer()

            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                Text(message)
                    .font(.subheadline)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.15), radius: 8, x: 0, y: 4)
            .padding(.bottom, 32)
        }
        .transition(.move(edge: .bottom).combined(with: .opacity))
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                withAnimation {
                    viewModel.successMessage = nil
                }
            }
        }
    }
}

// MARK: - Material Row

struct MaterialManagementRow: View {
    let material: RoadmapMaterial
    let onReplace: (() -> Void)?
    let onRemove: (() -> Void)?
    let onRestore: (() -> Void)?

    private var isSkipped: Bool {
        material.status == .skipped
    }

    var body: some View {
        HStack(spacing: 12) {
            // 教材画像
            materialImage

            // 教材情報
            VStack(alignment: .leading, spacing: 4) {
                Text(material.material?.materialName ?? "不明な教材")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(isSkipped ? .secondary : .primary)
                    .strikethrough(isSkipped)
                    .lineLimit(2)

                HStack(spacing: 8) {
                    // カテゴリ
                    if let category = material.material?.materialCategory {
                        Label(category, systemImage: material.material?.categoryIcon ?? "book")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }

                    // ステータス
                    statusBadge
                }
            }

            Spacer()

            // アクションボタン
            if isSkipped {
                Button("復元") {
                    onRestore?()
                }
                .font(.caption)
                .foregroundColor(.blue)
            } else {
                Menu {
                    if let onReplace = onReplace {
                        Button {
                            onReplace()
                        } label: {
                            Label("別の教材に変更", systemImage: "arrow.triangle.2.circlepath")
                        }
                    }

                    if let onRemove = onRemove {
                        Button(role: .destructive) {
                            onRemove()
                        } label: {
                            Label("削除（スキップ）", systemImage: "trash")
                        }
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .font(.title3)
                        .foregroundColor(.gray)
                }
            }
        }
        .padding(.vertical, 4)
        .opacity(isSkipped ? 0.6 : 1)
    }

    private var materialImage: some View {
        Group {
            if let imageUrl = material.material?.imageUrl, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 40, height: 56)
                            .cornerRadius(4)
                    case .failure, .empty:
                        placeholderImage
                    @unknown default:
                        placeholderImage
                    }
                }
            } else {
                placeholderImage
            }
        }
    }

    private var placeholderImage: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 4)
                .fill(Color(.systemGray5))
            Image(systemName: "book.closed")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(width: 40, height: 56)
    }

    private var statusBadge: some View {
        Group {
            switch material.status {
            case .completed:
                Label("完了", systemImage: "checkmark.circle.fill")
                    .font(.caption2)
                    .foregroundColor(.green)
            case .inProgress:
                Label("\(material.currentCycle)/\(material.totalCycles)周", systemImage: "play.circle.fill")
                    .font(.caption2)
                    .foregroundColor(.blue)
            case .pending:
                Label("未着手", systemImage: "circle")
                    .font(.caption2)
                    .foregroundColor(.gray)
            case .skipped:
                Label("スキップ", systemImage: "forward.circle.fill")
                    .font(.caption2)
                    .foregroundColor(.orange)
            }
        }
    }
}

// MARK: - Replace Sheet

struct MaterialReplaceSheet: View {
    let material: RoadmapMaterial
    @ObservedObject var viewModel: MaterialManagementViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.availableMaterials.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 48))
                            .foregroundColor(.orange)

                        Text("代替候補がありません")
                            .font(.headline)

                        Text("同じカテゴリ・ステージの他の教材がありません")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else {
                    List {
                        Section(header: Text("現在の教材")) {
                            currentMaterialRow
                        }

                        Section(header: Text("変更先を選択")) {
                            ForEach(viewModel.availableMaterials) { newMaterial in
                                Button {
                                    Task {
                                        await viewModel.replaceMaterial(material, with: newMaterial)
                                        dismiss()
                                    }
                                } label: {
                                    AlternativeMaterialRow(material: newMaterial)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("教材を変更")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private var currentMaterialRow: some View {
        HStack(spacing: 12) {
            // 教材画像
            if let imageUrl = material.material?.imageUrl, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 40, height: 56)
                            .cornerRadius(4)
                    } else {
                        placeholderImage
                    }
                }
            } else {
                placeholderImage
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(material.material?.materialName ?? "不明")
                    .font(.subheadline)
                    .fontWeight(.medium)

                if let category = material.material?.materialCategory {
                    Text(category)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            Text("現在")
                .font(.caption)
                .foregroundColor(.white)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.blue)
                .cornerRadius(4)
        }
    }

    private var placeholderImage: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 4)
                .fill(Color(.systemGray5))
            Image(systemName: "book.closed")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(width: 40, height: 56)
    }
}

struct AlternativeMaterialRow: View {
    let material: EnglishMaterial

    var body: some View {
        HStack(spacing: 12) {
            // 教材画像
            if let imageUrl = material.imageUrl, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 40, height: 56)
                            .cornerRadius(4)
                    } else {
                        placeholderImage
                    }
                }
            } else {
                placeholderImage
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(material.materialName)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)

                HStack(spacing: 8) {
                    if let difficulty = material.difficultyLevel {
                        Text(difficulty)
                            .font(.caption2)
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(difficultyColor(difficulty))
                            .cornerRadius(4)
                    }

                    if let chapters = material.totalChapters {
                        Text("\(chapters)章")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }

                if let notes = material.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding(.vertical, 4)
    }

    private var placeholderImage: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 4)
                .fill(Color(.systemGray5))
            Image(systemName: "book.closed")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(width: 40, height: 56)
    }

    private func difficultyColor(_ level: String) -> Color {
        switch level {
        case "初級": return .green
        case "中級": return .blue
        case "上級": return .purple
        case "最上級", "難関", "最難関": return .red
        default: return .gray
        }
    }
}

#Preview {
    MaterialManagementView(roadmapId: 1, currentStage: "E5")
}
