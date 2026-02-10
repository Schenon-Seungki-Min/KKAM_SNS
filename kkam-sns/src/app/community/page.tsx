'use client';

import { useState, useCallback } from 'react';
import { CommunitySearchItem, KeywordFrequency } from '@/types';
import CommunitySearchBar, { SearchParams } from '@/components/community/CommunitySearchBar';
import CommunityResultList from '@/components/community/CommunityResultList';
import WordCloud from '@/components/community/WordCloud';
import CsvDownloadButton from '@/components/community/CsvDownloadButton';
import Link from 'next/link';

interface SearchState {
  loading: boolean;
  keyword: string;
  platform: 'naver' | 'youtube';
  results: CommunitySearchItem[];
  relatedKeywords: KeywordFrequency[];
  totalCount: number;
  error: string | null;
}

export default function CommunityPage() {
  const [state, setState] = useState<SearchState>({
    loading: false,
    keyword: '',
    platform: 'youtube',
    results: [],
    relatedKeywords: [],
    totalCount: 0,
    error: null,
  });

  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const handleSearch = useCallback(async (searchParams: SearchParams) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      keyword: searchParams.keyword,
      platform: searchParams.platform,
    }));

    try {
      const params = new URLSearchParams({
        platform: searchParams.platform,
        keyword: searchParams.keyword,
        display: '50',
      });

      if (searchParams.platform === 'naver' && searchParams.naverSort) {
        params.set('naverSort', searchParams.naverSort);
      }

      if (searchParams.platform === 'youtube' && searchParams.youtubeFilters) {
        const f = searchParams.youtubeFilters;
        if (f.publishedAfter) params.set('publishedAfter', f.publishedAfter);
        if (f.publishedBefore) params.set('publishedBefore', f.publishedBefore);
        if (f.viewMin) params.set('viewMin', f.viewMin);
        if (f.viewMax) params.set('viewMax', f.viewMax);
      }

      const res = await fetch(`/api/community?${params}`);
      const data = await res.json();

      if (!data.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: data.error || '검색에 실패했습니다.',
        }));
        return;
      }

      setState({
        loading: false,
        keyword: searchParams.keyword,
        platform: searchParams.platform,
        results: data.results,
        relatedKeywords: data.relatedKeywords,
        totalCount: data.totalCount,
        error: null,
      });
      setSourceFilter('all');
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: '네트워크 오류가 발생했습니다.',
      }));
    }
  }, []);

  // 소스 필터링
  const filteredResults =
    sourceFilter === 'all'
      ? state.results
      : state.results.filter((r) => r.source === sourceFilter);

  // 플랫폼별 소스 탭 정의
  const getSourceTabs = () => {
    if (state.platform === 'naver') {
      return [
        { key: 'all', label: '전체' },
        { key: 'naver_blog', label: '블로그' },
        { key: 'naver_cafe', label: '카페' },
        { key: 'naver_kin', label: '지식iN' },
      ];
    } else {
      return [{ key: 'all', label: '전체' }];
    }
  };

  const sourceTabs = getSourceTabs();

  const getSourceCounts = () => {
    if (state.platform === 'naver') {
      return {
        all: state.results.length,
        naver_blog: state.results.filter((r) => r.source === 'naver_blog').length,
        naver_cafe: state.results.filter((r) => r.source === 'naver_cafe').length,
        naver_kin: state.results.filter((r) => r.source === 'naver_kin').length,
      };
    } else {
      return {
        all: state.results.length,
      };
    }
  };

  const sourceCounts = getSourceCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">
                &larr; KKAM_SNS 대시보드
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">커뮤니티 분석</h1>
              <p className="text-sm text-gray-500">
                네이버 또는 유튜브를 선택하여 키워드를 검색합니다
              </p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              Type A
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 검색 바 */}
        <CommunitySearchBar onSearch={handleSearch} loading={state.loading} />

        {/* 에러 표시 */}
        {state.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        {/* 결과 영역 */}
        {state.results.length > 0 && (
          <>
            {/* 상단: 통계 + CSV 다운로드 */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">&quot;{state.keyword}&quot;</span>{' '}
                <span className={state.platform === 'naver' ? 'text-green-600' : 'text-red-600'}>
                  ({state.platform === 'naver' ? '네이버' : '유튜브'})
                </span>{' '}
                검색 결과 <span className="font-semibold">{state.totalCount}</span>건
              </p>
              <CsvDownloadButton results={state.results} keyword={state.keyword} />
            </div>

            {/* 소스 필터 탭 (네이버일 때만 여러 개) */}
            {sourceTabs.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {sourceTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSourceFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      sourceFilter === tab.key
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label} ({sourceCounts[tab.key as keyof typeof sourceCounts] ?? 0})
                  </button>
                ))}
              </div>
            )}

            {/* 2-column: 결과 리스트 + 워드클라우드 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CommunityResultList results={filteredResults} />
              </div>
              <div>
                <WordCloud
                  keywords={state.relatedKeywords}
                  onKeywordClick={(keyword) =>
                    handleSearch({ platform: state.platform, keyword })
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* 빈 상태 */}
        {!state.loading && state.results.length === 0 && !state.error && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg">플랫폼을 선택하고 키워드를 입력해보세요</p>
            <p className="text-sm mt-2">
              네이버 (블로그, 카페, 지식iN) 또는 유튜브에서 검색합니다
            </p>
          </div>
        )}

        {/* 로딩 */}
        {state.loading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
