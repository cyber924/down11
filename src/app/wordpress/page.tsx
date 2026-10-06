
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Globe, 
  Settings2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  History,
  ShieldCheck,
  RefreshCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function WordPressPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          워드프레스 자동화 파이프라인
        </h1>
        <p className="text-muted-foreground">생성된 콘텐츠를 실시간으로 워드프레스에 등록하고 카테고리를 분류합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg border-accent/20">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline">연동 사이트 설정</CardTitle>
                <Badge className="bg-green-500">Connected</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>사이트 URL</Label>
                  <Input defaultValue="https://workation.korea.com" />
                </div>
                <div className="space-y-2">
                  <Label>API Application Password</Label>
                  <Input type="password" defaultValue="**** **** **** ****" />
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <Button className="bg-primary">설정 저장</Button>
                <Button variant="outline" className="gap-2"><RefreshCcw className="w-4 h-4" /> 연결 테스트</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">최근 자동 발행 로그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, title: "2024년 강원도 워케이션 센터 총정리", status: "success", time: "10분 전" },
                  { id: 2, title: "속초항 근처 가성비 숙소 TOP 5", status: "success", time: "1시간 전" },
                  { id: 3, title: "제주도 디지털 노마드 커뮤니티 가이드", status: "error", time: "3시간 전" },
                ].map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                      <span className="text-sm font-medium">{log.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                      <Button size="icon" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="w-full text-muted-foreground text-xs"><History className="w-3 h-3 mr-1" /> 전체 기록 보기</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                자동화 옵션
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>이미지 자동 업로드</Label>
                  <p className="text-[10px] text-muted-foreground">생성된 비주얼을 미디어 라이브러리에 저장</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>카테고리 AI 매칭</Label>
                  <p className="text-[10px] text-muted-foreground">주제에 따라 적절한 카테고리 자동 선택</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>예약 발행 모드</Label>
                  <p className="text-[10px] text-muted-foreground">검토 완료 후 지정된 시간에 자동 발행</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SNS 동시 포스팅</Label>
                  <p className="text-[10px] text-muted-foreground">발행 즉시 인스타그램/페이스북 공유</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold">보안 정책 가이드</span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">
                워드프레스 API 연동 시 'Application Password'를 사용하는 것을 권장합니다. 정기적으로 토큰을 갱신하여 보안을 강화하세요.
              </p>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs">보안 가이드 보기</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
