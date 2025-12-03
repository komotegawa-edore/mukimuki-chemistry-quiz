import Foundation
import SwiftUI
import PhotosUI

/// プロフィール編集画面のViewModel
@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var nickname: String = ""
    @Published var grade: Grade?
    @Published var targetUniversity: String = ""
    @Published var targetFaculty: String = ""
    @Published var bio: String = ""
    @Published var avatarUrl: String?
    @Published var selectedImage: UIImage?
    @Published var isLoading = false
    @Published var isSaving = false
    @Published var isUploadingImage = false
    @Published var error: Error?
    @Published var saveSuccess = false

    private let profileService = ProfileService.shared

    func loadProfile() async {
        guard let userId = AuthService.shared.currentUserId else { return }

        isLoading = true
        error = nil

        do {
            let profile = try await profileService.fetchProfile(userId: userId)
            nickname = profile.nickname ?? ""
            grade = profile.gradeEnum
            targetUniversity = profile.targetUniversity ?? ""
            targetFaculty = profile.targetFaculty ?? ""
            bio = profile.bio ?? ""
            avatarUrl = profile.avatarUrl
        } catch {
            self.error = error
            print("ProfileViewModel loadProfile error: \(error)")
        }

        isLoading = false
    }

    func saveProfile() async {
        guard let userId = AuthService.shared.currentUserId else { return }

        isSaving = true
        error = nil
        saveSuccess = false

        do {
            // 画像がある場合は先にアップロード
            var newAvatarUrl: String? = avatarUrl
            if let image = selectedImage {
                isUploadingImage = true
                if let imageData = image.jpegData(compressionQuality: 0.7) {
                    newAvatarUrl = try await profileService.uploadAvatar(userId: userId, imageData: imageData)
                }
                isUploadingImage = false
            }

            let params = UpdateProfileParams(
                nickname: nickname.isEmpty ? nil : nickname,
                avatarUrl: newAvatarUrl,
                grade: grade?.rawValue,
                targetUniversity: targetUniversity.isEmpty ? nil : targetUniversity,
                targetFaculty: targetFaculty.isEmpty ? nil : targetFaculty,
                bio: bio.isEmpty ? nil : bio
            )

            let updatedProfile = try await profileService.updateProfile(userId: userId, params: params)

            // AuthServiceのプロフィールを更新
            AuthService.shared.profile = updatedProfile
            avatarUrl = updatedProfile.avatarUrl

            saveSuccess = true
        } catch {
            self.error = error
            print("ProfileViewModel saveProfile error: \(error)")
        }

        isSaving = false
        isUploadingImage = false
    }
}

/// 模試成績管理画面のViewModel（新形式）
@MainActor
final class MockExamViewModel: ObservableObject {
    @Published var exams: [MockExam] = []
    @Published var isLoading = false
    @Published var isSaving = false
    @Published var error: Error?

    // 新規追加用
    @Published var examName: String = ""
    @Published var examDate: Date = Date()
    @Published var notes: String = ""
    @Published var subjectScores: [SubjectScoreInput] = []

    // グラフ用データ
    @Published var deviationHistory: [DeviationDataPoint] = []
    @Published var selectedSubjects: Set<String> = []

    private let mockExamService = MockExamService.shared

    /// 利用可能な科目リスト
    let availableSubjects = [
        "英語", "数学", "国語", "物理", "化学", "生物",
        "日本史", "世界史", "地理", "政治経済", "倫理",
        "総合", "その他"
    ]

    /// 科目別の色
    let subjectColors: [String: Color] = [
        "英語": .blue,
        "数学": .red,
        "国語": .green,
        "物理": .orange,
        "化学": .purple,
        "生物": .cyan,
        "日本史": .brown,
        "世界史": .indigo,
        "地理": .mint,
        "政治経済": .pink,
        "倫理": .teal,
        "総合": .gray,
        "その他": .secondary
    ]

    func loadExams() async {
        guard let userId = AuthService.shared.currentUserId else { return }

        isLoading = true
        error = nil

        do {
            exams = try await mockExamService.fetchExams(userId: userId)
            deviationHistory = try await mockExamService.fetchDeviationHistory(userId: userId)

            // 利用可能な科目を選択状態に
            let subjects = Set(deviationHistory.map { $0.subject })
            selectedSubjects = subjects
        } catch {
            self.error = error
            print("MockExamViewModel loadExams error: \(error)")
        }

        isLoading = false
    }

    func addExam() async -> Bool {
        guard let userId = AuthService.shared.currentUserId else { return false }

        // 少なくとも1科目は入力が必要
        let validScores = subjectScores.filter { !$0.subject.isEmpty }
        if validScores.isEmpty {
            return false
        }

        isSaving = true
        error = nil

        do {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd"

            // 模試を作成
            let examParams = MockExamParams(
                userId: userId,
                examName: examName,
                examDate: dateFormatter.string(from: examDate),
                notes: notes.isEmpty ? nil : notes
            )
            let newExam = try await mockExamService.addExam(params: examParams)

            // 科目スコアを追加
            let scoreParams = validScores.map { input in
                MockExamScoreParams(
                    mockExamId: newExam.id,
                    subject: input.subject,
                    score: Int(input.score),
                    maxScore: Int(input.maxScore),
                    deviationValue: Double(input.deviationValue),
                    rankPercentile: nil
                )
            }

            if !scoreParams.isEmpty {
                _ = try await mockExamService.addScores(params: scoreParams)
            }

            // リロード
            await loadExams()
            clearForm()
            isSaving = false
            return true
        } catch {
            self.error = error
            print("MockExamViewModel addExam error: \(error)")
            isSaving = false
            return false
        }
    }

    func deleteExam(exam: MockExam) async {
        do {
            try await mockExamService.deleteExam(id: exam.id)
            exams.removeAll { $0.id == exam.id }
            // グラフデータも更新
            await loadExams()
        } catch {
            self.error = error
            print("MockExamViewModel deleteExam error: \(error)")
        }
    }

    func clearForm() {
        examName = ""
        examDate = Date()
        notes = ""
        subjectScores = []
    }

    func addSubjectScore() {
        subjectScores.append(SubjectScoreInput())
    }

    func removeSubjectScore(at index: Int) {
        guard index < subjectScores.count else { return }
        subjectScores.remove(at: index)
    }

    /// 科目別の最新偏差値
    func latestDeviationValue(for subject: String) -> Double? {
        deviationHistory
            .filter { $0.subject == subject }
            .sorted { $0.date > $1.date }
            .first?
            .deviationValue
    }

    /// 選択された科目のグラフデータ
    var filteredDeviationHistory: [DeviationDataPoint] {
        deviationHistory.filter { selectedSubjects.contains($0.subject) }
    }

    /// 科目リスト（データがあるもの）
    var availableSubjectsWithData: [String] {
        Array(Set(deviationHistory.map { $0.subject })).sorted()
    }
}

/// 科目スコア入力用の構造体
struct SubjectScoreInput: Identifiable {
    let id = UUID()
    var subject: String = ""
    var score: String = ""
    var maxScore: String = ""
    var deviationValue: String = ""
}
