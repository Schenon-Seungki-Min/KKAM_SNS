'use client';

import { CommunitySearchItem } from '@/types';

interface Props {
  results: CommunitySearchItem[];
  keyword: string;
}

export default function CsvDownloadButton({ results, keyword }: Props) {
  const handleDownload = () => {
    if (results.length === 0) return;

    // BOM for Korean Excel compatibility
    const BOM = '\uFEFF';
    const header = '소스,제목,링크,날짜,설명';
    const rows = results.map((r) => {
      const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
      return [
        escape(r.sourceLabel),
        escape(r.title),
        escape(r.link),
        escape(r.date),
        escape(r.description),
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
