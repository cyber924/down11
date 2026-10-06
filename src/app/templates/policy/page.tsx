"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Gavel, 
  Users, 
  Gift, 
  FileEdit, 
  Zap, 
  Loader2, 
  ChevronLeft,
  Globe,
  Sparkles,
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generatePolicyContent } from "@/ai/flows/generate-policy-content-flow";
import { recommendPolicyDetails } from "@/ai/flows/recommend-policy-details-flow";
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

export default function PolicyTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [formData, setFormData] = useState({
    policyName: "",
    region: "",
    target: "",
    benefits: "",
    howToApply: "",
    deadline: "",
    language: "ko"
  });

  const handleRecommend = async () => {
    if (!formData.region) {
      toast({ variant: "destructive", title: "지역 입력 필요", description: "지자체 정책을 추천받을 지역을 입력해주세요." });
      return;
    }
    setRecommendLoading(true);
    try {
      const data = await recommendPolicyDetails({
        location: formData.region,
        language: formData.language as any
      });
      setFormData({ ...formData, ...data });
      toast({ title: "AI 정책 추천 완료", description: `실제 시행 중인 정책을 성공적으로 가져왔습니다.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "추천 실패", description: "해당 지역의 최신 정책 정보를 찾지 못했습니다." });
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.policyName || !formData.region) {
      toast({ variant: "destructive", title: "필수 정보 누락", description: "정책 이름과 지역은 필수입니다." });
      return;
    }
    setLoading(true);
    try {
      const output = await generatePolicyContent(formData as any);
      if (user) {
        const docRef = await addDoc(collection(db, "packages"), {
          location: formData.policyName,
          theme: "Policy",
          durationDays: 0,
          language: formData.language,
          localGuide: output.introduction,
          accommodationIntro: output.benefitAnalysis,
          travelItinerary: output.stepByStepGuide,
          snsCaption: output.snsCaption,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        toast({ title: "정책 가이드 생성 완료", description: "나의 보관함에 저장되었습니다." });
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
          <Gavel className="w-8 h-8 text-accent" />
          정부 및 지자체 정책 템플릿
        </h1>
        <p className="text-muted-foreground text-sm font-medium">복잡한 지원 정책을 여행객을 위한 명확한 정보성 콘텐츠로 변환합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-xl">
            <CardHeader className="bg-muted/30 border-b py-6 px-8 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-headline font-bold">정책 데이터 수집</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl border-accent text-accent font-bold text-[10px] gap-2 h-8"
                onClick={handleRecommend}
                disabled={recommendLoading}
              >
                {recommendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                실제 정책 데이터 자동 채우기
              </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">정책/사업명</Label>
                  <Input value={formData.policyName} onChange={(e) => setFormData({...formData, policyName: e.target.value})} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">시행 지역</Label>
                  <Input value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 지원 대상</Label>
                <Input value={formData.target} onChange={(e) => setFormData({...formData, target: e.target.value})} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Gift className="w-3.5 h-3.5" /> 주요 혜택 및 지원금</Label>
                <Textarea value={formData.benefits} onChange={(e) => setFormData({...formData, benefits: e.target.value})} className="min-h-[80px] rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><FileEdit className="w-3.5 h-3.5" /> 신청 방법</Label>
                <Textarea value={formData.howToApply} onChange={(e) => setFormData({...formData, howToApply: e.target.value})} className="min-h-[80px] rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 신청 기한</Label>
                <Input value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="h-10 rounded-xl" />
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
              정책 콘텐츠 생성
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
