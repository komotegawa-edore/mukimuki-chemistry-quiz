'use client'

import { useEffect, useState } from 'react'
import { Gift, Trophy, Package, Users, Mail } from 'lucide-react'

interface Prize {
  id: number
  name: string
  description: string
  prize_type: string
  prize_value: number
  total_stock: number
  remaining_stock: number
}

interface Winner {
  id: number
  is_claimed: boolean
  created_at: string
  prize: {
    id: number
    name: string
    description: string
    prize_type: string
    prize_value: number
  } | null
  user: {
    id: string
    name: string
    email: string
  } | null
}

export default function GachaAdminPanel() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [totalDraws, setTotalDraws] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/gacha/admin')
      if (response.ok) {
        const data = await response.json()
        setPrizes(data.prizes || [])
        setWinners(data.winners || [])
        setTotalDraws(data.totalDraws || 0)
      } else {
        const errData = await response.json()
        setError(errData.error || 'データ取得に失敗しました')
      }
    } catch (err) {
      setError('データ取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-500">{error}</div>
        <p className="text-sm text-gray-500 mt-2">
          ガチャテーブルがまだ作成されていない可能性があります。
          SQLマイグレーションを実行してください。
        </p>
      </div>
    )
  }

  // 当たり景品のみ（ハズレ以外）
  const activePrizes = prizes.filter(p => p.prize_type !== 'lose')

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
        <Gift className="w-5 h-5 text-purple-500" />
        ガチャ管理
      </h3>

      {/* 統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">総ガチャ回数</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{totalDraws}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-sm">当選者数</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{winners.length}</p>
        </div>
        {activePrizes.map(prize => (
          <div key={prize.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-sm">{prize.name} 残り</span>
            </div>
            <p className="text-2xl font-bold text-gray-700">
              {prize.remaining_stock}/{prize.total_stock}
            </p>
          </div>
        ))}
      </div>

      {/* 景品在庫 */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          景品在庫
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3">景品名</th>
                <th className="text-left p-3">金額</th>
                <th className="text-center p-3">総在庫</th>
                <th className="text-center p-3">残り</th>
                <th className="text-center p-3">出た数</th>
              </tr>
            </thead>
            <tbody>
              {activePrizes.map(prize => (
                <tr key={prize.id} className="border-b">
                  <td className="p-3 font-medium">{prize.name}</td>
                  <td className="p-3">{prize.prize_value.toLocaleString()}円</td>
                  <td className="p-3 text-center">{prize.total_stock}</td>
                  <td className="p-3 text-center">
                    <span className={prize.remaining_stock === 0 ? 'text-red-500 font-bold' : ''}>
                      {prize.remaining_stock}
                    </span>
                  </td>
                  <td className="p-3 text-center">{prize.total_stock - prize.remaining_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 当選者一覧 */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          当選者一覧
          <span className="text-xs text-gray-500">（メールで景品を送付してください）</span>
        </h4>

        {winners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            まだ当選者はいません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3">日時</th>
                  <th className="text-left p-3">景品</th>
                  <th className="text-left p-3">名前</th>
                  <th className="text-left p-3">メールアドレス</th>
                </tr>
              </thead>
              <tbody>
                {winners.map(winner => (
                  <tr key={winner.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(winner.created_at).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        winner.prize?.prize_value === 5000 ? 'bg-yellow-100 text-yellow-800' :
                        winner.prize?.prize_value === 3000 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {winner.prize?.name} ({winner.prize?.prize_value?.toLocaleString()}円)
                      </span>
                    </td>
                    <td className="p-3">{winner.user?.name || '不明'}</td>
                    <td className="p-3">
                      <a
                        href={`mailto:${winner.user?.email}?subject=【Roopy】ガチャ当選のお知らせ&body=${winner.user?.name}様%0A%0Aおめでとうございます！%0ARoopyのガチャで${winner.prize?.name}（${winner.prize?.prize_value?.toLocaleString()}円分のAmazonギフト券）に当選されました！%0A%0A以下のギフト券コードをお受け取りください。%0A%0A【ギフト券コード】%0A（ここにコードを記載）%0A%0A今後ともRoopyをよろしくお願いいたします。`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Mail className="w-3 h-3" />
                        {winner.user?.email || '不明'}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
