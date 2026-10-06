'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ExternalLink,
  RefreshCw,
  Clock,
  ShieldCheck,
  Send,
  Flame,
  Layers,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { runGoogleNewsEntertainmentEngine, type GeneratedArticle } from "@/ai/flows/google-news-entertainment-engine-flow";
import { generateOneClickEnterPackage, type GenerateOneClickEnterPackageOutput } from "@/ai/flows/generate-one-click-enter-package-flow";
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
import type { GoogleNewsArticle } from "@/lib/google-news";

export default function EnterPage() {
  const [activeTab, setActiveTab] = useState<"google_news" | "manual">("google_news");
  
  // Google News State
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsArticles, setNewsArticles] = useState<GoogleNewsArticle[]>([]);
  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>([]);
  const [newsQuery, setNewsQuery] = useState("드라마 결말 OR 복선 OR 시청률");
  
  // Generation State
  const [generating, setGenerating] = useState(false);
  const [engineStep, setEngineStep] = useState<string>("");
  const [generatedResults, setGeneratedResults] = useState<GeneratedArticle[]>([]);
  const [activeResultIdx, setActiveResultIdx] = useState(0);
  const [wpPublishing, setWpPublishing] = useState<Record<number, boolean>>({});
  const [wpPublished, setWpPublished] = useState<Record<number, boolean>>({});

  // Manual Mode State
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState<GenerateOneClickEnterPackageOutput & { id?: string } | null>(null);
  const [manualFormData, setManualFormData] = useState({
    title: "신입사원 강회장",
    category: "drama" as "drama" | "movie" | "show" | "vlog" | "tips",
    theme: "글로벌 OTT 차트 1위를 휩쓸고 있는 K-드라마 '신입사원 강회장'의 파격적인 전개와 주연 배우들의 열연, 그리고 해외 팬들의 반응을 분석한 특집 기사.",
    language: "ko"
  });

  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  // Load Google News feed
  const loadGoogleNews = async (query = newsQuery) => {
    setNewsLoading(true);
    try {
      const res = await fetch(`/api/google-news?q=${encodeURIComponent(query)}&limit=12`);
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setNewsArticles(data.articles);
        // 기본으로 상위 3개 자동 선택
        const top3Ids = data.articles.slice(0, 3).map((a: GoogleNewsArticle) => a.id);
        setSelectedNewsIds(top3Ids);
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "구글 뉴스 조회 실패", description: "뉴스 피드를 불러오지 못했습니다." });
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    loadGoogleNews();
  }, []);

  const toggleNewsSelection = (id: string) => {
    if (selectedNewsIds.includes(id)) {
      if (selectedNewsIds.length === 1) {
        toast({ title: "최소 1개 선택", description: "최소 1개 이상의 기사를 선택해야 합니다." });
        return;
      }
      setSelectedNewsIds(selectedNewsIds.filter((item) => item !== id));
    } else {
      if (selectedNewsIds.length >= 3) {
        toast({ title: "최대 3개 제한", description: "검색엔진 최적화 및 스팸 방지를 위해 최대 3개까지만 선택할 수 있습니다." });
        return;
      }
      setSelectedNewsIds([...selectedNewsIds, id]);
    }
  };

  // Run Google News Fact Engine (Max 3)
  const handleRunGoogleNewsEngine = async () => {
    const selectedArticles = newsArticles.filter((a) => selectedNewsIds.includes(a.id)).slice(0, 3);
    if (selectedArticles.length === 0) {
      toast({ variant: "destructive", title: "기사 선택 필요", description: "팩트로 활용할 뉴스를 최소 1개 이상 선택하세요." });
      return;
    }

    setGenerating(true);
    setEngineStep("1단계: 구글 뉴스 보도 팩트 추출 및 할루시네이션 검증 중...");
    try {
      setTimeout(() => {
        setEngineStep("2단계: 팩트 앵커 기반 롱폼 심층 칼럼 및 복선 해석 집필 중...");
      }, 1800);

      setTimeout(() => {
        setEngineStep("3단계: Unsplash 고해상도 무드 에셋 배치 & 골든타임 스케줄 산정 중...");
      }, 3500);

      const response = await runGoogleNewsEntertainmentEngine({
        articles: selectedArticles.map((a) => ({
          id: a.id,
          title: a.cleanTitle || a.title,
          source: a.source,
          snippet: a.snippet,
          link: a.link,
          pubDate: a.pubDate,
        })),
        language: "ko",
        style: "drama_deep_analysis",
      });

      if (response.success && response.articles.length > 0) {
        setGeneratedResults(response.articles);
        setActiveResultIdx(0);

        // Firestore 저장 (로그인 시)
        if (user && db) {
          for (const item of response.articles) {
            await addDoc(collection(db, "packages"), {
              location: item.dramaTitle || item.title,
              theme: "K-DRAMA-FACT",
              durationDays: 0,
              language: "ko",
              localGuide: item.fullContent,
              accommodationIntro: "",
              travelItinerary: "",
              snsCaption: item.snsCaption,
              sourceLink: item.sourceLink || "",
              mediaSource: item.factSheet.mediaSource,
              confidenceScore: item.factSheet.confidenceScore,
              goldenTimeSchedule: item.goldenTimeSchedule,
              createdBy: user.uid,
              status: "ready_to_publish",
              createdAt: serverTimestamp(),
            });
          }
        }

        toast({
          title: `팩트 기반 콘텐츠 ${response.articles.length}건 생성 완료!`,
          description: "구글 뉴스 공인 팩트를 바탕으로 최대 3개의 롱폼 아티클이 완성되었습니다.",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "생성 실패",
        description: err.message || "AI 엔진 응답 처리 중 오류가 발생했습니다.",
      });
    } finally {
      setGenerating(false);
      setEngineStep("");
    }
  };

  // WordPress publish simulation
  const handlePublishToWordPress = async (idx: number, article: GeneratedArticle) => {
    setWpPublishing((prev) => ({ ...prev, [idx]: true }));
    setTimeout(() => {
      setWpPublishing((prev) => ({ ...prev, [idx]: false }));
      setWpPublished((prev) => ({ ...prev, [idx]: true }));
      toast({
        title: "워드프레스 발행 완료!",
        description: `'${article.title}' 아티클이 ${article.goldenTimeSchedule} 슬롯에 예약 등록되었습니다.`,
      });
    }, 1500);
  };

  // Manual Generation (Legacy/Custom fallback)
  const handleManualGenerate = async () => {
    if (!manualFormData.title) {
      toast({ variant: "destructive", title: "주제/제목 입력", description: "분석할 주제나 제목을 입력해주세요." });
      return;
    }
    setManualLoading(true);
    try {
      const output = await generateOneClickEnterPackage(manualFormData);

      if (user && db) {
        const docRef = await addDoc(collection(db, "packages"), {
          location: manualFormData.title,
          theme: manualFormData.category.toUpperCase(),
          durationDays: 0,
          language: manualFormData.language,
          localGuide: output.fullContent,
          accommodationIntro: "",
          travelItinerary: "",
          snsCaption: output.snsCaption,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        setManualResult({ ...output, id: docRef.id });
        toast({ title: "콘텐츠 생성 완료", description: "나의 보관함에 저장되었습니다." });
      } else {
        setManualResult(output);
        toast({ title: "생성 완료", description: "로그인 시 자동으로 보관함에 저장됩니다." });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "생성 실패", description: "AI 서비스 응답 지연입니다." });
    } finally {
      setManualLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "복사 완료", description: "클립보드에 복사되었습니다." });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold tracking-wider uppercase">
          <Flame className="w-3.5 h-3.5" />
          Google News Fact-Anchored Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-2">
          <ClapperIcon className="w-6 h-6 text-primary" />
          구글 뉴스 팩트 기반 K-콘텐츠 스튜디오
        </h1>
        <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-2xl mx-auto">
          구글 뉴스 실시간 피드에서 공인된 보도 팩트만을 추출하여 할루시네이션 없는 독창적 롱폼 블로그 아티클을 <strong className="text-slate-800">최대 3개 엄선 발행</strong>합니다.
        </p>
      </div>

      {/* Tabs: 구글 뉴스 팩트 엔진 vs 수동 입력 */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="google_news" className="text-xs font-bold px-5 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Flame className="w-3.5 h-3.5 mr-1.5 text-accent" />
              구글 뉴스 실시간 팩트 연동 (최대 3개 발행)
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs font-medium px-5 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileIcon className="w-3.5 h-3.5 mr-1.5" />
              수동 키워드 입력 모드
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Google News Realtime Fact Engine */}
        <TabsContent value="google_news" className="space-y-6">
          {/* Filter & News Controls */}
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GlobeIcon className="w-4 h-4 text-primary" />
                    실시간 구글 뉴스 드라마·연예 피드
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    발행하고 싶은 팩트 기사를 1~3개 선택하세요. (현재 {selectedNewsIds.length}/3개 선택됨)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={newsQuery}
                    onValueChange={(val) => {
                      setNewsQuery(val);
                      loadGoogleNews(val);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs w-[160px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="드라마 결말 OR 복선 OR 시청률">결말 & 복선 포커스</SelectItem>
                      <SelectItem value="K-드라마 화제작 넷플릭스">화제작 & OTT 랭킹</SelectItem>
                      <SelectItem value="주말 드라마 시청률 1위">시청률 급상승 드라마</SelectItem>
                      <SelectItem value="연예 방송 인터뷰 비하인드">비하인드 인터뷰</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 rounded-lg"
                    onClick={() => loadGoogleNews()}
                    disabled={newsLoading}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? "animate-spin" : ""}`} />
                    새로고침
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {newsLoading ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="text-xs text-slate-500 font-medium">최신 구글 뉴스 피드를 실시간 파싱 중입니다...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {newsArticles.map((article, index) => {
                    const isSelected = selectedNewsIds.includes(article.id);
                    return (
                      <div
                        key={`${article.id || 'article'}_${index}`}
                        onClick={() => toggleNewsSelection(article.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border transition-all text-left relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                            : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/60"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-semibold text-primary/80">{article.source}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {article.timeAgo}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                            {article.cleanTitle}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {article.snippet}
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 mt-2">
                          <span className={`text-[10px] font-bold ${isSelected ? "text-primary" : "text-slate-400"}`}>
                            {isSelected ? "✓ 팩트 앵커 선택됨" : "+ 클릭하여 선택"}
                          </span>
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-5 border-t border-slate-100 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>공인 보도 팩트 추출 → 듀얼 에이전트 표절 0% 심화 → 골든타임 스케줄러 탑재</span>
                </div>
                <Button
                  onClick={handleRunGoogleNewsEngine}
                  disabled={generating || selectedNewsIds.length === 0}
                  className="w-full sm:w-auto h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md gap-2"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <SparkleIcon className="w-3.5 h-3.5 text-accent" />}
                  {generating ? "팩트 콘텐츠 엔진 가동 중..." : `선택된 팩트 기반 Top ${Math.min(selectedNewsIds.length, 3)} 아티클 동시 생성`}
                </Button>
              </div>

              {/* Engine Step Progress */}
              {generating && (
                <div className="mt-4 p-3.5 bg-accent/5 border border-accent/20 rounded-xl flex items-center gap-3 animate-pulse">
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  <span className="text-xs font-bold text-accent">{engineStep}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Top 3 Results Showcase */}
          {generatedResults.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    팩트 기반 검증 아티클 ({generatedResults.length}건 엄선 완료)
                  </h3>
                  <p className="text-xs text-slate-500">각 아티클별 팩트 시트와 골든타임 스케줄을 확인하고 워드프레스에 즉시/예약 발행하세요.</p>
                </div>
                <div className="flex gap-1.5">
                  {generatedResults.map((item, idx) => (
                    <Button
                      key={idx}
                      variant={activeResultIdx === idx ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveResultIdx(idx)}
                      className="h-8 text-xs font-bold rounded-lg"
                    >
                      아티클 {idx + 1}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Active Article Details */}
              {generatedResults[activeResultIdx] && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Full Content */}
                  <Card className="lg:col-span-2 border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-3.5 px-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                          {generatedResults[activeResultIdx].dramaTitle}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {generatedResults[activeResultIdx].factSheet.mediaSource} 보도 팩트 인용
                        </span>
                      </div>
                      <CardTitle className="text-sm sm:text-base font-bold text-slate-900 mt-2 leading-snug">
                        {generatedResults[activeResultIdx].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                      <div
                        className="prose prose-slate max-w-none text-[14px] leading-relaxed font-normal text-slate-700"
                        dangerouslySetInnerHTML={{ __html: generatedResults[activeResultIdx].fullContent }}
                      />
                    </CardContent>
                  </Card>

                  {/* Right 1 Col: Fact Sheet, Golden Time, WordPress */}
                  <div className="space-y-4">
                    {/* Fact Sheet Verification Card */}
                    <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          공인 팩트 시트
                        </span>
                        <Badge className="bg-green-100 text-green-700 text-[10px] font-bold">
                          신뢰도 {generatedResults[activeResultIdx].factSheet.confidenceScore}%
                        </Badge>
                      </div>
                      <div className="space-y-2 text-xs text-slate-600">
                        <p className="font-semibold text-slate-800">
                          언론사 출처: <span className="font-normal text-slate-600">{generatedResults[activeResultIdx].factSheet.mediaSource}</span>
                        </p>
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-800">확인된 핵심 사실:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
                            {generatedResults[activeResultIdx].factSheet.keyEvents.map((fact, i) => (
                              <li key={i}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>

                    {/* Golden Time & WordPress Publish */}
                    <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-slate-900 text-white p-5 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">추천 골든타임 스케줄</span>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          {generatedResults[activeResultIdx].goldenTimeSchedule}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                        <Button
                          onClick={() => handlePublishToWordPress(activeResultIdx, generatedResults[activeResultIdx])}
                          disabled={wpPublishing[activeResultIdx] || wpPublished[activeResultIdx]}
                          className={`w-full h-9 text-xs font-bold rounded-xl gap-2 ${
                            wpPublished[activeResultIdx]
                              ? "bg-green-600 text-white"
                              : "bg-primary hover:bg-primary/90 text-white"
                          }`}
                        >
                          {wpPublishing[activeResultIdx] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : wpPublished[activeResultIdx] ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          {wpPublishing[activeResultIdx]
                            ? "워드프레스 연동 중..."
                            : wpPublished[activeResultIdx]
                            ? "워드프레스 발행 완료"
                            : "워드프레스 원클릭 예약 발행"}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(generatedResults[activeResultIdx].fullContent)}
                          className="w-full h-9 text-xs font-semibold rounded-xl border-white/20 text-white hover:bg-white/10 gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          HTML 본문 전체 복사
                        </Button>
                      </div>
                    </Card>

                    {/* SNS Marketing Caption */}
                    <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Instagram className="w-3.5 h-3.5 text-accent" />
                          SNS 마케팅 캡션
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2 text-slate-500"
                          onClick={() => copyToClipboard(generatedResults[activeResultIdx].snsCaption)}
                        >
                          <Copy className="w-3 h-3 mr-1" /> 복사
                        </Button>
                      </div>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {generatedResults[activeResultIdx].snsCaption}
                      </p>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Manual Keyword Input Mode */}
        <TabsContent value="manual" className="space-y-6">
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white">
            <CardContent className="pt-6 px-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">작품명 또는 메인 주제</Label>
                  <Input 
                    placeholder="예: 신입사원 강회장" 
                    value={manualFormData.title}
                    onChange={(e) => setManualFormData({...manualFormData, title: e.target.value})}
                    className="h-9 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">카테고리</Label>
                  <Select value={manualFormData.category} onValueChange={(val: any) => setManualFormData({...manualFormData, category: val})}>
                    <SelectTrigger className="h-9 rounded-lg text-xs">
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
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">출력 언어</Label>
                  <Select value={manualFormData.language} onValueChange={(val) => setManualFormData({...manualFormData, language: val})}>
                    <SelectTrigger className="h-9 rounded-lg text-xs">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">상세 팩트 메모 (권장)</Label>
                <Textarea 
                  placeholder="작품의 최신 방영 회차나 기사 내용을 입력하세요." 
                  value={manualFormData.theme}
                  onChange={(e) => setManualFormData({...manualFormData, theme: e.target.value})}
                  className="min-h-[90px] rounded-xl text-xs leading-relaxed resize-none p-3"
                />
              </div>

              <Button 
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow gap-2"
                onClick={handleManualGenerate}
                disabled={manualLoading || !manualFormData.title}
              >
                {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SparkleIcon className="w-3.5 h-3.5" />}
                {manualLoading ? "매거진 아티클 구성 중..." : "수동 콘텐츠 생성"}
              </Button>
            </CardContent>
          </Card>

          {manualResult && (
            <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-slate-900">{manualResult.title}</h3>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => copyToClipboard(manualResult.fullContent)}>
                  <Copy className="w-3 h-3 mr-1" /> HTML 복사
                </Button>
              </div>
              <div
                className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: manualResult.fullContent }}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
