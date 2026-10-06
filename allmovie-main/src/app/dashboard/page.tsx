
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Factory, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ArrowUpRight,
  BarChart3,
  Plane,
  Clapperboard,
  Sparkles,
  Eye,
  Database,
  TrendingUp,
  Layout,
  Globe
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function Dashboard() {
  const db = useFirestore();
  const { user } = useUser();
  
  // 전체 통계용 쿼리
  const statsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "packages"), where("createdBy", "==", user.uid));
  }, [db, user]);
  const { data: allItems } = useCollection(statsQuery);

  const stats = useMemo(() => {
    if (!allItems) return { total: 0, published: 0, draft: 0, views: 0 };
    return {
      total: allItems.length,
      published: allItems.filter((p: any) => p.status === 'published').length,
      draft: allItems.filter((p: any) => p.status === 'draft' || !p.status).length,
      views: allItems.reduce((acc: number, curr: any) => acc + (curr.views || 0), 0)
    };
  }, [allItems]);

  // 최신 리스트: 인덱스 문제 방지를 위해 단순 쿼리 후 클라이언트 정렬
  const latestPackages = useMemo(() => {
    if (!allItems) return [];
    return [...allItems]
      .sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      })
      .slice(0, 6);
  }, [allItems]);

  const loading = !allItems && !!user;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase tracking-widest px-2 py-0">Admin Center</Badge>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">/ Personal Realtime Engine</span>
          </div>
          <h1 className="text-2xl font-headline font-black text-slate-900 tracking-tighter">M-BLOG STUDIO DASHBOARD</h1>
          <p className="text-slate-400 font-medium text-[11px]">전문가님이 생성하신 K-콘텐츠의 생산과 배포를 실시간으로 관제합니다.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="px-3 py-1 bg-accent text-white text-[10px] font-black gap-1.5 shadow-lg shadow-accent/20">
            <Sparkles className="w-3 h-3" /> AGENT GROUP ACTIVE
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-2 bg-slate-900 text-white shadow-xl border-none rounded-3xl overflow-hidden group">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-[11px] font-black text-accent uppercase tracking-widest">
              <Database className="w-3.5 h-3.5" /> Total My Masterpieces
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex justify-between items-end">
            <div>
              <span className="text-5xl font-headline font-black tracking-tighter">{stats.total.toLocaleString()}</span>
              <p className="text-white/40 mt-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-accent" /> Cumulative Content Production
              </p>
            </div>
            <BarChart3 className="w-16 h-16 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="p-5 pb-1">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Published
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <span className="text-3xl font-headline font-black text-slate-800">{stats.published}</span>
            <p className="text-[9px] font-bold text-muted-foreground/60 mt-1 uppercase">Live on Domains</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="p-5 pb-1">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
              <Clock className="w-3 h-3 text-amber-500" /> Reviewing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <span className="text-3xl font-headline font-black text-slate-800">{stats.draft}</span>
            <p className="text-[9px] font-bold text-muted-foreground/60 mt-1 uppercase">Draft in Storage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Production Engines</h3>
            <Layout className="w-3 h-3 text-slate-300" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { href: "/package", label: "여행 패키지", icon: Zap, color: "text-accent", bg: "bg-accent/5", desc: "One-click Travel Guide" },
              { href: "/enter", label: "K-엔터 팩토리", icon: Clapperboard, color: "text-primary", bg: "bg-primary/5", desc: "Fact-based Drama Analysis" },
              { href: "/factory", label: "대량 생산 엔진", icon: Factory, color: "text-slate-800", bg: "bg-slate-100", desc: "Bulk Content Pipeline" }
            ].map((engine) => (
              <Link key={engine.href} href={engine.href}>
                <Card className="border-none shadow-sm hover:shadow-md hover:translate-x-1 transition-all group rounded-2xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`${engine.bg} p-2.5 rounded-xl group-hover:scale-110 transition-transform`}>
                        <engine.icon className={`w-5 h-5 ${engine.color}`} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">{engine.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{engine.desc}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-none rounded-3xl p-6 relative overflow-hidden">
             <div className="relative z-10 space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Global Reach</p>
                <h4 className="text-sm font-bold text-slate-800 leading-tight">트리플 도메인 전략으로<br />검색 점유율 300% 달성</h4>
                <Button asChild size="sm" variant="link" className="p-0 h-auto text-[11px] font-bold text-primary">
                  <Link href="/seo">SEO 관제센터 바로가기 →</Link>
                </Button>
             </div>
             <Globe className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/5" />
          </Card>
        </div>

        <Card className="lg:col-span-2 border-none shadow-md rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="p-6 border-b bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-headline font-bold flex items-center gap-2 text-slate-800">
                <FileText className="w-4 h-4 text-primary" />
                나의 최근 마스터피스
              </CardTitle>
              <CardDescription className="text-[10px] font-medium mt-0.5">전문가님이 제작하신 최신 기사 6건을 실시간 표시합니다.</CardDescription>
            </div>
            <Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-400">SYNCED</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Synchronizing DB...</p>
                </div>
              ) : latestPackages.map((item: any) => (
                <Link key={item.id} href={`/packages/${item.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-primary/10 transition-colors">
                      {['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(item.theme?.toUpperCase()) ? 
                        <Clapperboard className="w-4 h-4 text-primary" /> : 
                        <FileText className="w-4 h-4 text-slate-500" />
                      }
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{item.title || item.location}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-tight">{item.theme} • {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}</p>
                        <span className="flex items-center gap-1 text-[9px] font-black text-accent">
                          <Eye className="w-3 h-3" /> {item.views || 0}
                        </span>
                        {item.status === 'published' ? (
                           <Badge className="bg-green-100 text-green-600 border-none text-[8px] h-4 px-1.5 font-bold">LIVE</Badge>
                        ) : (
                           <Badge className="bg-amber-100 text-amber-600 border-none text-[8px] h-4 px-1.5 font-bold">DRAFT</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] font-black border-slate-100 text-slate-400 group-hover:border-primary/20 group-hover:text-primary transition-all">VIEW</Badge>
                  </div>
                </Link>
              ))}
              {!loading && latestPackages.length === 0 && (
                <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                  No Contents Found in My Cloud.
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-4 bg-slate-50/30 text-center border-t border-slate-50">
             <Button asChild variant="ghost" size="sm" className="text-[10px] font-black text-slate-400 hover:text-primary tracking-widest">
                <Link href="/packages">나의 보관함 전체보기 →</Link>
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
