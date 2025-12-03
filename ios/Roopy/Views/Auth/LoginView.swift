import SwiftUI
import AuthenticationServices

/// ログイン画面
struct LoginView: View {
    @EnvironmentObject var authService: AuthService
    @State private var email = ""
    @State private var password = ""
    @State private var isSignUp = false
    @State private var name = ""
    @State private var showingMagicLinkSent = false
    @State private var errorMessage: String?
    @State private var showingSafari = false
    @State private var googleAuthURL: URL?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // ロゴとタイトル
                    VStack(spacing: 16) {
                        Image("Roopy")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 120, height: 120)

                        Text("Roopy")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.roopyText)

                        Text("受験の森へようこそ")
                            .font(.subheadline)
                            .foregroundColor(.roopyText.opacity(0.7))
                    }
                    .padding(.top, 40)

                    // エラーメッセージ
                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding(.horizontal)
                    }

                    // フォーム
                    VStack(spacing: 16) {
                        if isSignUp {
                            TextField("名前", text: $name)
                                .textFieldStyle(RoopyTextFieldStyle())
                                .textContentType(.name)
                        }

                        TextField("メールアドレス", text: $email)
                            .textFieldStyle(RoopyTextFieldStyle())
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                        SecureField("パスワード", text: $password)
                            .textFieldStyle(RoopyTextFieldStyle())
                            .textContentType(isSignUp ? .newPassword : .password)

                        // ログイン / サインアップボタン
                        Button(action: {
                            Task {
                                await handleAuth()
                            }
                        }) {
                            if authService.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text(isSignUp ? "アカウント作成" : "ログイン")
                                    .fontWeight(.semibold)
                            }
                        }
                        .buttonStyle(RoopyPrimaryButtonStyle())
                        .disabled(authService.isLoading || !isFormValid)

                        // モード切り替え
                        Button(action: {
                            withAnimation {
                                isSignUp.toggle()
                                errorMessage = nil
                            }
                        }) {
                            Text(isSignUp ? "アカウントをお持ちの方はこちら" : "新規アカウント作成")
                                .font(.subheadline)
                                .foregroundColor(.roopyPrimary)
                        }
                    }
                    .padding(.horizontal, 24)

                    // 区切り線
                    HStack {
                        Rectangle()
                            .fill(Color.roopyBackground)
                            .frame(height: 1)
                        Text("または")
                            .font(.caption)
                            .foregroundColor(.roopyText.opacity(0.5))
                        Rectangle()
                            .fill(Color.roopyBackground)
                            .frame(height: 1)
                    }
                    .padding(.horizontal, 24)

                    // Google ログイン
                    Button(action: {
                        Task {
                            await signInWithGoogle()
                        }
                    }) {
                        HStack {
                            Image(systemName: "g.circle.fill")
                                .font(.title2)
                            Text("Googleでログイン")
                                .fontWeight(.semibold)
                        }
                    }
                    .buttonStyle(GoogleButtonStyle())
                    .padding(.horizontal, 24)

                    // マジックリンク
                    Button(action: {
                        Task {
                            await sendMagicLink()
                        }
                    }) {
                        Text("パスワードなしでログイン（メールリンク）")
                            .font(.caption)
                            .foregroundColor(.roopyText.opacity(0.6))
                    }
                    .padding(.top, 8)

                    Spacer()
                }
            }
            .background(Color.roopyBackgroundLight)
            .alert("メールを送信しました", isPresented: $showingMagicLinkSent) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("メールに記載されたリンクをタップしてログインしてください。")
            }
            .sheet(isPresented: $showingSafari) {
                if let url = googleAuthURL {
                    SafariView(url: url)
                }
            }
        }
    }

    private var isFormValid: Bool {
        let emailValid = email.contains("@") && email.contains(".")
        let passwordValid = password.count >= 6
        let nameValid = !isSignUp || name.count >= 2
        return emailValid && passwordValid && nameValid
    }

    private func handleAuth() async {
        errorMessage = nil
        do {
            if isSignUp {
                try await authService.signUp(email: email, password: password, name: name)
            } else {
                try await authService.signIn(email: email, password: password)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func signInWithGoogle() async {
        do {
            let url = try await authService.signInWithGoogle()
            googleAuthURL = url
            showingSafari = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func sendMagicLink() async {
        guard email.contains("@") else {
            errorMessage = "メールアドレスを入力してください"
            return
        }

        do {
            try await authService.signInWithMagicLink(email: email)
            showingMagicLinkSent = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// MARK: - Safari View for OAuth

import SafariServices

struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        return SFSafariViewController(url: url)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}

// MARK: - Custom Styles

struct RoopyTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.roopyBackground, lineWidth: 2)
            )
    }
}

struct RoopyPrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .padding()
            .background(isEnabled ? Color.roopyPrimary : Color.gray.opacity(0.3))
            .foregroundColor(.white)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct GoogleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.white)
            .foregroundColor(.roopyText)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthService.shared)
}
