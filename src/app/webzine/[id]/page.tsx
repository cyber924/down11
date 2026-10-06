
import { Metadata } from 'next';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import WebzineDetailClient from './webzine-detail-client';

/**
 * @fileOverview 웹진 상세 페이지 서버 컴포넌트
 * SEO 최적화 및 고유 메타데이터 생성을 담당합니다.
 */

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { firestore } = initializeFirebase();
  const host = ((await headers()).get('host') || '').toLowerCase();
  
  try {
    const docSnap = await getDoc(doc(firestore, "packages", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const title = data.title || data.location || "웹진 아카이브";
      const snippet = data.localGuide?.replace(/<[^>]*>/g, '').slice(0, 160) || "";
      const canonical = host.includes('moviefree.store') ? `https://moviefree.store/webzine/${id}` : `https://${host}/webzine/${id}`;

      return {
        title: title,
        description: snippet,
        alternates: { canonical: canonical },
        openGraph: {
          title: title,
          description: snippet,
          images: [`https://picsum.photos/seed/${id}/1600/800`],
          type: 'article',
        }
      };
    }
  } catch (e) {
    console.error("Metadata error", e);
  }

  return { title: "아카이브를 찾을 수 없습니다" };
}

export default async function WebzinePublicDetailPage({ params }: Props) {
  const { id } = await params;
  return <WebzineDetailClient id={id} />;
}
