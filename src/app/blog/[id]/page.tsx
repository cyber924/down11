
import { Metadata } from 'next';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import BlogDetailClient from './blog-detail-client';
import { notFound } from 'next/navigation';

/**
 * @fileOverview 블로그 상세 페이지 서버 컴포넌트
 * 서버 사이드 페칭을 통해 구글 로봇에게 선명한 본문 데이터를 제공합니다.
 */

type Props = {
  params: Promise<{ id: string }>;
};

async function getPost(id: string) {
  const { firestore } = initializeFirebase();
  try {
    const docSnap = await getDoc(doc(firestore, "packages", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
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
  const post = await getPost(id);
  const host = ((await headers()).get('host') || '').toLowerCase();
  
  if (!post) {
    return { title: "M-BLOG | 포스트 안내" };
  }

  const title = (post as any).title || (post as any).location;
  const snippet = (post as any).localGuide?.replace(/<[^>]*>/g, ' ').slice(0, 160) || "";
  const canonical = host.includes('allmovie.shop') ? `https://allmovie.shop/blog/${id}` : `https://${host}/blog/${id}`;

  return {
    title: title,
    description: snippet,
    alternates: { canonical: canonical },
    openGraph: {
      title: title,
      description: snippet,
      images: [`https://picsum.photos/seed/${id}/1200/630`],
      type: 'article',
    }
  };
}

export default async function BlogPublicDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <BlogDetailClient id={id} initialData={post} />;
}
