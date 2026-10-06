"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Zap, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  Loader2,
  Globe,
  Instagram,
  Copy,
  Play
} from "lucide-react";
import { generateOneClickWorkationPackage, type GenerateOneClickWorkationPackageOutput } from "@/ai/flows/generate-one-click-workation-package-flow";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function PackagePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateOneClickWorkationPackageOutput & { id?: string } | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    location: "",
    durationDays: 3,
    theme: "",
    language: "ko"
  });

  const handleGenerate = async () => {
    if (!formData.location) return;
    setLoading(true);
    try {
      const output = await generateOneClickWorkationPackage({
        location: formData.location,
        durationDays: Number(formData.durationDays),
        theme: formData.theme || undefined,
        language: formData.language as any
      });

      if (user) {
        const docRef = await addDoc(collection(db, "packages"), {
          ...output,
          location: formData.location,
          durationDays: Number(formData.durationDays),
          theme: formData.theme || "General",
          language: formData.language,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          views: 0,
          status: 'published'
        });
        setResult({ ...output, id: docRef.id });
        toast({ title: "생성 및 저장 완료", description: "글로벌 패키지가 보관함에 저장되었습니다." });
      } else {
        setResult(output);
        toast({ title: "생성 완료", description: "로그인 시 자동 저장됩니다." });
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "생성 실패", description: "AI 서비스 응답 지연입니다." });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "복사 완료", description: "클립보드에 복사되었습니다." });
  };

  const getStaticImage = (theme: string) => {
    const themeUpper = theme?.toUpperCase() || "";
    if (themeUpper.includes('GOURMET') || themeUpper.includes('미식') || themeUpper.includes('FOOD')) return PlaceHolderImages.find(img => img.id === 'gourmet-hero')?.imageUrl;
    return PlaceHolderImages.find(img => img.id === 'travel-hero')?.imageUrl;
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
        
        // [수정 핵심] 전문가 직접 업로드(data:) 혹은 정상적인 고해상도 Unsplash 주소는 필터링 건너뜀
        const isUserModified = src?.startsWith('data:') || src?.includes('images.unsplash.com');
        const isPlaceholder = !src || src.includes('picsum.photos') || src.includes('placehold.co') || src === '' || src === 'null';

        if (isPlaceholder && !isUserModified) {
          const themeContext = (formData.theme || formData.location || "").toUpperCase();
          const isGourmet = themeContext.includes('GOURMET') || themeContext.includes('미식') || themeContext.includes('FOOD') || themeContext.includes('맛집');
          
          const travelSubs = ['travel-hero', 'travel-sub-1', 'travel-sub-2', 'travel-sub-3'];
          const gourmetSubs = ['gourmet-hero', 'travel-sub-3', 'travel-sub-2'];

          if (isGourmet) {
             const subId = gourmetSubs[imgCounter % gourmetSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage('GOURMET');
          } else {
             const subId = travelSubs[imgCounter % travelSubs.length];
             src = PlaceHolderImages.find(img => img.id === subId)?.imageUrl || getStaticImage('TRAVEL');
          }
        }

        if (!src) return null;
        
        return (
          <div key={index} className="my-10 flex flex-col items-center">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-xl border-2 border-transparent hover:border-accent transition-all bg-slate-100 group">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="block w-full">
                <img src={src} className="w-full h-auto hover:opacity-90 transition-opacity" alt="Magazine Visual" />
              </a>
            </div>
            <div className="mt-4 free-view-link">
              <a href="https://m.filetori.com/?site=MKT1" target="_blank" rel="noopener noreferrer nofollow sponsored" className="inline-flex items-center gap-1.5 text-[13px] font-black text-slate-400">
                 <Play className="w-3.5 h-3.5 fill-current" /> 드라마 영화 무료보기
              </a>
            </div>
          </div>
        );
      }
      return <div key={index} className="leading-[2.0] text-slate-700 article-content-blog" dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center justify-center gap-2">
          <Globe className="w-7 h-7 text-accent" />
          K-여행 글로벌 패키지 생성
        </h1>
        <p className="text-muted-foreground font-medium text-[14px]">전 세계인을 위한 다국어 여행 가이드와 SNS 캡션을 한 번에 생성하세요.</p>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="pt-10 px-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <MapPin className="w-3.5 h-3.5" /> 목표 지역
              </Label>
              <Input 
                placeholder="예: 속초 미식여행, 제주" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="h-11 rounded-xl bg-slate-50 border-none text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <Calendar className="w-3.5 h-3.5" /> 기간 (일)
              </Label>
              <Input 
                type="number" 
                min="1" 
                value={formData.durationDays}
                onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value)})}
                className="h-11 rounded-xl bg-slate-50 border-none text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <Globe className="w-3.5 h-3.5" /> 출력 언어
              </Label>
              <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val})}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none text-sm font-medium">
                  <SelectValue placeholder="언어 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어 (Korean)</SelectItem>
                  <SelectItem value="en">English (영어)</SelectItem>
                  <SelectItem value="ja">日本語 (일본어)</SelectItem>
                  <SelectItem value="zh">中文 (중국어)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <Sparkles className="w-3.5 h-3.5" /> 테마
              </Label>
              <Input 
                placeholder="예: 미식, 쇼핑" 
                value={formData.theme}
                onChange={(e) => setFormData({...formData, theme: e.target.value})}
                className="h-11 rounded-xl bg-slate-50 border-none text-sm font-medium"
              />
            </div>
          </div>
          <Button 
            className="w-full h-12 text-sm font-black gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-[0.98]"
            onClick={handleGenerate}
            disabled={loading || !formData.location}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "글로벌 패키지 구성 중..." : "AI 글로벌 여행 패키지 생성하기"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-headline font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              패키지 생성 결과
            </h2>
            <div className="flex gap-2">
              {result.id && (
                <Button variant="outline" size="sm" className="gap-2 rounded-full px-5 h-9 text-[11px] font-black border-slate-200" onClick={() => router.push(`/packages/${result.id}`)}>
                  <ExternalLink className="w-3.5 h-3.5" /> 보관함에서 보기
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="guide" className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-12 bg-slate-100 p-1 rounded-2xl mb-6">
              <TabsTrigger value="guide" className="rounded-xl text-[11px] font-black uppercase">지역 가이드</TabsTrigger>
              <TabsTrigger value="accommodation" className="rounded-xl text-[11px] font-black uppercase">숙소</TabsTrigger>
              <TabsTrigger value="itinerary" className="rounded-xl text-[11px] font-black uppercase">여정</TabsTrigger>
              <TabsTrigger value="sns" className="rounded-xl text-[11px] font-black uppercase text-accent">SNS 캡션</TabsTrigger>
              <TabsTrigger value="newsletter" className="rounded-xl text-[11px] font-black uppercase">뉴스레터</TabsTrigger>
            </TabsList>
            
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <TabsContent value="guide" className="p-10 md:p-14 lg:p-16">
                <article className="prose prose-slate max-w-none text-[16px] leading-[2.2] font-medium article-content-blog">
                  {renderMappedContent(result.localGuide)}
                </article>
              </TabsContent>
              <TabsContent value="accommodation" className="p-10 md:p-14 lg:p-16">
                <article className="prose prose-slate max-w-none text-[16px] leading-[2.2] font-medium article-content-blog">
                  {renderMappedContent(result.accommodationIntro)}
                </article>
              </TabsContent>
              <TabsContent value="itinerary" className="p-10 md:p-14 lg:p-16">
                <article className="prose prose-slate max-w-none text-[16px] leading-[2.2] font-medium article-content-blog">
                  {renderMappedContent(result.travelItinerary)}
                </article>
              </TabsContent>
              <TabsContent value="sns" className="p-10 md:p-14 space-y-6">
                <div className="bg-slate-50 p-8 rounded-[2rem] relative group border border-slate-100 shadow-inner">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(result.snsCaption)}
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                  </Button>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed font-bold text-slate-600">
                    {result.snsCaption}
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button className="rounded-xl bg-accent hover:bg-accent/90 gap-2 font-black text-xs px-10 h-11 shadow-lg" onClick={() => copyToClipboard(result.snsCaption)}>
                    <Copy className="w-4 h-4" /> SNS 캡션 복사
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="newsletter" className="p-10 md:p-14 lg:p-16">
                <article className="prose prose-slate max-w-none text-[16px] leading-[2.2] font-medium">
                  {renderMappedContent(result.newsletterContent)}
                </article>
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      )}
    </div>
  );
}
