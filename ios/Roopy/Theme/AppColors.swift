import SwiftUI

/// アプリのカラーパレット（Webアプリと同じデザイン）
extension Color {
    /// メインカラー: #5DDFC3
    static let roopyPrimary = Color(hex: "5DDFC3")

    /// プライマリの暗いバージョン: #4ECFB3
    static let roopyPrimaryDark = Color(hex: "4ECFB3")

    /// 背景のアクセント: #E0F7F1
    static let roopyBackground = Color(hex: "E0F7F1")

    /// 淡い背景: #F4F9F7
    static let roopyBackgroundLight = Color(hex: "F4F9F7")

    /// メインテキスト: #3A405A
    static let roopyText = Color(hex: "3A405A")

    /// ゴールド（ポイント表示用）: #FFD700
    static let roopyGold = Color(hex: "FFD700")

    /// オレンジ（アクセント）: #FFA500
    static let roopyOrange = Color(hex: "FFA500")

    /// 成功（80%以上）
    static let roopySuccess = Color.roopyPrimary

    /// 警告（60-79%）
    static let roopyWarning = Color.yellow

    /// エラー（60%未満）
    static let roopyError = Color.red
}

/// Hex文字列からColorを生成する拡張
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
