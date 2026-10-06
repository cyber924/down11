"use client"

import { useFirestore, useDoc, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp, collection, query, where } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Clock, 
  Sparkles, 
  Download,
  Instagram,
  Copy,
  Loader2,
  Wand2,
  FileText,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Eye,
  Link as LinkIcon,
  Play,
  Clapperboard,
  Youtube,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { processIntelligentEdit } from "@/ai/flows/intelligent-editor-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function PackageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const docRef = id ? doc(db, "packages", id as string) : null;
  const { data: pkg, loading, error } = useDoc(docRef);

  const [isRetouching, setIsRetouching] = useState(false);
  const [retouchInstruction, setRetouchInstruction] = useState("");
  const [isRetouchDialogOpen, setIsRetouchDialogOpen] = useState(false);

  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [targetImageUrl, setTargetImageUrl] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const assetsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "visualAssets"), 
      where("createdBy", "==", user.uid)
    );
  }, [db, user]);

  const { data: rawAssets } = useCollection(assetsQuery);

  const userAssets = useMemo(() => {
    if (!rawAssets) return [];
    return [...rawAssets].sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [rawAssets]);

  const getStaticImage = (theme: string) => {
    const themeUpper = theme?.toUpperCase() || "";
    if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) return PlaceHolderImages.find(img => img.id === 'drama-hero')?.imageUrl;
    if (themeUpper === 'VLOG') return PlaceHolderImages.find(img => img.id === 'vlog-hero')?.imageUrl;
    if (themeUpper === 'TIPS' || themeUpper === 'POLICY') return PlaceHolderImages.find(img => img.id === 'tips-hero')?.imageUrl;
    if (themeUpper === 'GOURMET') return PlaceHolderImages.find(img => img.id === 'gourmet-hero')?.imageUrl;
    return PlaceHolderImages.find(img => img.id === 'travel-hero')?.imageUrl;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "복사 완료" });
  };

  const downloadHTML = () => {
    if (!pkg) return;
    const content = `<!DOCTYPE html><html lang="${pkg.language}"><head><meta charset="UTF-8"><title>${pkg.location}</title><style>body{font-family:sans-serif;line-height:1.8;color:#334155;max-width:800px;margin:40px auto;padding:20px;}.text-accent{color:#0ea5e9;font-weight:700;} img { max-width: 100%; height: auto; border-radius: 1rem; margin: 2rem 0; }</style></head><body><h1>${pkg.location}</h1>${pkg.localGuide}</body></html>`;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pkg.location}.html`;
    a.click();
  };

  const handleDelete = async () => {
    if (!docRef) return;
    try {
      await deleteDoc(docRef);
      toast({ title: "삭제 완료" });
      router.push("/packages");
    } catch (error) {
      toast({ variant: "destructive", title: "삭제 실패" });
    }
  };

  const handleRetouch = async () => {
    if (!retouchInstruction || !pkg || !docRef) return;
    setIsRetouching(true);
    try {
      const result = await processIntelligentEdit({
        currentContent: pkg.localGuide + (pkg.accommodationIntro || "") + (pkg.travelItinerary || ""),
        instruction: retouchInstruction
      });
      await updateDoc(docRef, {
        localGuide: result.updatedContent,
        accommodationIntro: "",
        travelItinerary: "",
        updatedAt: serverTimestamp()
      });
      toast({ title: "리터칭 완료", description: result.agentComment });
      setIsRetouchDialogOpen(false);
      setRetouchInstruction("");
    } catch (error) {
      toast({ variant: "destructive", title: "리터칭 실패" });
    } finally {
      setIsRetouching(false);
    }
  };

  const replaceImage = async (newImageUrl: string) => {
    if (!pkg || !docRef || !targetImageUrl) return;
    const cleanTarget = targetImageUrl.replace(/&amp;/g, '&');
    let updated = false;
    const fieldsToUpdate: any = { updatedAt: serverTimestamp() };
    const contentFields = ['localGuide', 'accommodationIntro', 'travelItinerary'];
    contentFields.forEach(field => {
      let currentHtml = pkg[field] || "";
      if (currentHtml.includes(targetImageUrl) || currentHtml.includes(cleanTarget)) {
        const finalTarget = currentHtml.includes(targetImageUrl) ? targetImageUrl : cleanTarget;
        fieldsToUpdate[field] = currentHtml.split(finalTarget).join(newImageUrl);
        updated = true;
      }
    });

    if (updated) {
      await updateDoc(docRef, fieldsToUpdate);
      setIsImagePickerOpen(false);
      setTargetImageUrl(null);
      toast({ title: "이미지 교체 완료" });
    }
  };

  const renderMappedContent = (html: string) => {
    if (!html) return null;
    const parts = html.split(/(<img[^>]*>)/g);
    let imgCounter = 0;
    
    return parts.map((part, index) => {
      if (part.startsWith('<img')) {
        imgCounter++;
        const srcMatch = part.match(/src=["']([^"']*)["']/);
        const originalSrc = srcMatch ? srcMatch[1] : null;
        let displaySrc = originalSrc;
        
        // [수정 핵심] 전문가가 직접 수정한 이미지(data: 혹은 images.unsplash.com)는 필터 무조건 건너뜀
        const isUserModified = displaySrc?.startsWith('data:') || displaySrc?.includes('images.unsplash.com');
        const isPlaceholder = !displaySrc || displaySrc.includes('picsum.photos') || displaySrc.includes('placehold.co') || displaySrc === '' || displaySrc === 'null';

        if (isPlaceholder && !isUserModified) {
          const themeUpper = pkg.theme?.toUpperCase() || "";
          const dramaSubs = ['drama-hero', 'drama-sub-1', 'drama-sub-2'];
          const travelSubs = ['travel-hero', 'travel-sub-1', 'travel-sub-2', 'travel-sub-3'];
          const vlogSubs = ['vlog-hero', 'vlog-sub-1', 'vlog-sub-2'];
          
          if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) {
             const subId = dramaSubs[imgCounter % dramaSubs.length];
             displaySrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(pkg.theme);
          } else if (themeUpper === 'VLOG') {
             const subId = vlogSubs[imgCounter % vlogSubs.length];
             displaySrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(pkg.theme);
          } else {
             const subId = travelSubs[imgCounter % travelSubs.length];
             displaySrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage(pkg.theme);
          }
        }

        if (!displaySrc) return null;
        
        return (
          <div key={index} className="my-10 flex flex-col items-center">
            <div className="relative w-full image-edit-container overflow-hidden rounded-2xl shadow-lg border-2 border-transparent hover:border-accent transition-all group">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="block w-full">
                <img src={displaySrc} className="w-full h-auto hover:opacity-90 transition-opacity" alt="Content Visual" />
              </a>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                <Button 
                  className="bg-accent text-white text-[10px] font-bold px-4 py-2 rounded-xl h-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    if (originalSrc) {
                      setTargetImageUrl(originalSrc);
                      setIsImagePickerOpen(true);
                    }
                  }}
                >
                  이미지 교체
                </Button>
              </div>
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

  if (loading) return <div className="flex items-center justify-center h-[60vh] animate-pulse">Syncing...</div>;
  if (error || !pkg) return <div className="text-center p-20">Data not found.</div>;

  const coverImage = getStaticImage(pkg.theme);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(pkg.youtubeUrl);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/packages")} className="gap-2 rounded-full px-4 h-9 text-[11px] font-bold">
          <ChevronLeft className="w-4 h-4" /> BACK TO ARCHIVE
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => setIsRetouchDialogOpen(true)} variant="outline" size="sm" className="gap-2 border-accent text-accent rounded-full px-4 h-9 text-[11px] font-bold">
             <Sparkles className="w-3.5 h-3.5" /> AI RETOUCHING
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 rounded-full px-4 h-9 text-[11px] font-bold" onClick={downloadHTML}>
            <Download className="w-4 h-4" /> EXPORT
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive rounded-full px-4 h-9 text-[11px] font-bold" onClick={() => setIsDeleteDialogOpen(true)}>
             <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-[360px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100">
        <Image src={coverImage!} alt={pkg.location} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-12">
          <Badge className="bg-accent text-white w-fit mb-4 rounded-none px-3 font-black text-[9px] uppercase tracking-widest">{pkg.theme}</Badge>
          <h1 className="text-4xl font-headline font-bold text-white mb-2 uppercase tracking-tighter">{pkg.location}</h1>
          <div className="flex items-center gap-4 text-white/50 text-[11px] font-bold uppercase tracking-widest">
            <Clock className="w-4 h-4 text-accent" /> {pkg.createdAt?.toDate ? pkg.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
            <span className="opacity-20">|</span>
            <Eye className="w-4 h-4 text-accent" /> {pkg.views || 0} VIEWS
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b py-5 px-10 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
               <FileText className="w-4 h-4" /> MASTERPIECE REPORT
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 md:p-14 lg:p-16">
            {youtubeEmbedUrl && (
              <div className="mb-12 space-y-4">
                 <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-100">
                    <iframe src={youtubeEmbedUrl} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
                 </div>
              </div>
            )}
            <div className="prose prose-slate max-w-none text-[15px] font-medium text-slate-600 editorial-content">
              {renderMappedContent(pkg.localGuide + (pkg.accommodationIntro || "") + (pkg.travelItinerary || ""))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white shadow-2xl border-none p-10 rounded-[3rem]">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-headline font-bold flex items-center gap-2"><Instagram className="w-5 h-5 text-accent" /> SNS 캡션</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {pkg.snsCaption && (
              <div className="bg-white/5 p-8 rounded-3xl text-[13px] leading-relaxed text-white/80 font-medium italic relative group border border-white/5">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-white hover:bg-white/10" onClick={() => copyToClipboard(pkg.snsCaption)}><Copy className="w-4 h-4" /></Button>
                {pkg.snsCaption}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isRetouchDialogOpen} onOpenChange={setIsRetouchDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl">
          <DialogHeader><DialogTitle>AI 지능형 리터칭</DialogTitle></DialogHeader>
          <div className="py-6 space-y-4">
            <Label className="text-[11px] font-bold uppercase text-muted-foreground">AI 지시사항</Label>
            <Textarea 
              placeholder="리터칭 지시를 입력하세요..." 
              value={retouchInstruction}
              onChange={(e) => setRetouchInstruction(e.target.value)}
              className="min-h-[120px] rounded-2xl"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRetouchDialogOpen(false)} className="rounded-full">취소</Button>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 gap-2 font-bold" onClick={handleRetouch} disabled={isRetouching || !retouchInstruction}>
              {isRetouching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} 리터칭 시작
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImagePickerOpen} onOpenChange={setIsImagePickerOpen}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
          <DialogHeader className="p-8 bg-slate-900 text-white flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-headline font-bold">이미지 선택</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsImagePickerOpen(false)} className="text-white hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></Button>
          </DialogHeader>
          <ScrollArea className="h-[500px] p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {userAssets.map((asset: any) => (
                <div key={asset.id} className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-4 border-transparent hover:border-primary transition-all" onClick={() => replaceImage(asset.imageUrl)}>
                  <Image src={asset.imageUrl} alt={asset.topic} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> 정말 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              이 기사는 보관함에서 영구적으로 삭제되며 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">삭제 확정</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
