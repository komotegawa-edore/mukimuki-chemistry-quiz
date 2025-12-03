import SwiftUI

/// クイズ画面
struct QuizView: View {
    let chapter: Chapter
    @StateObject private var viewModel: QuizViewModel
    @Environment(\.dismiss) private var dismiss

    init(chapter: Chapter) {
        self.chapter = chapter
        self._viewModel = StateObject(wrappedValue: QuizViewModel(chapter: chapter))
    }

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingView()
            } else if viewModel.isCompleted {
                QuizResultView(
                    viewModel: viewModel,
                    onRetry: { viewModel.retry() },
                    onDismiss: { dismiss() }
                )
            } else if let question = viewModel.currentQuestion {
                QuestionView(
                    question: question,
                    currentIndex: viewModel.currentIndex,
                    totalCount: viewModel.questions.count,
                    selectedAnswer: viewModel.selectedAnswer,
                    showAnswer: viewModel.showAnswer,
                    onSelect: { answer in viewModel.selectAnswer(answer) },
                    onNext: { viewModel.nextQuestion() }
                )
            } else {
                EmptyStateView(message: "問題がありません")
            }
        }
        .navigationTitle(chapter.title)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadQuestions()
        }
    }
}

/// ローディング表示
struct LoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            Text("問題を読み込み中...")
                .foregroundColor(.roopyText.opacity(0.7))
        }
    }
}

/// 問題表示ビュー
struct QuestionView: View {
    let question: Question
    let currentIndex: Int
    let totalCount: Int
    let selectedAnswer: String?
    let showAnswer: Bool
    let onSelect: (String) -> Void
    let onNext: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // 進捗バー
                ProgressSection(current: currentIndex + 1, total: totalCount)

                // 問題文
                QuestionTextSection(question: question)

                // 選択肢
                ChoicesSection(
                    question: question,
                    selectedAnswer: selectedAnswer,
                    showAnswer: showAnswer,
                    onSelect: onSelect
                )

                // 解説（正解表示時）
                if showAnswer, let explanation = question.explanation, !explanation.isEmpty {
                    ExplanationSection(explanation: explanation)
                }

                // 次へボタン
                if showAnswer {
                    Button(action: onNext) {
                        Text(currentIndex + 1 < totalCount ? "次の問題へ" : "結果を見る")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(RoopyPrimaryButtonStyle())
                }
            }
            .padding()
        }
        .background(Color.roopyBackgroundLight)
    }
}

/// 進捗表示
struct ProgressSection: View {
    let current: Int
    let total: Int

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text("問題 \(current) / \(total)")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.roopyText)

                Spacer()

                Text("\(Int(Double(current) / Double(total) * 100))%")
                    .font(.caption)
                    .foregroundColor(.roopyPrimary)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.roopyBackground)
                        .frame(height: 8)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.roopyPrimary)
                        .frame(width: geo.size.width * CGFloat(current) / CGFloat(total), height: 8)
                }
            }
            .frame(height: 8)
        }
    }
}

/// 問題文セクション
struct QuestionTextSection: View {
    let question: Question

    var body: some View {
        VStack(spacing: 12) {
            // 問題画像（あれば）
            if let imageUrl = question.questionImageUrl, !imageUrl.isEmpty {
                AsyncImage(url: URL(string: imageUrl)) { image in
                    image
                        .resizable()
                        .scaledToFit()
                        .cornerRadius(8)
                } placeholder: {
                    ProgressView()
                }
                .frame(maxHeight: 200)
            }

            Text(question.questionText)
                .font(.body)
                .foregroundColor(.roopyText)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }
}

/// 選択肢セクション
struct ChoicesSection: View {
    let question: Question
    let selectedAnswer: String?
    let showAnswer: Bool
    let onSelect: (String) -> Void

    var body: some View {
        VStack(spacing: 12) {
            ForEach(question.labeledChoices, id: \.label) { choice in
                ChoiceButton(
                    label: choice.label,
                    text: choice.text,
                    isSelected: selectedAnswer == choice.label,
                    isCorrect: question.correctAnswer == choice.label,
                    showAnswer: showAnswer,
                    onTap: { onSelect(choice.label) }
                )
            }
        }
    }
}

/// 選択肢ボタン
struct ChoiceButton: View {
    let label: String
    let text: String
    let isSelected: Bool
    let isCorrect: Bool
    let showAnswer: Bool
    let onTap: () -> Void

    private var backgroundColor: Color {
        if showAnswer {
            if isCorrect {
                return .green.opacity(0.2)
            } else if isSelected {
                return .red.opacity(0.2)
            }
        } else if isSelected {
            return .roopyPrimary.opacity(0.2)
        }
        return .white
    }

    private var borderColor: Color {
        if showAnswer {
            if isCorrect {
                return .green
            } else if isSelected {
                return .red
            }
        } else if isSelected {
            return .roopyPrimary
        }
        return .roopyBackground
    }

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // ラベル
                ZStack {
                    Circle()
                        .fill(isSelected ? Color.roopyPrimary : Color.roopyBackground)
                        .frame(width: 32, height: 32)
                    Text(label)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(isSelected ? .white : .roopyText)
                }

                // テキスト
                Text(text)
                    .font(.subheadline)
                    .foregroundColor(.roopyText)
                    .multilineTextAlignment(.leading)

                Spacer()

                // 正誤アイコン
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

/// 解説セクション
struct ExplanationSection: View {
    let explanation: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(.roopyGold)
                Text("解説")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyText)
            }

            Text(explanation)
                .font(.subheadline)
                .foregroundColor(.roopyText.opacity(0.8))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.roopyGold.opacity(0.1))
        .cornerRadius(12)
    }
}

/// 空状態表示
struct EmptyStateView: View {
    let message: String

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "tray")
                .font(.system(size: 48))
                .foregroundColor(.roopyText.opacity(0.3))
            Text(message)
                .foregroundColor(.roopyText.opacity(0.6))
        }
    }
}

#Preview {
    NavigationStack {
        QuizView(chapter: Chapter(
            id: 1,
            title: "第1章 水素",
            orderNum: 1,
            subjectId: 1,
            isPublished: true,
            createdAt: nil
        ))
    }
    .environmentObject(AuthService.shared)
}
