'use client';

import { useState, FormEvent } from 'react';

export type SearchPlatform = 'naver' | 'youtube';
export type NaverSort = 'sim' | 'date';

export interface YouTubeFilters {
  publishedAfter?: string;
  publishedBefore?: string;
  viewMin?: string;
  viewMax?: string;
}

export interface SearchParams {
  platform: SearchPlatform;
  keyword: string;
  naverSort?: NaverSort;
  youtubeFilters?: YouTubeFilters;
}

interface Props {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

export default function CommunitySearchBar({ onSearch, loading }: Props) {
  const [platform, setPlatform] = useState<SearchPlatform>('youtube');
  const [input, setInput] = useState('');
  const [naverSort, setNaverSort] = useState<NaverSort>('sim');
  const [youtubeFilters, setYoutubeFilters] = useState<YouTubeFilters>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length === 0) return;

    if (platform === 'naver') {
      onSearch({ platform, keyword: trimmed, naverSort });
    } else {
      const filters: YouTubeFilters = {};
      if (youtubeFilters.publishedAfter) {
        filters.publishedAfter = new Date(youtubeFilters.publishedAfter).toISOString().replace(/\.\d{3}Z$/, 'Z');
      }
      if (youtubeFilters.publishedBefore) {
        filters.publishedBefore = new Date(youtubeFilters.publishedBefore + 'T23:59:59').toISOString().replace(/\.\d{3}Z$/, 'Z');
      }
      if (youtubeFilters.viewMin) filters.viewMin = youtubeFilters.viewMin;
      if (youtubeFilters.viewMax) filters.viewMax = youtubeFilters.viewMax;

      const hasFilters = Object.keys(filters).length > 0;
      onSearch({ platform, keyword: trimmed, youtubeFilters: hasFilters ? filters : undefined });
    }
  };

  const suggestions = ['수면', '불면증', '멜라토닌', '코골이', '수면무호흡'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setPlatform('naver')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            platform === 'naver'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          네이버 검색
        </button>
        <button
          type="button"
          onClick={() => setPlatform('youtube')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            platform === 'youtube'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          유튜브 검색
        </button>
      </div>

      {/* 검색바 */}
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

      {/* 추천 키워드 */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-gray-400">추천:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              setInput(s);
              if (platform === 'naver') {
                onSearch({ platform, keyword: s, naverSort });
              } else {
                onSearch({ platform, keyword: s });
              }
            }}
            disabled={loading}
            className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* 네이버 필터: 정렬 */}
      {platform === 'naver' && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <label className="text-xs text-green-700 font-medium block mb-2">정렬</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="naverSort"
                checked={naverSort === 'sim'}
                onChange={() => setNaverSort('sim')}
                className="text-green-500"
              />
              정확도순
            </label>
            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="naverSort"
                checked={naverSort === 'date'}
                onChange={() => setNaverSort('date')}
                className="text-green-500"
              />
              최신순
            </label>
          </div>
        </div>
      )}

      {/* 유튜브 필터: 날짜 + 조회수 */}
      {platform === 'youtube' && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 space-y-3">
          {/* 업로드 기간 */}
          <div>
            <label className="text-xs text-red-700 font-medium block mb-1.5">업로드 기간</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">시작일</label>
                <input
                  type="date"
                  value={youtubeFilters.publishedAfter || ''}
                  onChange={(e) => setYoutubeFilters((f) => ({ ...f, publishedAfter: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">종료일</label>
                <input
                  type="date"
                  value={youtubeFilters.publishedBefore || ''}
                  onChange={(e) => setYoutubeFilters((f) => ({ ...f, publishedBefore: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* 조회수 범위 */}
          <div>
            <label className="text-xs text-red-700 font-medium block mb-1.5">조회수 범위</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">최소</label>
                <input
                  type="number"
                  min="0"
                  placeholder="예: 1000"
                  value={youtubeFilters.viewMin || ''}
                  onChange={(e) => setYoutubeFilters((f) => ({ ...f, viewMin: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-0.5">최대</label>
                <input
                  type="number"
                  min="0"
                  placeholder="예: 100000"
                  value={youtubeFilters.viewMax || ''}
                  onChange={(e) => setYoutubeFilters((f) => ({ ...f, viewMax: e.target.value }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setYoutubeFilters({})}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
