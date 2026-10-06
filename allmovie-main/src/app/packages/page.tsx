
"use client"

import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, doc, deleteDoc, updateDoc, serverTimestamp, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  ArrowRight, 
  Briefcase, 
  Building2, 
  Map as MapIcon, 
  Gavel,
  Trash2,
  AlertTriangle,
  HeartPulse,
  Palette,
  Utensils,
  Clapperboard,
  Edit3,
  Link as LinkIcon,
  Save,
  Loader2,
  X,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ITEMS_PER_PAGE = 12;

export default function PackagesListPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 인덱스 문제 방지를 위해 단순 쿼리 후 클라이언트 사이드에서 정렬
  const packagesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "packages"), 
      where("createdBy", "==", user.uid)
    );
  }, [db, user]);

  const { data: rawPackages, loading } = useCollection(packagesQuery);

  // 클라이언트 사이드에서 최신순 정렬
  const sortedPackages = useMemo(() => {
    if (!rawPackages) return [];
    return [...rawPackages].sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [rawPackages]);

  const totalPages = Math.ceil(sortedPackages.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedPackages.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedPackages, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [sortedPackages.length, totalPages, currentPage]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "packages", id));
      toast({ title: "삭제 완료", description: "콘텐츠가 보관함에서 영구 삭제되었습니다." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "삭제 오류" });
    }
  };

  const handleEditClick = (pkg: any) => {
    setEditingPkg({ ...pkg });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingPkg || !editingPkg.id) return;
    setIsUpdateLoading(true);
    try {
      const docRef = doc(db, "packages", editingPkg.id);
      await updateDoc(docRef, {
        location: editingPkg.location || "에디터 작업물",
        title: editingPkg.title || "",
        theme: editingPkg.theme || "General",
        localGuide: editingPkg.localGuide || "",
        externalLink: editingPkg.externalLink || "",
        youtubeUrl: editingPkg.youtubeUrl || "",
        updatedAt: serverTimestamp()
      });
      toast({ title: "수정 완료", description: "콘텐츠가 성공적으로 업데이트되었습니다." });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "수정 오류" });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const getThemeBadge = (theme: string) => {
    const themeUpper = theme?.toUpperCase() || "";
    if (['ENTERTAINMENT', 'DRAMA', 'MOVIE', 'SHOW'].includes(themeUpper)) {
      return (
        <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-none text-[10px] font-black gap-1.5 px-3 py-1 shadow-sm">
          <Clapperboard className="w-3 h-3" /> {themeUpper}
        </Badge>
      );
    }
    
    switch(themeUpper) {
      case 'HOTEL':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none text-[9px] font-bold gap-1 px-2 py-0.5"><Building2 className="w-3 h-3" /> 호텔/숙박</Badge>;
      case 'TOUR':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white border-none text-[9px] font-bold gap-1 px-2 py-0.5"><MapIcon className="w-3 h-3" /> 관광/명소</Badge>;
      case 'POLICY':
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none text-[9px] font-bold gap-1 px-2 py-0.5"><Gavel className="w-3 h-3" /> 정책/지원</Badge>;
      case 'LIFE':
        return <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none text-[9px] font-bold gap-1 px-2 py-0.5"><HeartPulse className="w-3 h-3" /> 생활/꿀팁</Badge>;
      case 'CULTURE':
        return <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-none text-[9px] font-bold gap-1 px-2 py-0.5"><Palette className="w-3 h-3" /> K-문화</Badge>;
      case 'GOURMET':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none text-[9px] font-bold gap-1 px-2 py-0.5"><Utensils className="w-3 h-3" /> 미식/맛집</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px] font-bold border-none uppercase px-2 py-0.5">{theme || "일반"}</Badge>;
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Briefcase className="w-16 h-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-headline font-bold">로그인이 필요합니다</h2>
        <p className="text-muted-foreground">생성한 패키지를 확인하려면 먼저 로그인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase tracking-widest px-2 py-0">Archive Master</Badge>
          </div>
          <h1 className="text-3xl font-headline font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-primary" />
            나의 마스터피스 보관함
          </h1>
          <p className="text-slate-400 font-medium text-[12px]">실시간으로 동기화된 전문가님의 전체 콘텐츠 리스트입니다.</p>
        </div>
        <div className="hidden md:flex gap-2">
          <Badge className="px-3 py-1 bg-accent text-white text-[10px] font-black gap-1.5 shadow-lg shadow-accent/20">
            <Sparkles className="w-3 h-3" /> {sortedPackages.length} ARTICLES IN CLOUD
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse bg-muted/50 h-[220px] rounded-[1.5rem]" />
          ))}
        </div>
      ) : sortedPackages.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-2 rounded-[2.5rem] bg-slate-50/50">
          <p className="text-slate-300 font-black uppercase tracking-widest text-sm">아직 생성된 콘텐츠가 없습니다.</p>
          <Button asChild className="mt-8 bg-primary rounded-full px-10 h-12 font-bold shadow-xl shadow-primary/20">
            <Link href="/package">첫 번째 패키지 생성하기</Link>
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentItems.map((pkg: any) => (
              <Card key={pkg.id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col rounded-[2rem] border-none shadow-sm bg-white relative hover:-translate-y-1">
                <CardHeader className="pb-2 pt-6 px-6">
                  <div className="flex justify-between items-start mb-3">
                    {getThemeBadge(pkg.theme)}
                    <div className="flex items-center gap-1">
                      {pkg.status === 'published' ? (
                        <div className="flex items-center gap-1 text-[9px] font-black text-green-500 uppercase tracking-tighter bg-green-50 px-1.5 py-0.5 rounded">
                           <CheckCircle2 className="w-2.5 h-2.5" /> LIVE
                        </div>
                      ) : (
                        <div className="text-[9px] font-black text-amber-500 uppercase bg-amber-50 px-1.5 py-0.5 rounded">
                           DRAFT
                        </div>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                        onClick={() => handleEditClick(pkg)}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border-none">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                              정말 삭제하시겠습니까?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              "{pkg.title || pkg.location}" 콘텐츠가 보관함에서 영구 삭제됩니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive hover:bg-destructive/90 rounded-xl"
                              onClick={() => handleDelete(pkg.id)}
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className="text-[16px] font-headline font-bold leading-[1.4] tracking-tight text-slate-800 group-hover:text-primary transition-colors line-clamp-2 min-h-[44px]">
                    {pkg.title || pkg.location}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase mt-1">
                    <Clock className="w-3 h-3" /> {pkg.createdAt?.toDate ? pkg.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 px-6 pb-6 flex flex-col mt-4">
                  <p className="text-[12px] text-slate-500 font-medium line-clamp-3 mb-6 leading-relaxed">
                    {pkg.localGuide?.replace(/<[^>]*>/g, '').slice(0, 120)}...
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {pkg.externalLink && <Badge variant="outline" className="text-[8px] font-black text-accent border-accent/20 px-1.5 py-0">CTA</Badge>}
                      {pkg.youtubeUrl && <Badge variant="outline" className="text-[8px] font-black text-rose-500 border-rose-100 px-1.5 py-0">VIDEO</Badge>}
                    </div>
                    <Button asChild size="sm" className="rounded-xl group-hover:bg-primary group-hover:text-white transition-all font-black text-[11px] h-8 px-4" variant="outline">
                      <Link href={`/packages/${pkg.id}`} className="flex items-center gap-1.5">
                        OPEN <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full w-9 h-9 border-slate-100 text-slate-400"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      className={`w-9 h-9 rounded-full font-black text-[11px] ${currentPage === page ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:text-primary'}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full w-9 h-9 border-slate-100 text-slate-400"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          )}
        </>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="p-8 bg-slate-900 text-white flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-headline font-bold flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-accent" /> 프로페셔널 퀵 에디트
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)} className="text-white hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></Button>
          </DialogHeader>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">기사 제목</Label>
                <Input 
                  value={editingPkg?.title || editingPkg?.location || ""} 
                  onChange={(e) => setEditingPkg({...editingPkg, title: e.target.value})}
                  className="rounded-xl h-11 border-slate-100 font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                  <Youtube className="w-4 h-4 text-rose-500" /> 유튜브 URL
                </Label>
                <Input 
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={editingPkg?.youtubeUrl || ""} 
                  onChange={(e) => setEditingPkg({...editingPkg, youtubeUrl: e.target.value})}
                  className="rounded-xl h-11 border-slate-100 text-[13px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                  <LinkIcon className="w-4 h-4 text-accent" /> 외부 링크 (CTA)
                </Label>
                <Input 
                  placeholder="https://m.filetori.com/?site=MKT1"
                  value={editingPkg?.externalLink || ""} 
                  onChange={(e) => setEditingPkg({...editingPkg, externalLink: e.target.value})}
                  className="rounded-xl h-11 border-slate-100 text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">본문 데이터 (Rich HTML)</Label>
              <Textarea 
                value={editingPkg?.localGuide || ""} 
                onChange={(e) => setEditingPkg({...editingPkg, localGuide: e.target.value})}
                className="h-full min-h-[320px] rounded-2xl text-[12px] leading-relaxed resize-none border-slate-100 bg-slate-50/50 p-6"
              />
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t flex justify-end gap-3">
            <Button variant="ghost" className="rounded-xl font-bold text-[12px]" onClick={() => setIsEditModalOpen(false)}>취소</Button>
            <Button 
              className="rounded-xl bg-primary font-black px-10 h-11 gap-2 shadow-xl shadow-primary/20 text-[12px] uppercase tracking-tighter"
              onClick={handleUpdate}
              disabled={isUpdateLoading}
            >
              {isUpdateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
