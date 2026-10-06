
'use client';

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Eye, 
  Trophy, 
  Newspaper, 
  Search, 
  ChevronRight, 
  Clock, 
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Play,
  Youtube
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EventPopup } from '@/components/event-popup';
import { PlaceHolderImages } from "@/lib/placeholder-images";

type ViewType = 'featured' | 'ranking' | 'feed';

export default function NewsPortalClient({ allPosts }: { allPosts: any[] }) {
  const [activeView, setActiveView] = useState<ViewType>('featured');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { label: 'K-ENTER', value: 'Entertainment' },
    { label: 'K-TRAVEL', value: 'Gourmet' },
    { label: 'TIPS', value: 'TIPS' },
    { label: 'VLOG', value: 'VLOG' },
  ];

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return allPosts;
    return allPosts.filter((post: any) => {
      const postTheme = post.theme?.toUpperCase() || "";
      const target = selectedCategory.toUpperCase();
      if (target === 'GOURMET') return ['GOURMET', 'HOTEL', 'TOUR', 'TRAVEL', 'CULTURE', 'LIFE'].includes(postTheme);
      if (target === 'ENTERTAINMENT') return ['ENTERTAINMENT', 'DRAMA', 'MOVIE', 'SHOW'].includes(postTheme);
      return postTheme === target;
    });
  }, [allPosts, selectedCategory]);

  const rankingPosts = useMemo(() => {
    return [...allPosts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 20);
  }, [allPosts]);

  const top10 = useMemo(() => {
    return [...allPosts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);
  }, [allPosts]);

  const latestPost = filteredPosts[0];

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'JUST NOW';
    if (typeof timestamp === 'number') return new Date(timestamp).toLocaleDateString();
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString();
    return 'JUST NOW';
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const getStaticImage = (theme: string) => {
    const themeUpper = theme?.toUpperCase() || "";
    if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) return PlaceHolderImages.find(img => img.id === 'drama-hero')?.imageUrl;
    if (themeUpper === 'GOURMET' || themeUpper === 'HOTEL' || themeUpper === 'FOOD') return PlaceHolderImages.find(img => img.id === 'gourmet-hero')?.imageUrl;
    if (themeUpper === 'VLOG') return PlaceHolderImages.find(img => img.id === 'vlog-hero')?.imageUrl;
    if (themeUpper === 'TIPS' || themeUpper === 'POLICY') return PlaceHolderImages.find(img => img.id === 'tips-hero')?.imageUrl;
    if (['TRAVEL', 'TOUR', 'CULTURE', 'LIFE'].includes(themeUpper)) return PlaceHolderImages.find(img => img.id === 'travel-hero')?.imageUrl;
    return PlaceHolderImages.find(img => img.id === 'news-hero')?.imageUrl;
  };

  const getDisplayImage = (post: any) => {
    if (!post) return "";
    const html = (post.localGuide || "") + (post.accommodationIntro || "") + (post.travelItinerary || "");
    // 더 강력한 이미지 추출 정규표현식 적용
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    const src = match ? match[1] : null;
    
    // 전문가가 수정한 이미지는 무조건 우선 노출
    const isUserModified = src?.startsWith('data:') || src?.includes('images.unsplash.com');
    if (isUserModified) return src;
    
    return getStaticImage(post.theme);
  };

  const renderMappedContent = (html: string, currentPost: any) => {
    if (!html) return null;
    const parts = html.split(/(<img[^>]*>)/g);
    let imgCounter = 0;
    
    return parts.map((part, index) => {
      if (part.startsWith('<img')) {
        imgCounter++;
        const srcMatch = part.match(/src=["']([^"']*)["']/i);
        let src = srcMatch ? srcMatch[1] : null;
        
        const isUserModified = src?.startsWith('data:') || src?.includes('images.unsplash.com');
        const isPlaceholder = !src || src.includes('picsum.photos') || src.includes('placehold.co') || src === '' || src === 'null';

        if (isPlaceholder && !isUserModified) {
          const themeUpper = currentPost?.theme?.toUpperCase() || "";
          const travelSubs = ['travel-hero', 'travel-sub-1', 'travel-sub-2', 'travel-sub-3'];
          const vlogSubs = ['vlog-hero', 'vlog-sub-1', 'vlog-sub-2'];
          const tipsSubs = ['tips-hero', 'lifestyle-hero'];

          if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) {
             src = PlaceHolderImages.find(img => img.id === (['drama-hero', 'drama-sub-1', 'drama-sub-2'][imgCounter % 3]))?.imageUrl || getStaticImage(currentPost.theme);
          } else if (themeUpper === 'VLOG') {
             src = PlaceHolderImages.find(img => img.id === vlogSubs[imgCounter % vlogSubs.length])?.imageUrl || getStaticImage(currentPost.theme);
          } else if (themeUpper === 'TIPS' || themeUpper === 'POLICY') {
             src = PlaceHolderImages.find(img => img.id === tipsSubs[imgCounter % tipsSubs.length])?.imageUrl || getStaticImage(currentPost.theme);
          } else {
             src = PlaceHolderImages.find(img => img.id === travelSubs[imgCounter % travelSubs.length])?.imageUrl || getStaticImage(currentPost.theme);
          }
        }

        if (!src) return null;
        return (
          <div key={index} className="my-10 flex flex-col items-center">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-xl shadow-lg border-2 border-white bg-slate-100">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="block w-full">
                <img src={src} className="w-full h-auto hover:opacity-90 transition-opacity" alt="News Visual" />
              </a>
            </div>
            <div className="mt-4 flex justify-center free-view-link">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="inline-flex items-center gap-1.5 text-[13px] font-black text-slate-400">
                 <Play className="w-3.5 h-3.5 fill-current" /> 드라마 영화 무료보기
              </a>
            </div>
          </div>
        );
      }
      return <div key={index} className="news-feed-content" dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen text-slate-900 font-body relative">
      <EventPopup />

      <header className="bg-white/95 border-b border-slate-100 sticky top-0 z-[100] shadow-sm backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <button onClick={() => { setActiveView('featured'); setSelectedCategory('all'); }} className="flex items-center gap-2 group shrink-0">
             <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4 text-white fill-white" />
             </div>
             <span className="text-xl font-headline font-black tracking-tighter text-primary italic hidden sm:inline">K-NEWS</span>
          </button>
          
          <div className="hidden lg:flex items-center gap-6">
            {categories.map((cat) => (
              <button 
                key={cat.label} 
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setActiveView('feed');
                }}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedCategory === cat.value ? 'text-primary underline underline-offset-4' : 'text-slate-400 hover:text-primary'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
             <button 
               onClick={() => setActiveView('ranking')}
               className={`text-[10px] font-black tracking-widest uppercase px-6 py-2 rounded-full flex items-center gap-2 transition-all ${activeView === 'ranking' ? 'bg-white text-primary shadow-sm border border-slate-200' : 'text-slate-400 hover:text-primary'}`}
             >
               <Trophy className={`w-3.5 h-3.5 ${activeView === 'ranking' ? 'text-accent' : ''}`} /> <span>RANKING 20</span>
             </button>
             <button 
               onClick={() => setActiveView('feed')}
               className={`text-[10px] font-black tracking-widest uppercase px-6 py-2 rounded-full flex items-center gap-2 transition-all ${activeView === 'feed' ? 'bg-white text-primary shadow-sm border border-slate-200' : 'text-slate-400 hover:text-primary'}`}
             >
               <Newspaper className={`w-3.5 h-3.5 ${activeView === 'feed' ? 'text-primary' : ''}`} /> <span>NEWS FEED</span>
             </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="ghost" size="icon" className="text-slate-400 w-8 h-8"><Search className="w-4 h-4" /></Button>
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">N</div>
          </div>
        </div>
      </header>

      <div className="bg-slate-900 text-white overflow-hidden whitespace-nowrap py-2">
         <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
            <Badge className="bg-accent text-slate-950 rounded-none font-black text-[9px] uppercase px-3 py-1 shrink-0">LATEST FLASH</Badge>
            <div className="animate-marquee flex gap-12 text-[10px] font-bold text-white/80">
               <span>K-드라마 '신입사원 강회장' 글로벌 12개국 1위 등극...</span>
               <span>영화 '결혼의 완성' 무삭제 감독판 특별 공개 확정...</span>
               <span>넷플릭스 신작 라인업 독점 분석 리포트 업데이트...</span>
            </div>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 min-h-[70vh]">
        
        {activeView === 'featured' && latestPost && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="lg:col-span-8 space-y-10">
                <article className="max-w-2xl mx-auto">
                   <div className="text-center space-y-4 mb-10">
                      <Badge className="bg-primary/10 text-primary border-none px-4 py-1 text-[9px] font-black tracking-[0.2em] uppercase rounded-full">LATEST ANALYSIS</Badge>
                      <h1 className="text-2xl md:text-3xl font-headline font-black tracking-tighter leading-tight uppercase break-keep text-slate-900">
                         {latestPost.title || latestPost.location}
                      </h1>
                      <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <span className="text-primary font-black italic">K-NEWS PORTAL EDITORIAL</span>
                         <span className="opacity-30">|</span>
                         <span>{formatDate(latestPost.createdAt)}</span>
                         <span className="opacity-30">|</span>
                         <div className="flex items-center gap-1.5 text-accent">
                            <Eye className="w-3.5 h-3.5" /> {latestPost.views || 0} VIEWS
                         </div>
                      </div>
                   </div>

                   <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white group bg-slate-100">
                      <Image 
                         src={getDisplayImage(latestPost)!} 
                         alt={latestPost.title || "Featured"} 
                         fill 
                         className="object-cover group-hover:scale-105 transition-transform duration-[4s]"
                         priority
                         unoptimized={getDisplayImage(latestPost).startsWith('data:')}
                         data-ai-hint="korean news"
                      />
                   </div>

                   {latestPost.youtubeUrl && (
                     <div className="my-12 max-w-2xl mx-auto px-2">
                       <div className="relative aspect-video w-full bg-black shadow-2xl rounded-2xl overflow-hidden border-4 border-slate-100">
                          <iframe src={getYouTubeEmbedUrl(latestPost.youtubeUrl)!} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
                       </div>
                     </div>
                   )}

                   <div className="prose prose-slate max-w-none text-[15px] leading-[2] font-medium text-slate-700 news-article-content px-2">
                      {renderMappedContent(latestPost.localGuide + (latestPost.accommodationIntro || "") + (latestPost.travelItinerary || ""), latestPost)}
                   </div>
                </article>
             </div>

             <aside className="hidden lg:block lg:col-span-4">
                <div className="bg-[#0f172a] text-white rounded-[3rem] p-10 sticky top-28 shadow-2xl border border-white/5 relative overflow-hidden">
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-10">
                         <TrendingUp className="w-6 h-6 text-accent" />
                         <h3 className="text-[16px] font-headline font-black tracking-[0.2em] uppercase italic">실시간 인기 저장소</h3>
                      </div>
                      <div className="space-y-8">
                         {top10.map((post, idx) => (
                           <Link key={post.id} href={`/news/${post.id}`} className="group flex items-start gap-5 transition-all">
                              <span className="text-4xl font-headline font-black text-white/10 group-hover:text-accent/40 transition-colors italic leading-none shrink-0 w-10">{idx + 1}</span>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                 <h4 className="text-[13.5px] font-bold leading-tight group-hover:text-accent transition-colors line-clamp-2 uppercase tracking-tight">
                                    {post.title || post.location}
                                 </h4>
                                 <div className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                    <span className="text-primary">{post.theme}</span>
                                    <span className="opacity-30">•</span>
                                    <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> {post.views || 0} VIEWS</span>
                                 </div>
                              </div>
                           </Link>
                         ))}
                      </div>
                   </div>
                   <div className="absolute -bottom-10 -right-10 opacity-5">
                      <TrendingUp className="w-40 h-40 text-white" />
                   </div>
                </div>
             </aside>
          </div>
        )}

        {activeView === 'ranking' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="flex flex-col items-center text-center space-y-4 mb-10">
                <Trophy className="w-10 h-10 text-accent fill-accent mb-2" />
                <h2 className="text-3xl font-headline font-black tracking-tighter uppercase italic">Real-Time Global TOP 20</h2>
                <p className="text-slate-400 font-bold tracking-[0.3em] text-[10px] uppercase">전문가님이 엄선한 오늘의 가장 뜨거운 마스터피스입니다.</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {rankingPosts.map((post: any, idx: number) => (
                  <Link key={post.id} href={`/news/${post.id}`} className="group relative bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-7xl font-headline font-black text-slate-50 italic opacity-10 group-hover:opacity-30 transition-opacity">
                      {idx + 1}
                    </div>
                    <div className="space-y-3 relative z-10">
                       <div className="relative aspect-video rounded-2xl overflow-hidden mb-2 bg-slate-100 border border-slate-50">
                          <img src={getDisplayImage(post)} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" alt={post.title} />
                          <div className="absolute top-2 left-2">
                             <Badge className="bg-primary/95 text-white border-none text-[8px] font-black rounded-none px-2 py-0.5 shadow-xl">{idx + 1}위 REPORT</Badge>
                          </div>
                       </div>
                       <h3 className="font-headline font-black text-[14px] leading-tight uppercase group-hover:text-primary transition-colors line-clamp-2">
                          {post.title || post.location}
                       </h3>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        )}

        {activeView === 'feed' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
             <div className="flex flex-col gap-10">
                {filteredPosts.map((post: any) => (
                  <article key={post.id} className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-start hover:bg-white p-6 md:p-8 -mx-6 rounded-[2.5rem] transition-all hover:shadow-xl border border-transparent hover:border-slate-100">
                    <div className="md:col-span-4 relative aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all">
                      <Image 
                        src={getDisplayImage(post)!} 
                        alt={post.title || "Feed"} 
                        fill 
                        className="object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        unoptimized={getDisplayImage(post).startsWith('data:')}
                        data-ai-hint="magazine editorial"
                      />
                      <div className="absolute top-3 left-3">
                         <Badge className="bg-primary text-white text-[8px] font-black border-none rounded-none px-2 py-0.5 shadow-2xl">{post.theme}</Badge>
                      </div>
                    </div>
                    
                    <div className="md:col-span-8 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                           <span className="text-primary font-black">EDITORIAL REPORT</span>
                           <span>{formatDate(post.createdAt)}</span>
                           <span className="flex items-center gap-1.5 text-accent ml-auto font-black">
                              <Eye className="w-3 h-3" /> {post.views || 0}
                           </span>
                        </div>
                        <Link href={`/news/${post.id}`}>
                          <h2 className="text-[18px] md:text-[20px] font-headline font-black leading-tight tracking-tight group-hover:text-primary transition-colors uppercase break-keep">
                            {post.title || post.location}
                          </h2>
                        </Link>
                      </div>
                      <p className="text-[13px] leading-[1.7] font-medium text-slate-500 line-clamp-3">
                        {post.localGuide?.replace(/<[^>]*>/g, ' ').slice(0, 180)}...
                      </p>
                      <Button asChild variant="link" className="p-0 h-auto text-[10px] font-black text-slate-900 group-hover:text-primary uppercase gap-2 tracking-tighter">
                        <Link href={`/news/${post.id}`}>Explore Full Story <ArrowRight className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </article>
                ))}
                {filteredPosts.length === 0 && (
                  <div className="py-20 text-center uppercase tracking-widest font-black opacity-20">No matching news found</div>
                )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
