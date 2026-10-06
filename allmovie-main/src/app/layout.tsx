
import './globals.css';
import { headers } from 'next/headers';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { Metadata } from 'next';

/**
 * @fileOverview 서버 사이드 루트 레이아웃 (SEO 최적화 - 타이틀 재작성 방지)
 * 구글봇이 고유 기사 제목을 명확히 인식하도록 타이틀 구조를 초간결하게 다듬었습니다.
 */

export async function generateMetadata(): Promise<Metadata> {
  const host = ((await headers()).get('host') || '').toLowerCase();
  
  if (host.includes('down1.co.kr')) {
    return {
      title: {
        default: "K-NEWS",
        template: "%s | K-NEWS"
      },
      description: "영화, 드라마 최신 기사 무료 보기 - K-NEWS",
      alternates: { canonical: "https://down1.co.kr" }
    };
  }

  if (host.includes('allmovie.shop')) {
    return {
      title: {
        default: "ALLMOVIE",
        template: "%s | ALLMOVIE"
      },
      description: "영화 드라마 심층 분석 리포트 - ALLMOVIE",
      alternates: { canonical: "https://allmovie.shop" }
    };
  }
  
  if (host.includes('moviefree.store')) {
    return {
      title: {
        default: "MovieFree",
        template: "%s | MovieFree"
      },
      description: "K-컬처 프리미엄 웹진 - MovieFree",
      alternates: { canonical: "https://moviefree.store" }
    };
  }

  return {
    title: "M-BLOG STUDIO | K-콘텐츠 엔진",
    description: "대한민국 최고의 K-콘텐츠 분석 및 발행 플랫폼",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
