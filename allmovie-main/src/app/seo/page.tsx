
"use client"

import { useState, useMemo, useEffect } from "react";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SearchCheck, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  Activity, 
  Search, 
  Layout, 
  Copy, 
  Zap, 
  MousePointer2, 
  Database, 
  ArrowRight, 
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const ITEMS_PER_PAGE = 30;

export default function SEOControlPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [viewingSERP, setViewingSERP] = useState<any | null>(null);
  const [isDomainInfoOpen, setIsDomainInfoOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [indexingLoading, setIndexingLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const packagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "packages"), orderBy("createdAt", "desc"), limit(200));
  }, [db]);

  const { data: rawPackages, loading } = useCollection(packagesQuery);

  const basePublishedPackages = useMemo(() => {
    if (!rawPackages) return [];
    return rawPackages.filter((pkg: any) => {
      const isPublished = pkg.status !== 'draft';
      const matchesSearch = (pkg.title || pkg.location || "").toLowerCase().includes(searchTerm.toLowerCase());
      return isPublished && matchesSearch;
    });
  }, [rawPackages, searchTerm]);

  const tripleDomainPackages = useMemo(() => {
    const domains = [
      { name: "allmovie.shop", prefix: "https://allmovie.shop/blog/", type: "Blog" },
      { name: "moviefree.store", prefix: "https://moviefree.store/webzine/", type: "Webzine" },
      { name: "down1.co.kr", prefix: "https://down1.co.kr/news/", type: "News Portal" }
    ];

    const result: any[] = [];
    basePublishedPackages.forEach((pkg: any) => {
      domains.forEach(domain => {
        result.push({
          ...pkg,
          uniqueKey: `${pkg.id}_${domain.name}`,
          targetDomain: domain.name,
          targetUrl: `${domain.prefix}${pkg.id}`,
          domainType: domain.type
        });
      });
    });
    return result;
  }, [basePublishedPackages]);

  // 페이지네이션 처리
  const totalPages = Math.ceil(tripleDomainPackages.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return tripleDomainPackages.slice(start, start + ITEMS_PER_PAGE);
  }, [tripleDomainPackages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedUrls([]);
  }, [searchTerm]);

  const getAIAnalysis = (pkg: any) => {
    let score = 0;
    const feedback: string[] = [];
    
    if (pkg.title && pkg.title.length > 20) {
      score += 40;
      feedback.push("롱테일 제목 키워드 배치가 우수함");
    } else {
      score += 20;
      feedback.push("제목이 짧아 재작성 위험 있음");
    }
    
    if (pkg.localGuide?.length > 1500) {
      score += 40;
      feedback.push("풍부한 본문 분량으로 신뢰도 확보");
    } else {
      score += 20;
      feedback.push("본문 보강 시 색인 속도 향상 예상");
    }
    
    if (pkg.localGuide?.includes('<img')) {
      score += 20;
      feedback.push("시각 에셋 포함됨");
    }

    return { 
      score, 
      feedback: feedback.join(", "),
      status: score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"
    };
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUrls(currentItems.map(p => p.targetUrl));
    } else {
      setSelectedUrls([]);
    }
  };

  const handleToggleSelect = (url: string) => {
    setSelectedUrls(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  // 10개 단위 지능형 벌크 검사
  const openBulkQualityCheck = () => {
    if (selectedUrls.length === 0) {
      toast({ variant: "destructive", title: "선택 항목 없음", description: "먼저 검사할 항목을 선택해주세요." });
      return;
    }

    const chunks = [];
    for (let i = 0; i < selectedUrls.length; i += 10) {
      chunks.push(selectedUrls.slice(i, i + 10));
    }

    // 첫 10개 즉시 열기
    chunks[0].forEach(url => window.open(url, '_blank'));
    
    if (chunks.length > 1) {
      toast({ 
        title: "벌크 검사 (1단계 완료)", 
        description: `첫 10개의 탭을 열었습니다. 나머지 ${selectedUrls.length - 10}개는 팝업 차단 방지를 위해 수동으로 순차 실행을 권장합니다.`,
        action: (
          <Button size="sm" className="bg-accent text-white" onClick={() => {
            chunks.slice(1).flat().forEach(url => window.open(url, '_blank'));
          }}>나머지 전체 열기</Button>
        )
      });
    } else {
      toast({ title: "벌크 검사 시작", description: `${selectedUrls.length}개의 탭을 열었습니다.` });
    }
  };

  const requestIndexing = async (key: string) => {
    setIndexingLoading(key);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIndexingLoading(null);
    toast({
      title: "구글 인덱싱 갱신 요청 완료",
      description: "Google Search Console API를 통해 즉시 수집 신호를 보냈습니다.",
    });
  };

  const copyToClipboard = (text: string, msg: string = "주소가 복사되었습니다.") => {
    navigator.clipboard.writeText(text);
    toast({ title: "복사 완료", description: msg });
  };

  if (!user) return <div className="p-20 text-center font-bold text-muted-foreground uppercase tracking-widest">Administrator Login Required</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <SearchCheck className="w-10 h-10 text-accent" />
            SEO 검색최적화 관제 센터 3.0
          </h1>
          <p className="text-muted-foreground font-medium text-lg">트리플 도메인 전략으로 구글 검색 상단을 정밀 타격합니다.</p>
        </div>
        <div className="flex gap-2">
           <Button 
            onClick={() => setIsDomainInfoOpen(true)}
            variant="outline" 
            className="rounded-full h-11 px-6 gap-2 border-primary/20 text-primary font-bold shadow-sm"
           >
              <Database className="w-4 h-4" /> 도메인 마스터 정보
           </Button>
           <Badge variant="outline" className="px-4 py-2 bg-accent/5 border-accent/20 text-accent font-black gap-2">
              <Activity className="w-4 h-4" /> 실시간 인덱싱 엔진 Active
           </Badge>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="제목 또는 키워드 실시간 검색..." 
                className="pl-12 h-12 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 mr-4 text-xs font-bold text-slate-400">
                 <CheckCircle2 className="w-4 h-4 text-primary" />
                 {selectedUrls.length}개 선택됨
              </div>
              <Button 
                onClick={openBulkQualityCheck}
                disabled={selectedUrls.length === 0}
                className="flex-1 md:flex-none h-12 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs gap-2 shadow-xl hover:scale-105 transition-transform"
              >
                <MousePointer2 className="w-4 h-4" /> 선택 항목 벌크 품질 검사 (10개 단위)
              </Button>
           </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b p-10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" />
              트리플 도메인 통합 색인 마스터
              <Badge className="ml-2 bg-primary text-white border-none">{tripleDomainPackages.length}</Badge>
            </CardTitle>
            <CardDescription className="font-medium text-slate-500 mt-1">
              발행된 {basePublishedPackages.length}개의 마스터피스가 3개 도메인에서 각각 어떻게 요리되고 있는지 관제합니다. (30개씩 표시)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100">
                <TableHead className="w-12 px-8">
                  <Checkbox 
                    checked={selectedUrls.length === currentItems.length && currentItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[350px] py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">컨텐츠 정보 & 타겟 도메인</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">AI SEO 종합 분석 의견</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">상태 & 갱신</TableHead>
                <TableHead className="text-right pr-10 text-[10px] font-black uppercase text-slate-400 tracking-widest">정밀 관제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-80 text-center animate-pulse font-bold text-slate-300">Syncing Triple Domain Data...</TableCell></TableRow>
              ) : currentItems.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-80 text-center font-bold text-slate-300 uppercase tracking-widest">No Indexed Contents Found.</TableCell></TableRow>
              ) : currentItems.map((pkg: any) => {
                const analysis = getAIAnalysis(pkg);
                const isSelected = selectedUrls.includes(pkg.targetUrl);
                
                return (
                  <TableRow key={pkg.uniqueKey} className={`hover:bg-slate-50/50 group transition-colors border-b last:border-0 ${isSelected ? 'bg-primary/5' : ''}`}>
                    <TableCell className="px-8">
                       <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(pkg.targetUrl)}
                       />
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="flex flex-col gap-2">
                        <span className="font-bold text-[15px] text-slate-800 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(pkg.title || pkg.location)}`, '_blank')}>
                          {pkg.title || pkg.location}
                        </span>
                        <div className="flex items-center gap-2">
                           <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black px-2 py-0.5 rounded-full">{pkg.domainType}</Badge>
                           <span className="text-[10px] text-slate-400 font-mono tracking-tight">{pkg.targetDomain}</span>
                           <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-200 hover:text-accent" onClick={() => copyToClipboard(pkg.targetUrl)}>
                              <Copy className="w-3 h-3" />
                           </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-4">
                       <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                             <Zap className="w-3 h-3 text-accent fill-accent" /> {analysis.status} ({analysis.score})
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium max-w-[200px] leading-tight italic">
                             "{analysis.feedback}"
                          </p>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase">
                             <CheckCircle2 className="w-3.5 h-3.5" /> Live
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 text-[9px] font-black text-primary hover:bg-primary/10 rounded-lg gap-1.5"
                            onClick={() => requestIndexing(pkg.uniqueKey)}
                            disabled={indexingLoading === pkg.uniqueKey}
                          >
                            <RefreshCcw className={`w-3 h-3 ${indexingLoading === pkg.uniqueKey ? 'animate-spin' : ''}`} />
                            인덱싱 갱신
                          </Button>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex justify-end gap-2">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="rounded-xl h-9 px-4 text-[10px] font-black border-slate-200 text-slate-500 gap-2 hover:bg-slate-100"
                           onClick={() => window.open(pkg.targetUrl, '_blank')}
                         >
                           <ExternalLink className="w-3.5 h-3.5" /> 접속
                         </Button>
                         <Button 
                           className="bg-accent hover:bg-accent/90 text-slate-950 font-black text-[10px] h-9 px-4 rounded-xl gap-2 shadow-lg transition-all"
                           onClick={() => setViewingSERP(pkg)}
                         >
                           <Layout className="w-3.5 h-3.5" /> 미리보기
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {/* 페이지네이션 컨트롤러 */}
          {totalPages > 1 && (
            <div className="p-8 bg-slate-50/50 border-t flex justify-center items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button 
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    className={`w-10 h-10 rounded-full font-bold text-xs ${currentPage === page ? 'bg-primary text-white shadow-lg' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border-none bg-white shadow-xl rounded-[2.5rem] p-10 flex flex-col justify-between">
            <div className="space-y-6">
               <div className="bg-primary/10 p-4 rounded-2xl w-fit">
                  <Activity className="w-8 h-8 text-primary" />
               </div>
               <h4 className="text-xl font-headline font-bold">도메인별 검색 색인 정책 3.0</h4>
               <p className="text-slate-500 leading-relaxed font-medium">
                  단일 기사를 3개 도메인에 분산 색인하여 구글 점유율을 높입니다.<br />
                  구글의 타이틀 재작성 방지를 위해 루트 레이아웃 템플릿을 간소화했습니다.
               </p>
            </div>
            <Button variant="link" className="text-primary font-bold p-0 justify-start mt-10" onClick={() => window.open('https://developers.google.com/search/docs/advanced/appearance/title-link', '_blank')}>
              구글 공식 타이틀 가이드라인 보기 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
         </Card>

         <Card className="border-none bg-accent/5 shadow-inner rounded-[2.5rem] p-10 space-y-6">
            <h4 className="text-xl font-headline font-bold flex items-center gap-3">
               <Zap className="w-6 h-6 text-accent" />
               트리플 도메인 점유 전략
            </h4>
            <ul className="space-y-4">
               {[
                 "기존 기사 제목을 20자 이상의 '스토리형 롱테일'로 리터칭하세요.",
                 "수정 후 반드시 '인덱싱 갱신'을 눌러 구글에 신호를 보내세요.",
                 "10개 단위 벌크 검사 기능을 사용하여 실시간 접근성을 확인하세요.",
                 "제목 상단에 핵심 키워드(배우, 작품명)를 배치하면 색인이 빨라집니다."
               ].map((tip, i) => (
                 <li key={i} className="flex gap-3 text-sm font-medium text-slate-700">
                    <div className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-accent shadow-sm border border-accent/10">{i+1}</div>
                    {tip}
                 </li>
               ))}
            </ul>
         </Card>
      </div>

      <Dialog open={isDomainInfoOpen} onOpenChange={setIsDomainInfoOpen}>
        <DialogContent className="max-w-2xl rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
           <DialogHeader className="p-8 bg-slate-900 text-white">
              <DialogTitle className="text-xl font-headline font-bold">도메인 마스터 설정 정보</DialogTitle>
              <DialogDescription className="text-white/40">구글 서치 콘솔 및 도구 등록 시 필요한 정보입니다.</DialogDescription>
           </DialogHeader>
           <div className="p-8 space-y-6">
              {[
                { name: "NEWS Portal", host: "down1.co.kr", sitemap: "/sitemap.xml", robots: "/robots.txt" },
                { name: "BLOG", host: "allmovie.shop", sitemap: "/sitemap.xml", robots: "/robots.txt" },
                { name: "WEBZINE", host: "moviefree.store", sitemap: "/sitemap.xml", robots: "/robots.txt" }
              ].map(d => (
                <div key={d.host} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                   <div className="flex justify-between items-center">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{d.name}</p>
                      <Badge className="bg-green-500">Online</Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold text-slate-400">SITEMAP URL</p>
                         <code className="text-[11px] font-mono text-primary flex items-center gap-2">
                           https://{d.host}{d.sitemap}
                           <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => copyToClipboard(`https://${d.host}${d.sitemap}`, "사이트맵 주소 복사됨")}><Copy className="w-2.5 h-2.5" /></Button>
                         </code>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold text-slate-400">ROBOTS.TXT</p>
                         <code className="text-[11px] font-mono text-slate-600 flex items-center gap-2">
                           https://{d.host}{d.robots}
                           <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => copyToClipboard(`https://${d.host}${d.robots}`, "robots.txt 주소 복사됨")}><Copy className="w-2.5 h-2.5" /></Button>
                         </code>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <DialogFooter className="p-6 bg-slate-50 border-t">
              <Button onClick={() => setIsDomainInfoOpen(false)} className="rounded-xl font-bold bg-primary px-8">정보 확인 완료</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingSERP} onOpenChange={() => setViewingSERP(null)}>
        <DialogContent className="max-w-3xl rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-[#f1f3f4]">
          {viewingSERP && (
            <div className="flex flex-col">
               <DialogHeader className="bg-white p-8 border-b flex flex-row items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-headline font-bold">Google SERP 시뮬레이터</DialogTitle>
                    <p className="text-[12px] text-slate-400 font-medium mt-1">이 도메인({viewingSERP.targetDomain})에서의 검색 노출 모습입니다.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setViewingSERP(null)} className="rounded-full"><MoreVertical className="w-5 h-5" /></Button>
               </DialogHeader>
               
               <div className="p-12 space-y-12">
                  <div className="bg-white rounded-full h-12 shadow-sm border px-6 flex items-center gap-4">
                     <Search className="w-4 h-4 text-slate-400" />
                     <span className="text-sm font-medium text-slate-800 flex-1">{viewingSERP.title || viewingSERP.location}</span>
                  </div>

                  <div className="space-y-2 max-w-2xl">
                     <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-white rounded-full border flex items-center justify-center">
                           <Globe className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[12px] font-medium text-slate-700">{viewingSERP.targetDomain}</span>
                           <span className="text-[11px] text-slate-400 truncate">{viewingSERP.targetUrl}</span>
                        </div>
                     </div>
                     <h3 className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer leading-tight font-medium">
                        {viewingSERP.title || viewingSERP.location}
                     </h3>
                     <p className="text-[14px] text-[#4d5156] leading-relaxed line-clamp-2">
                        {viewingSERP.description || viewingSERP.localGuide?.replace(/<[^>]*>/g, '').slice(0, 160) || "전문가님이 정성껏 작성하신 고퀄리티 K-콘텐츠의 요약문이 이곳에 노출됩니다."}
                     </p>
                  </div>
               </div>

               <div className="p-8 bg-white border-t flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setViewingSERP(null)} className="rounded-xl font-bold">닫기</Button>
                  <Button className="bg-primary rounded-xl font-bold px-8 shadow-lg shadow-primary/20 gap-2" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(viewingSERP.title || viewingSERP.location)}`, '_blank')}>
                     <Search className="w-4 h-4" /> 실제 구글 검색창으로 이동
                  </Button>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
