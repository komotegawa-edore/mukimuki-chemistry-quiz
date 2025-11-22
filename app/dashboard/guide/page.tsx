import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/helpers'
import Link from 'next/link'

export default async function GuidePage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'teacher') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← ダッシュボードに戻る
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-black">
              問題管理ガイド
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* 概要 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-black mb-4">概要</h2>
            <p className="text-gray-700 leading-relaxed">
              このガイドでは、MUKIMUKIアプリでの問題管理方法を説明します。
              問題の追加、編集、削除、CSV一括インポート、章の公開/非公開設定などの機能について学べます。
            </p>
          </section>

          {/* 問題管理の基本 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              1. 問題管理の基本
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  章の構成
                </h3>
                <p className="text-gray-700 mb-2">
                  問題は「教科」→「章」という階層で管理されています。
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>各教科には複数の章が含まれます</li>
                  <li>各章には複数の問題を登録できます</li>
                  <li>章ごとに公開/非公開を設定できます</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  問題の形式
                </h3>
                <p className="text-gray-700 mb-2">
                  すべての問題は4択形式（A・B・C・D）です。
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>問題文（必須）</li>
                  <li>選択肢A～D（すべて必須）</li>
                  <li>正解（A・B・C・Dのいずれか、必須）</li>
                  <li>解説（任意）</li>
                  <li>画像・音声（任意、メディア対応章の場合）</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 個別に問題を追加・編集 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              2. 個別に問題を追加・編集
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-black mb-2">
                  手順
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>ダッシュボードで該当する教科のセクションを展開</li>
                  <li>対象の章カードの「問題を管理」ボタンをクリック</li>
                  <li>「新しい問題を追加」ボタンをクリック</li>
                  <li>問題文、選択肢、正解、解説を入力</li>
                  <li>「追加」ボタンで保存</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  注意点
                </h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
                  <li>正解はA・B・C・Dのいずれか1つを必ず選択してください</li>
                  <li>選択肢はすべて入力が必須です</li>
                  <li>問題の編集は、各問題の「編集」ボタンから行えます</li>
                  <li>削除した問題は復元できません</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CSV一括インポート */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              3. CSV一括インポート
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                複数の問題を一度に登録したい場合は、CSV一括インポート機能を使用します。
              </p>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-black mb-2">
                  CSVファイルの形式
                </h3>
                <p className="text-gray-700 mb-2">
                  以下のカラム（列）を含むCSVファイルを用意してください：
                </p>
                <div className="bg-gray-50 rounded p-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-black font-semibold">
                          カラム名
                        </th>
                        <th className="px-3 py-2 text-left text-black font-semibold">
                          必須
                        </th>
                        <th className="px-3 py-2 text-left text-black font-semibold">
                          説明
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      <tr>
                        <td className="px-3 py-2 text-black font-mono">
                          chapter_id
                        </td>
                        <td className="px-3 py-2 text-black">必須</td>
                        <td className="px-3 py-2 text-gray-700">
                          章のID（数値）
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-black font-mono">
                          question_text
                        </td>
                        <td className="px-3 py-2 text-black">必須</td>
                        <td className="px-3 py-2 text-gray-700">問題文</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-black font-mono">
                          choice_a
                        </td>
                        <td className="px-3 py-2 text-black">必須</td>
                        <td className="px-3 py-2 text-gray-700">選択肢A</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-black font-mono">
                          choice_b
                        </td>
                        <td className="px-3 py-2 text-black">必須</td>
                        <td className="px-3 py-2 text-gray-700">選択肢B</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-black font-mono">
                          choice_c
                        </td>
                        <td className="px-3 py-2 text-black">必須</td>
                        <td className="px-3 py-2 text-gray-700">選択肢C</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-black font-mono">
                          choice_d
                        </td>
                        <td className="px-3 py-2 text-black">必須</td>
                        <td className="px-3 py-2 text-gray-700">選択肢D</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-black font-mono">
                          correct_answer
                        </td>
                        <td className="px-3 py-2 text-black">必須</td>
                        <td className="px-3 py-2 text-gray-700">
                          正解（A, B, C, D のいずれか）
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-black font-mono">
                          explanation
                        </td>
                        <td className="px-3 py-2 text-black">任意</td>
                        <td className="px-3 py-2 text-gray-700">解説</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-black mb-2">
                  インポート手順
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>ダッシュボードの「CSV一括インポート」セクションを見つける</li>
                  <li>「CSVファイルを選択」ボタンをクリック</li>
                  <li>用意したCSVファイルを選択</li>
                  <li>プレビューで内容を確認</li>
                  <li>「インポート」ボタンをクリック</li>
                  <li>成功・エラー件数を確認</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  サンプルCSVのダウンロード
                </h4>
                <p className="text-blue-800 text-sm mb-2">
                  CSV一括インポートセクションの「サンプルをダウンロード」リンクから、
                  正しい形式のサンプルファイルをダウンロードできます。
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">
                  よくあるエラー
                </h4>
                <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                  <li>
                    <strong>章ID が無効：</strong> 存在しない章IDを指定しています
                  </li>
                  <li>
                    <strong>正解が無効：</strong> A, B, C, D 以外の値が入力されています
                  </li>
                  <li>
                    <strong>必須項目が空：</strong> question_text や choice_a などが空欄です
                  </li>
                  <li>
                    <strong>文字コードエラー：</strong> UTF-8 で保存されていません
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 章の公開/非公開設定 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              4. 章の公開/非公開設定
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                各章は公開/非公開を切り替えることができます。
                非公開にすると、生徒側の画面には表示されなくなります。
              </p>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-black mb-2">
                  公開/非公開の切り替え方法
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>ダッシュボードで該当する教科のセクションを展開</li>
                  <li>対象の章カードを見つける</li>
                  <li>「公開する」または「非公開にする」ボタンをクリック</li>
                </ol>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">
                  使用例
                </h4>
                <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                  <li>準備中の章を一時的に非公開にする</li>
                  <li>問題の見直し中に一時的に非公開にする</li>
                  <li>特定の期間だけ公開する章を管理する</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 定着率の確認 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              5. 定着率の確認
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                ダッシュボードの「分析」セクションから、生徒の定着率を確認できます。
              </p>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  章別定着率
                </h3>
                <p className="text-gray-700 mb-2">
                  各生徒が各章でどれだけ正解しているかを一覧で確認できます。
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>教科フィルタで特定の教科のみ表示可能</li>
                  <li>複数回受験している場合は全受験回数の合計正答率を表示</li>
                  <li>色分けで定着度を視覚的に把握（緑：80%以上、黄：60-79%、赤：60%未満）</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  問題別定着率
                </h3>
                <p className="text-gray-700 mb-2">
                  各問題について、生徒ごとの正答率を確認できます。
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>教科・章でフィルタリング可能</li>
                  <li>特定の問題でつまずいている生徒を特定できます</li>
                  <li>難易度の高い問題を見つけやすい</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
            <h2 className="text-2xl font-bold text-black mb-4">
              Tips & ベストプラクティス
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-black">
                    問題は少しずつ追加する
                  </h4>
                  <p className="text-gray-700 text-sm">
                    一度に大量の問題を追加するより、少しずつ追加して生徒の反応を見ながら調整する方が効果的です。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-semibold text-black">
                    定期的に定着率を確認
                  </h4>
                  <p className="text-gray-700 text-sm">
                    週に1回程度、定着率を確認して苦手分野を把握しましょう。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✏️</span>
                <div>
                  <h4 className="font-semibold text-black">
                    解説を充実させる
                  </h4>
                  <p className="text-gray-700 text-sm">
                    解説欄を活用することで、生徒の理解を深めることができます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <h4 className="font-semibold text-black">
                    問題をこまめに見直す
                  </h4>
                  <p className="text-gray-700 text-sm">
                    定着率の低い問題は、難易度が高すぎる可能性があります。問題文や選択肢を見直しましょう。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* フッター */}
          <div className="text-center py-8">
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
