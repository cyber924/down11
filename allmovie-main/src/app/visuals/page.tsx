
"use client"

import { useState, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Image as ImageIcon, 
  Sparkles, 
  RefreshCw,
  Layout,
  Instagram,
  Loader2,
  Library,
  Trash2,
  Copy,
  UploadCloud,
  FileImage
} from "lucide-react";
import { generateVisualAssetsForContent, type GenerateVisualAssetsForContentOutput } from "@/ai/flows/generate-visual-assets-for-content";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, deleteDoc, doc } from "firebase/firestore";

export default function VisualsPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<GenerateVisualAssetsForContentOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 인덱스 오류 방지를 위해 단순 쿼리만 사용
  const assetsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "visualAssets"), 
      where("createdBy", "==", user.uid)
    );
  }, [db, user]);

  const { data: rawAssets, loading: assetsLoading } = useCollection(assetsQuery);

  // 클라이언트 사이드에서 정렬 처리 (인덱싱 문제 해결)
  const assets = useMemo(() => {
    if (!rawAssets) return [];
    return [...rawAssets].sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [rawAssets]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const output = await generateVisualAssetsForContent({ topic, context });
      setResult(output);

      if (user) {
        const assetRef = collection(db, "visualAssets");
        await addDoc(assetRef, {
          topic,
          imageUrl: output.blogCoverImageUrl,
          assetType: "blogCover",
          createdBy: user.uid,
          createdAt: serverTimestamp()
        });
        await addDoc(assetRef, {
          topic,
          imageUrl: output.snsCardImageUrl,
          assetType: "snsCard",
          createdBy: user.uid,
          createdAt: serverTimestamp()
        });
      }

      toast({ title: "디자인 완료", description: "비주얼 에셋이 생성되어 보관함에 저장되었습니다." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "생성 실패", description: "현재 서비스 부하가 높습니다." });
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const compressedDataUrl = await compressImage(file);
      
      await addDoc(collection(db, "visualAssets"), {
        topic: file.name.split('.')[0] + " (직접 업로드)",
        imageUrl: compressedDataUrl,
        assetType: "blogCover",
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      toast({ 
        title: "업로드 및 압축 완료", 
        description: "이미지가 200KB 내외로 최적화되어 보관함에 저장되었습니다." 
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "업로드 실패", description: "이미지 처리 중 오류가 발생했습니다." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await deleteDoc(doc(db, "visualAssets", id));
      toast({ title: "삭제 완료" });
    } catch (error) {
      toast({ variant: "destructive", title: "삭제 실패" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-accent" />
            비주얼 에셋 디렉터
          </h1>
          <p className="text-muted-foreground font-medium text-[15px]">M-blog 에디터 전용 이미지 스튜디오입니다.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-full bg-accent hover:bg-accent/90 font-bold px-6 h-10 gap-2 shadow-lg shadow-accent/20"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            PC 이미지 업로드 (최적화)
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="bg-muted/40 p-1 rounded-2xl mb-8">
          <TabsTrigger value="generator" className="rounded-xl font-bold px-8">디자인 생성기</TabsTrigger>
          <TabsTrigger value="library" className="rounded-xl font-bold px-8 gap-2">
            <Library className="w-4 h-4" /> 이미지 보관함
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-none shadow-xl rounded-[2rem] bg-white">
              <CardHeader>
                <CardTitle className="font-headline font-bold text-lg">새 디자인 요청</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">메인 주제</Label>
                  <Input placeholder="예: 제주도 해변 워케이션" value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">스타일 (맥락)</Label>
                  <Input placeholder="예: 미니멀, 감성적인" value={context} onChange={(e) => setContext(e.target.value)} className="rounded-xl" />
                </div>
                <Button className="w-full h-12 bg-primary font-bold rounded-2xl gap-2 shadow-lg shadow-primary/20" onClick={handleGenerate} disabled={loading || !topic}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  M-blog 이미지 생성
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-8">
              {loading ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted">
                  <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-sm font-bold text-muted-foreground">M-blog 에디터가 이미지를 생성 중...</p>
                </div>
              ) : result ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-lg flex items-center gap-2 px-2">
                      <Layout className="w-5 h-5 text-primary" /> 블로그 헤더 (16:9)
                    </h3>
                    <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl">
                      <Image src={result.blogCoverImageUrl} alt="Blog Cover" fill className="object-cover" unoptimized />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-lg flex items-center gap-2 px-2">
                      <Instagram className="w-5 h-5 text-accent" /> SNS 카드 뉴스 (1:1)
                    </h3>
                    <div className="w-full max-w-sm relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl">
                      <Image src={result.snsCardImageUrl} alt="SNS Card" fill className="object-cover" unoptimized />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed p-10 text-center space-y-4">
                  <ImageIcon className="w-16 h-16 text-muted-foreground opacity-20" />
                  <p className="text-sm font-bold text-muted-foreground">왼쪽 폼에 주제를 입력하여 디자인을 시작하세요.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library">
          {assetsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : !user ? (
            <div className="text-center p-20 font-bold text-muted-foreground">로그인이 필요한 서비스입니다.</div>
          ) : assets.length === 0 ? (
            <div className="text-center p-20 border-2 border-dashed rounded-[2.5rem] bg-muted/10 flex flex-col items-center gap-4">
              <FileImage className="w-12 h-12 text-muted-foreground opacity-30" />
              <p className="font-bold text-muted-foreground">아직 보관된 이미지가 없습니다.</p>
              <Button variant="outline" className="rounded-full" onClick={() => fileInputRef.current?.click()}>이미지 첫 업로드하기</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {assets.map((asset: any) => (
                <Card key={asset.id} className="group relative aspect-square overflow-hidden rounded-2xl border-none shadow-md hover:shadow-xl transition-all">
                  <Image src={asset.imageUrl} alt={asset.topic} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <p className="text-white text-[10px] font-bold line-clamp-2 px-2">{asset.topic}</p>
                    <div className="flex gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => {
                        navigator.clipboard.writeText(asset.imageUrl);
                        toast({ title: "URL 복사 완료" });
                      }}><Copy className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDeleteAsset(asset.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <div className="bg-black/40 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                      {asset.topic.includes("업로드") ? 'UPLOAD' : asset.assetType === 'blogCover' ? 'BLOG' : 'SNS'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
