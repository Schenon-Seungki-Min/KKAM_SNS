'use client';

import { CommunitySearchItem } from '@/types';

interface Props {
  results: CommunitySearchItem[];
  keyword: string;
}

function formatNumber(n?: number): string {
  if (n === undefined || isNaN(n)) return '';
  return n.toString();
}

export default function CsvDownloadButton({ results, keyword }: Props) {
  const handleDownload = () => {
    if (results.length === 0) return;

    // BOM for Korean Excel compatibility
    const BOM = '\uFEFF';
    const header = '채널명,채널 임팩트 지수,View,Like,제목,내용 (요약),유형,주요 키워드,링크';
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;

    const rows = results.map((r) => {
      // 채널명
      const channelName = r.source === 'youtube' && r.channelTitle
        ? `유튜브 - ${r.channelTitle}`
        : r.sourceLabel;

      // 채널 임팩트 지수
      let impact = '';
      if (r.source === 'youtube') {
        const parts: string[] = [];
        if (r.subscriberCount !== undefined) parts.push(`구독자 ${r.subscriberCount.toLocaleString()}`);
        if (r.commentCount !== undefined) parts.push(`댓글 ${r.commentCount.toLocaleString()}`);
        impact = parts.join(', ');
      }

      return [
        escape(channelName),
        escape(impact),
        formatNumber(r.viewCount),
        formatNumber(r.likeCount),
        escape(r.title),
        escape(r.description),
        '', // 유형: 사람이 판단
        '', // 주요 키워드: 사람이 판단
        escape(r.link),
      ].join(',');
    });

    const csv = BOM + header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `community_${keyword}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={results.length === 0}
      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      CSV 다운로드
    </button>
  );
}
