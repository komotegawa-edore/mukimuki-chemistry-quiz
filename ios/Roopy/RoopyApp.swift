import SwiftUI

/// Roopy アプリのエントリーポイント
@main
struct RoopyApp: App {
    @StateObject private var authService = AuthService.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
                .onOpenURL { url in
                    // OAuth コールバック処理
                    Task {
                        try? await authService.handleOAuthCallback(url: url)
                    }
                }
        }
    }
}

/// メインのコンテンツビュー（認証状態に応じて切り替え）
struct ContentView: View {
    @EnvironmentObject var authService: AuthService

    var body: some View {
        Group {
            if authService.isAuthenticated {
                if authService.profile?.isTeacher == true {
                    TeacherDashboardView()
                } else {
                    MainTabView()
                }
            } else {
                LoginView()
            }
        }
        .animation(.easeInOut, value: authService.isAuthenticated)
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthService.shared)
}
