
import { Metadata } from 'next';
import { initializeFirebase } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { getThumbnailUrl, extractSummary } from '@/lib/news-utils';
import NewsPortalClient from './news-portal-client';

/**
 * @fileOverview 뉴스 포털 메인 페이지 (실시간 데이터 반영 버전)
 * - force-dynamic 설정을 통해 전문가의 DB 수정 사항이 즉시 서비스에 반영되도록 보장합니다.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'K-NEWS | 실시간 랭킹 & 최신 뉴스피드 전문 저장소',
  description: '대한민국 No.1 컨텐츠 뉴스 저장소. 실시간 인기 랭킹 20과 최신 기사 피드를 전문으로 제공합니다.',
  keywords: ["영화", "드라마", "실시간 랭킹", "뉴스피드", "K-컨텐츠"],
  alternates: {
    canonical: 'https://down1.co.kr/news',
  },
};

async function getNewsData() {
  const { firestore } = initializeFirebase();
  const q = query(
    collection(firestore, "packages"), 
    orderBy("createdAt", "desc"), 
    limit(100)
  );
  
  try {
    const snapshot = await getDocs(q);
    const allPosts = snapshot.docs.map(doc => {
      const id = doc.id;
      const data = doc.data();
      
      const thumbnailUrl = getThumbnailUrl(id, data);
      const summary = extractSummary(data);
      
      return {
        id,
        title: data.title || data.location || "",
        location: data.location || "",
        theme: data.theme || "",
        views: data.views || 0,
        youtubeUrl: data.youtubeUrl || null,
        status: data.status || "",
        createdAt: data.createdAt?.toMillis?.() || null,
        updatedAt: data.updatedAt?.toMillis?.() || null,
        publishedAt: data.publishedAt?.toMillis?.() || null,
        thumbnailUrl,
        summary,
      };
    }) as any[];
    return allPosts.filter((post: any) => post.status !== 'draft');
  } catch (e) {
    console.error("Error fetching news data:", e);
    return [];
  }
}

export default async function NewsPortalPage() {
  const allPosts = await getNewsData();
  return <NewsPortalClient allPosts={allPosts} />;
}
