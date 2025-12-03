import SwiftUI
import PhotosUI

/// プロフィール編集画面
struct ProfileEditView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = ProfileViewModel()
    @State private var showingSaveAlert = false
    @State private var selectedItem: PhotosPickerItem?

    var body: some View {
        NavigationStack {
            Form {
                // プロフィール画像セクション
                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 12) {
                            // アバター画像
                            ZStack {
                                if let image = viewModel.selectedImage {
                                    Image(uiImage: image)
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 100, height: 100)
                                        .clipShape(Circle())
                                } else if let avatarUrl = viewModel.avatarUrl, let url = URL(string: avatarUrl) {
                                    AsyncImage(url: url) { phase in
                                        switch phase {
                                        case .empty:
                                            ProgressView()
                                                .frame(width: 100, height: 100)
                                        case .success(let image):
                                            image
                                                .resizable()
                                                .scaledToFill()
                                                .frame(width: 100, height: 100)
                                                .clipShape(Circle())
                                        case .failure:
                                            DefaultAvatarView(name: viewModel.nickname, size: 100)
                                        @unknown default:
                                            DefaultAvatarView(name: viewModel.nickname, size: 100)
                                        }
                                    }
                                } else {
                                    DefaultAvatarView(name: viewModel.nickname, size: 100)
                                }

                                // カメラアイコン
                                Circle()
                                    .fill(Color.roopyPrimary)
                                    .frame(width: 32, height: 32)
                                    .overlay(
                                        Image(systemName: "camera.fill")
                                            .font(.system(size: 14))
                                            .foregroundColor(.white)
                                    )
                                    .offset(x: 35, y: 35)
                            }

                            PhotosPicker(selection: $selectedItem, matching: .images) {
                                Text("写真を変更")
                                    .font(.subheadline)
                                    .foregroundColor(.roopyPrimary)
                            }
                        }
                        Spacer()
                    }
                    .listRowBackground(Color.clear)
                }

                // 基本情報セクション
                Section(header: Text("基本情報")) {
                    TextField("ニックネーム", text: $viewModel.nickname)
                        .textContentType(.nickname)

                    Picker("学年", selection: $viewModel.grade) {
                        Text("選択してください").tag(nil as Grade?)
                        ForEach(Grade.allCases, id: \.self) { grade in
                            Text(grade.displayName).tag(grade as Grade?)
                        }
                    }
                }

                // 志望校セクション
                Section(header: Text("志望校")) {
                    TextField("志望大学", text: $viewModel.targetUniversity)

                    TextField("志望学部・学科", text: $viewModel.targetFaculty)
                }

                // 自己紹介セクション
                Section(header: Text("自己紹介")) {
                    TextEditor(text: $viewModel.bio)
                        .frame(minHeight: 100)
                }
            }
            .navigationTitle("プロフィール編集")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        dismiss()
                    }
                    .foregroundColor(.roopyText.opacity(0.7))
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("保存") {
                        Task {
                            await viewModel.saveProfile()
                            if viewModel.saveSuccess {
                                showingSaveAlert = true
                            }
                        }
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyPrimary)
                    .disabled(viewModel.isSaving)
                }
            }
            .alert("保存しました", isPresented: $showingSaveAlert) {
                Button("OK") {
                    dismiss()
                }
            }
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.1))
                }

                if viewModel.isSaving || viewModel.isUploadingImage {
                    VStack(spacing: 8) {
                        ProgressView()
                        Text(viewModel.isUploadingImage ? "画像をアップロード中..." : "保存中...")
                            .font(.caption)
                    }
                    .padding()
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(radius: 10)
                }
            }
            .onChange(of: selectedItem) { _, newItem in
                Task {
                    if let data = try? await newItem?.loadTransferable(type: Data.self),
                       let uiImage = UIImage(data: data) {
                        viewModel.selectedImage = uiImage
                    }
                }
            }
        }
        .task {
            await viewModel.loadProfile()
        }
    }
}

/// デフォルトアバター表示
struct DefaultAvatarView: View {
    let name: String
    let size: CGFloat

    var body: some View {
        ZStack {
            Circle()
                .fill(Color.roopyPrimary.opacity(0.2))
                .frame(width: size, height: size)

            Text(name.isEmpty ? "U" : String(name.prefix(1)))
                .font(.system(size: size * 0.4, weight: .bold))
                .foregroundColor(.roopyPrimary)
        }
    }
}

#Preview {
    ProfileEditView()
}
