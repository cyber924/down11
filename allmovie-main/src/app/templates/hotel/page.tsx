"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  Wifi, 
  Users, 
  Coffee, 
  Zap, 
  Loader2, 
  ChevronLeft,
  CheckCircle2,
  Globe,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generateHotelContent } from "@/ai/flows/generate-hotel-content-flow";
import { recommendHotelDetails } from "@/ai/flows/recommend-hotel-details-flow";
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

export default function HotelTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [formData, setFormData] = useState({
    hotelName: "",
    location: "",
    wifiSpeed: "",
    meetingRooms: "",
    surroundings: "",
    amenities: "",
    language: "ko"
  });

  const handleRecommend = async () => {
    if (!formData.location) {
      toast({ variant: "destructive", title: "위치 정보 필요", description: "먼저 추천을 받을 지역(예: 제주)을 입력해주세요." });
      return;
    }
    setRecommendLoading(true);
    try {
      const data = await recommendHotelDetails({
        location: formData.location,
        language: formData.language as any
      });
      setFormData({
        ...formData,
        ...data
      });
      toast({ title: "AI 추천 완료", description: `${data.hotelName}의 정보를 자동으로 채웠습니다.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "추천 실패", description: "AI가 정보를 찾지 못했습니다." });
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.hotelName || !formData.location) {
      toast({ variant: "destructive", title: "필수 정보 누락", description: "호텔명과 위치는 반드시 입력해야 합니다." });
      return;
    }
    setLoading(true);
    try {
      const output = await generateHotelContent(formData as any);
      
      if (user) {
        const docRef = await addDoc(collection(db, "packages"), {
          location: formData.hotelName,
          theme: "Hotel",
          durationDays: 0,
          language: formData.language,
          localGuide: output.introduction,
          accommodationIntro: output.infrastructureAnalysis,
          travelItinerary: output.locationInsight,
          snsCaption: output.snsCaption,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        toast({ title: "호텔 리포트 생성 완료", description: "나의 보관함에 저장되었습니다." });
        router.push(`/packages/${docRef.id}`);
      } else {
        toast({ title: "생성 완료", description: "로그인 시 자동으로 보관함에 저장됩니다." });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "생성 실패", description: "AI 서비스 응답 지연입니다." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-4 rounded-full text-[11px] font-bold">
        <ChevronLeft className="w-4 h-4" /> 템플릿 목록으로
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
          <Building2 className="w-8 h-8 text-accent" />
          호텔 & 숙박 구조화 템플릿
        </h1>
        <p className="text-muted-foreground text-sm font-medium">워케이션 고객을 유치하기 위한 최적의 숙소 분석 리포트를 생성합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b py-6 px-8">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-headline font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  정밀 데이터 수집 폼
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white font-bold text-[10px] gap-2 h-8"
                  onClick={handleRecommend}
                  disabled={recommendLoading}
                >
                  {recommendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI 추천 데이터로 자동 채우기
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">호텔/숙소명</Label>
                  <Input 
                    placeholder="예: 강릉 오션 호텔" 
                    value={formData.hotelName}
                    onChange={(e) => setFormData({...formData, hotelName: e.target.value})}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">위치</Label>
                  <Input 
                    placeholder="예: 제주, 강릉, 부산" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" /> 객실 Wi-Fi 및 업무 인프라
                </Label>
                <Textarea 
                  placeholder="예: 객실별 개별 공유기 설치, 다운로드 300Mbps 이상, 침대 옆 콘센트 배치" 
                  value={formData.wifiSpeed}
                  onChange={(e) => setFormData({...formData, wifiSpeed: e.target.value})}
                  className="min-h-[80px] rounded-xl text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> 공용 회의실 및 워크스테이션
                </Label>
                <Textarea 
                  placeholder="예: 2층 코워킹 라운지 24시간 운영, 4인용 미팅룸 2개 보유, 모니터 대여 가능" 
                  value={formData.meetingRooms}
                  onChange={(e) => setFormData({...formData, meetingRooms: e.target.value})}
                  className="min-h-[80px] rounded-xl text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" /> 주변 업무 환경 (로컬 카페 등)
                </Label>
                <Textarea 
                  placeholder="예: 도보 5분 거리 스타벅스 위치, 조용한 안목해변 산책로 연결" 
                  value={formData.surroundings}
                  onChange={(e) => setFormData({...formData, surroundings: e.target.value})}
                  className="min-h-[80px] rounded-xl text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">기타 어메니티</Label>
                <Input 
                  placeholder="예: 조식 서비스, 무제한 커피 머신, 피트니스 센터" 
                  value={formData.amenities}
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                  className="h-10 rounded-xl text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-xl bg-slate-900 text-white p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-sm font-headline font-bold text-accent uppercase tracking-widest">Global Options</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> 출력 언어 선택
                </Label>
                <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val})}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-11 rounded-xl">
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

              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-[12px] font-bold text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> 전문가급 정밀 분석
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> 워드프레스 즉시 발행 HTML
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> SNS 자동 캡션 생성
                </div>
              </div>

              <Button 
                className="w-full mt-6 h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl shadow-lg shadow-accent/20 transition-all active:scale-95"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                호텔 리포트 생성하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
