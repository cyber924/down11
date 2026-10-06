
'use client';

import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Plane, 
  Clapperboard, 
  Sparkles, 
  ArrowRight, 
  Play,
  Globe,
  LayoutGrid,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AuthDialog } from "@/components/auth-dialog";

export default function LandingPage() {
  const { user } = useUser();

  return (
    <div className="bg-white min-h-screen text-slate-900 font-body overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-[100] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-headline font-bold tracking-tighter text-primary italic">M-BLOG STUDIO</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <a href="#allmovie" className="hover:text-primary transition-colors">AllMovie Shop</a>
              <a href="#moviefree" className="hover:text-primary transition-colors">MovieFree Store</a>
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
            </nav>
            {user ? (
              <Button asChild className="rounded-full bg-primary font-black px-6 h-10 shadow-lg">
                <Link href="/dashboard" className="flex items-center gap-2">
                  GO TO DASHBOARD <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <AuthDialog />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <Badge className="bg-accent/10 text-accent border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full">
            AI 블로그 포스팅 원클릭 자동화 솔루션
          </Badge>
          <h1 
            id="hero-title"
            className="font-bold tracking-tight text-slate-900 max-w-2xl mx-auto"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)', lineHeight: '1.4' }}
          >
            지역 여행 가이드부터 워드프레스 발행까지,{" "}
            <span className="text-primary italic">원클릭 AI 콘텐츠 스튜디오</span>
          </h1>
          <p className="max-w-xl mx-auto text-slate-500 font-normal text-xs sm:text-sm leading-relaxed">
            국내 워케이션 숙소 추천부터 최신 K-드라마 회차별 복선 해석까지.
            4개 국어 번역과 이미지 에셋 생성, 워드프레스 자동 발행을 원클릭으로 완벽 처리합니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {["#AI여행블로그생성", "#워드프레스원클릭발행", "#국내워케이션숙소추천", "#최신K드라마복선해석"].map((tag) => (
              <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="sm" className="rounded-full bg-slate-900 text-white font-bold px-6 h-9 text-xs shadow hover:scale-105 transition-all">
              <Link href="/package">콘텐츠 생성 시작하기</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full border-slate-200 font-semibold px-6 h-9 text-xs hover:bg-slate-50">
              서비스 가이드 보기
            </Button>
          </div>
        </div>
      </section>

      {/* Domain Showcases */}
      <section id="allmovie" className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 order-2 lg:order-1">
            <div className="flex items-center gap-2">
              <div className="bg-[#E50914] p-1.5 rounded-md"><Clapperboard className="w-4 h-4 text-white" /></div>
              <span className="text-xs font-headline font-black text-[#E50914] tracking-widest italic uppercase">allmovie.shop</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#E50914] tracking-wider uppercase">EXCLUSIVE K-DRAMA DEEP ANALYSIS</p>
              <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight leading-snug text-slate-900">
                최신 K-드라마 복선 해석부터 미공개 결말 비하인드까지
              </h2>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              '신입사원 강회장'부터 '결혼의 완성'까지. 전 세계가 열광하는 최신 K-드라마의 회차별 숨은 복선과 촬영장 미공개 비하인드를 정밀 분석하여 독점 리포트를 생성합니다. 검색 의도를 정밀하게 관통하는 롱폼 아티클로 체류 시간과 오가닉 유입을 극대화하세요.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["최신K드라마해석", "회차별복선비하인드", "결말원작비교", "올무비팩트체크"].map(tag => (
                <Badge key={tag} variant="secondary" className="bg-red-50 text-[#E50914] border border-red-100 text-[10px] font-medium px-2 py-0.5">
                  #{tag}
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1 max-w-xs">
              <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-100">
                <p className="text-lg font-bold text-slate-900">98%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fact Accuracy</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-100">
                <p className="text-lg font-bold text-slate-900">2.5k+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Readers</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md order-1 lg:order-2">
            <Image 
              src="https://picsum.photos/seed/k-drama-hero/1200/900" 
              alt="K-Drama Analysis" 
              fill 
              className="object-cover"
              data-ai-hint="korean drama"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#E50914]/40 to-transparent" />
          </div>
        </div>
      </section>

      <section id="moviefree" className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
            <Image 
              src="https://picsum.photos/seed/k-travel-hero/1200/900" 
              alt="K-Travel Guide" 
              fill 
              className="object-cover"
              data-ai-hint="korean travel"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-accent p-1.5 rounded-md"><Zap className="w-4 h-4 text-white" /></div>
              <span className="text-xs font-headline font-black text-accent tracking-widest italic uppercase">moviefree.store</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-accent tracking-wider uppercase">PREMIUM K-WORKATION & LOCAL LIFESTYLE</p>
              <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight leading-snug text-slate-900">
                일과 쉼이 공존하는 국내 워케이션 숙소 & 로컬 미식 가이드
              </h2>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              디지털 노마드를 위한 전국의 감성 워케이션 숙소 추천부터 로컬 주민만 아는 숨은 미식 맛집, 지자체 한 달 살기 지원 정책까지. 독자들의 실질적인 탐색과 체류 니즈를 충족하는 고품격 라이프스타일 가이드를 대량으로 생산하고 관리합니다.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["국내워케이션숙소추천", "오션뷰작업카페코스", "지자체한달살기지원", "숨은로컬미식총정리"].map(tag => (
                <Badge key={tag} variant="secondary" className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-medium px-2 py-0.5">
                  #{tag}
                </Badge>
              ))}
            </div>
            <ul className="space-y-2 pt-1">
              {["글로벌 4개 국어 자동 번역", "이미지 에셋 자동 생성", "워드프레스 실시간 퍼블리싱"].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-800">
                  <div className="bg-accent/10 p-1 rounded-full"><Sparkles className="w-3 h-3 text-accent" /></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">Intelligent Workflow</h2>
            <p className="text-white/40 font-medium uppercase tracking-[0.2em] text-[10px]">M-BLOG STUDIO CORE FEATURES</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3 hover:bg-white/10 transition-colors">
              <div className="bg-accent p-2 w-fit rounded-lg"><LayoutGrid className="w-4 h-4 text-white" /></div>
              <h3 className="text-base font-bold tracking-tight">원클릭 여행·워케이션 패키지</h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed">지역과 테마만 입력하세요. AI가 최적 여정 코스, 감성 숙소, 검색 최적화(SEO) 본문 및 SNS 캡션을 한 번에 구성합니다.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3 hover:bg-white/10 transition-colors">
              <div className="bg-primary p-2 w-fit rounded-lg"><Globe className="w-4 h-4 text-white" /></div>
              <h3 className="text-base font-bold tracking-tight">광역 대량 콘텐츠 팩토리</h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed">광역 단체 및 지자체 산하 다국어 콘텐츠를 수백 개 단위로 대량 생산하고 워드프레스에 원클릭 동시 예약 발행합니다.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3 hover:bg-white/10 transition-colors">
              <div className="bg-pink-500 p-2 w-fit rounded-lg"><ShieldCheck className="w-4 h-4 text-white" /></div>
              <h3 className="text-base font-bold tracking-tight">4단계 멀티에이전트 검증</h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed">기획자, 전문 작가, SEO 키워드 분석가, 팩트체커 AI 에이전트가 교차 검증하여 고품질 롱테일 키워드와 검색 알고리즘 적합성을 보증합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="bg-primary p-1.5 rounded-lg">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-headline font-bold tracking-tighter text-primary">M-BLOG STUDIO</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              © 2024 M-BLOG STUDIO. ALL RIGHTS RESERVED.<br />
              POWERED BY GEMINI 3.6 FLASH.
            </p>
          </div>
          <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-900">
            <Link href="/blog" className="hover:text-primary transition-colors">BLOG</Link>
            <Link href="/webzine" className="hover:text-primary transition-colors">WEBZINE</Link>
            <Link href="/visuals" className="hover:text-primary transition-colors">STUDIO</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
