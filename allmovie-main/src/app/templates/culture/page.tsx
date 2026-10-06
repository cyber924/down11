
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Palette, 
  Sparkles, 
  Zap, 
  Loader2, 
  ChevronLeft,
  Globe,
  Camera
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { recommendCultureDetails } from "@/ai/flows/recommend-culture-details-flow";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function CultureTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    photoZone: "",
    booking: "",
    language: "ko"
  });

  const handleRecommend = async () => {
    if (!formData.location) {
      toast({ variant: "destructive", title: "지역 입력 필요", description: "먼저 추천을 받을 지역(예: 서울 성수)을 입력해주세요." });
      return;
    }
    setRecommendLoading(true);
    try {
      const data = await recommendCultureDetails({
        location: formData.location,
        language: formData.language as any
      });
      setFormData({
        ...formData,
        ...data
      });
      toast({ title: "AI 문화체험 추천 완료", description: `${formData.location}의 핫한 문화 체험 정보를 가져왔습니다.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "추천 실패", description: "AI가 문화 정보를 찾지 못했습니다." });
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.title || !formData.location) {
      toast({ variant: "destructive", title: "필수 정보 누락", description: "제목과 위치는 필수입니다." });
      return;
    }
    setLoading(true);
    try {
      if (user) {
        const fallbackImg = PlaceHolderImages.find(img => img.id === 'travel-sub-1')?.imageUrl;
        await addDoc(collection(db, "packages"), {
          location: formData.title,
          theme: "Culture",
          durationDays: 0,
          language: formData.language,
          localGuide: `<h3>${formData.title} 체험 가이드</h3><p>${formData.description}</p><img src="${fallbackImg}" alt="${formData.title}" class="rounded-2xl my-8 shadow-lg ai-generated-img" style="width: 100%;" data-ai-hint="korean culture" />`,
          accommodationIntro: `<h4>포토존 & 하이라이트</h4><p>${formData.photoZone}</p>`,
          travelItinerary: `<h4>예약 및 관람 팁</h4><p>${formData.booking}</p>`,
          snsCaption: `#${formData.title} #K컬처 #인생샷 #서울팝업 #전시회추천`,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        toast({ title: "K-문화 콘텐츠 생성 완료" });
        router.push("/packages");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-4 rounded-full text-[11px] font-bold">
        <ChevronLeft className="w-4 h-4" /> 템플릿 목록
      </Button>
      <div className="space-y-2">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
          <Palette className="w-8 h-8 text-purple-500" />
          K-문화 & 체험 템플릿
        </h1>
        <p className="text-muted-foreground text-sm font-medium">전시회, 팝업 스토어, 로컬 클래스 등 핫한 K-컬처 정보를 구조화합니다.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-xl">
            <CardHeader className="bg-muted/30 border-b py-6 px-8 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-headline font-bold">체험 데이터 수집</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white font-bold text-[10px] gap-2 h-8"
                onClick={handleRecommend}
                disabled={recommendLoading}
              >
                {recommendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI 추천 데이터 자동 채우기
              </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">이름/제목</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-10 rounded-xl" placeholder="예: 성수동 00 팝업스토어" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">위치</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="h-10 rounded-xl" placeholder="예: 서울 성수" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">상세 설명</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[80px] rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> 포토존 & 하이라이트</Label>
                <Input value={formData.photoZone} onChange={(e) => setFormData({...formData, photoZone: e.target.value})} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">예약 및 티켓 정보</Label>
                <Input value={formData.booking} onChange={(e) => setFormData({...formData, booking: e.target.value})} className="h-10 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card className="rounded-[2rem] bg-slate-900 text-white p-8">
            <div className="space-y-6">
              <Label className="text-[10px] font-bold text-accent uppercase tracking-widest">출력 언어</Label>
              <Select value={formData.language} onValueChange={(val: any) => setFormData({...formData, language: val})}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full h-12 bg-primary font-bold rounded-2xl gap-2 shadow-lg" onClick={handleGenerate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                K-컬처 콘텐츠 생성
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
