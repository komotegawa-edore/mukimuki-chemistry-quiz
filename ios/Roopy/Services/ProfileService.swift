import Foundation
import UIKit

/// プロフィール関連のサービス
final class ProfileService {
    static let shared = ProfileService()
    private init() {}

    /// プロフィールを更新
    func updateProfile(userId: UUID, params: UpdateProfileParams) async throws -> Profile {
        let updatedProfile: Profile = try await supabase
            .from("mukimuki_profiles")
            .update(params)
            .eq("id", value: userId)
            .select()
            .single()
            .execute()
            .value
        return updatedProfile
    }

    /// プロフィールを取得
    func fetchProfile(userId: UUID) async throws -> Profile {
        let profile: Profile = try await supabase
            .from("mukimuki_profiles")
            .select()
            .eq("id", value: userId)
            .single()
            .execute()
            .value
        return profile
    }

    /// アバター画像をアップロード
    func uploadAvatar(userId: UUID, imageData: Data) async throws -> String {
        // UUIDを小文字に変換（RLSポリシーのauth.uid()は小文字を返すため）
        let fileName = "\(userId.uuidString.lowercased())/avatar_\(Int(Date().timeIntervalSince1970)).jpg"

        // Storageにアップロード
        try await supabase.storage
            .from("avatars")
            .upload(
                fileName,
                data: imageData,
                options: .init(contentType: "image/jpeg", upsert: true)
            )

        // 公開URLを取得
        let publicUrl = try supabase.storage
            .from("avatars")
            .getPublicURL(path: fileName)

        return publicUrl.absoluteString
    }

    /// アバターURLをプロフィールに保存
    func updateAvatarUrl(userId: UUID, avatarUrl: String) async throws -> Profile {
        let params = UpdateProfileParams(avatarUrl: avatarUrl)
        return try await updateProfile(userId: userId, params: params)
    }
}

/// 模試成績関連のサービス（新形式）
final class MockExamService {
    static let shared = MockExamService()
    private init() {}

    /// 模試一覧を取得（スコア付き）
    func fetchExams(userId: UUID) async throws -> [MockExam] {
        let exams: [MockExam] = try await supabase
            .from("mukimuki_mock_exams")
            .select("*, mukimuki_mock_exam_scores(*)")
            .eq("user_id", value: userId)
            .order("exam_date", ascending: false)
            .execute()
            .value
        return exams
    }

    /// 模試を追加
    func addExam(params: MockExamParams) async throws -> MockExam {
        let exam: MockExam = try await supabase
            .from("mukimuki_mock_exams")
            .insert(params)
            .select("*, mukimuki_mock_exam_scores(*)")
            .single()
            .execute()
            .value
        return exam
    }

    /// 模試を削除
    func deleteExam(id: Int) async throws {
        try await supabase
            .from("mukimuki_mock_exams")
            .delete()
            .eq("id", value: id)
            .execute()
    }

    /// 科目スコアを追加
    func addScore(params: MockExamScoreParams) async throws -> MockExamScore {
        let score: MockExamScore = try await supabase
            .from("mukimuki_mock_exam_scores")
            .insert(params)
            .select()
            .single()
            .execute()
            .value
        return score
    }

    /// 複数の科目スコアを一括追加
    func addScores(params: [MockExamScoreParams]) async throws -> [MockExamScore] {
        let scores: [MockExamScore] = try await supabase
            .from("mukimuki_mock_exam_scores")
            .insert(params)
            .select()
            .execute()
            .value
        return scores
    }

    /// 科目スコアを削除
    func deleteScore(id: Int) async throws {
        try await supabase
            .from("mukimuki_mock_exam_scores")
            .delete()
            .eq("id", value: id)
            .execute()
    }

    /// 偏差値推移データを取得（グラフ用）
    func fetchDeviationHistory(userId: UUID) async throws -> [DeviationDataPoint] {
        let exams = try await fetchExams(userId: userId)

        var dataPoints: [DeviationDataPoint] = []
        for exam in exams {
            guard let scores = exam.scores else { continue }
            for score in scores {
                if let deviation = score.deviationValue {
                    dataPoints.append(DeviationDataPoint(
                        date: exam.examDate,
                        subject: score.subject,
                        deviationValue: deviation
                    ))
                }
            }
        }

        return dataPoints.sorted { $0.date < $1.date }
    }

    // MARK: - 旧API（互換性のため残す）

    /// 模試結果一覧を取得（旧形式）
    func fetchResults(userId: UUID) async throws -> [MockExamResult] {
        let results: [MockExamResult] = try await supabase
            .from("mukimuki_mock_exam_results")
            .select()
            .eq("user_id", value: userId)
            .order("exam_date", ascending: false)
            .execute()
            .value
        return results
    }

    /// 模試結果を追加（旧形式）
    func addResult(params: MockExamResultParams) async throws -> MockExamResult {
        let result: MockExamResult = try await supabase
            .from("mukimuki_mock_exam_results")
            .insert(params)
            .select()
            .single()
            .execute()
            .value
        return result
    }

    /// 模試結果を削除（旧形式）
    func deleteResult(id: Int) async throws {
        try await supabase
            .from("mukimuki_mock_exam_results")
            .delete()
            .eq("id", value: id)
            .execute()
    }

    /// 科目別の模試結果を取得（旧形式）
    func fetchResultsBySubject(userId: UUID, subject: String) async throws -> [MockExamResult] {
        let results: [MockExamResult] = try await supabase
            .from("mukimuki_mock_exam_results")
            .select()
            .eq("user_id", value: userId)
            .eq("subject", value: subject)
            .order("exam_date", ascending: true)
            .execute()
            .value
        return results
    }
}
