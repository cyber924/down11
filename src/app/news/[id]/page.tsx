
import { Metadata } from 'next';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import NewsDetailClient from './news-detail-client';
import { notFound } from 'next/navigation';

import { replaceBase64Images } from '@/lib/news-utils';

/**
 * @fileOverview 뉴스 상세 페이지 (실시간 데이터 반영 버전)
 * - ISR 캐싱을 제거하고 접속 시점에 항상 최신 문서를 읽어옵니다.
 */

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

async function getArticle(id: string) {
  const { firestore } = initializeFirebase();
  try {
    const docSnap = await getDoc(doc(firestore, "packages", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      const localGuide = replaceBase64Images(id, "localGuide", data.localGuide || "");
      const accommodationIntro = replaceBase64Images(id, "accommodationIntro", data.accommodationIntro || "");
      const travelItinerary = replaceBase64Images(id, "travelItinerary", data.travelItinerary || "");

      return { 
        id: docSnap.id, 
        ...data,
        localGuide,
        accommodationIntro,
        travelItinerary,
        createdAt: data.createdAt?.toMillis?.() || null,
        updatedAt: data.updatedAt?.toMillis?.() || null,
        publishedAt: data.publishedAt?.toMillis?.() || null,
      };
    }
  } catch (e) {
    console.error("Fetch error", e);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  const host = ((await headers()).get('host') || '').toLowerCase();
  
  if (!article) {
    return { title: "K-NEWS | 최신 기사 안내" };
  }

  const title = (article as any).title || (article as any).location;
  const snippet = (article as any).localGuide?.replace(/<[^>]*>/g, ' ').slice(0, 160) || "";
  const canonical = host.includes('down1.co.kr') ? `https://down1.co.kr/news/${id}` : `https://${host}/news/${id}`;

  return {
    title: title,
    description: snippet,
    alternates: { canonical: canonical },
    openGraph: {
      title: title,
      description: snippet,
      images: [`https://picsum.photos/seed/${id}/1200/630`],
      type: 'article',
      url: canonical
    }
  };
}

export default async function NewsPublicDetailPage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const title = (article as any).title || (article as any).location;
  const snippet = (article as any).localGuide?.replace(/<[^>]*>/g, ' ').slice(0, 160) || "";
  const publishDate = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
  const modifiedDate = article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "image": [
      `https://picsum.photos/seed/${id}/1200/630`
    ],
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "author": {
      "@type": "Organization",
      "name": "K-NEWS",
      "url": "https://down1.co.kr"
    },
    "publisher": {
      "@type": "Organization",
      "name": "K-NEWS",
      "logo": {
        "@type": "ImageObject",
        "url": "https://down1.co.kr/favicon.ico"
      }
    },
    "description": snippet
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <NewsDetailClient id={id} initialData={article} />
    </>
  );
}
