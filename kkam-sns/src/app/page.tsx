import TrendList from '@/components/dashboard/TrendList';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                KKAM_SNS
              </h1>
              <p className="text-sm text-gray-500">
                수면 트렌드 분석 & 콘텐츠 자동화
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/community"
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
              >
                커뮤니티 분석
              </Link>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                MVP v1
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 오늘의 트렌드 섹션 */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📈</span>
            <h2 className="text-xl font-bold text-gray-900">
              오늘의 수면 트렌드
            </h2>
          </div>
          <TrendList />
        </section>

        {/* 시너지 구조 안내 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">🎯 1타 4피 시너지</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">🧵</div>
              <div className="font-medium">쓰레드</div>
              <div className="text-gray-500">텍스트 콘텐츠</div>
            </div>
            <div className="p-3 bg-pink-50 rounded-lg">
              <div className="text-2xl mb-1">📸</div>
              <div className="font-medium">인스타그램</div>
              <div className="text-gray-500">이미지 + 텍스트</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-1">💤</div>
              <div className="font-medium">DHC_SLP</div>
              <div className="text-gray-500">슬립큐 마케팅</div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="text-2xl mb-1">📱</div>
              <div className="font-medium">KKAM_SLP</div>
              <div className="text-gray-500">수면앱 홍보</div>
            </div>
          </div>
        </section>

        {/* 다음 단계 안내 */}
        <section className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">🚧 MVP 로드맵</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
              <span>1단계: 트렌드 수집 (현재)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs">2</span>
              <span>2단계: 콘텐츠 추천</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs">3</span>
              <span>3단계: 해시태그 최적화</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs">4</span>
              <span>4단계: 자동 제작 (AI)</span>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          KKAM_SNS by Coree | PM의 PM: Doner 🐕
        </div>
      </footer>
    </div>
  );
}
