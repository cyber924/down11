
'use client';

import { useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Clock, 
  Instagram, 
  Twitter, 
  Zap,
  ChevronLeft,
  Heart,
  Eye,
  Play,
  Clapperboard,
  Youtube,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function WebzineDetailClient({ id }: { id: string }) {
  const db = useFirestore();
  const docRef = doc(db, "packages", id);
  const { data: post, loading, error } = useDoc(docRef);

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

  const getStaticImage = (theme: string) => {
    const themeUpper = theme?.toUpperCase() || "";
    if (['DRAMA', 'MOVIE', 'SHOW'].includes(themeUpper)) return PlaceHolderImages.find(img => img.id === 'drama-hero')?.imageUrl;
    if (themeUpper === 'GOURMET') return PlaceHolderImages.find(img => img.id === 'gourmet-hero')?.imageUrl;
    if (themeUpper === 'VLOG') return PlaceHolderImages.find(img => img.id === 'vlog-hero')?.imageUrl;
    if (themeUpper === 'TIPS') return PlaceHolderImages.find(img => img.id === 'tips-hero')?.imageUrl;
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
        let src = srcMatch ? srcMatch[1] : null;
        
        if (src && (src.includes('picsum.photos') || src === '' || src === 'null')) {
          const themeUpper = post?.theme?.toUpperCase() || "";
          const dramaSubs = ['drama-hero', 'drama-sub-1', 'drama-sub-2'];
          const travelSubs = ['travel-hero', 'travel-sub-1'];
          const vlogSubs = ['vlog-hero', 'vlog-sub-1', 'vlog-sub-2'];

          if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) {
             const subId = dramaSubs[imgCounter % dramaSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post?.theme || "");
          } else if (themeUpper === 'VLOG') {
             const subId = vlogSubs[imgCounter % vlogSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post?.theme || "");
          } else {
             const subId = travelSubs[imgCounter % travelSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post?.theme || "");
          }
        }

        if (!src) return null;
        
        return (
          <div key={index} className="my-10 flex flex-col items-center">
            <div className="relative w-full overflow-hidden rounded-sm shadow-2xl border border-white/5 bg-slate-900">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="block w-full">
                <img src={src} className="w-full h-auto hover:opacity-90 transition-opacity" alt="Webzine Visual" />
              </a>
            </div>
            <div className="mt-4 free-view-link">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="inline-flex items-center gap-1.5">
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
        <Zap className="w-5 h-5 text-accent" />
        <p className="text-[8px] font-bold text-accent uppercase tracking-widest">DECODING...</p>
      </div>
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-950 text-white">
      <h1 className="text-xl font-headline font-black tracking-tighter uppercase">NOT FOUND</h1>
      <Button asChild className="bg-accent text-slate-950 font-black rounded-none px-6 h-10 text-[9px]">
        <Link href="/webzine">BACK TO ARCHIVE</Link>
      </Button>
    </div>
  );

  const youtubeEmbedUrl = getYouTubeEmbedUrl(post.youtubeUrl);
  const themeUpper = post.theme?.toUpperCase() || "";
  const displayTitle = post.title || post.location;

  return (
    <div className="bg-slate-950 min-h-screen text-white font-body pb-12">
      <header className="border-b border-white/5 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-50">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/webzine" className="flex items-center gap-2">
             <div className="bg-accent p-1 rounded-sm"><Zap className="w-3 h-3 text-slate-950" /></div>
             <span className="text-base font-headline font-black italic text-accent">M-WEBZINE</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="text-[8px] font-black uppercase tracking-widest hover:text-accent h-7 px-3">
              <Link href="/webzine" className="flex items-center gap-1.5"><ChevronLeft className="w-2.5 h-2.5" /> BACK</Link>
            </Button>
            <Button size="icon" variant="ghost" className="text-white/40 hover:text-accent w-7 h-7"><Share2 className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </header>

      <article className="max-w-xl mx-auto mt-10 px-6">
        <div className="space-y-4 text-left mb-8">
          <Badge className="bg-accent text-slate-950 border-none px-2 py-0 text-[7px] font-black uppercase tracking-[0.2em] rounded-none">
            {post.theme} ARCHIVE
          </Badge>
          <h1 className="text-2xl font-headline font-black leading-tight tracking-tighter uppercase">
            {displayTitle}
          </h1>
          <div className="flex items-center gap-4 text-white/30 text-[8px] font-black uppercase tracking-widest">
             <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-none bg-accent flex items-center justify-center text-slate-950 font-black">W</div>
                <span>M-WEBZINE STUDIO</span>
             </div>
             <div className="flex items-center gap-1.5">
                <Clock className="w-2.5 h-2.5" />
                <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
             </div>
             <div className="flex items-center gap-1.5 text-accent">
                <Eye className="w-2.5 h-2.5" />
                <span>{post.views || 0} VIEWS</span>
             </div>
          </div>
        </div>

        <div className="relative aspect-[16/8] w-full rounded-sm overflow-hidden shadow-2xl mb-8">
          <Image src={getStaticImage(post.theme)!} alt={displayTitle} fill className="object-cover" priority />
        </div>

        {youtubeEmbedUrl && (
          <div className="mb-10 group">
             <div className="relative aspect-video w-full rounded-sm overflow-hidden shadow-2xl border border-white/5">
                <iframe src={youtubeEmbedUrl} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
             </div>
          </div>
        )}

        <div className="prose prose-invert max-w-none text-sm leading-[1.8] font-medium text-white/70 article-content-webzine">
          {renderMappedContent(post.localGuide + (post.accommodationIntro || "") + (post.travelItinerary || ""))}
        </div>

        {(post.externalLink || themeUpper.includes('ENTERTAINMENT') || themeUpper.includes('DRAMA') || themeUpper.includes('MOVIE')) && (
          <div className="mt-16 pt-10 border-t border-white/5 flex flex-col items-center gap-6">
             <a 
               href={post.externalLink || "https://m.filetori.com/?site=MKT1"} 
               target="_blank" 
               rel="noopener noreferrer nofollow sponsored"
               className="inline-flex items-center gap-3 bg-[#E50914] text-white px-10 py-5 rounded-sm font-black text-[16px] hover:bg-red-700 transition-all shadow-2xl hover:scale-105 active:scale-95 no-underline uppercase tracking-tighter group"
             >
                <Clapperboard className="w-5 h-5 fill-white group-hover:rotate-12 transition-transform" />
                <span>영상 다시보기</span>
                <ArrowRight className="w-4 h-4 ml-2" />
             </a>
          </div>
        )}
      </article>

      <footer className="bg-slate-950 py-10 px-6 border-t border-white/5 text-center">
         <div className="max-w-xl mx-auto space-y-3">
            <Link href="/webzine" className="flex items-center justify-center gap-2">
               <div className="bg-accent p-1 rounded-sm">
                  <Zap className="w-3 h-3 text-slate-950" />
               </div>
               <span className="text-base font-headline font-black tracking-tighter italic text-accent">M-WEBZINE</span>
            </Link>
         </div>
      </footer>
    </div>
  );
}
