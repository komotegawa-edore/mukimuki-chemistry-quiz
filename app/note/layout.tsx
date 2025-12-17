import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RoopyNote - 受験生の学習記録',
  description: '学習記録、目標管理、受験生同士のつながりを支援するアプリ',
}

export default function NoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
