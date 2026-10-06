
"use client"

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Factory, 
  Loader2, 
  Layers, 
  CheckCircle2, 
  Eye,
  Sparkles,
  Lightbulb,
  Send,
  Trash2,
  Search,
  Play,
  X,
  Library,
  Settings2,
  MousePointer2
} from "lucide-react";
import { bulkGenerateEnterContent, type BulkEnterOutput } from "@/ai/flows/bulk-entertainment-factory-flow";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function FactoryPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const [formData, setFormData] = useState({
    category: "drama" as "drama" | "movie" | "show" | "vlog" | "tips",
    language: "ko",
    facts: ["", "", ""],
    mainTopic: ""
  });

  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [targetImageUrl, setTargetImageUrl] = useState<string | null>(null);

  const rawQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "packages"),
      where("createdBy", "==", user.uid)
    );
  }, [db, user]);

  const { data: allUserPackages, loading: draftLoading } = useCollection(rawQuery);

  const drafts = useMemo(() => {
    if (!allUserPackages) return [];
    return allUserPackages
      .filter((p: any) => p.status === 'draft' || !p.status)
      .sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
  }, [allUserPackages]);

  const assetsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "visualAssets"), where("createdBy", "==", user.uid));
  }, [db, user]);

  const { data: userAssets } = useCollection(assetsQuery);

  const handleFactChange = (index: number, value: string) => {
    const newFacts = [...formData.facts];
    newFacts[index] = value;
    setFormData({ ...formData, facts: newFacts });
  };

  const [newsLoading, setNewsLoading] = useState(false);
  const handleAutoFillFromGoogleNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch('/api/google-news?q=드라마 결말 OR 복선 OR 시청률&limit=5');
      const data = await res.json();
      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        const top3 = data.articles.slice(0, 3).map((a: any) => `[${a.source}] ${a.cleanTitle}: ${a.snippet}`);
        setFormData((prev) => ({ ...prev, facts: top3 }));
        toast({ title: "구글 뉴스 팩트 3개 로드 완료", description: "실시간 언론 보도 기사 팩트가 자동으로 채워졌습니다." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "가져오기 실패", description: "구글 뉴스를 불러오지 못했습니다." });
    } finally {
      setNewsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (['drama', 'movie', 'show'].includes(formData.category) && formData.facts.every(f => !f)) {
      toast({ variant: "destructive", title: "입력 부족", description: "최소 하나 이상의 팩트를 입력해주세요." });
      return;
    }
    if (['vlog', 'tips'].includes(formData.category) && !formData.mainTopic) {
      toast({ variant: "destructive", title: "주제 누락", description: "메인 주제를 입력해주세요." });
      return;
    }

    setLoading(true);
    setProgress(10);
    try {
      const output = await bulkGenerateEnterContent({
        category: formData.category,
        language: formData.language as any,
        facts: formData.facts.filter(f => f.trim() !== ""),
        mainTopic: formData.mainTopic
      });
      
      setProgress(60);
      
      if (user && output.length > 0) {
        for (const item of output) {
          await addDoc(collection(db, "packages"), {
            title: item.title,
            description: item.description,
            localGuide: item.fullContent,
            snsCaption: item.snsCaption,
            theme: formData.category.toUpperCase(),
            language: formData.language,
            status: "draft",
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            views: 0
          });
        }
        setProgress(100);
        toast({ title: "대량 생성 완료", description: `${output.length}개의 마스터피스가 병렬 엔진을 통해 예비 보관함에 저장되었습니다.` });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "생성 실패", description: "AI 병렬 엔진 응답 지연입니다. 다시 시도해주세요." });
    } finally {
      setLoading(false);
      setProgress(0);
      setFormData({ ...formData, facts: ["", "", ""], mainTopic: "" });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateDoc(doc(db, "packages", id), {
        status: "published",
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast({ title: "최종 발행 완료", description: "실시간으로 배포되었습니다." });
    } catch (error) {
      toast({ variant: "destructive", title: "발행 실패" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "packages", id));
      toast({ title: "삭제 완료" });
    } catch (error) {
      toast({ variant: "destructive", title: "삭제 실패" });
    }
  };

  const replaceImage = async (newImageUrl: string) => {
    if (!viewingItem || !targetImageUrl) return;
    const cleanTarget = targetImageUrl.replace(/&amp;/g, '&');
    const currentHtml = viewingItem.localGuide;
    if (currentHtml.includes(targetImageUrl) || currentHtml.includes(cleanTarget)) {
      const finalTarget = currentHtml.includes(targetImageUrl) ? targetImageUrl : cleanTarget;
      const updatedContent = currentHtml.split(finalTarget).join(newImageUrl);
      await updateDoc(doc(db, "packages", viewingItem.id), {
        localGuide: updatedContent,
        updatedAt: serverTimestamp()
      });
      setViewingItem({...viewingItem, localGuide: updatedContent});
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
        
        if (displaySrc && (displaySrc.includes('picsum.photos') || displaySrc === '' || displaySrc === 'null')) {
          const themeUpper = viewingItem?.theme?.toUpperCase() || "";
          const dramaSubs = ['drama-hero', 'drama-sub-1', 'drama-sub-2'];
          const travelSubs = ['travel-hero', 'travel-sub-1'];
          const vlogSubs = ['vlog-hero', 'vlog-sub-1', 'vlog-sub-2'];

          if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) {
             const subId = dramaSubs[imgCounter % dramaSubs.length];
             displaySrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || PlaceHolderImages[0].imageUrl;
          } else if (themeUpper === 'VLOG') {
             const subId = vlogSubs[imgCounter % vlogSubs.length];
             displaySrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || PlaceHolderImages[0].imageUrl;
          } else {
             const subId = travelSubs[imgCounter % travelSubs.length];
             displaySrc = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || PlaceHolderImages[0].imageUrl;
          }
        }

        if (!displaySrc) return null;

        return (
          <div key={index} className="my-10 flex flex-col items-center">
            <div className="relative w-full image-edit-container overflow-hidden rounded-2xl shadow-lg border-2 border-transparent hover:border-accent transition-all group cursor-pointer"
                 onClick={() => {
                   if (originalSrc) {
                     setTargetImageUrl(originalSrc); 
                     setIsImagePickerOpen(true);
                   }
                 }}>
              <img src={displaySrc} className="w-full h-auto hover:opacity-90 transition-opacity" alt="Draft Visual" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 text-slate-900 font-bold text-xs shadow-xl">
                    <MousePointer2 className="w-4 h-4 text-accent" /> 이 이미지 교체하기
                 </div>
              </div>
            </div>
          </div>
        );
      }
      return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <Factory className="w-10 h-10 text-primary" />
            엔터테인먼트 팩토리 2.0
          </h1>
          <p className="text-muted-foreground font-medium text-lg">AI 병렬 엔진으로 대량의 K-콘텐츠를 타임아웃 없이 생산합니다.</p>
        </div>
        <div className="flex gap-3">
           <Badge variant="outline" className="px-4 py-2 border-primary/20 bg-primary/5 text-primary font-bold gap-2">
              <Settings2 className="w-4 h-4" /> 병렬 엔진 가동 중
           </Badge>
        </div>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="bg-muted/40 p-1 rounded-2xl mb-8">
          <TabsTrigger value="generator" className="rounded-xl font-bold px-12 h-12 text-sm">콘텐츠 생성 엔진</TabsTrigger>
          <TabsTrigger value="storage" className="rounded-xl font-bold px-12 h-12 text-sm gap-2">
            <Layers className="w-4 h-4" /> 예비 보관함 
            {drafts.length > 0 && <Badge className="ml-1 bg-accent text-white border-none h-5 px-2">{drafts.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-none shadow-2xl rounded-[2.5rem] bg-white h-fit sticky top-24">
              <CardHeader className="bg-slate-50 border-b py-6 px-8 rounded-t-[2.5rem]">
                <CardTitle className="text-sm font-headline font-bold text-slate-500 uppercase tracking-widest">병렬 생성 옵션</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">카테고리 선택</Label>
                  <Select value={formData.category} onValueChange={(val: any) => setFormData({...formData, category: val})}>
                    <SelectTrigger className="h-12 rounded-xl text-sm font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drama">K-드라마 (Fact-based)</SelectItem>
                      <SelectItem value="movie">K-무비 (Fact-based)</SelectItem>
                      <SelectItem value="show">K-예능 (Fact-based)</SelectItem>
                      <SelectItem value="vlog">일상로그 (AI-Expand)</SelectItem>
                      <SelectItem value="tips">정보 & 꿀팁 (AI-Expand)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">출력 언어</Label>
                  <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val})}>
                    <SelectTrigger className="h-12 rounded-xl text-sm font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어 (Korean)</SelectItem>
                      <SelectItem value="en">English (영어)</SelectItem>
                      <SelectItem value="ja">日本語 (일본어)</SelectItem>
                      <SelectItem value="zh">中文 (중국어)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full h-14 bg-primary hover:bg-primary/90 font-bold rounded-2xl gap-3 shadow-xl shadow-primary/20 text-base" 
                  onClick={handleGenerate} 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  3개 마스터피스 동시 생성
                </Button>
                {loading && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-[11px] font-bold text-primary animate-pulse">
                      <span>3-3-3 전략으로 병렬 작업 중...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              {['drama', 'movie', 'show'].includes(formData.category) ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-xl"><CheckCircle2 className="w-5 h-5 text-primary" /></div>
                      <h3 className="font-headline font-bold text-xl">팩트 기반 정밀 입력 (최대 3개)</h3>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoFillFromGoogleNews}
                      disabled={newsLoading}
                      className="text-xs h-8 rounded-lg gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      {newsLoading ? "뉴스 팩트 수집 중..." : "구글 뉴스 팩트 3개 자동 불러오기"}
                    </Button>
                  </div>
                  {formData.facts.map((fact, i) => (
                    <Card key={i} className="rounded-2xl border-none shadow-md hover:shadow-xl transition-all group overflow-hidden bg-white">
                      <CardContent className="p-0 flex items-center">
                        <div className="w-16 h-16 bg-slate-50 flex items-center justify-center text-lg font-black text-slate-300 group-hover:bg-primary group-hover:text-white transition-colors border-r">{i + 1}</div>
                        <Input 
                          placeholder={`기사 내용이나 핵심 팩트를 입력하세요`} 
                          value={fact}
                          onChange={(e) => handleFactChange(i, e.target.value)}
                          className="flex-1 border-none focus-visible:ring-0 text-[15px] font-medium h-16 px-6"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden animate-in zoom-in-95 duration-700">
                   <div className="bg-accent/10 p-12 border-b border-accent/5">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="bg-accent p-3 rounded-2xl text-white shadow-lg"><Lightbulb className="w-8 h-8" /></div>
                         <h3 className="text-2xl font-headline font-bold">주제 지능형 확장 시스템</h3>
                      </div>
                      <p className="text-slate-600 font-medium text-lg leading-relaxed">메인 주제 하나만 입력하세요. AI가 이를 <span className="text-accent font-black">3개의 매혹적인 소주제</span>로 분리하여 독창적인 매거진 아티클 세트를 구성합니다.</p>
                   </div>
                   <CardContent className="p-12 space-y-6">
                      <Label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">메인 주제 (The Seed)</Label>
                      <Input 
                        placeholder="예: 서울의 숨겨진 밤풍경, 겨울철 보습 꿀팁..." 
                        value={formData.mainTopic}
                        onChange={(e) => setFormData({...formData, mainTopic: e.target.value})}
                        className="h-16 rounded-2xl text-xl font-bold border-2 border-slate-100 focus-visible:border-accent px-8"
                      />
                   </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="animate-in fade-in duration-500">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-headline font-bold">검수 및 예비 보관함</CardTitle>
                <CardDescription className="text-white/40 font-medium text-[13px] mt-1">총 {drafts.length}개의 마스터피스가 발행 대기 중입니다.</CardDescription>
              </div>
              <Badge className="bg-accent text-slate-950 font-black px-5 py-2 rounded-full text-[11px] tracking-widest shadow-lg">PRE-RELEASE ZONE</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 border-b">
                  <TableRow>
                    <TableHead className="w-[450px] pl-10 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">콘텐츠 메타데이터</TableHead>
                    <TableHead className="text-center text-[11px] font-black uppercase text-slate-400 tracking-widest">카테고리</TableHead>
                    <TableHead className="text-center text-[11px] font-black uppercase text-slate-400 tracking-widest">생성일</TableHead>
                    <TableHead className="text-right pr-10 text-[11px] font-black uppercase text-slate-400 tracking-widest">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draftLoading ? (
                    <TableRow><TableCell colSpan={4} className="h-80 text-center animate-pulse">Synchronizing...</TableCell></TableRow>
                  ) : drafts.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="h-80 text-center flex flex-col items-center justify-center gap-6">
                      <div className="bg-slate-50 p-6 rounded-full"><Search className="w-16 h-16 text-slate-200" /></div>
                      <p className="font-bold text-slate-300 uppercase tracking-widest">발행 대기 중인 콘텐츠가 없습니다.</p>
                    </TableCell></TableRow>
                  ) : drafts.map((draft: any) => (
                    <TableRow key={draft.id} className="hover:bg-slate-50/50 group transition-colors border-b last:border-0">
                      <TableCell className="pl-10 py-8">
                        <div className="flex flex-col gap-2">
                          <span className="font-bold text-[16px] text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{draft.title || draft.location}</span>
                          <span className="text-[13px] text-slate-400 font-medium line-clamp-2 leading-relaxed">{draft.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-primary/5 text-primary border-none font-bold text-[11px] px-4 py-1.5 rounded-full uppercase tracking-tight">{draft.theme}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-[12px] font-bold text-slate-400">
                        {draft.createdAt?.toDate ? draft.createdAt.toDate().toLocaleDateString() : 'Today'}
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex justify-end gap-3">
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-white hover:shadow-md" onClick={() => setViewingItem(draft)}><Eye className="w-5 h-5 text-slate-400" /></Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/5" onClick={() => handleDelete(draft.id)}><Trash2 className="w-4.5 h-4.5" /></Button>
                          <Button 
                            className="bg-accent hover:bg-accent/90 text-slate-950 font-black text-[11px] h-10 px-6 rounded-xl shadow-lg shadow-accent/10 ml-2 uppercase tracking-tighter"
                            onClick={() => handlePublish(draft.id)}
                          >
                            <Send className="w-3.5 h-3.5 mr-2" /> 최종 발행
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewingItem} onOpenChange={() => { if(!isImagePickerOpen) setViewingItem(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
          {viewingItem && (
            <div className="flex flex-col h-full max-h-[90vh]">
               <div className="shrink-0 p-10 bg-slate-900 text-white flex justify-between items-center shadow-xl z-20">
                  <div className="space-y-1">
                    <Badge className="bg-accent text-slate-950 font-black text-[10px] uppercase tracking-widest px-3 mb-1">{viewingItem.theme} PREVIEW</Badge>
                    <DialogTitle className="text-2xl font-headline font-bold tracking-tight">{viewingItem.title || viewingItem.location}</DialogTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setViewingItem(null)} className="text-white hover:bg-white/10 rounded-full w-12 h-12">
                    <X className="w-8 h-8" />
                  </Button>
               </div>
               
               <ScrollArea className="flex-1 overflow-y-auto">
                  <div className="p-12 space-y-12">
                    <div className="prose prose-slate max-w-none text-slate-700 leading-[2.2] font-medium editorial-preview-container text-[16px]">
                      {renderMappedContent(viewingItem.localGuide)}
                    </div>
                  </div>
               </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isImagePickerOpen} onOpenChange={setIsImagePickerOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] rounded-[3rem] border-none shadow-2xl overflow-hidden p-0 bg-white">
          <div className="flex flex-col h-full max-h-[80vh]">
            <DialogHeader className="shrink-0 p-10 bg-slate-900 text-white flex flex-row items-center justify-between shadow-xl z-20">
              <DialogTitle className="text-2xl font-headline font-bold">이미지 선택</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsImagePickerOpen(false)} className="text-white hover:bg-white/10 rounded-full w-10 h-10"><X className="w-6 h-6" /></Button>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-y-auto p-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {userAssets?.map((asset: any) => (
                    <div 
                      key={asset.id} 
                      className="group relative aspect-video rounded-[1.5rem] overflow-hidden cursor-pointer border-4 border-transparent hover:border-primary transition-all"
                      onClick={() => replaceImage(asset.imageUrl)}
                    >
                      <Image src={asset.imageUrl} alt={asset.topic} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
