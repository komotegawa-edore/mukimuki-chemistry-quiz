import Link from 'next/link'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Roopy（るーぴー）| 大学受験学習アプリ',
  description: '大学受験を"毎日つづけられる"ゲームにする。Roopyは、受験生の学習習慣を応援する無料の学習アプリです。',
  openGraph: {
    title: 'Roopy（るーぴー）| 大学受験学習アプリ',
    description: '大学受験を"毎日つづけられる"ゲームにする。Roopyは、受験生の学習習慣を応援する無料の学習アプリです。',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-[#F4F9F7] text-[#3A405A] ${notoSansJP.className}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(93, 223, 195, 0.05) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(93, 223, 195, 0.05) 0%, transparent 20%)
        `
      }}>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-white to-[#F4F9F7] rounded-b-[40px] shadow-[0_4px_20px_rgba(93,223,195,0.1)] py-16 px-4 text-center">
        <div className="max-w-[860px] mx-auto">
          <div className="text-[#5DDFC3] text-xl mb-2 font-bold">
            Roopy（るーぴー）
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
            大学受験を<br className="md:hidden" />"毎日つづけられる"ゲームにする
          </h1>

          <div className="w-44 h-44 bg-[#E0F7F1] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg relative">
            <span className="text-8xl">🌱</span>
            <span className="absolute -bottom-10 text-sm opacity-60">[ロゴ＋るーぴーのビジュアル]</span>
          </div>

          <h2 className="text-3xl font-bold mt-16 mb-6 font-bold">
            受験の森へ、ようこそ。
          </h2>
          <p className="mb-6 leading-relaxed">
            志望校合格というゴールを目指す、長く険しい道のり。<br />
            それはまるで、深く広大な森を冒険するようなものかもしれません。
          </p>
          <p className="mb-6 leading-relaxed">
            Roopy（るーぴー）は、そんな「受験の森」を旅するあなたのためのナビゲーター。<br />
            日々の学習を、少しのワクワクと、確かな達成感に変えていく。<br />
            一人きりの孤独な戦いを、Roopyと一緒に「続けられる冒険」にしませんか？
          </p>
        </div>
      </header>

      {/* Why Section */}
      <section className="max-w-[860px] mx-auto my-10 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-16">
          <h2 className="text-3xl font-bold text-center mb-8 font-bold">
            なぜ、受験勉強は続かないのでしょうか？
          </h2>
          <p className="mb-6 leading-relaxed">
            「やらなきゃいけないのは分かっているけれど、やる気が出ない」<br />
            「机に向かっても、集中が続かない」<br />
            「昨日は頑張れたのに、今日はサボってしまった」
          </p>
          <p className="mb-6 leading-relaxed">
            受験生なら誰もが抱える、継続の難しさ。<br />
            それは決して、あなたの意志が弱いからではありません。<br />
            成果が見えづらく、孤独で、単調な作業の繰り返しになりがちだからです。
          </p>

          <div className="bg-[#E0F7F1] p-8 rounded-2xl text-center font-bold text-xl my-10">
            Roopyは、そんな「続かない」悩みを解決するために生まれました。
          </div>

          <p className="mb-6 leading-relaxed">
            学習をゲームのように直感的に、テンポよく。<br />
            毎日の小さな積み重ねを、目に見える成果として記録する。<br />
            Roopyは、あなたの「今日も勉強できた！」という達成感を何よりも大切にする、新しい学習アプリです。
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-[860px] mx-auto my-10 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-16">
          <h2 className="text-3xl font-bold text-center mb-8 font-bold">
            まずは、ここから。確実な一歩を。
          </h2>
          <p className="text-center mb-12 leading-relaxed">
            Roopyはまだ生まれたばかり。<br />
            まずは、受験生がつまずきやすい分野から、しっかりとサポートします。
          </p>

          <h3 className="text-2xl font-bold text-[#5DDFC3] mt-12 mb-4 font-bold">
            🧪 無機化学テスト
          </h3>
          <p className="mb-6 leading-relaxed">
            暗記量が多く、後回しにしがちな無機化学。<br />
            Roopyなら、1問1答のクイズ形式で、ゲーム感覚でサクサク進められます。
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F4F9F7] rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                🎮
              </div>
              <div>
                <strong className="block text-lg mb-1">テンポの良いUI</strong>
                <p>ストレスなく、次々と問題を解いていける心地よい操作感。</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F4F9F7] rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                🔄
              </div>
              <div>
                <strong className="block text-lg mb-1">復習・履歴管理</strong>
                <p>間違えた問題だけを効率よく解き直せるので、知識が確実に定着します。</p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-[#5DDFC3] mt-12 mb-4 font-bold">
            📈 記録 × モチベーション
          </h3>
          <p className="mb-6 leading-relaxed">
            「今日も頑張った」という証を、Roopyは逃しません。
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F4F9F7] rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                💰
              </div>
              <div>
                <strong className="block text-lg mb-1">ポイント機能</strong>
                <p>学習するたびにポイントが貯まる。日々の努力が数字で見える楽しさを。</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F4F9F7] rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                🏆
              </div>
              <div>
                <strong className="block text-lg mb-1">ランキング機能</strong>
                <p>同じ志を持つライバルたちと、切磋琢磨できる（※匿名で参加できます）。</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F4F9F7] rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                🎁
              </div>
              <div>
                <strong className="block text-lg mb-1">ログインボーナス</strong>
                <p>アプリを開くだけで、小さなご褒美が。毎日の習慣化を後押しします。</p>
              </div>
            </div>
          </div>

          <p className="text-center mt-12 leading-relaxed">
            これだけでも、苦手な分野の克服と、学習習慣の定着が確実に前進します。
          </p>
        </div>
      </section>

      {/* Coming Soon Sections */}
      <section className="max-w-[860px] mx-auto my-10 px-4">
        <h2 className="text-3xl font-bold text-center mb-8 font-bold">
          冒険の世界は、まもなく広がります。
        </h2>
        <p className="text-center mb-12 leading-relaxed">
          Roopyは、あなたと一緒に成長していくアプリです。<br />
          近日中に、以下の機能が解放される予定です。
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-bold text-[#5DDFC3] mb-4 font-bold">
              ⚗️ 有機化学
            </h3>
            <p className="leading-relaxed">
              無機化学に続き、化学の重要分野である「有機化学」も登場。構造式や反応系統図も、Roopyらしい分かりやすいインターフェースで学習できるようになります。
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-bold text-[#5DDFC3] mb-4 font-bold">
              🎧 英語リスニング
            </h3>
            <p className="leading-relaxed">
              毎日の継続がカギとなるリスニング。通学時間やスキマ時間に、手軽に取り組めるトレーニング機能を追加予定です。
            </p>
          </div>
        </div>
      </section>

      {/* Dark Coming Soon Section */}
      <section className="max-w-[860px] mx-auto my-10 px-4">
        <div className="bg-[#3A405A] text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-[#5DDFC3] mb-6 font-bold">
            Coming Soon
          </h2>
          <p className="mb-8 leading-relaxed">
            Roopyとの冒険は、まだ始まったばかり。<br />
            これからのアップデートにも、どうぞご期待ください。
          </p>
          <ul className="inline-block text-left space-y-4">
            <li className="font-bold">✨ 教科の拡張（化学以外の科目も順次追加）</li>
            <li className="font-bold">✨ 学習計画（Roopyと一緒に「森を旅する」プランニング）</li>
            <li className="font-bold">✨ ミッション（クエストや継続チャレンジなどのゲーム要素）</li>
          </ul>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-gradient-to-b from-[#F4F9F7] to-white rounded-t-[40px] py-20 px-4 text-center mt-20">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-bold">
            さあ、今日から始めましょう。
          </h2>
          <p className="mb-6 leading-relaxed">
            Roopyは、すべての大学受験生のために作られたアプリです。<br />
            すべての機能を、これからもずっと、完全無料でご利用いただけます。
          </p>
          <p className="mb-6 leading-relaxed">
            面倒な手続きは必要ありません。<br />
            GoogleアカウントやApple IDなどで、すぐに冒険を始められます。
          </p>
          <p className="mb-12 leading-relaxed">
            あなたの努力が、確かな実力に変わるその日まで。<br />
            Roopyは、一番近くであなたを応援しています。
          </p>

          <Link
            href="/login"
            className="inline-block bg-[#5DDFC3] text-white text-xl font-bold py-5 px-16 rounded-full shadow-[0_8px_20px_rgba(93,223,195,0.4)] hover:shadow-[0_12px_24px_rgba(93,223,195,0.5)] hover:-translate-y-1 transition-all font-bold"
          >
            無料で利用を開始する
          </Link>
        </div>
      </footer>
    </div>
  )
}
