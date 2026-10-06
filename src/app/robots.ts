import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get('host') || '').toLowerCase();
  
  let sitemapUrl = 'https://down1.co.kr/sitemap.xml';
  if (host.includes('allmovie.shop')) {
    sitemapUrl = 'https://allmovie.shop/sitemap.xml';
  } else if (host.includes('moviefree.store')) {
    sitemapUrl = 'https://moviefree.store/sitemap.xml';
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/editor/',
        '/packages/',
        '/package/',
        '/factory/',
        '/visuals/',
        '/templates/',
        '/wordpress/'
      ],
    },
    sitemap: sitemapUrl,
  };
}
