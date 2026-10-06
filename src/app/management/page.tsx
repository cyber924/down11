
"use client"

import { useState, useMemo, useRef } from "react";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  UploadCloud, 
  Loader2, 
  CheckCircle2, 
  Filter,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ContentManagementPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("all");

  const packagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "packages"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: packages, loading: dataLoading } = useCollection(packagesQuery);

  const filteredPackages = useMemo(() => {
    if (selectedTheme === "all") return packages;
    const normalizedTarget = selectedTheme.toUpperCase();
    return packages.filter((p: any) => {
      const postTheme = p.theme?.toUpperCase() || "";
      if (normalizedTarget === 'GOURMET') return ['GOURMET', 'HOTEL', 'TOUR'].includes(postTheme);
      if (normalizedTarget === 'ENTERTAINMENT') return ['ENTERTAINMENT', 'DRAMA', 'MOVIE', 'SHOW'].includes(postTheme);
      return postTheme === normalizedTarget;
    });
  }, [packages, selectedTheme]);

  const handleDownloadTemplate = () => {
    const headers = ["Title", "Theme", "Language", "ContentHTML", "SNSCaption", "YouTubeURL", "ExternalLink"];
    
    // Sample 1: Rich K-Drama Content (3 Paragraphs, 3 Images)
    const sample1 = [
      "신입사원 강회장: 글로벌 1위의 비결 분석",
      "DRAMA",
      "ko",
      "<h3>전 세계를 사로잡은 K-드라마의 새로운 정점</h3><p>최근 글로벌 OTT 플랫폼에서 1위를 기록하며 화제가 되고 있는 '신입사원 강회장'은 기존의 기업 드라마 공식을 완전히 뒤엎는 파격적인 전개로 시청자들을 매료시키고 있습니다. 탄탄한 대본과 주연 배우들의 소름 돋는 연기 대결은 매회 숨 막히는 긴장감을 선사합니다.</p><img src=\"https://picsum.photos/seed/drama_a1/800/450\" class=\"rounded-2xl my-8 shadow-lg\" data-ai-hint=\"korean drama\" /><h3>입체적인 캐릭터와 현실적인 비즈니스 세계</h3><p>강회장의 카리스마 넘치는 경영 철학과 그에 맞서는 신입사원의 패기 있는 도전은 시청자들에게 카타르시스를 제공합니다. 단순한 성공 스토리가 아닌, 권력의 속성과 인간의 욕망을 깊이 있게 통찰한 결과물이기에 전 세계 팬들의 공감을 얻고 있습니다.</p><img src=\"https://picsum.photos/seed/drama_a2/800/450\" class=\"rounded-2xl my-8 shadow-lg\" data-ai-hint=\"business drama\" /><h3>비하인드 스토리와 영상 다시보기 안내</h3><p>촬영 현장에서의 화기애애한 분위기와는 정반대로 화면 속에서는 치열한 두뇌 싸움이 벌어지는 반전 매력이 이 작품의 백미입니다. 아직 이 전설적인 작품을 확인하지 못하셨다면 아래 버튼을 통해 바로 감상해 보시길 강력히 추천드립니다.</p><img src=\"https://picsum.photos/seed/drama_a3/800/450\" class=\"rounded-2xl my-8 shadow-lg\" data-ai-hint=\"drama set\" />",
      "#신입사원강회장 #K드라마 #영상다시보기 #드라마추천 #넷플릭스1위",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://m.filetori.com/?site=MKT1"
    ];

    // Sample 2: Rich K-Travel Content (3 Paragraphs, 3 Images)
    const sample2 = [
      "제주도 동쪽: 로컬들만 아는 숨은 미식 여행",
      "GOURMET",
      "ko",
      "<h3>제주도 동쪽의 숨겨진 보석, 로컬 미식 탐방</h3><p>관광객들로 붐비는 뻔한 명소에서 벗어나 제주의 진짜 맛을 느끼고 싶다면 동쪽 끝자락의 작은 마을들을 주목해야 합니다. 해녀들이 갓 잡아 올린 신선한 해산물과 수십 년간 한 자리를 지켜온 노포들의 깊은 맛은 여행의 격을 높여줍니다.</p><img src=\"https://picsum.photos/seed/travel_a1/800/450\" class=\"rounded-2xl my-8 shadow-lg\" data-ai-hint=\"jeju sea\" /><h3>인생 맛집으로 꼽히는 로컬 전복 죽과 성게 국</h3><p>특히 이곳에서만 맛볼 수 있는 진한 녹색의 전복 죽은 고소함의 극치를 달립니다. 정해진 수량이 소진되면 영업을 종료하는 배짱 있는 맛집들이 많으니 방문 전 운영 시간을 확인하는 것은 필수입니다. 로컬 주민들만이 아는 이용 꿀팁을 확인하세요.</p><img src=\"https://picsum.photos/seed/travel_a2/800/450\" class=\"rounded-2xl my-8 shadow-lg\" data-ai-hint=\"korean food\" /><h3>힐링과 맛을 동시에 잡는 완벽한 여행 코스</h3><p>식사 후 가볍게 걷기 좋은 올레길 코스와 파도 소리가 들리는 조용한 카페에서의 휴식은 워케이션족들에게 최고의 업무 효율을 선사합니다. 제주 동쪽의 매력을 담은 영상과 함께 더 자세한 정보를 확인하시려면 지금 바로 클릭하세요.</p><img src=\"https://picsum.photos/seed/travel_a3/800/450\" class=\"rounded-2xl my-8 shadow-lg\" data-ai-hint=\"jeju cafe\" />",
      "#제주도여행 #제주맛집 #영상다시보기 #미식여행 #워케이션",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://m.filetori.com/?site=MKT1"
    ];

    const escapeCSV = (text: string) => {
      if (!text) return "";
      const cleaned = text.replace(/[\r\n]+/g, " ");
      return `"${cleaned.replace(/"/g, '""')}"`;
    };
    
    const rows = [
      sample1.map(s => escapeCSV(s)).join(","),
      sample2.map(s => escapeCSV(s)).join(",")
    ];

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `m-blog-standard-form.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "표준 양식 다운로드 완료", description: "3문단, 3이미지가 포함된 고품질 샘플이 포함되었습니다." });
  };

  const handleUploadCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length <= 1) throw new Error("데이터가 없습니다.");
        
        const parseCSVLine = (line: string) => {
          const result = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current);
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current);
          return result;
        };

        const newRecords = lines.slice(1)
          .filter(line => line.trim())
          .map(line => parseCSVLine(line))
          .filter(record => record.length >= 2);

        const batch = writeBatch(db);
        newRecords.forEach((record: any) => {
          const docRef = doc(collection(db, "packages"));
          batch.set(docRef, {
            location: record[0] || "무제한 컨텐츠",
            theme: record[1] || "Bulk",
            language: record[2] || "ko",
            localGuide: record[3] || "",
            accommodationIntro: "",
            travelItinerary: "",
            snsCaption: record[4] || "",
            youtubeUrl: record[5] || "",
            externalLink: record[6] || "",
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            views: 0
          });
        });

        await batch.commit();
        toast({ title: "대량 신규 등록 성공", description: `${newRecords.length}개의 컨텐츠가 마스터 DB에 추가되었습니다.` });
      } catch (error: any) {
        console.error(error);
        toast({ variant: "destructive", title: "업로드 오류", description: "CSV 형식이 올바르지 않습니다." });
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Section: Professional & Compact */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
           <div className="bg-primary/10 p-2 rounded-xl">
              <Database className="w-5 h-5 text-primary" />
           </div>
           <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">
             컨텐츠 마스터 매니지먼트
           </h1>
        </div>
        
        <p className="text-slate-500 font-medium text-[13px] leading-relaxed max-w-2xl">
          표준 양식을 내려받아 대량의 마스터피스를 한 번에 신규 등록하세요. <br />
          내려받은 엑셀 파일의 양식에 맞춰 내용을 작성한 후 업로드하면 모든 데이터가 신규로 생성됩니다.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button 
            onClick={handleDownloadTemplate}
            variant="outline" 
            className="rounded-xl border-2 border-primary/10 text-primary font-bold px-5 h-10 gap-2 hover:bg-primary/5 transition-all text-xs"
          >
            <Download className="w-3.5 h-3.5" /> 표준 양식 다운로드 (고품질 샘플 포함)
          </Button>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleUploadCSV} 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl bg-accent hover:bg-accent/90 text-white font-bold px-6 h-10 gap-2 shadow-lg shadow-accent/10 text-xs"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            대량 신규 등록 (CSV 업로드)
          </Button>
        </div>
      </div>

      {/* Main Grid: Stacked vertical per request */}
      <div className="flex flex-col gap-8">
        {/* Top: Filter Section */}
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden max-w-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                <Filter className="w-3 h-3" /> 카테고리 필터
              </label>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="rounded-xl border-slate-100 h-11 font-bold text-slate-700 text-sm">
                  <SelectValue placeholder="모든 컨텐츠" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 컨텐츠</SelectItem>
                  <SelectItem value="Entertainment">엔터테인먼트 / 드라마</SelectItem>
                  <SelectItem value="Gourmet">미식 / 맛집 / 숙박</SelectItem>
                  <SelectItem value="TIPS">정보 & 꿀팁</SelectItem>
                  <SelectItem value="VLOG">일상 로그</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-black text-accent uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" /> 무조건 신규 등록 모드
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                업로드 시 모든 데이터는 <strong>새로운 고유 문서</strong>로 즉시 생성됩니다. 기존 데이터를 템플릿 삼아 대량 양산할 때 최적입니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom: Database Table */}
        <Card className="border-none shadow-md rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-8 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-headline font-bold">운영 데이터베이스</CardTitle>
              <CardDescription className="text-white/40 font-medium text-[11px]">마스터 DB에 {filteredPackages.length}개의 콘텐츠가 활성화됨</CardDescription>
            </div>
            <Badge className="bg-accent text-slate-950 font-black px-4 py-1.5 rounded-full text-[9px]">
              LIVE MASTER DB
            </Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-100">
                  <TableHead className="py-5 pl-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">컨텐츠 정보</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">테마</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">언어</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-right pr-8">등록일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
                         <p className="font-bold text-slate-300 uppercase tracking-[0.2em] text-[9px]">Syncing...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                         <FileSpreadsheet className="w-12 h-12 text-slate-100 mb-2" />
                         <p className="font-bold text-slate-300 uppercase tracking-widest text-[11px]">검색 결과 없음</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPackages.map((pkg: any) => (
                  <TableRow key={pkg.id} className="hover:bg-slate-50/30 transition-all border-b border-slate-50 group">
                    <TableCell className="py-6 pl-8">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[14px] text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{pkg.location}</span>
                        <span className="text-[9px] text-slate-300 font-medium tracking-tight font-mono">{pkg.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-[8px] font-black border-slate-200 text-slate-400 uppercase px-2 py-0.5">
                        {pkg.theme}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-[10px] font-black text-primary uppercase">{pkg.language || "ko"}</span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <span className="text-[10px] font-bold text-slate-400">
                        {pkg.createdAt?.toDate().toLocaleDateString('ko-KR')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
