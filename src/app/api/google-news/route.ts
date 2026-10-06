import { NextRequest, NextResponse } from 'next/server';
import { fetchGoogleNewsArticles } from '@/lib/google-news';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '드라마 결말 OR 복선 OR 시청률 OR 방영';
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const articles = await fetchGoogleNewsArticles(query, Math.min(limit, 30));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      query,
      count: articles.length,
      articles,
    });
  } catch (error: any) {
    console.error('API Google News Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Google News' },
      { status: 500 }
    );
  }
}
