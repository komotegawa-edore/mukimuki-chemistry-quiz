import SwiftUI

/// バッジセクション
struct BadgeSection: View {
    let badges: [UserBadge]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "medal.fill")
                    .foregroundColor(.roopyGold)
                Text("獲得バッジ")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyText)

                Spacer()

                Text("\(badges.count)個")
                    .font(.caption)
                    .foregroundColor(.roopyText.opacity(0.6))
            }

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(badges) { userBadge in
                    if let badge = userBadge.badge {
                        BadgeItem(badge: badge)
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

/// バッジアイテム
struct BadgeItem: View {
    let badge: Badge

    private var badgeColor: Color {
        switch badge.color {
        case "gold": return .roopyGold
        case "silver": return .gray
        case "bronze": return .orange
        case "green": return .roopyPrimary
        default: return .gray
        }
    }

    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(badgeColor.opacity(0.2))
                    .frame(width: 50, height: 50)
                Text(badge.icon)
                    .font(.title2)
            }

            Text(badge.name)
                .font(.caption2)
                .foregroundColor(.roopyText)
                .lineLimit(1)
        }
    }
}
