import SwiftUI

/// プロフィール画面
struct ProfileView: View {
    @EnvironmentObject var authService: AuthService
    @State private var showingEditProfile = false
    @State private var showingMockExam = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // プロフィールヘッダー
                    ProfileHeaderCard(profile: authService.profile)

                    // メニュー
                    VStack(spacing: 12) {
                        ProfileMenuButton(
                            icon: "person.circle",
                            title: "プロフィール編集",
                            subtitle: "ニックネーム・学年・志望校など"
                        ) {
                            showingEditProfile = true
                        }

                        ProfileMenuButton(
                            icon: "chart.line.uptrend.xyaxis",
                            title: "模試成績管理",
                            subtitle: "模試の結果を記録・分析"
                        ) {
                            showingMockExam = true
                        }

                        ProfileMenuButton(
                            icon: "flame.fill",
                            title: "学習記録",
                            subtitle: "連続ログイン: \(authService.profile?.currentStreak ?? 0)日"
                        ) {
                            // 将来的に学習記録画面へ
                        }
                    }
                    .padding(.horizontal)

                    // ログアウトボタン
                    Button(action: {
                        Task {
                            try? await authService.signOut()
                        }
                    }) {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text("ログアウト")
                        }
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)
                        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
                    }
                    .padding(.horizontal)
                    .padding(.top, 20)
                }
                .padding(.vertical)
            }
            .background(Color.roopyBackgroundLight)
            .navigationTitle("マイページ")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showingEditProfile) {
                ProfileEditView()
            }
            .sheet(isPresented: $showingMockExam) {
                MockExamView()
            }
        }
    }
}

/// プロフィールヘッダーカード
struct ProfileHeaderCard: View {
    let profile: Profile?

    var body: some View {
        VStack(spacing: 16) {
            // アバター
            if let avatarUrl = profile?.avatarUrl, let url = URL(string: avatarUrl) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(width: 80, height: 80)
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: 80, height: 80)
                            .clipShape(Circle())
                    case .failure:
                        DefaultAvatarView(name: profile?.displayName ?? "", size: 80)
                    @unknown default:
                        DefaultAvatarView(name: profile?.displayName ?? "", size: 80)
                    }
                }
            } else {
                DefaultAvatarView(name: profile?.displayName ?? "", size: 80)
            }

            // 名前
            VStack(spacing: 4) {
                Text(profile?.displayName ?? "ユーザー")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.roopyText)

                if let grade = profile?.gradeEnum {
                    Text(grade.displayName)
                        .font(.subheadline)
                        .foregroundColor(.roopyText.opacity(0.7))
                }
            }

            // 志望校
            if let university = profile?.targetUniversity, !university.isEmpty {
                HStack(spacing: 4) {
                    Image(systemName: "building.columns")
                        .font(.caption)
                    Text("志望: \(university)")
                        .font(.caption)
                    if let faculty = profile?.targetFaculty, !faculty.isEmpty {
                        Text("(\(faculty))")
                            .font(.caption)
                    }
                }
                .foregroundColor(.roopyPrimary)
            }

            // 自己紹介
            if let bio = profile?.bio, !bio.isEmpty {
                Text(bio)
                    .font(.caption)
                    .foregroundColor(.roopyText.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
        .padding(.horizontal)
    }
}

/// プロフィールメニューボタン
struct ProfileMenuButton: View {
    let icon: String
    let title: String
    let subtitle: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(.roopyPrimary)
                    .frame(width: 40)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.roopyText)

                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.roopyText.opacity(0.6))
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.roopyText.opacity(0.3))
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthService.shared)
}
