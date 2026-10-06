
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
        default: "K-NEWS | 최신 영화·드라마 실시간 뉴스 & 이슈 리포트",
        template: "%s | K-NEWS"
      },
      description: "최신 K-드라마와 영화 실시간 이슈, 캐스팅 비하인드, 방영 일정 무료 뉴스 피드 - K-NEWS",
      keywords: ["최신영화뉴스", "K드라마이슈", "드라마캐스팅비하인드", "연예뉴스무료보기"],
      alternates: { canonical: "https://down1.co.kr" }
    };
  }

  if (host.includes('allmovie.shop')) {
    return {
      title: {
        default: "ALLMOVIE | 최신 K-드라마 회차별 복선 해석 & 결말 비하인드 심층 분석",
        template: "%s | ALLMOVIE"
      },
      description: "인기 K-드라마와 영화의 숨은 복선 해석, 원작 비교, 결말 스포일러 비하인드 독점 팩트체크 리포트 - ALLMOVIE",
      keywords: ["최신K드라마해석", "회차별복선해석", "드라마결말비하인드", "K콘텐츠심층분석", "올무비"],
      alternates: { canonical: "https://allmovie.shop" }
    };
  }
  
  if (host.includes('moviefree.store')) {
    return {
      title: {
        default: "MovieFree | 일과 쉼이 공존하는 국내 워케이션 숙소 & 로컬 미식 가이드",
        template: "%s | MovieFree"
      },
      description: "디지털 노마드를 위한 감성 워케이션 숙소 추천, 작업하기 좋은 로컬 카페, 지자체 한달살기 지원금 정보 총정리 - MovieFree",
      keywords: ["국내워케이션숙소추천", "오션뷰작업카페코스", "지자체한달살기지원", "로컬미식여행가이드", "무비프리"],
      alternates: { canonical: "https://moviefree.store" }
    };
  }

  return {
    title: {
      default: "M-BLOG STUDIO | 원클릭 AI 여행 블로그 포스팅 & 워드프레스 자동 발행 솔루션",
      template: "%s | M-BLOG STUDIO"
    },
    description: "국내 워케이션 숙소 추천부터 K-드라마 복선 해석까지, 4개 국어 번역과 이미지 에셋을 한 번에 생성하여 워드프레스에 원클릭 발행하는 지능형 AI 콘텐츠 스튜디오.",
    keywords: ["AI여행블로그생성", "워드프레스원클릭발행", "국내워케이션숙소추천", "최신K드라마복선해석", "M블로그스튜디오"],
    openGraph: {
      title: "M-BLOG STUDIO | 원클릭 AI 여행 블로그 포스팅 & K-콘텐츠 자동화",
      description: "지역 여행 가이드부터 워드프레스 발행까지, 크리에이터와 지자체를 위한 원클릭 AI 콘텐츠 스튜디오",
      siteName: "M-BLOG STUDIO",
      locale: "ko_KR",
      type: "website"
    }
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
