import SwiftUI

/// メインのタブバー（下部ナビゲーション）
/// クエストとドリルを統合した「学習」タブに変更
struct MainTabView: View {
    @State private var selectedTab: Tab = .home

    enum Tab {
        case home
        case roadmap
        case study
        case profile
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: selectedTab == .home ? "house.fill" : "house")
                    Text("ホーム")
                }
                .tag(Tab.home)

            RoadmapTabView()
                .tabItem {
                    Image(systemName: selectedTab == .roadmap ? "map.fill" : "map")
                    Text("ロードマップ")
                }
                .tag(Tab.roadmap)

            StudyTabView()
                .tabItem {
                    Image(systemName: selectedTab == .study ? "book.fill" : "book")
                    Text("学習")
                }
                .tag(Tab.study)

            ProfileView()
                .tabItem {
                    Image(systemName: selectedTab == .profile ? "person.fill" : "person")
                    Text("マイページ")
                }
                .tag(Tab.profile)
        }
        .tint(.roopyPrimary)
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthService.shared)
}
