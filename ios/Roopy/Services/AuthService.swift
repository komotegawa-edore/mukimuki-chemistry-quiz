import Foundation
import Supabase
import AuthenticationServices

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
            await observeAuthChanges()
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
        } catch {
            print("Failed to fetch profile: \(error)")
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
