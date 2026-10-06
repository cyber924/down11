
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Map, 
  Clock, 
  Navigation, 
  Zap, 
  Loader2, 
  ChevronLeft,
  Globe,
  Sparkles,
  Camera
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generateTourContent } from "@/ai/flows/generate-tour-content-flow";
import { recommendTourDetails } from "@/ai/flows/recommend-tour-details-flow";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function TourTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [formData, setFormData] = useState({
    tourName: "",
    location: "",
    accessibility: "",
    duration: "",
    workspaceInfo: "",
    highlights: "",
    language: "ko"
  });

  const handleRecommend = async () => {
    if (!formData.location) {
      toast({ variant: "destructive", title: "지역 입력 필요", description: "먼저 추천을 받을 지역(예: 제주)을 입력해주세요." });
      return;
    }
    setRecommendLoading(true);
    try {
      const data = await recommendTourDetails({
        location: formData.location,
        language: formData.language as any
      });
      setFormData({ ...formData, ...data });
      toast({ title: "AI 추천 완료", description: `${data.tourName} 정보를 성공적으로 가져왔습니다.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "추천 실패", description: "AI가 명소 정보를 찾지 못했습니다." });
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.tourName || !formData.location) {
      toast({ variant: "destructive", title: "필수 정보 누락", description: "명소 이름과 위치는 필수입니다." });
      return;
    }
    setLoading(true);
    try {
      const output = await generateTourContent(formData as any);
      if (user) {
        const fallbackImg = PlaceHolderImages.find(img => img.id === 'travel-hero')?.imageUrl;
        const docRef = await addDoc(collection(db, "packages"), {
          location: formData.tourName,
          theme: "Tour",
          durationDays: 0,
          language: formData.language,
          localGuide: output.introduction + `<img src="${fallbackImg}" class="rounded-2xl my-8 shadow-lg" data-ai-hint="korean travel" />`,
          accommodationIntro: output.experienceGuide,
          travelItinerary: output.digitalNomadTip,
          snsCaption: output.snsCaption,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        toast({ title: "관광지 콘텐츠 생성 완료", description: "나의 보관함에 저장되었습니다." });
        router.push(`/packages/${docRef.id}`);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "생성 실패", description: "콘텐츠 생성 중 문제가 발생했습니다." });
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
          <Map className="w-8 h-8 text-accent" />
          관광지 & 로컬 투어 템플릿
        </h1>
        <p className="text-muted-foreground text-sm font-medium">로컬의 숨은 명소와 투어 코스를 전문가급 HTML 콘텐츠로 변환합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-xl">
            <CardHeader className="bg-muted/30 border-b py-6 px-8 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-headline font-bold">관광 데이터 수집</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl border-accent text-accent font-bold text-[10px] gap-2 h-8"
                onClick={handleRecommend}
                disabled={recommendLoading}
              >
                {recommendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                명소 자동 추천
              </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">관광지명</Label>
                  <Input value={formData.tourName} onChange={(e) => setFormData({...formData, tourName: e.target.value})} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">지역</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> 접근성 및 교통</Label>
                <Input value={formData.accessibility} onChange={(e) => setFormData({...formData, accessibility: e.target.value})} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 권장 소요 시간</Label>
                <Input value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> 하이라이트 및 포토존</Label>
                <Textarea value={formData.highlights} onChange={(e) => setFormData({...formData, highlights: e.target.value})} className="min-h-[80px] rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">주변 업무/휴식 공간</Label>
                <Input value={formData.workspaceInfo} onChange={(e) => setFormData({...formData, workspaceInfo: e.target.value})} className="h-10 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card className="rounded-[2rem] bg-slate-900 text-white p-8">
            <CardHeader className="p-0 mb-6">
              <Label className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> 출력 언어</Label>
              <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val})}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <Button className="w-full h-12 bg-accent hover:bg-accent/90 font-bold rounded-2xl gap-2" onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              투어 콘텐츠 생성
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
