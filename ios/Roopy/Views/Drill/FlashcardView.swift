import SwiftUI

/// 単語カード学習画面
struct FlashcardView: View {
    let deck: FlashcardDeck
    @StateObject private var viewModel: FlashcardViewModel
    @Environment(\.dismiss) private var dismiss

    init(deck: FlashcardDeck) {
        self.deck = deck
        self._viewModel = StateObject(wrappedValue: FlashcardViewModel(deck: deck))
    }

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingView()
            } else if viewModel.showResumeModal {
                ResumeModalView(viewModel: viewModel)
            } else if viewModel.isCompleted {
                FlashcardResultView(viewModel: viewModel, onDismiss: { dismiss() })
            } else if let card = viewModel.currentCard {
                FlashcardContentView(viewModel: viewModel, card: card)
            } else {
                EmptyStateView(message: "カードがありません")
            }
        }
        .navigationTitle(deck.name)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadCards()
        }
    }
}

/// 続きから再開モーダル
struct ResumeModalView: View {
    @ObservedObject var viewModel: FlashcardViewModel

    var body: some View {
        VStack(spacing: 24) {
            Text("📚")
                .font(.system(size: 60))

            Text("前回の続きがあります")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.roopyText)

            Text("\(viewModel.savedIndex + 1)枚目から再開できます（全\(viewModel.cards.count)枚中）")
                .font(.subheadline)
                .foregroundColor(.roopyText.opacity(0.7))

            VStack(spacing: 12) {
                Button(action: { viewModel.resumeFromSaved() }) {
                    Text("続きから始める")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.roopyPrimary)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }

                Button(action: { viewModel.startFromBeginning() }) {
                    Text("最初から始める")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.roopyBackground)
                        .foregroundColor(.roopyText)
                        .cornerRadius(12)
                }
            }
            .padding(.horizontal, 24)
        }
        .padding()
        .background(Color.roopyBackgroundLight)
    }
}

/// カード表示ビュー（スワイプ対応）
struct FlashcardContentView: View {
    @ObservedObject var viewModel: FlashcardViewModel
    let card: Flashcard

    @State private var offset: CGSize = .zero
    @State private var cardOpacity: Double = 1.0

    var body: some View {
        VStack(spacing: 16) {
            // 進捗バー
            VStack(spacing: 4) {
                HStack {
                    Text("\(viewModel.currentIndex + 1) / \(viewModel.cards.count)")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.roopyText)
                    Spacer()
                }

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 6)
                            .cornerRadius(3)

                        Rectangle()
                            .fill(Color.roopyPrimary)
                            .frame(width: geo.size.width * CGFloat(viewModel.currentIndex + 1) / CGFloat(viewModel.cards.count), height: 6)
                            .cornerRadius(3)
                    }
                }
                .frame(height: 6)
            }
            .padding(.horizontal)

            // コントロールボタン
            HStack(spacing: 12) {
                Button(action: {
                    viewModel.toggleShuffle()
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: viewModel.isShuffled ? "arrow.counterclockwise" : "shuffle")
                            .font(.caption)
                        Text(viewModel.isShuffled ? "順番に戻す" : "シャッフル")
                            .font(.caption)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.roopyBackground)
                    .foregroundColor(.roopyText)
                    .cornerRadius(8)
                }
            }

            Spacer()

            // カード（タップでフリップ、スワイプで次へ）
            ZStack {
                // 表面
                CardFaceView(
                    text: card.frontText,
                    subText: "#\(card.orderNum ?? 0)",
                    hint: "タップで答えを見る",
                    isBack: false
                )
                .opacity(viewModel.isFlipped ? 0 : 1)
                .rotation3DEffect(
                    .degrees(viewModel.isFlipped ? 180 : 0),
                    axis: (x: 0, y: 1, z: 0)
                )

                // 裏面
                CardFaceView(
                    text: card.backText,
                    subText: "解答",
                    hint: "← スワイプで次へ →",
                    isBack: true
                )
                .opacity(viewModel.isFlipped ? 1 : 0)
                .rotation3DEffect(
                    .degrees(viewModel.isFlipped ? 0 : -180),
                    axis: (x: 0, y: 1, z: 0)
                )
            }
            .frame(height: 280)
            .offset(x: offset.width)
            .opacity(cardOpacity)
            .rotationEffect(.degrees(Double(offset.width / 25)))
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        offset = gesture.translation
                    }
                    .onEnded { gesture in
                        let threshold: CGFloat = 80

                        if gesture.translation.width < -threshold && viewModel.currentIndex < viewModel.cards.count - 1 {
                            // 左スワイプ - 次へ（カードが左に出ていく）
                            withAnimation(.easeOut(duration: 0.2)) {
                                offset = CGSize(width: -500, height: 0)
                                cardOpacity = 0
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                                viewModel.goToNext()
                                // 新しいカードを右から入れる
                                offset = CGSize(width: 500, height: 0)
                                cardOpacity = 0
                                withAnimation(.easeOut(duration: 0.25)) {
                                    offset = .zero
                                    cardOpacity = 1
                                }
                            }
                        } else if gesture.translation.width > threshold && viewModel.currentIndex > 0 {
                            // 右スワイプ - 前へ（カードが右に出ていく）
                            withAnimation(.easeOut(duration: 0.2)) {
                                offset = CGSize(width: 500, height: 0)
                                cardOpacity = 0
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                                viewModel.goToPrev()
                                // 新しいカードを左から入れる
                                offset = CGSize(width: -500, height: 0)
                                cardOpacity = 0
                                withAnimation(.easeOut(duration: 0.25)) {
                                    offset = .zero
                                    cardOpacity = 1
                                }
                            }
                        } else {
                            // 戻す
                            withAnimation(.spring(response: 0.3)) {
                                offset = .zero
                            }
                        }
                    }
            )
            .onTapGesture {
                withAnimation(.spring(response: 0.4)) {
                    viewModel.flipCard()
                }
            }
            .padding(.horizontal)

            Spacer()

            // ナビゲーションボタン
            HStack(spacing: 40) {
                Button(action: {
                    guard viewModel.currentIndex > 0 else { return }
                    // 左から入ってくるアニメーション
                    withAnimation(.easeOut(duration: 0.15)) {
                        offset = CGSize(width: 300, height: 0)
                        cardOpacity = 0
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                        viewModel.goToPrev()
                        offset = CGSize(width: -300, height: 0)
                        withAnimation(.easeOut(duration: 0.2)) {
                            offset = .zero
                            cardOpacity = 1
                        }
                    }
                }) {
                    Image(systemName: "chevron.left")
                        .font(.title2)
                        .foregroundColor(viewModel.currentIndex == 0 ? .gray.opacity(0.3) : .roopyText)
                        .frame(width: 50, height: 50)
                        .background(Color.white)
                        .clipShape(Circle())
                        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                }
                .disabled(viewModel.currentIndex == 0)

                // インジケーター
                HStack(spacing: 4) {
                    ForEach(0..<min(7, viewModel.cards.count), id: \.self) { i in
                        let startIdx = max(0, min(viewModel.currentIndex - 3, viewModel.cards.count - 7))
                        let idx = startIdx + i
                        if idx < viewModel.cards.count {
                            Circle()
                                .fill(idx == viewModel.currentIndex ? Color.roopyPrimary : Color.gray.opacity(0.3))
                                .frame(width: idx == viewModel.currentIndex ? 10 : 6, height: idx == viewModel.currentIndex ? 10 : 6)
                        }
                    }
                }

                Button(action: {
                    guard viewModel.currentIndex < viewModel.cards.count - 1 else { return }
                    // 右から入ってくるアニメーション
                    withAnimation(.easeOut(duration: 0.15)) {
                        offset = CGSize(width: -300, height: 0)
                        cardOpacity = 0
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                        viewModel.goToNext()
                        offset = CGSize(width: 300, height: 0)
                        withAnimation(.easeOut(duration: 0.2)) {
                            offset = .zero
                            cardOpacity = 1
                        }
                    }
                }) {
                    Image(systemName: "chevron.right")
                        .font(.title2)
                        .foregroundColor(viewModel.currentIndex == viewModel.cards.count - 1 ? .gray.opacity(0.3) : .roopyText)
                        .frame(width: 50, height: 50)
                        .background(Color.white)
                        .clipShape(Circle())
                        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                }
                .disabled(viewModel.currentIndex == viewModel.cards.count - 1)
            }
            .padding(.bottom, 20)
        }
        .background(Color.roopyBackgroundLight)
    }
}

/// カードの表面/裏面
struct CardFaceView: View {
    let text: String
    let subText: String
    let hint: String
    let isBack: Bool

    var body: some View {
        VStack(spacing: 8) {
            Text(subText)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(isBack ? .white.opacity(0.7) : .roopyPrimary)

            Spacer()

            Text(text)
                .font(isBack ? .title : .title2)
                .fontWeight(.semibold)
                .foregroundColor(isBack ? .white : .roopyText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 16)

            Spacer()

            Text(hint)
                .font(.caption2)
                .foregroundColor(isBack ? .white.opacity(0.5) : .roopyText.opacity(0.4))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(isBack
                    ? LinearGradient(colors: [Color.roopyPrimary, Color.roopyPrimary.opacity(0.8)], startPoint: .topLeading, endPoint: .bottomTrailing)
                    : LinearGradient(colors: [Color.white, Color.white], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .shadow(color: .black.opacity(0.15), radius: 10, x: 0, y: 5)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(isBack ? Color.clear : Color.roopyPrimary, lineWidth: 3)
        )
    }
}

/// 結果画面
struct FlashcardResultView: View {
    @ObservedObject var viewModel: FlashcardViewModel
    let onDismiss: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.roopyPrimary)

            Text("セッション完了！")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.roopyText)

            Text("\(viewModel.cards.count)枚のカードを学習しました")
                .font(.subheadline)
                .foregroundColor(.roopyText.opacity(0.7))

            Spacer()

            VStack(spacing: 12) {
                Button(action: { viewModel.resetSession() }) {
                    Text("もう一度")
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
    NavigationStack {
        FlashcardView(deck: FlashcardDeck(
            id: 1,
            name: "テストデッキ",
            description: "テスト用",
            subject: "英語",
            category: nil,
            displayOrder: 0,
            isPublished: true,
            createdBy: nil,
            createdAt: nil,
            updatedAt: nil
        ))
    }
}
