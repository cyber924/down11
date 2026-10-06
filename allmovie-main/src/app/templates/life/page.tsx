
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  HeartPulse, 
  Zap, 
  Loader2, 
  ChevronLeft,
  Globe,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { recommendLifeDetails } from "@/ai/flows/recommend-life-details-flow";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LifeTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    region: "",
    essentials: "",
    transport: "",
    emergency: "",
    tips: "",
    language: "ko"
  });

  const handleRecommend = async () => {
    if (!formData.region) {
      toast({ variant: "destructive", title: "지역 입력 필요", description: "먼저 추천을 받을 지역(예: 서울 강남)을 입력해주세요." });
      return;
    }
    setRecommendLoading(true);
    try {
      const data = await recommendLifeDetails({
        location: formData.region,
        language: formData.language as any
      });
      setFormData({
        ...formData,
        ...data
      });
      toast({ title: "AI 생활정보 추천 완료", description: `${formData.region}의 실제 생활 정보를 가져왔습니다.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "추천 실패", description: "AI가 생활 정보를 찾지 못했습니다." });
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.title || !formData.region) {
      toast({ variant: "destructive", title: "필수 정보 누락", description: "제목과 지역을 입력해주세요." });
      return;
    }
    setLoading(true);
    try {
      if (user) {
        const fallbackImg = PlaceHolderImages.find(img => img.id === 'lifestyle-hero')?.imageUrl;
        await addDoc(collection(db, "packages"), {
          location: formData.title,
          theme: "Life",
          durationDays: 0,
          language: formData.language,
          localGuide: `<h3>${formData.region} 필수 생활 가이드</h3><p>${formData.essentials}</p><img src="${fallbackImg}" class="rounded-2xl my-8 shadow-lg ai-generated-img" style="width: 100%;" data-ai-hint="korea life" />`,
          accommodationIntro: `<h4>교통 및 이동 팁</h4><p>${formData.transport}</p>`,
          travelItinerary: `<h4>비상 상황 대처 & 꿀팁</h4><p>${formData.emergency}</p><p>${formData.tips}</p>`,
          snsCaption: `#${formData.region} #생활꿀팁 #K여행 #한국생활`,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        toast({ title: "생활 정보 생성 완료", description: "나의 보관함에 저장되었습니다." });
        router.push("/packages");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "오류 발생" });
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
          <HeartPulse className="w-8 h-8 text-rose-500" />
          생활 정보 & 꿀팁 템플릿
        </h1>
        <p className="text-muted-foreground text-sm font-medium">한국 로컬 생활에 꼭 필요한 실용 정보를 구조화하여 안내합니다.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-xl">
            <CardHeader className="bg-muted/30 border-b py-6 px-8 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-headline font-bold">생활 데이터 수집</CardTitle>
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
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">가이드 제목</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-10 rounded-xl" placeholder="예: 부산 영도 분리수거 완전 정복" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">대상 지역</Label>
                  <Input value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="h-10 rounded-xl" placeholder="예: 부산 영도" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">필수 생활 수칙 (분리수거 등)</Label>
                <Textarea value={formData.essentials} onChange={(e) => setFormData({...formData, essentials: e.target.value})} className="min-h-[80px] rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">교통편 및 이동 팁</Label>
                <Textarea value={formData.transport} onChange={(e) => setFormData({...formData, transport: e.target.value})} className="min-h-[80px] rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">비상 연락 및 안전 정보</Label>
                <Input value={formData.emergency} onChange={(e) => setFormData({...formData, emergency: e.target.value})} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">로컬 생활 꿀팁</Label>
                <Textarea value={formData.tips} onChange={(e) => setFormData({...formData, tips: e.target.value})} className="min-h-[80px] rounded-xl" />
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
              <Button className="w-full h-12 bg-accent hover:bg-accent/90 font-bold rounded-2xl gap-2" onClick={handleGenerate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                생활 가이드 생성
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
