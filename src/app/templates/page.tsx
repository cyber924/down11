
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Map, 
  Gavel, 
  LayoutTemplate, 
  ArrowRight, 
  Info,
  HeartPulse,
  Palette,
  Utensils
} from "lucide-react";
import Link from "next/link";

const templates = [
  {
    id: "hotel",
    title: "호텔 & 숙박 시설",
    description: "워케이션 전용 객실, 코워킹 공간, 어메니티 등 상세 정보를 수집합니다.",
    icon: Building2,
    color: "text-blue-500",
    url: "/templates/hotel",
    fields: ["객실 Wi-Fi 속도", "회의실 예약 시스템", "주변 업무 환경"]
  },
  {
    id: "tour",
    title: "관광지 & 로컬 투어",
    description: "업무 전후에 즐기기 좋은 산책 코스 및 활동 정보를 구조화합니다.",
    icon: Map,
    color: "text-green-500",
    url: "/templates/tour",
    fields: ["접근성", "소요 시간", "작업하기 좋은 카페 정보"]
  },
  {
    id: "policy",
    title: "정부 및 지자체 정책",
    description: "워케이션 지원금, 바우처 정책, 대상자 조건 등을 명확하게 정리합니다.",
    icon: Gavel,
    color: "text-orange-500",
    url: "/templates/policy",
    fields: ["지원 대상", "신청 방법", "예산 규모"]
  },
  {
    id: "life",
    title: "생활 정보 & 꿀팁",
    description: "분리수거, 대중교통, 응급 상황 대처 등 로컬 생활 밀착형 정보를 수집합니다.",
    icon: HeartPulse,
    color: "text-rose-500",
    url: "/templates/life",
    fields: ["비상 연락처", "쓰레기 배출", "교통 이용 팁"]
  },
  {
    id: "culture",
    title: "K-문화 & 체험",
    description: "팝업 스토어, 전시회, 원데이 클래스 등 트렌디한 K-컬처 정보를 구조화합니다.",
    icon: Palette,
    color: "text-purple-500",
    url: "/templates/culture",
    fields: ["예약 방법", "운영 기간", "인스타 포토존"]
  },
  {
    id: "gourmet",
    title: "미식 & 로컬 맛집",
    description: "대표 메뉴, 웨이팅 꿀팁, 식단 옵션 등 정밀한 미식 데이터를 분석합니다.",
    icon: Utensils,
    color: "text-amber-500",
    url: "/templates/gourmet",
    fields: ["대표 메뉴", "웨이팅 시스템", "식단 옵션"]
  }
];

export default function TemplatesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
          <LayoutTemplate className="w-8 h-8 text-primary" />
          산업 특화 구조화 템플릿
        </h1>
        <p className="text-muted-foreground">업종별로 최적화된 입력 인터페이스를 통해 더 정확하고 전문적인 정보를 수집하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Link key={template.id} href={template.url}>
            <Card className="h-full flex flex-col hover:border-accent hover:shadow-lg transition-all cursor-pointer group rounded-[1.8rem] border-none shadow-md overflow-hidden bg-white">
              <CardHeader className="pb-4">
                <div className={`p-3 rounded-xl bg-muted/50 w-fit mb-4 group-hover:bg-accent/10 transition-colors`}>
                  <template.icon className={`w-6 h-6 ${template.color}`} />
                </div>
                <CardTitle className="font-headline font-bold text-lg">{template.title}</CardTitle>
                <CardDescription className="text-[12px] font-medium leading-relaxed">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">주요 데이터 필드</p>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.map(field => (
                      <Badge key={field} variant="secondary" className="text-[9px] font-bold px-2 py-0.5 bg-muted/50 border-none">{field}</Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex items-center text-[11px] font-bold text-primary group-hover:text-accent mt-auto">
                  이 템플릿 사용하기 <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-muted/30 border-dashed rounded-[1.5rem] border-2">
        <CardContent className="flex items-center justify-between p-8">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-full shadow-sm">
              <Info className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold">새로운 산업 템플릿이 필요한가요?</p>
              <p className="text-[12px] text-muted-foreground font-medium">우리 브랜드만의 전용 수집 템플릿을 AI에게 제안하고 생성할 수 있습니다.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full px-6 h-10 text-[11px] font-bold border-accent text-accent hover:bg-accent hover:text-white">
            커스텀 템플릿 제안
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
