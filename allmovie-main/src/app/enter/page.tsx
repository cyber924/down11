
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tv as TvIcon,
  Clapperboard as ClapperIcon,
  Sparkles as SparkleIcon,
  Zap as ZapIcon,
  Globe as GlobeIcon,
  Play as PlayIcon,
  FileText as FileIcon,
  Loader2, 
  Instagram, 
  Copy,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { generateOneClickEnterPackage, type GenerateOneClickEnterPackageOutput } from "@/ai/flows/generate-one-click-enter-package-flow";
import { Badge } from "@/components/ui/badge";
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

export default function EnterPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateOneClickEnterPackageOutput & { id?: string } | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "신입사원 강회장",
    category: "drama" as "drama" | "movie" | "show" | "vlog" | "tips",
    theme: "글로벌 OTT 차트 1위를 휩쓸고 있는 K-드라마 '신입사원 강회장'의 파격적인 전개와 주연 배우들의 열연, 그리고 해외 팬들의 반응을 분석한 특집 기사.",
    language: "ko"
  });

  const handleGenerate = async () => {
    if (!formData.title) {
      toast({ variant: "destructive", title: "주제/제목 입력", description: "분석할 주제나 제목을 입력해주세요." });
      return;
    }
    setLoading(true);
    try {
      const output = await generateOneClickEnterPackage(formData);

      if (user) {
        const docRef = await addDoc(collection(db, "packages"), {
          location: formData.title,
          theme: formData.category.toUpperCase(),
          durationDays: 0,
          language: formData.language,
          localGuide: output.fullContent,
          accommodationIntro: "",
          travelItinerary: "",
          snsCaption: output.snsCaption,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        setResult({ ...output, id: docRef.id });
        toast({ title: "콘텐츠 생성 완료", description: "나의 보관함에 저장되었습니다." });
      } else {
        setResult(output);
        toast({ title: "생성 완료", description: "로그인 시 자동으로 보관함에 저장됩니다." });
      }
    } catch (error) {
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center justify-center gap-2">
          <ClapperIcon className="w-7 h-7 text-accent" />
          K-엔터 팩트기반 패키지 생성
        </h1>
        <p className="text-muted-foreground font-medium text-[14px]">최신 기사와 팩트를 바탕으로 엔터, 일상, 꿀팁 콘텐츠를 정밀 생성합니다.</p>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="pt-10 px-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <PlayIcon className="w-3.5 h-3.5" /> 주제 / 제목
              </Label>
              <Input 
                placeholder="예: 신입사원 강회장, 나만의 모닝 루틴" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="h-11 rounded-xl bg-slate-50 border-none text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <TvIcon className="w-3.5 h-3.5" /> 카테고리
              </Label>
              <Select value={formData.category} onValueChange={(val: any) => setFormData({...formData, category: val})}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drama">K-드라마</SelectItem>
                  <SelectItem value="movie">K-무비</SelectItem>
                  <SelectItem value="show">K-예능</SelectItem>
                  <SelectItem value="vlog">일상로그</SelectItem>
                  <SelectItem value="tips">정보 & 꿀팁</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <GlobeIcon className="w-3.5 h-3.5" /> 출력 언어
              </Label>
              <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val})}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <FileIcon className="w-3.5 h-3.5" /> 관련 팩트 또는 상세 정보 (권장)
            </Label>
            <Textarea 
              placeholder="뉴스 기사나 작품 정보를 입력하세요." 
              value={formData.theme}
              onChange={(e) => setFormData({...formData, theme: e.target.value})}
              className="min-h-[120px] rounded-2xl bg-slate-50 border-none text-[13px] leading-relaxed resize-none p-6 font-medium"
            />
            <p className="text-[10px] text-muted-foreground/60 font-bold italic">* 정확한 정보나 기사를 입력하면 할루시네이션 없이 고품질 콘텐츠가 생성됩니다.</p>
          </div>

          <Button 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/20 gap-2 transition-all active:scale-[0.98]"
            onClick={handleGenerate}
            disabled={loading || !formData.title}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SparkleIcon className="w-4 h-4" />}
            {loading ? "데이터 분석 및 매거진 아티클 구성 중..." : "AI 정밀 콘텐츠 팩 생성"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-headline font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              아티클 생성 결과
            </h2>
            {result.id && (
              <Button variant="outline" size="sm" className="rounded-full px-5 h-9 text-[11px] font-black border-slate-200 text-slate-500" onClick={() => router.push(`/packages/${result.id}`)}>
                보관함에서 상세 보기
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="border-b bg-slate-50/50 py-4 px-10">
                <CardTitle className="text-[11px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                  <FileIcon className="w-4 h-4" /> Full Magazine Article
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 md:p-14 lg:p-16">
                <div className="prose prose-slate max-w-none text-[16px] leading-[2.2] font-medium text-slate-700" dangerouslySetInnerHTML={{ __html: result.fullContent }} />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="bg-accent/5 border-b py-4 px-8">
                  <CardTitle className="text-[11px] font-black flex items-center gap-2 text-accent uppercase tracking-widest">
                    <Instagram className="w-4 h-4" /> SNS Caption
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="bg-slate-50 p-6 rounded-2xl relative group border border-slate-100 shadow-inner">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(result.snsCaption)}><Copy className="w-3.5 h-3.5" /></Button>
                    <p className="whitespace-pre-wrap text-[12px] leading-[1.8] font-bold text-slate-600">{result.snsCaption}</p>
                  </div>
                  <Button className="w-full mt-4 h-10 text-[11px] font-black bg-accent hover:bg-accent/90 gap-2 rounded-xl shadow-lg shadow-accent/10" onClick={() => copyToClipboard(result.snsCaption)}>
                    <Copy className="w-3.5 h-3.5" /> 캡션 복사
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-slate-900 text-white p-8">
                <CardContent className="p-0 space-y-4">
                  <div className="text-[10px] font-black text-accent tracking-[0.2em] uppercase mb-4">Content Metadata</div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[12px] border-b border-white/5 pb-2">
                      <span className="text-white/30 font-bold">Category</span>
                      <span className="font-black text-accent">{formData.category.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-[12px] border-b border-white/5 pb-2">
                      <span className="text-white/30 font-bold">Language</span>
                      <span className="font-black text-white">{formData.language.toUpperCase()}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 text-[11px] font-black h-10 rounded-xl mt-4" onClick={() => window.print()}>
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> PDF Export
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
