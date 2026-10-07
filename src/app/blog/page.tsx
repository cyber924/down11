'use client';

import { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Clock,
  Plane,
  Eye,
  Play,
  TrendingUp,
  Trophy,
  Newspaper
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function BlogLandingPage() {
  const db = useFirestore();
  const [selectedTheme, setSelectedTheme] = useState('Entertainment');

  const categories = [
    { label: 'K-ENTER', value: 'Entertainment' },
    { label: 'K-TRAVEL', value: 'Gourmet' },
    { label: 'TIPS', value: 'TIPS' },
    { label: 'VLOG', value: 'VLOG' },
  ];

  const baseQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "packages"), orderBy("createdAt", "desc"), limit(100));
  }, [db]);
  
  const { data: allPosts, loading } = useCollection(baseQuery);

  const filteredData = useMemo(() => {
    if (!allPosts) return [];
    return allPosts.filter((post: any) => {
      if (post.status === 'draft') return false;
      const postTheme = post.theme?.toUpperCase() || "";
      const normalizedTarget = selectedTheme.toUpperCase();
      if (normalizedTarget === 'GOURMET') return ['GOURMET', 'HOTEL', 'TOUR', 'TRAVEL', 'CULTURE', 'LIFE'].includes(postTheme);
      if (normalizedTarget === 'ENTERTAINMENT') return ['ENTERTAINMENT', 'DRAMA', 'MOVIE', 'SHOW'].includes(postTheme);
      return postTheme === normalizedTarget;
    });
  }, [allPosts, selectedTheme]);

  const trendingPosts = useMemo(() => {
    if (!allPosts) return [];
    return [...allPosts].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  }, [allPosts]);

  const heroPost = filteredData[0] as any;

  const getStaticImage = (theme: string): string => {
    const themeUpper = theme?.toUpperCase() || "";
    if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) return PlaceHolderImages.find(img => img.id === 'drama-hero')?.imageUrl || "";
    if (themeUpper === 'VLOG') return PlaceHolderImages.find(img => img.id === 'vlog-hero')?.imageUrl || "";
    if (themeUpper === 'TIPS' || themeUpper === 'POLICY') return PlaceHolderImages.find(img => img.id === 'tips-hero')?.imageUrl || "";
    if (['GOURMET', 'HOTEL', 'TOUR', 'TRAVEL', 'CULTURE', 'LIFE'].includes(themeUpper)) {
       return PlaceHolderImages.find(img => img.id === (themeUpper === 'GOURMET' ? 'gourmet-hero' : 'travel-hero'))?.imageUrl || "";
    }
    return PlaceHolderImages.find(img => img.id === 'travel-hero')?.imageUrl || "";
  };

  const getDisplayImage = (post: any) => {
    if (!post) return "";
    const html = (post.localGuide || "") + (post.accommodationIntro || "") + (post.travelItinerary || "");
    const match = html.match(/<img[^>]*src=["']([^"']*)["']/);
    const src = match ? match[1] : null;
    
    const isUserModified = src?.startsWith('data:') || src?.includes('images.unsplash.com');
    if (isUserModified) return src;
    
    return getStaticImage(post.theme);
  };

  const renderMappedHeroContent = (html: string) => {
    if (!html) return null;
    const parts = html.split(/(<img[^>]*>)/g);
    let imgCounter = 0;
    
    return parts.map((part, index) => {
      if (part.startsWith('<img')) {
        imgCounter++;
        const srcMatch = part.match(/src=["']([^"']*)["']/);
        let src = srcMatch ? srcMatch[1] : null;
        
        const isUserModified = src?.startsWith('data:') || src?.includes('images.unsplash.com');
        const isPlaceholder = !src || src.includes('picsum.photos') || src.includes('placehold.co') || src === '' || src === 'null';

        if (isPlaceholder && !isUserModified) {
          const themeUpper = heroPost?.theme?.toUpperCase() || "";
          const dramaSubs = ['drama-hero', 'drama-sub-1', 'drama-sub-2'];
          const travelSubs = ['travel-hero', 'travel-sub-1', 'travel-sub-2', 'travel-sub-3'];
          const vlogSubs = ['vlog-hero', 'vlog-sub-1', 'vlog-sub-2'];
          const tipsSubs = ['tips-hero', 'lifestyle-hero'];

          if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) {
             const subId = dramaSubs[imgCounter % dramaSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(heroPost.theme) || null;
          } else if (themeUpper === 'VLOG') {
             const subId = vlogSubs[imgCounter % vlogSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(heroPost.theme) || null;
          } else if (themeUpper === 'TIPS' || themeUpper === 'POLICY') {
             const subId = tipsSubs[imgCounter % tipsSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(heroPost.theme) || null;
          } else {
             const subId = travelSubs[imgCounter % travelSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(heroPost.theme) || null;
          }
        }

        if (!src) return null;
        return (
          <div key={index} className="my-8 flex flex-col items-center">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-xl shadow-lg border-2 border-transparent hover:border-accent transition-all bg-slate-100">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="block w-full">
                <img src={src} className="w-full h-auto hover:opacity-90 transition-opacity" alt="Featured Visual" />
              </a>
            </div>
            <div className="mt-4 free-view-link">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored">
                 <Play className="w-3.5 h-3.5 fill-current" /> 드라마 영화 무료보기
              </a>
            </div>
          </div>
        );
      }
      return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Plane className="w-8 h-8 text-primary animate-bounce" />
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">M-BLOG MAGAZINE</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#fcfcfd] min-h-screen text-slate-900 overflow-x-hidden font-body">
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-xl z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/blog" className="flex items-center gap-2 group shrink-0">
             <div className="bg-slate-900 p-1.5 rounded-lg group-hover:bg-primary transition-colors">
                <Plane className="w-4 h-4 text-white" />
             </div>
             <span className="text-xl font-headline font-black tracking-tighter text-slate-900 italic hidden sm:inline">M-BLOG</span>
          </Link>

          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-full shadow-inner">
             <Button asChild variant="ghost" className="rounded-full h-9 px-6 text-[10px] font-black tracking-widest gap-2 hover:bg-white hover:text-primary">
                <Link href="/news"><Trophy className="w-3.5 h-3.5" /> RANKING 20</Link>
             </Button>
             <Button asChild variant="ghost" className="rounded-full h-9 px-6 text-[10px] font-black tracking-widest gap-2 hover:bg-white hover:text-primary">
                <Link href="/news"><Newspaper className="w-3.5 h-3.5" /> NEWS FEED</Link>
             </Button>
          </nav>
          
          <div className="hidden lg:flex items-center gap-6">
            {categories.map((cat) => (
              <button key={cat.label} onClick={() => setSelectedTheme(cat.value)} className={`text-[10px] font-black uppercase tracking-widest ${selectedTheme === cat.value ? 'text-primary underline underline-offset-4' : 'text-slate-400 hover:text-primary'}`}>{cat.label}</button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8"><Search className="w-4 h-4" /></Button>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-900 border border-slate-200">M</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            {heroPost ? (
              <article className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4 text-center mb-8">
                  <Badge className="bg-primary text-white border-none px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">FEATURED {selectedTheme}</Badge>
                  <h1 className="text-2xl md:text-3xl font-headline font-black leading-tight tracking-tighter text-slate-900 uppercase break-keep">
                    {heroPost.title || heroPost.location}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                     <span className="text-primary font-black italic">M-BLOG STUDIO EDITORIAL</span>
                     <span className="opacity-30">|</span>
                     <span>{heroPost.createdAt?.toDate ? heroPost.createdAt.toDate().toLocaleDateString() : 'Today'}</span>
                     <span className="opacity-30">|</span>
                     <div className="flex items-center gap-1 text-accent"><Eye className="w-3.5 h-3.5" /> {heroPost.views || 0} VIEWS</div>
                  </div>
                </div>

                <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl mb-10 group bg-slate-100 border border-slate-100">
                  <Image src={getDisplayImage(heroPost)!} alt={heroPost.location} fill className="object-cover group-hover:scale-105 transition-transform duration-[3s]" priority data-ai-hint="blog header" />
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="prose prose-slate max-w-none text-[15px] leading-[1.9] font-medium text-slate-600 article-content-blog px-2">
                    {renderMappedHeroContent((heroPost.localGuide || "") + (heroPost.accommodationIntro || "") + (heroPost.travelItinerary || ""))}
                  </div>
                </div>
              </article>
            ) : (
              <div className="py-20 text-center uppercase tracking-[0.3em] font-black opacity-10">NO CONTENTS FOUND</div>
            )}
          </div>

          <aside className="hidden lg:block lg:col-span-4">
             <div className="sticky top-28 space-y-8">
                <div className="bg-[#0f172a] text-white rounded-[2.5rem] p-8 shadow-2xl border border-white/5 overflow-hidden relative">
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                         <TrendingUp className="w-6 h-6 text-accent" />
                         <h3 className="text-[15px] font-headline font-black tracking-[0.2em] uppercase italic">실시간 인기 저장소</h3>
                      </div>
                      
                      <div className="space-y-7">
                         {trendingPosts.map((post, idx) => (
                           <Link key={post.id} href={`/blog/${post.id}`} className="group flex items-start gap-4 transition-all">
                              <span className="text-4xl font-headline font-black text-white/10 group-hover:text-accent/40 transition-colors italic leading-none shrink-0 w-10">{idx + 1}</span>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                 <h4 className="text-[13px] font-bold leading-tight text-white group-hover:text-accent transition-colors line-clamp-2 uppercase tracking-tight">
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
             </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
