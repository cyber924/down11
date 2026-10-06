
'use client';

import { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Clock,
  Zap,
  Heart,
  Instagram,
  Twitter,
  LayoutGrid,
  Eye,
  Clapperboard,
  Play,
  Youtube,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function WebzineLandingPage() {
  const db = useFirestore();
  const [selectedTheme, setSelectedTheme] = useState('Entertainment');

  const categories = [
    { label: 'HOT ENTER', value: 'Entertainment' },
    { label: 'GOURMET', value: 'Gourmet' },
    { label: 'K-STYLE', value: 'Life' },
    { label: 'GLOBAL', value: 'Tour' },
  ];

  const baseQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "packages"), orderBy("createdAt", "desc"), limit(100));
  }, [db]);
  
  const { data: allFetchedPosts, loading } = useCollection(baseQuery);

  const filteredData = useMemo(() => {
    if (!allFetchedPosts) return [];
    const normalizedTarget = selectedTheme.toUpperCase();
    return allFetchedPosts.filter((post: any) => {
      const postTheme = post.theme?.toUpperCase() || "";
      if (normalizedTarget === 'GOURMET') return ['GOURMET', 'HOTEL', 'TOUR'].includes(postTheme);
      if (normalizedTarget === 'ENTERTAINMENT') return ['ENTERTAINMENT', 'DRAMA', 'MOVIE', 'SHOW'].includes(postTheme);
      return postTheme === normalizedTarget;
    });
  }, [allFetchedPosts, selectedTheme]);

  const heroPost = filteredData[0] as any;
  const categoryArchive = filteredData.slice(1, 11);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const getStaticImage = (theme: string) => {
    const themeUpper = theme?.toUpperCase() || "";
    if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) return PlaceHolderImages.find(img => img.id === 'drama-hero')?.imageUrl;
    if (themeUpper === 'GOURMET' || themeUpper === 'HOTEL') return PlaceHolderImages.find(img => img.id === 'gourmet-hero')?.imageUrl;
    if (themeUpper === 'VLOG') return PlaceHolderImages.find(img => img.id === 'vlog-hero')?.imageUrl;
    if (themeUpper === 'TIPS') return PlaceHolderImages.find(img => img.id === 'tips-hero')?.imageUrl;
    return PlaceHolderImages.find(img => img.id === 'travel-hero')?.imageUrl;
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
        
        if (src && (src.includes('picsum.photos') || src === '' || src === 'null')) {
          const themeUpper = heroPost?.theme?.toUpperCase() || "";
          const dramaSubs = ['drama-hero', 'drama-sub-1', 'drama-sub-2'];
          const travelSubs = ['travel-hero', 'travel-sub-1'];
          const vlogSubs = ['vlog-hero', 'vlog-sub-1', 'vlog-sub-2'];

          if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) {
             const subId = dramaSubs[imgCounter % dramaSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(heroPost.theme);
          } else if (themeUpper === 'VLOG') {
             const subId = vlogSubs[imgCounter % vlogSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(heroPost.theme);
          } else {
             const subId = travelSubs[imgCounter % travelSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(heroPost.theme);
          }
        }

        if (!src) return null;
        
        return (
          <div key={index} className="my-8 flex flex-col items-center">
            <div className="relative w-full overflow-hidden rounded-sm shadow-2xl border border-white/5 bg-slate-900">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="block w-full">
                <img src={src} className="w-full h-auto hover:opacity-90 transition-opacity" alt="Hero Webzine Visual" />
              </a>
            </div>
            <div className="mt-4 free-view-link">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="inline-flex items-center gap-1.5 text-[13px] font-black text-white/30 hover:text-accent transition-colors">
                 <Play className="w-3 h-3 fill-current" /> 드라마 영화 무료보기
              </a>
            </div>
          </div>
        );
      }
      return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Zap className="w-6 h-6 text-accent animate-bounce" />
        <p className="text-[9px] font-bold text-accent uppercase tracking-[0.4em]">SYNCING...</p>
      </div>
    </div>
  );

  const heroYoutubeUrl = heroPost ? getYouTubeEmbedUrl(heroPost.youtubeUrl) : null;
  const heroThemeUpper = heroPost?.theme?.toUpperCase() || "";

  return (
    <div className="bg-slate-950 min-h-screen text-white overflow-x-hidden font-body">
      <header className="border-b border-white/5 sticky top-0 bg-slate-950/80 backdrop-blur-2xl z-[100]">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/webzine" className="flex items-center gap-2 group">
             <div className="bg-accent p-1 rounded-sm">
                <Zap className="w-3.5 h-3.5 text-slate-950" />
             </div>
             <span className="text-base font-headline font-black tracking-tighter italic text-accent">M-WEBZINE</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {categories.map((cat) => (
              <button 
                key={cat.label} 
                onClick={() => setSelectedTheme(cat.value)}
                className={`text-[9px] font-black transition-all uppercase tracking-widest hover:text-accent ${selectedTheme === cat.value ? 'text-accent' : 'text-white/20'}`}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:text-accent w-7 h-7"><Search className="w-3.5 h-3.5" /></Button>
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-slate-950 text-[8px] font-black">W</div>
          </div>
        </div>
      </header>

      <main>
        {heroPost ? (
          <article className="relative border-b border-white/5">
            <div className="max-w-xl mx-auto pt-8 pb-10 px-6">
              <div className="space-y-3 mb-6">
                <Badge className="bg-accent text-slate-950 border-none px-2 py-0 text-[7px] font-black uppercase tracking-widest rounded-none">
                  {selectedTheme} SPECIAL
                </Badge>
                <h1 className="text-xl md:text-2xl font-headline font-black leading-tight tracking-tighter uppercase break-keep">
                  {heroPost.location}
                </h1>
                <div className="flex items-center gap-4 text-[8px] font-bold text-white/40 uppercase tracking-widest">
                   <div className="flex items-center gap-1.5 text-accent">
                      <Eye className="w-2.5 h-2.5" />
                      <span>{heroPost.views || 0} VIEWS</span>
                   </div>
                </div>
              </div>

              <div className="relative aspect-[16/7] w-full rounded-sm overflow-hidden mb-8 group shadow-2xl bg-slate-900">
                <Image src={getStaticImage(heroPost.theme)!} alt={heroPost.location} fill className="object-cover group-hover:scale-105 transition-transform duration-[2s]" priority />
              </div>

              <div className="max-w-xl mx-auto">
                <div className="prose prose-invert max-w-none text-sm leading-[1.7] font-medium text-white/60 font-body article-content-webzine">
                   {renderMappedHeroContent((heroPost.localGuide || "") + (heroPost.accommodationIntro || "") + (heroPost.travelItinerary || ""))}
                </div>
              </div>
            </div>
          </article>
        ) : (
          <div className="py-20 text-center">
             <h2 className="text-xl font-black opacity-10 uppercase tracking-tighter">NO CONTENTS FOUND</h2>
          </div>
        )}
      </main>
    </div>
  );
}
