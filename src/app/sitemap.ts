
import { MetadataRoute } from 'next';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { headers } from 'next/headers';

/**
 * @fileOverview 구글 색인 최적화 지능형 사이트맵 생성기 (3개 도메인 정예 체제)
 * - 각 도메인별 1:1 매칭 상세 URL 전수 노출
 * - Canonical 주소 (non-www) 고정
 */

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const rawHost = headersList.get('host') || '';
  const host = rawHost.toLowerCase().replace('www.', '').split(':')[0];
  
  const domainMap: Record<string, string> = {
    'down1.co.kr': 'https://down1.co.kr',
    'allmovie.shop': 'https://allmovie.shop',
    'moviefree.store': 'https://moviefree.store',
  };

  const currentBaseUrl = domainMap[host] || `https://${host}`;
  const { firestore } = initializeFirebase();
  
  let posts: any[] = [];
  try {
    const snapshot = await getDocs(collection(firestore, 'packages'));
    posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        updatedAt: data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
      };
    });
  } catch (e) {
    console.error("Sitemap fetch error", e);
  }

  const home: MetadataRoute.Sitemap[number] = {
    url: `${currentBaseUrl}/`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  };

  // 1. down1.co.kr (뉴스 포털)
  if (host === 'down1.co.kr') {
    return [
      home,
      ...posts.map((post) => ({
        url: `${currentBaseUrl}/news/${post.id}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  }

  // 2. allmovie.shop (블로그)
  if (host === 'allmovie.shop') {
    return [
      home,
      ...posts.map((post) => ({
        url: `${currentBaseUrl}/blog/${post.id}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  }

  // 3. moviefree.store (웹진)
  if (host === 'moviefree.store') {
    return [
      home,
      ...posts.map((post) => ({
        url: `${currentBaseUrl}/webzine/${post.id}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  }

  return [home];
}
