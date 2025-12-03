import SwiftUI

/// 履歴画面（プレースホルダー）
struct HistoryView: View {
    var body: some View {
        Text("履歴画面")
            .navigationTitle("履歴")
    }
}

/// 講師ダッシュボード（プレースホルダー）
struct TeacherDashboardView: View {
    @EnvironmentObject var authService: AuthService

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("講師ダッシュボード")
                    .font(.title)

                Text("※ iOS版は生徒向け機能のみ対応しています")
                    .font(.caption)
                    .foregroundColor(.roopyText.opacity(0.6))

                Button("ログアウト") {
                    Task {
                        try? await authService.signOut()
                    }
                }
                .foregroundColor(.red)
            }
            .navigationTitle("ダッシュボード")
        }
    }
}

#Preview("History") {
    NavigationStack {
        HistoryView()
    }
}

#Preview("Teacher") {
    TeacherDashboardView()
        .environmentObject(AuthService.shared)
}
