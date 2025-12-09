import Foundation
import Supabase

/// Supabase クライアントのシングルトンインスタンス
///
/// 使用方法:
/// ```swift
/// let client = SupabaseManager.shared.client
/// ```
final class SupabaseManager {
    static let shared = SupabaseManager()

    let client: SupabaseClient

    private init() {
        // カスタムデコーダー（date型とtimestamptz型の両方に対応）
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)

            // ISO8601形式（timestamptz）
            if let date = ISO8601DateFormatter().date(from: dateString) {
                return date
            }

            // Supabase形式（timestamptz with fractional seconds）
            let isoFormatter = ISO8601DateFormatter()
            isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = isoFormatter.date(from: dateString) {
                return date
            }

            // YYYY-MM-DD形式（date型）
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd"
            dateFormatter.locale = Locale(identifier: "en_US_POSIX")
            dateFormatter.timeZone = TimeZone(identifier: "UTC")
            if let date = dateFormatter.date(from: dateString) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Cannot decode date: \(dateString)"
            )
        }

        client = SupabaseClient(
            supabaseURL: URL(string: "https://hlfpnquhlkqjsqsipnea.supabase.co")!,
            supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZnBucXVobGtxanNxc2lwbmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzMyNTgsImV4cCI6MjA3OTE0OTI1OH0.SST4WlhXN7nZHUV3xkTvr9z7Jca_XlLuxCZR4-OwOzg",
            options: SupabaseClientOptions(
                db: .init(decoder: decoder),
                auth: .init(emitLocalSessionAsInitialSession: true)
            )
        )
    }
}

// 便利なグローバルアクセサ
let supabase = SupabaseManager.shared.client

