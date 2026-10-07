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
  Facebook,
  Plane,
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

export default function BlogDetailClient({ id, initialData }: { id: string, initialData: any }) {
  const db = useFirestore();
  const docRef = doc(db, "packages", id);
  const { data: realTimePost } = useDoc(docRef);
  const post = realTimePost || initialData;

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

  const renderMappedContent = (html: string) => {
    if (!html) return null;
    const parts = html.split(/(<img[^>]*>)/g);
    let imgCounter = 0;
    
    return parts.map((part, index) => {
      if (part.startsWith('<img')) {
        imgCounter++;
        const srcMatch = part.match(/src=["']([^"']*)["']/);
        let src = srcMatch ? srcMatch[1] : null;
        
        // [수정 핵심] 전문가님이 직접 업로드(data:)했거나 이미 언스플래시 실제 주소라면 필터링하지 않음
        const isUserModified = src?.startsWith('data:') || src?.includes('images.unsplash.com');
        const isPlaceholder = !src || src.includes('picsum.photos') || src.includes('placehold.co') || src === '' || src === 'null';

        if (isPlaceholder && !isUserModified) {
          const themeUpper = post.theme?.toUpperCase() || "";
          const dramaSubs = ['drama-hero', 'drama-sub-1', 'drama-sub-2'];
          const travelSubs = ['travel-hero', 'travel-sub-1', 'travel-sub-2', 'travel-sub-3'];
          const vlogSubs = ['vlog-hero', 'vlog-sub-1', 'vlog-sub-2'];
          const tipsSubs = ['tips-hero', 'lifestyle-hero'];

          if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) {
             const subId = dramaSubs[imgCounter % dramaSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post.theme) || null;
          } else if (themeUpper === 'VLOG') {
             const subId = vlogSubs[imgCounter % vlogSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post.theme) || null;
          } else if (themeUpper === 'TIPS' || themeUpper === 'POLICY') {
             const subId = tipsSubs[imgCounter % tipsSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post.theme) || null;
          } else {
             const subId = travelSubs[imgCounter % travelSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(post.theme) || null;
          }
        }

        if (!src) return null;
        
        return (
          <div key={index} className="my-10 flex flex-col items-center">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-xl border-2 border-transparent hover:border-accent transition-all bg-slate-100">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="block w-full">
                <img src={src} className="w-full h-auto hover:opacity-90 transition-opacity" alt="Magazine Visual" />
              </a>
            </div>
            <div className="mt-4 free-view-link">
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

  const coverImage = getStaticImage(post.theme);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(post.youtubeUrl);
  const themeUpper = post.theme?.toUpperCase() || "";
  const displayTitle = post.title || post.location;

  return (
    <div className="bg-white min-h-screen font-body text-slate-900 pb-32">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 group">
             <div className="bg-primary p-1 rounded-lg">
                <Plane className="w-3.5 h-3.5 text-white" />
             </div>
             <span className="text-base font-headline font-bold tracking-tighter text-primary">M-BLOG</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8"><Share2 className="w-4 h-4" /></Button>
            <Button asChild variant="outline" className="rounded-full font-bold text-[10px] h-8 px-5 border-slate-200">
              <Link href="/blog">Back Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <article className="max-w-2xl mx-auto mt-10 px-6">
        <div className="space-y-6 text-center mb-10">
          <Badge className="bg-accent/10 text-accent border-none px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest">
            {post.theme}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-headline font-bold leading-tight tracking-tighter text-slate-900 uppercase">
            {displayTitle}
          </h1>
          <div className="flex items-center justify-center gap-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
             <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-primary text-[9px] font-black">M</div>
                <span>M-BLOG STUDIO</span>
             </div>
             <span className="opacity-20">|</span>
             <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
             </div>
             <span className="opacity-20">|</span>
             <div className="flex items-center gap-1.5 text-accent">
                <Eye className="w-3 h-3" />
                <span>{post.views || 0} VIEWS</span>
             </div>
          </div>
        </div>

        <div className="relative aspect-[16/9] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl mb-12 bg-slate-100">
          <Image src={coverImage!} alt={displayTitle} fill className="object-cover" priority />
        </div>

        {youtubeEmbedUrl && (
          <div className="mb-12 max-w-2xl mx-auto">
             <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-50 bg-black">
                <iframe src={youtubeEmbedUrl} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
             </div>
             <p className="text-center mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
               <Youtube className="w-3 h-3 text-rose-500" /> Featured Video Content
             </p>
          </div>
        )}

        <div className="prose prose-slate max-w-none text-[15px] leading-[1.8] font-medium text-slate-700 article-content-blog">
          {renderMappedContent(post.localGuide + (post.accommodationIntro || "") + (post.travelItinerary || ""))}
        </div>

        {(post.externalLink || themeUpper.includes('ENTERTAINMENT') || themeUpper.includes('DRAMA') || themeUpper.includes('MOVIE')) && (
          <div className="mt-16 pt-10 border-t flex flex-col items-center gap-6">
             <a 
               href={post.externalLink || "https://m.filetori.com/?site=MKT1"} 
               target="_blank" 
               rel="noopener noreferrer nofollow sponsored"
               className="inline-flex items-center gap-3 bg-[#E50914] text-white px-12 py-5 rounded-2xl font-bold text-[18px] hover:bg-red-700 transition-all shadow-2xl hover:scale-105 active:scale-95 no-underline group"
             >
                <Clapperboard className="w-6 h-6 fill-white group-hover:rotate-12 transition-transform" />
                <span>영상 다시보기</span>
                <ArrowRight className="w-5 h-5 ml-2" />
             </a>
          </div>
        )}

        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="rounded-full gap-2 font-bold px-6 h-9">
                <Heart className="w-4 h-4 text-rose-500" /> Like
              </Button>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="rounded-full w-8 h-8 text-slate-400 hover:text-primary"><Instagram className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="rounded-full w-8 h-8 text-slate-400 hover:text-primary"><Twitter className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="rounded-full w-8 h-8 text-slate-400 hover:text-primary"><Facebook className="w-4 h-4" /></Button>
              </div>
           </div>
           <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Shared from M-BLOG STUDIO
           </div>
        </div>
      </article>

      <footer className="max-w-4xl mx-auto px-6 mt-20 text-center">
         <div className="bg-slate-50 rounded-[2rem] p-10 space-y-4">
            <h4 className="text-xl font-headline font-bold">당신만의 K-콘텐츠를 만드세요</h4>
            <p className="text-slate-500 font-medium text-[13px] max-w-md mx-auto">전 세계 독자들을 사로잡을 명품 여행 콘텐츠를 M-BLOG STUDIO에서 생성할 수 있습니다.</p>
            <Button asChild size="sm" className="rounded-full bg-primary font-bold px-8 h-10 shadow-lg">
               <Link href="/">Get Started</Link>
            </Button>
         </div>
      </footer>
    </div>
  );
}
