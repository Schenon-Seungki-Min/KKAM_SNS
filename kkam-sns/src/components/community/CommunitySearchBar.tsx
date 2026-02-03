'use client';

import { useState, FormEvent } from 'react';

export interface YouTubeAdvancedFilters {
  publishedAfter?: string;
  publishedBefore?: string;
  viewMin?: string;
  viewMax?: string;
}

interface Props {
  onSearch: (keyword: string, filters?: YouTubeAdvancedFilters) => void;
  loading: boolean;
}

export default function CommunitySearchBar({ onSearch, loading }: Props) {
  const [input, setInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<YouTubeAdvancedFilters>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length === 0) return;

    const apiFilters: YouTubeAdvancedFilters = {};
    if (filters.publishedAfter) {
      apiFilters.publishedAfter = new Date(filters.publishedAfter).toISOString();
    }
    if (filters.publishedBefore) {
      apiFilters.publishedBefore = new Date(filters.publishedBefore + 'T23:59:59').toISOString();
    }
    if (filters.viewMin) apiFilters.viewMin = filters.viewMin;
    if (filters.viewMax) apiFilters.viewMax = filters.viewMax;

    const hasFilters = Object.keys(apiFilters).length > 0;
    onSearch(trimmed, hasFilters ? apiFilters : undefined);
  };

  const suggestions = ['수면', '불면증', '멜라토닌', '코골이', '수면무호흡'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="키워드를 입력하세요 (예: 수면, 불면증)"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || input.trim().length === 0}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-gray-400">추천:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              setInput(s);
              onSearch(s);
            }}
            disabled={loading}
            className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* 고급 검색 토글 */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        고급 검색 (유튜브) {showAdvanced ? '\u25B2' : '\u25BC'}
      </button>

      {showAdvanced && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <p className="text-[10px] text-gray-400">YouTube 검색 결과에만 적용됩니다</p>

          {/* 업로드 기간 */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1.5">업로드 기간</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">시작일</label>
                <input
                  type="date"
                  value={filters.publishedAfter || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, publishedAfter: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">종료일</label>
                <input
                  type="date"
                  value={filters.publishedBefore || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, publishedBefore: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* 조회수 범위 */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1.5">조회수 범위</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">최소</label>
                <input
                  type="number"
                  min="0"
                  placeholder="예: 1000"
                  value={filters.viewMin || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, viewMin: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">최대</label>
                <input
                  type="number"
                  min="0"
                  placeholder="예: 100000"
                  value={filters.viewMax || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, viewMax: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilters({})}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
