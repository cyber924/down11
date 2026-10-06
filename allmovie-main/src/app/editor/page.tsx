"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  PenTool, 
  CheckCircle2, 
  Sparkles, 
  FileCheck,
  History,
  Send,
  Loader2,
  AlertTriangle,
  Zap,
  MessageSquareShare
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { collaborateWithAgents, type MultiAgentOutput } from "@/ai/flows/multi-agent-collaboration-flow";
import { processIntelligentEdit } from "@/ai/flows/intelligent-editor-flow";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const agents = [
  { id: 'planner', name: '기획자', role: '구조 설계', color: 'bg-blue-500' },
  { id: 'writer', name: '작가', role: '창의적 서술', color: 'bg-purple-500' },
  { id: 'seo', name: 'SEO 전문가', role: '키워드 최적화', color: 'bg-green-500' },
  { id: 'fact', name: '팩트체커', role: '정보 검증', color: 'bg-orange-500' },
];

export default function EditorPage() {
  const [content, setContent] = useState("");
  const [instruction, setInstruction] = useState("");
  const [activeAgent, setActiveAgent] = useState('writer');
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [feedback, setFeedback] = useState<MultiAgentOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const handleIntelligentEdit = async () => {
    if (!instruction) {
      toast({ variant: "destructive", title: "지시사항 입력", description: "AI에게 무엇을 할지 알려주세요." });
      return;
    }
    setEditLoading(true);
    try {
      const result = await processIntelligentEdit({ 
        currentContent: content, 
        instruction 
      });
      setContent(result.updatedContent);
      setInstruction("");
      toast({ title: "지능형 편집 완료", description: result.agentComment });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "편집 오류", description: "AI와 대화하는 중 문제가 발생했습니다." });
    } finally {
      setEditLoading(false);
    }
  };

  const handleCollaborate = async () => {
    if (!content || content.length < 10) {
      toast({ variant: "destructive", title: "입력 부족", description: "분석을 위해 최소 10자 이상의 내용을 입력해주세요." });
      return;
    }
    setLoading(true);
    try {
      const result = await collaborateWithAgents({ content });
      setFeedback(result);
      toast({ title: "분석 리포트 완료", description: "4명의 에이전트가 상세 분석을 마쳤습니다." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "분석 실패", description: "에이전트 분석 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "로그인 필요", description: "저장하려면 먼저 로그인해주세요." });
      return;
    }
    if (!content) {
      toast({ variant: "destructive", title: "내용 없음", description: "저장할 내용이 없습니다." });
      return;
    }

    setSaveLoading(true);
    try {
      const docRef = await addDoc(collection(db, "packages"), {
        localGuide: content,
        location: "에디터 작업물",
        durationDays: 0,
        theme: "에디터 초안",
        accommodationIntro: "",
        travelItinerary: "",
        newsletterContent: "",
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      toast({ title: "보관함 저장 완료", description: "나의 보관함에 안전하게 저장되었습니다." });
      router.push(`/packages/${docRef.id}`);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "저장 오류", description: "보관함에 저장하는 중 문제가 발생했습니다." });
    } finally {
      setSaveLoading(false);
    }
  };

  const applySuggestion = (text: string) => {
    setContent(prev => text + "\n\n" + prev);
    toast({ title: "적용 완료", description: "작가 에이전트의 제안이 반영되었습니다." });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[calc(100vh-160px)]">
      <div className="xl:col-span-3 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-primary">지능형 멀티 에이전트 에디터</h1>
            <p className="text-muted-foreground text-[13px] font-medium">초안 생성부터 정밀 리터칭까지, AI 전문가 그룹과 대화하며 완성하세요.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-full h-9 px-4 text-[11px] font-bold">
              <History className="w-3.5 h-3.5" /> 버전 기록
            </Button>
            <Button 
              size="sm" 
              className="gap-2 bg-primary rounded-full h-9 px-6 text-[11px] font-bold shadow-lg shadow-primary/20"
              onClick={handleCollaborate}
              disabled={loading || !content}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              전문가 정밀 분석
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 shadow-xl border-none rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="border-b py-4 px-8 bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {agents.map(agent => (
                  <Avatar key={agent.id} className="border-2 border-white w-8 h-8">
                    <AvatarFallback className={`${agent.color} text-white text-[10px] font-bold`}>{agent.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-[12px] font-bold text-muted-foreground">지능형 에이전트 그룹 대기 중</span>
            </div>
            <div className="flex gap-4 text-[11px] font-bold text-muted-foreground/60 uppercase">
              <span>{content.length} characters</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative flex flex-col min-h-0">
            <Textarea 
              className="flex-1 p-10 md:p-14 text-[15px] border-none focus-visible:ring-0 resize-none leading-[1.8] font-body text-slate-700 bg-transparent"
              placeholder="하단 입력창에 '춘천 1박 2일 워케이션 초안 작성해줘'라고 말해보세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {/* AI Command Input Bar */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <div className="max-w-4xl mx-auto relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-all"></div>
                <div className="relative flex items-center gap-3 bg-white p-2 rounded-2xl border border-primary/20 shadow-lg">
                  <div className="pl-4">
                    <Zap className={`w-5 h-5 ${editLoading ? 'text-accent animate-pulse' : 'text-primary'}`} />
                  </div>
                  <Input 
                    className="flex-1 border-none focus-visible:ring-0 text-[14px] font-medium placeholder:text-muted-foreground/50 h-10"
                    placeholder="에이전트에게 지시하기 (예: 더 감성적으로 수정해줘, 초안 작성해줘...)"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleIntelligentEdit()}
                    disabled={editLoading}
                  />
                  <Button 
                    size="sm" 
                    className="rounded-xl h-10 px-6 bg-primary font-bold text-[12px] gap-2"
                    onClick={handleIntelligentEdit}
                    disabled={editLoading || !instruction}
                  >
                    {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareShare className="w-4 h-4" />}
                    실행
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-1 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col min-h-0 border-none rounded-[2rem] overflow-hidden shadow-2xl bg-white">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              에이전트 리포트
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            <div className="flex border-b bg-muted/30 p-1 mx-8 mb-4 rounded-xl">
              {agents.map(agent => (
                <button 
                  key={agent.id}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-tight transition-all rounded-lg ${activeAgent === agent.id ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/50'}`}
                  onClick={() => setActiveAgent(agent.id)}
                >
                  {agent.id}
                </button>
              ))}
            </div>
            <ScrollArea className="flex-1 p-8">
              {!feedback && !loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 pt-10">
                  <div className="p-4 bg-muted rounded-full">
                    <PenTool className="w-8 h-8" />
                  </div>
                  <p className="text-[12px] font-bold leading-relaxed">상단 '정밀 분석' 버튼을 누르면<br />전문가 그룹의 피드백이 생성됩니다.</p>
                </div>
              ) : loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse space-y-3">
                      <div className="h-3 w-1/4 bg-muted rounded-full"></div>
                      <div className="h-24 w-full bg-muted rounded-2xl"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {activeAgent === 'seo' && feedback && (
                    <div className="space-y-6">
                      <div className="bg-green-50 p-6 rounded-2xl border border-green-100 space-y-3">
                        <p className="text-[11px] font-bold text-green-800 flex items-center gap-2 uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" /> SEO 최적화 스코어: {feedback.seo.score}
                        </p>
                        <p className="text-[13px] text-green-700 leading-relaxed font-medium">{feedback.seo.advice}</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">누락 키워드</p>
                        <div className="flex flex-wrap gap-2">
                          {feedback.seo.keywordsMissing.map(kw => (
                            <Badge key={kw} variant="outline" className="text-[10px] px-3 border-green-200 text-green-700 font-bold">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeAgent === 'fact' && feedback && (
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 space-y-4">
                      <p className="text-[11px] font-bold text-orange-800 flex items-center gap-2 uppercase tracking-wider">
                        <FileCheck className="w-4 h-4" /> 정보 검증 결과
                      </p>
                      <div className="space-y-3">
                        {feedback.factChecker.warnings.map((w, idx) => (
                          <div key={idx} className="flex gap-2 text-[13px] text-orange-700 leading-relaxed font-medium">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeAgent === 'writer' && feedback && (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">작가적 통찰</p>
                        <p className="text-[13px] italic text-slate-600 leading-relaxed font-medium bg-muted/30 p-4 rounded-xl">"{feedback.writer.comment}"</p>
                      </div>
                      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 space-y-4 shadow-sm">
                        <p className="text-[10px] font-bold text-purple-800 uppercase tracking-widest">개선된 도입부 제안</p>
                        <p className="text-[14px] text-purple-900 leading-relaxed font-bold">
                          {feedback.writer.alternativeText}
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full h-10 text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-2"
                          onClick={() => applySuggestion(feedback.writer.alternativeText)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> 이 제안 적용하기
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeAgent === 'planner' && feedback && (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">구조적 피드백</p>
                        <p className="text-[13px] text-slate-700 leading-relaxed font-bold">{feedback.planner.analysis}</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">권장 콘텐츠 로드맵</p>
                        {feedback.planner.suggestions.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/40 border border-muted-foreground/5 group hover:border-primary/20 transition-all">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                            <span className="text-[12px] font-bold text-slate-700">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <div className="p-6 border-t bg-muted/10">
             <Button 
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-11 rounded-2xl shadow-lg shadow-accent/20"
              onClick={handleSave}
              disabled={saveLoading || !content}
             >
              {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "최종본 저장 및 보관함 이동"}
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
