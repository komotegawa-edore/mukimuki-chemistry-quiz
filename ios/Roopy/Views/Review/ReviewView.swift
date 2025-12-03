import SwiftUI

/// 復習画面
struct ReviewView: View {
    @StateObject private var viewModel = ReviewViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var isReviewMode = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    LoadingView()
                } else if isReviewMode {
                    if viewModel.isCompleted {
                        ReviewResultView(viewModel: viewModel, onRetry: {
                            viewModel.retry()
                        }, onDismiss: {
                            isReviewMode = false
                            viewModel.reset()
                        })
                    } else if let question = viewModel.currentQuestion {
                        ReviewQuizView(viewModel: viewModel, question: question)
                    }
                } else {
                    ReviewStartView(
                        viewModel: viewModel,
                        onStart: { isReviewMode = true },
                        onReshuffle: { viewModel.reshuffleQuestions() }
                    )
                }
            }
            .navigationTitle("復習モード")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("閉じる") {
                        dismiss()
                    }
                    .foregroundColor(.roopyPrimary)
                }
            }
        }
        .task {
            await viewModel.loadData()
        }
    }
}

/// 復習開始画面
struct ReviewStartView: View {
    @ObservedObject var viewModel: ReviewViewModel
    let onStart: () -> Void
    let onReshuffle: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                if viewModel.allQuestions.isEmpty {
                    // 復習する問題がない場合
                    VStack(spacing: 16) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 64))
                            .foregroundColor(.roopyPrimary)

                        Text("素晴らしい！")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.roopyText)

                        Text("現在、復習が必要な問題はありません。\n新しい章に挑戦してみましょう！")
                            .font(.subheadline)
                            .foregroundColor(.roopyText.opacity(0.7))
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 60)
                } else {
                    // 復習問題がある場合
                    VStack(alignment: .leading, spacing: 16) {
                        Text("間違えた問題を復習しましょう")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.roopyText)

                        HStack {
                            Text("過去に間違えた問題が")
                                .foregroundColor(.roopyText.opacity(0.7))
                            Text("\(viewModel.allQuestions.count)")
                                .fontWeight(.bold)
                                .foregroundColor(.roopyText)
                            Text("問あります")
                                .foregroundColor(.roopyText.opacity(0.7))
                        }
                        .font(.subheadline)

                        if viewModel.allQuestions.count > 20 {
                            Text("ランダムで20問を選択")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.roopyPrimary)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.roopyBackground)
                                .cornerRadius(8)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    // 説明
                    VStack(alignment: .leading, spacing: 8) {
                        Text("復習モードについて")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.roopyText)

                        VStack(alignment: .leading, spacing: 4) {
                            BulletPoint(text: "過去のテストで間違えた問題からランダムに20問を選択します")
                            BulletPoint(text: "問題はランダムな順序で表示されます")
                            BulletPoint(text: "復習の結果は記録されません（何度でも挑戦できます）")
                        }
                    }
                    .padding()
                    .background(Color.roopyBackground.opacity(0.5))
                    .cornerRadius(12)
                    .overlay(
                        Rectangle()
                            .fill(Color.roopyPrimary)
                            .frame(width: 4),
                        alignment: .leading
                    )

                    // 選択された問題数
                    VStack(alignment: .leading, spacing: 12) {
                        Text("選択された問題")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.roopyText)

                        Text("\(viewModel.selectedQuestions.count)問")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.roopyPrimary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)

                    // ボタン
                    VStack(spacing: 12) {
                        if viewModel.allQuestions.count > 20 {
                            Button(action: onReshuffle) {
                                HStack {
                                    Image(systemName: "arrow.triangle.2.circlepath")
                                    Text("別の問題を選択")
                                }
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.roopyBackground)
                                .foregroundColor(.roopyText)
                                .cornerRadius(12)
                            }
                        }

                        Button(action: onStart) {
                            Text("復習を開始する")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.roopyPrimary)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                    .padding(.top, 8)
                }
            }
            .padding()
        }
        .background(Color.roopyBackgroundLight)
    }
}

/// 箇条書きポイント
struct BulletPoint: View {
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text("•")
                .foregroundColor(.roopyText.opacity(0.5))
            Text(text)
                .font(.caption)
                .foregroundColor(.roopyText.opacity(0.7))
        }
    }
}

/// 復習クイズ画面
struct ReviewQuizView: View {
    @ObservedObject var viewModel: ReviewViewModel
    let question: Question

    var body: some View {
        VStack(spacing: 0) {
            // 進捗バー
            VStack(spacing: 4) {
                HStack {
                    Text("復習モード")
                        .font(.caption)
                        .foregroundColor(.roopyPrimary)
                    Spacer()
                    Text("\(viewModel.currentIndex + 1) / \(viewModel.totalQuestions)")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.roopyText)
                }

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 6)
                            .cornerRadius(3)

                        Rectangle()
                            .fill(Color.roopyPrimary)
                            .frame(width: geo.size.width * CGFloat(viewModel.currentIndex + 1) / CGFloat(viewModel.totalQuestions), height: 6)
                            .cornerRadius(3)
                    }
                }
                .frame(height: 6)
            }
            .padding()

            ScrollView {
                VStack(spacing: 20) {
                    // 問題文
                    Text(question.questionText)
                        .font(.body)
                        .fontWeight(.medium)
                        .foregroundColor(.roopyText)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)

                    // 選択肢
                    VStack(spacing: 12) {
                        ReviewChoiceButton(
                            label: "A",
                            text: question.choiceA,
                            isSelected: viewModel.selectedAnswer == "A",
                            isCorrect: question.correctAnswer == "A",
                            showAnswer: viewModel.showAnswer,
                            action: { viewModel.selectAnswer("A") }
                        )
                        ReviewChoiceButton(
                            label: "B",
                            text: question.choiceB,
                            isSelected: viewModel.selectedAnswer == "B",
                            isCorrect: question.correctAnswer == "B",
                            showAnswer: viewModel.showAnswer,
                            action: { viewModel.selectAnswer("B") }
                        )
                        ReviewChoiceButton(
                            label: "C",
                            text: question.choiceC,
                            isSelected: viewModel.selectedAnswer == "C",
                            isCorrect: question.correctAnswer == "C",
                            showAnswer: viewModel.showAnswer,
                            action: { viewModel.selectAnswer("C") }
                        )
                        ReviewChoiceButton(
                            label: "D",
                            text: question.choiceD,
                            isSelected: viewModel.selectedAnswer == "D",
                            isCorrect: question.correctAnswer == "D",
                            showAnswer: viewModel.showAnswer,
                            action: { viewModel.selectAnswer("D") }
                        )
                    }

                    // 解説（回答後に表示）
                    if viewModel.showAnswer, let explanation = question.explanation, !explanation.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("解説")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.roopyPrimary)
                            Text(explanation)
                                .font(.subheadline)
                                .foregroundColor(.roopyText)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(Color.roopyBackground.opacity(0.5))
                        .cornerRadius(12)
                    }

                    // 次へボタン
                    if viewModel.showAnswer {
                        Button(action: { viewModel.nextQuestion() }) {
                            Text(viewModel.currentIndex + 1 < viewModel.totalQuestions ? "次の問題へ" : "結果を見る")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.roopyPrimary)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
        }
        .background(Color.roopyBackgroundLight)
    }
}

/// 選択肢ボタン（復習用）
struct ReviewChoiceButton: View {
    let label: String
    let text: String
    let isSelected: Bool
    let isCorrect: Bool
    let showAnswer: Bool
    let action: () -> Void

    var backgroundColor: Color {
        if showAnswer {
            if isCorrect {
                return Color.green.opacity(0.2)
            } else if isSelected {
                return Color.red.opacity(0.2)
            }
        }
        if isSelected {
            return Color.roopyPrimary.opacity(0.2)
        }
        return Color.white
    }

    var borderColor: Color {
        if showAnswer {
            if isCorrect {
                return Color.green
            } else if isSelected {
                return Color.red
            }
        }
        if isSelected {
            return Color.roopyPrimary
        }
        return Color.gray.opacity(0.3)
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Text(label)
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(isSelected ? .roopyPrimary : .roopyText.opacity(0.6))
                    .frame(width: 28, height: 28)
                    .background(
                        Circle()
                            .fill(isSelected ? Color.roopyPrimary.opacity(0.2) : Color.gray.opacity(0.1))
                    )

                Text(text)
                    .font(.subheadline)
                    .foregroundColor(.roopyText)
                    .multilineTextAlignment(.leading)

                Spacer()

                if showAnswer {
                    if isCorrect {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                    } else if isSelected {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.red)
                    }
                }
            }
            .padding()
            .background(backgroundColor)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: 2)
            )
        }
        .disabled(showAnswer)
    }
}

/// 復習結果画面
struct ReviewResultView: View {
    @ObservedObject var viewModel: ReviewViewModel
    let onRetry: () -> Void
    let onDismiss: () -> Void

    var percentage: Int {
        guard viewModel.totalQuestions > 0 else { return 0 }
        return Int(Double(viewModel.correctCount) / Double(viewModel.totalQuestions) * 100)
    }

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // 結果アイコン
            Image(systemName: percentage >= 80 ? "star.circle.fill" : "arrow.triangle.2.circlepath.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(percentage >= 80 ? .roopyGold : .roopyPrimary)

            // スコア
            VStack(spacing: 8) {
                Text("復習完了！")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.roopyText)

                Text("\(viewModel.correctCount) / \(viewModel.totalQuestions) 問正解")
                    .font(.title2)
                    .foregroundColor(.roopyText.opacity(0.8))

                Text("\(percentage)%")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.roopyPrimary)
            }

            // メッセージ
            Text(percentage >= 80 ? "素晴らしい結果です！" : "復習を続けて知識を定着させましょう！")
                .font(.subheadline)
                .foregroundColor(.roopyText.opacity(0.7))

            Spacer()

            // ボタン
            VStack(spacing: 12) {
                Button(action: onRetry) {
                    HStack {
                        Image(systemName: "arrow.counterclockwise")
                        Text("もう一度")
                    }
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.roopyPrimary)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }

                Button(action: onDismiss) {
                    Text("戻る")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.roopyBackground)
                        .foregroundColor(.roopyText)
                        .cornerRadius(12)
                }
            }
            .padding(.horizontal)
        }
        .padding()
        .background(Color.roopyBackgroundLight)
    }
}

#Preview {
    ReviewView()
        .environmentObject(AuthService.shared)
}
