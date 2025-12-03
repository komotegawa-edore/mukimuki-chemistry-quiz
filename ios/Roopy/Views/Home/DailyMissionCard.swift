import SwiftUI

/// デイリーミッションカード
struct DailyMissionCard: View {
    let mission: DailyMission

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "flag.fill")
                    .foregroundColor(.roopyPrimary)
                Text("本日のミッション")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyText)

                Spacer()

                if let points = mission.rewardPoints {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption)
                        Text("+\(points)pt")
                            .font(.caption)
                            .fontWeight(.bold)
                    }
                    .foregroundColor(.roopyGold)
                }
            }

            if let chapter = mission.chapter {
                NavigationLink(destination: QuizView(chapter: chapter)) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(chapter.title)
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(.roopyText)

                            if let timeLimit = mission.timeLimitSeconds {
                                HStack(spacing: 4) {
                                    Image(systemName: "clock")
                                        .font(.caption2)
                                    Text("制限時間: \(timeLimit / 60)分")
                                        .font(.caption)
                                }
                                .foregroundColor(.roopyText.opacity(0.6))
                            }
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .foregroundColor(.roopyPrimary)
                    }
                    .padding()
                    .background(Color.roopyBackground.opacity(0.5))
                    .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}
