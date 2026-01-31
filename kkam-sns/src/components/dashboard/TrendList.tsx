'use client';

import { useState, useEffect } from 'react';
import { TrendData } from '@/types';
import TrendCard from './TrendCard';

interface TrendListProps {
  initialTrends?: TrendData[];
}

export default function TrendList({ initialTrends = [] }: TrendListProps) {
  const [trends, setTrends] = useState<TrendData[]>(initialTrends);
  const [loading, setLoading] = useState(initialTrends.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'google' | 'naver' | 'pubmed'>('all');

  useEffect(() => {
    if (initialTrends.length === 0) {
      fetchTrends();
    }
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trends');
      const data = await response.json();

      if (data.success) {
        setTrends(data.data);
      } else {
        setError(data.error || 'Failed to fetch trends');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrends = filter === 'all' 
    ? trends 
    : trends.filter(t => t.source === filter);

  const handleTrendClick = (trend: TrendData) => {
    console.log('Selected trend:', trend);
    // TODO: 2단계에서 콘텐츠 추천 모달 열기
  };

  return (
    <div className="space-y-4">
      {/* 필터 & 새로고침 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'google', 'naver', 'pubmed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '전체' : f.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={fetchTrends}
          disabled={loading}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              로딩중...
            </>
          ) : (
            <>🔄 새로고침</>
          )}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 트렌드 목록 */}
      {loading && trends.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : filteredTrends.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          트렌드 데이터가 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrends.map((trend, index) => (
            <TrendCard
              key={`${trend.source}-${trend.keyword}-${index}`}
              trend={trend}
              rank={index + 1}
              onClick={() => handleTrendClick(trend)}
            />
          ))}
        </div>
      )}

      {/* 통계 */}
      {trends.length > 0 && (
        <div className="flex justify-center gap-6 pt-4 text-sm text-gray-500">
          <span>🔍 Google: {trends.filter(t => t.source === 'google').length}</span>
          <span>🇰🇷 Naver: {trends.filter(t => t.source === 'naver').length}</span>
          <span>🔬 PubMed: {trends.filter(t => t.source === 'pubmed').length}</span>
        </div>
      )}
    </div>
  );
}
