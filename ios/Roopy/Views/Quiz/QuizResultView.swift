import SwiftUI

/// クイズ結果画面
struct QuizResultView: View {
    @ObservedObject var viewModel: QuizViewModel
    let onRetry: () -> Void
    let onDismiss: () -> Void

    private var percentage: Int {
        guard viewModel.totalQuestions > 0 else { return 0 }
        return Int(Double(viewModel.correctCount) / Double(viewModel.totalQuestions) * 100)
    }

    private var resultColor: Color {
        if percentage >= 80 { return .roopySuccess }
        if percentage >= 60 { return .roopyWarning }
        return .roopyError
    }

    private var resultMessage: String {
        if percentage >= 80 { return "素晴らしい！🎉" }
        if percentage >= 60 { return "よく頑張りました！" }
        return "もう少し頑張りましょう💪"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // 結果サマリー
                ResultSummaryCard(
                    percentage: percentage,
                    correctCount: viewModel.correctCount,
                    totalCount: viewModel.totalQuestions,
                    resultColor: resultColor,
                    resultMessage: resultMessage
                )

                // ポイント獲得表示
                if viewModel.earnedPoints > 0 {
                    PointsEarnedCard(points: viewModel.earnedPoints)
                }

                // 間違えた問題一覧
                if !viewModel.wrongAnswers.isEmpty {
                    WrongAnswersSection(wrongAnswers: viewModel.wrongAnswers)
                }

                // アクションボタン
                VStack(spacing: 12) {
                    Button(action: onRetry) {
                        HStack {
                            Image(systemName: "arrow.counterclockwise")
                            Text("もう一度挑戦")
                        }
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(RoopyPrimaryButtonStyle())

                    Button(action: onDismiss) {
                        Text("章一覧に戻る")
                            .foregroundColor(.roopyPrimary)
                    }
                }
            }
            .padding()
        }
        .background(Color.roopyBackgroundLight)
    }
}

/// 結果サマリーカード
struct ResultSummaryCard: View {
    let percentage: Int
    let correctCount: Int
    let totalCount: Int
    let resultColor: Color
    let resultMessage: String

    var body: some View {
        VStack(spacing: 16) {
            Text(resultMessage)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.roopyText)

            // 円形プログレス
            ZStack {
                Circle()
                    .stroke(Color.roopyBackground, lineWidth: 12)
                    .frame(width: 150, height: 150)

                Circle()
                    .trim(from: 0, to: CGFloat(percentage) / 100)
                    .stroke(resultColor, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .frame(width: 150, height: 150)
                    .rotationEffect(.degrees(-90))

                VStack(spacing: 4) {
                    Text("\(percentage)")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(resultColor)
                    Text("%")
                        .font(.title3)
                        .foregroundColor(resultColor)
                }
            }

            Text("\(correctCount) / \(totalCount) 問正解")
                .font(.subheadline)
                .foregroundColor(.roopyText.opacity(0.7))
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
}

/// ポイント獲得カード
struct PointsEarnedCard: View {
    let points: Int

    var body: some View {
        HStack {
            Image(systemName: "star.circle.fill")
                .font(.title)
                .foregroundColor(.roopyGold)

            Text("\(points) ポイント獲得！")
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.roopyText)

            Spacer()
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.roopyGold.opacity(0.2), .roopyOrange.opacity(0.1)],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(12)
    }
}

/// 間違えた問題セクション
struct WrongAnswersSection: View {
    let wrongAnswers: [WrongAnswer]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.red)
                Text("間違えた問題")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyText)
            }

            ForEach(wrongAnswers, id: \.questionId) { wrong in
                WrongAnswerCard(wrong: wrong)
            }
        }
    }
}

/// 間違えた問題カード
struct WrongAnswerCard: View {
    let wrong: WrongAnswer

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(wrong.questionText)
                .font(.subheadline)
                .foregroundColor(.roopyText)

            HStack(spacing: 16) {
                HStack(spacing: 4) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.red)
                        .font(.caption)
                    Text("あなたの回答: \(wrong.selectedAnswer)")
                        .font(.caption)
                        .foregroundColor(.red)
                }

                HStack(spacing: 4) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.caption)
                    Text("正解: \(wrong.correctAnswer)")
                        .font(.caption)
                        .foregroundColor(.green)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.red.opacity(0.05))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.red.opacity(0.2), lineWidth: 1)
        )
    }
}

/// 間違えた回答データ
struct WrongAnswer {
    let questionId: Int
    let questionText: String
    let selectedAnswer: String
    let correctAnswer: String
}
