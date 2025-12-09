import Foundation
import Supabase
import AuthenticationServices

/// ログインボーナス記録用
struct LoginBonusRecord: Encodable {
    let userId: UUID
    let loginDate: String
    let points: Int
    let streakDay: Int

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case loginDate = "login_date"
        case points
        case streakDay = "streak_day"
    }
}

/// 認証サービス
@MainActor
final class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published var session: Session?
    @Published var profile: Profile?
    @Published var isLoading = false
    @Published var error: Error?

    var isAuthenticated: Bool {
        session != nil
    }

    var currentUserId: UUID? {
        session?.user.id
    }

    private init() {
        Task {
            // 既存のセッションを取得（アプリ起動時にログイン済みの場合に対応）
            await restoreSession()
            // その後、認証状態の変更を監視
            await observeAuthChanges()
        }
    }

    // MARK: - Session Restore

    /// 既存のセッションを復元
    private func restoreSession() async {
        do {
            let session = try await supabase.auth.session
            self.session = session
            await fetchProfile(userId: session.user.id)
        } catch {
            // セッションがない場合は無視（未ログイン状態）
            print("No existing session: \(error.localizedDescription)")
        }
    }

    // MARK: - Auth State Observation

    private func observeAuthChanges() async {
        for await state in supabase.auth.authStateChanges {
            if [.initialSession, .signedIn, .signedOut].contains(state.event) {
                self.session = state.session
                if let userId = state.session?.user.id {
                    await fetchProfile(userId: userId)
                } else {
                    self.profile = nil
                }
            }
        }
    }

    // MARK: - Email Auth

    /// メールとパスワードでサインイン
    func signIn(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }

        do {
            let session = try await supabase.auth.signIn(
                email: email,
                password: password
            )
            self.session = session
            await fetchProfile(userId: session.user.id)
        } catch {
            self.error = error
            throw error
        }
    }

    /// メールとパスワードでサインアップ
    func signUp(email: String, password: String, name: String) async throws {
        isLoading = true
        defer { isLoading = false }

        do {
            let response = try await supabase.auth.signUp(
                email: email,
                password: password,
                data: ["name": .string(name)]
            )
            if let session = response.session {
                self.session = session
                await fetchProfile(userId: session.user.id)
            }
        } catch {
            self.error = error
            throw error
        }
    }

    /// マジックリンクでサインイン
    func signInWithMagicLink(email: String) async throws {
        isLoading = true
        defer { isLoading = false }

        do {
            try await supabase.auth.signInWithOTP(
                email: email,
                redirectTo: URL(string: "roopy://login-callback")
            )
        } catch {
            self.error = error
            throw error
        }
    }

    // MARK: - Google Auth (OAuth)

    /// Google でサインイン
    func signInWithGoogle() async throws -> URL {
        isLoading = true
        defer { isLoading = false }

        do {
            let url = try await supabase.auth.getOAuthSignInURL(
                provider: .google,
                redirectTo: URL(string: "roopy://login-callback")
            )
            return url
        } catch {
            self.error = error
            throw error
        }
    }

    /// OAuth コールバックを処理
    func handleOAuthCallback(url: URL) async throws {
        do {
            let session = try await supabase.auth.session(from: url)
            self.session = session
            await fetchProfile(userId: session.user.id)
        } catch {
            self.error = error
            throw error
        }
    }

    // MARK: - Sign Out

    /// サインアウト
    func signOut() async throws {
        do {
            try await supabase.auth.signOut()
            self.session = nil
            self.profile = nil
        } catch {
            self.error = error
            throw error
        }
    }

    // MARK: - Profile

    /// プロフィールを取得
    func fetchProfile(userId: UUID) async {
        do {
            let profile: Profile = try await supabase
                .from("mukimuki_profiles")
                .select()
                .eq("id", value: userId)
                .single()
                .execute()
                .value
            self.profile = profile

            // ログインボーナスの処理
            await processLoginBonus(userId: userId, profile: profile)
        } catch {
            print("Failed to fetch profile: \(error)")
        }
    }

    /// ログインボーナスを処理
    private func processLoginBonus(userId: UUID, profile: Profile) async {
        let today = DateFormatter.yyyyMMdd.string(from: Date())
        let lastLoginDate = profile.lastLoginDate

        // 今日既にログイン済みならスキップ
        if lastLoginDate == today {
            return
        }

        // 連続日数の計算
        var newStreak = 1
        var newLongestStreak = profile.longestStreak ?? 0

        if let lastLogin = lastLoginDate,
           let lastDate = DateFormatter.yyyyMMdd.date(from: lastLogin) {
            let calendar = Calendar.current
            let daysDiff = calendar.dateComponents([.day], from: lastDate, to: Date()).day ?? 0

            if daysDiff == 1 {
                // 連続ログイン継続
                newStreak = (profile.currentStreak ?? 0) + 1
            } else if daysDiff == 0 {
                // 同日（念のため）
                return
            }
            // daysDiff > 1 の場合は連続途切れ、newStreak = 1
        }

        // 最長記録を更新
        if newStreak > newLongestStreak {
            newLongestStreak = newStreak
        }

        // ボーナスポイント計算（連続日数に応じて増加）
        let bonusPoints = calculateLoginBonusPoints(streak: newStreak)

        do {
            // プロフィール更新
            let updateParams = UpdateProfileParams(
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                lastLoginDate: today
            )

            try await supabase
                .from("mukimuki_profiles")
                .update(updateParams)
                .eq("id", value: userId)
                .execute()

            // ログインボーナスを記録
            let bonusRecord = LoginBonusRecord(
                userId: userId,
                loginDate: today,
                points: bonusPoints,
                streakDay: newStreak
            )

            try await supabase
                .from("mukimuki_login_bonuses")
                .insert(bonusRecord)
                .execute()

            // ローカル状態を更新
            self.profile?.currentStreak = newStreak
            self.profile?.longestStreak = newLongestStreak
            self.profile?.lastLoginDate = today

            print("Login bonus awarded: \(bonusPoints) points (streak: \(newStreak))")

        } catch {
            print("Failed to process login bonus: \(error)")
        }
    }

    /// 連続ログイン日数に応じたボーナスポイントを計算
    private func calculateLoginBonusPoints(streak: Int) -> Int {
        switch streak {
        case 1...6:
            return 10  // 基本10pt
        case 7:
            return 50  // 7日目は50pt
        case 8...13:
            return 15  // 8-13日は15pt
        case 14:
            return 100 // 14日目は100pt
        case 15...29:
            return 20  // 15-29日は20pt
        case 30:
            return 200 // 30日目は200pt
        default:
            return 25  // 31日以降は25pt
        }
    }

    /// プロフィールを更新
    func updateProfile(_ params: UpdateProfileParams) async throws {
        guard let userId = currentUserId else { return }

        try await supabase
            .from("mukimuki_profiles")
            .update(params)
            .eq("id", value: userId)
            .execute()

        await fetchProfile(userId: userId)
    }
}

