import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KKAM_SNS - 수면 트렌드 분석",
  description: "SNS 트렌드 분석 & 콘텐츠 자동화 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
