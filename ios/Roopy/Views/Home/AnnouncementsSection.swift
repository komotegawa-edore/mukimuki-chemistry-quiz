import SwiftUI

/// お知らせセクション
struct AnnouncementsSection: View {
    let announcements: [Announcement]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "megaphone.fill")
                    .foregroundColor(.roopyPrimary)
                Text("お知らせ")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyText)
            }

            ForEach(announcements) { announcement in
                AnnouncementCard(announcement: announcement)
            }
        }
    }
}

/// お知らせカード
struct AnnouncementCard: View {
    let announcement: Announcement

    private var priorityColor: Color {
        switch announcement.priority {
        case "urgent": return .red
        case "important": return .orange
        default: return .roopyPrimary
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                if announcement.priority == "urgent" || announcement.priority == "important" {
                    Circle()
                        .fill(priorityColor)
                        .frame(width: 8, height: 8)
                }

                Text(announcement.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.roopyText)

                Spacer()
            }

            Text(announcement.content)
                .font(.caption)
                .foregroundColor(.roopyText.opacity(0.7))
                .lineLimit(2)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(priorityColor.opacity(0.3), lineWidth: 1)
        )
    }
}
