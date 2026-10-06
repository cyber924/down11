'use client';

import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, increment, collection, query, orderBy, limit } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Clock, 
  ChevronLeft,
  Zap,
  Eye,
  Play,
  Clapperboard,
  Youtube,
  ArrowRight,
  Bookmark,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function NewsDetailClient({ id, initialData }: { id: string, initialData: any }) {
  const db = useFirestore();
  const docRef = doc(db, "packages", id);
  const { data: realTimePost } = useDoc(docRef);
  const post = realTimePost || initialData;

  // 사이드바 인기 리스트용 데이터
  const trendingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "packages"), orderBy("views", "desc"), limit(10));
  }, [db]);
  const { data: trendingPosts } = useCollection(trendingQuery);

  useEffect(() => {
    if (docRef) {
      updateDoc(docRef, {
        views: increment(1)
      }).catch(err => console.error("View increment failed", err));
    }
  }, [id]);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    if (typeof timestamp === 'number') return new Date(timestamp).toLocaleDateString();
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString();
    return 'Just now';
  };

  const getStaticImage = (theme: string) => {
    const themeUpper = theme?.toUpperCase() || "";
    if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) return PlaceHolderImages.find(img => img.id === 'drama-hero')?.imageUrl;
    if (themeUpper === 'VLOG') return PlaceHolderImages.find(img => img.id === 'vlog-hero')?.imageUrl;
    if (themeUpper === 'TIPS' || themeUpper === 'POLICY') return PlaceHolderImages.find(img => img.id === 'tips-hero')?.imageUrl;
    if (['GOURMET', 'HOTEL', 'TOUR', 'TRAVEL', 'CULTURE', 'LIFE'].includes(themeUpper)) {
       return PlaceHolderImages.find(img => img.id === (themeUpper === 'GOURMET' ? 'gourmet-hero' : 'travel-hero'))?.imageUrl;
    }
    return PlaceHolderImages.find(img => img.id === 'news-hero')?.imageUrl;
  };

  const renderMappedContent = (html: string) => {
    if (!html) return null;
    const parts = html.split(/(<img[^>]*>)/g);
    let imgCounter = 0;
    
    return parts.map((part, index) => {
      if (part.startsWith('<img')) {
        imgCounter++;
        const srcMatch = part.match(/src=["']([^"']*)["']/);
        const srcFromHtml = srcMatch && srcMatch[1] ? srcMatch[1] : null;
        let finalSrc = srcFromHtml;
        
        // [수정 핵심] 전문가 직접 업로드(data:) 혹은 정상적인 고해상도 Unsplash 주소, 혹은 /api/image 동적 주소는 필터링 건너뜀
        const isUserModified = finalSrc?.startsWith('data:') || finalSrc?.includes('images.unsplash.com') || finalSrc?.startsWith('/api/image');
        const isPlaceholder = !finalSrc || finalSrc.includes('picsum.photos') || finalSrc.includes('placehold.co') || finalSrc === '' || finalSrc === 'null';

        if (isPlaceholder && !isUserModified) {
          const themeUpper = post.theme?.toUpperCase() || "";
          const dramaSubs = ['drama-hero', 'drama-sub-1', 'drama-sub-2'];
          const travelSubs = ['travel-hero', 'travel-sub-1', 'travel-sub-2', 'travel-sub-3'];
          const vlogSubs = ['vlog-hero', 'vlog-sub-1', 'vlog-sub-2'];
          const tipsSubs = ['tips-hero', 'lifestyle-hero'];

          if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) {
             const subId = dramaSubs[imgCounter % dramaSubs.length];
             finalSrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post.theme);
          } else if (themeUpper === 'VLOG') {
             const subId = vlogSubs[imgCounter % vlogSubs.length];
             finalSrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post.theme);
          } else if (themeUpper === 'TIPS' || themeUpper === 'POLICY') {
             const subId = tipsSubs[imgCounter % tipsSubs.length];
             finalSrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post.theme);
          } else {
             const subId = travelSubs[imgCounter % travelSubs.length];
             finalSrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post.theme);
          }
        }

        if (!finalSrc) return null;
        return (
          <div key={index} className="my-8">
            <div className="relative w-full overflow-hidden rounded-lg shadow-xl border-4 border-white bg-slate-100">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="block w-full">
                <img src={finalSrc} className="w-full h-auto hover:brightness-95 transition-all" alt="News Visual" />
              </a>
            </div>
            <div className="mt-4 flex justify-center free-view-link">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="inline-flex items-center gap-1.5">
                 <Play className="w-3.5 h-3.5 fill-current" /> 드라마 영화 무료보기
              </a>
            </div>
          </div>
        );
      }
      return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(post.youtubeUrl);
  const themeUpper = post.theme?.toUpperCase() || "";
  const displayTitle = post.title || post.location;

  return (
    <div className="bg-[#f8fafc] min-h-screen font-body text-slate-900 pb-32">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/news" className="flex items-center gap-2 group">
             <div className="bg-primary p-1.5 rounded-md">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
             </div>
             <span className="text-base font-headline font-black tracking-tight text-primary">K-NEWS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="text-[9px] font-black uppercase h-8 px-4">
              <Link href="/news"><ChevronLeft className="w-3 h-3" /> BACK</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-12 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content */}
          <div className="lg:col-span-8">
            <article className="max-w-2xl mx-auto">
              <div className="space-y-6 mb-10 border-l-4 border-primary pl-8 py-2">
                <Badge className="bg-slate-100 text-slate-500 border-none px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                  {post.theme} SPECIAL REPORT
                </Badge>
                <h1 className="text-2xl md:text-3xl font-headline font-black leading-tight tracking-tighter text-slate-900 uppercase">
                  {displayTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                   <span>K-NEWS EDITORIAL</span>
                   <span>{formatDate(post.createdAt)}</span>
                   <span className="text-accent">{post.views || 0} VIEWS</span>
                </div>
              </div>

              <div className="relative aspect-video w-full rounded-none overflow-hidden shadow-2xl mb-12 border border-slate-200 bg-slate-100">
                <Image src={getStaticImage(post.theme)!} alt={displayTitle} fill className="object-cover" priority data-ai-hint="news coverage" />
              </div>

              {youtubeEmbedUrl && (
                <div className="mb-12 group">
                   <div className="relative aspect-video w-full bg-black shadow-2xl border-4 border-white">
                      <iframe src={youtubeEmbedUrl} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
                   </div>
                </div>
              )}

              <div className="prose prose-slate max-w-none text-[15px] leading-[1.9] font-medium text-slate-700 news-article-content">
                {renderMappedContent(post.localGuide + (post.accommodationIntro || "") + (post.travelItinerary || ""))}
              </div>

              {(post.externalLink || themeUpper.includes('ENTERTAINMENT') || themeUpper.includes('DRAMA') || themeUpper.includes('MOVIE')) && (
                <div className="mt-16 pt-10 border-t border-slate-200 flex flex-col items-center gap-6">
                   <a 
                     href={post.externalLink || "https://m.filetori.com/?site=MKT1"} 
                     target="_blank" 
                     rel="noopener noreferrer nofollow sponsored"
                     className="inline-flex items-center gap-3 bg-[#E50914] text-white px-12 py-5 rounded-none font-black text-[18px] hover:bg-red-700 transition-all shadow-2xl no-underline uppercase tracking-tighter"
                   >
                      <Clapperboard className="w-6 h-6 fill-white" />
                      <span>영상 다시보기</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                   </a>
                </div>
              )}
            </article>
          </div>

          {/* Sidebar: TOP 10 Ranking */}
          <aside className="hidden lg:block lg:col-span-4">
            <Card className="bg-[#0f172a] text-white border-none rounded-[2rem] p-8 sticky top-24 shadow-2xl">
               <div className="flex items-center gap-2 mb-8">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <h3 className="text-[14px] font-headline font-black tracking-widest uppercase">실시간 인기 저장소</h3>
               </div>
               <div className="space-y-6">
                  {trendingPosts?.slice(0, 10).map((p: any, idx: number) => (
                    <Link key={p.id} href={`/news/${p.id}`} className="group flex items-start gap-4 transition-all">
                       <span className="text-3xl font-headline font-black text-white/10 group-hover:text-accent/40 transition-colors italic leading-none shrink-0 w-8">{idx + 1}</span>
                       <div className="space-y-1">
                          <h4 className="text-[12.5px] font-bold leading-tight group-hover:text-accent transition-colors line-clamp-2 uppercase">
                             {p.title || p.location}
                          </h4>
                          <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                             <span className="text-primary">{p.theme}</span>
                             <span className="opacity-30">•</span>
                             <span className="flex items-center gap-1"><Eye className="w-2 h-2" /> {p.views || 0} VIEWS</span>
                          </div>
                       </div>
                    </Link>
                  ))}
               </div>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
