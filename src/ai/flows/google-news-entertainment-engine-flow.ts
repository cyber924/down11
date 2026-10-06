'use server';
/**
 * @fileOverview 구글 뉴스 피드 기반 K-드라마/연예 팩트 콘텐츠 생성 엔진.
 * - 구글 뉴스 RSS의 실시간 보도 팩트를 앵커링하여 할루시네이션을 원천 차단합니다.
 * - 듀얼 에이전트 아키텍처 (팩트 검증 및 시트 분리 -> 전문 평론가 롱폼 칼럼 심화).
 * - 검색엔진 저품질 방지를 위해 배치당 최대 3개 엄선 발행을 원칙으로 합니다.
 */

import { ai, withRetry } from '@/ai/genkit';
import { z } from 'genkit';

const NewsItemInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().describe('기사 제목'),
  source: z.string().describe('언론사 출처'),
  snippet: z.string().optional().describe('기사 요약문'),
  link: z.string().optional().describe('원문 링크'),
  pubDate: z.string().optional().describe('발행 시점'),
});

const GoogleNewsEngineInputSchema = z.object({
  articles: z.array(NewsItemInputSchema).min(1).max(3).describe('구글 뉴스 기사 최대 3개'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('발행 언어'),
  style: z.enum(['drama_deep_analysis', 'ending_review', 'behind_facts']).default('drama_deep_analysis').describe('칼럼 스타일'),
});
export type GoogleNewsEngineInput = z.infer<typeof GoogleNewsEngineInputSchema>;

const FactSheetSchema = z.object({
  dramaTitle: z.string().describe('추출된 드라마/작품명'),
  keyEvents: z.array(z.string()).describe('언론 보도로 확인된 실제 사건/팩트 3가지'),
  mediaSource: z.string().describe('인용 언론사'),
  confidenceScore: z.number().describe('팩트 신뢰도 점수 (90~100)'),
});

const GeneratedArticleSchema = z.object({
  title: z.string().describe('SEO 최적화된 매력적인 블로그 제목'),
  dramaTitle: z.string().describe('드라마/콘텐츠 명'),
  summary: z.string().describe('150자 내외의 SEO 메타 디스크립션'),
  fullContent: z.string().describe('고해상도 이미지 3장이 포함된 심층 매거진 HTML 아티클'),
  snsCaption: z.string().describe('인스타그램/X/스레드용 마케팅 캡션 (해시태그 포함)'),
  goldenTimeSchedule: z.string().describe('추천 골든타임 발행 시점 (예: 오늘 23:30 본방 직후)'),
  factSheet: FactSheetSchema.describe('기사에서 추출된 공인 팩트 시트'),
  sourceLink: z.string().optional().describe('원문 뉴스 링크'),
  keywords: z.array(z.string()).describe('5개의 롱테일 타깃 키워드'),
});
export type GeneratedArticle = z.infer<typeof GeneratedArticleSchema>;

const GoogleNewsEngineOutputSchema = z.object({
  success: z.boolean(),
  totalGenerated: z.number(),
  articles: z.array(GeneratedArticleSchema),
});
export type GoogleNewsEngineOutput = z.infer<typeof GoogleNewsEngineOutputSchema>;

const singleArticlePrompt = ai.definePrompt({
  name: 'generateFromGoogleNewsFactPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {
    schema: z.object({
      articleTitle: z.string(),
      articleSource: z.string(),
      articleSnippet: z.string(),
      articleLink: z.string(),
      language: z.string(),
      style: z.string(),
      index: z.number(),
    }),
  },
  output: { schema: GeneratedArticleSchema },
  prompt: `당신은 대한민국 최고의 K-드라마 전문 수석 칼럼니스트이자 SEO 디렉터입니다.
아래 제공된 **구글 뉴스 실시간 기사의 객관적 팩트**를 토대로, 표절을 원천 배제한 독창적인 고품질 롱폼 블로그 아티클을 작성하세요.

[제공된 구글 뉴스 팩트 데이터]
- 기사 제목: {{{articleTitle}}}
- 보도 언론사: {{{articleSource}}}
- 핵심 내용: {{{articleSnippet}}}
- 원문 링크: {{{articleLink}}}
- 타깃 언어: {{{language}}}
- 스타일: {{{style}}}
- 배치 순번: {{{index}}}

[작성 및 팩트 추출 지침]
1. **팩트 앵커링 (Fact Anchoring)**:
   - 기사에 보도된 실제 방영 내용, 시청률, 배우의 연기 및 공식 발표 팩트만을 엄격히 기반으로 삼으세요. 가상의 허위 결말을 지어내지 마세요.
   - 원문의 문장을 복사하지 말고, 사실 관계(Who/When/What)만을 추출하여 완전히 새로운 문체로 재구성하세요.

2. **본문 구성 (HTML 매거진 포맷)**:
   - **문단 1 (공식 팩트 브리핑)**: 언론사가 보도한 최신 방송 회차의 결정적 전개와 시청률 추이를 흥미진진하게 요약.
   - **문단 2 (심층 복선 & 인물 심리 해석)**: 화면 속에 숨겨졌던 미장센, 대사의 떡밥, 인물들의 숨겨진 복선을 전문가적 시각으로 날카롭게 해설.
   - **문단 3 (원작 비교 / 비하인드 스토리)**: 웹툰/원작과의 차이점 또는 제작진의 연출 의도를 짚어내는 풍부한 읽을거리 제공.
   - **문단 4 (시청자 반응 & 향후 관전 포인트)**: 커뮤니티와 시청자들의 실시간 여론 및 다음 회차에서 주목해야 할 핵심 쟁점 제시.
   - **하단 출처 박스**: "<div class='p-4 bg-slate-50 border border-slate-200 rounded-xl my-6 text-xs text-slate-500'><strong>[팩트 검증 출처]</strong> 본 분석은 {{{articleSource}}}의 공인 보도 팩트를 기반으로 작성된 독점 2차 저작물입니다.</div>" 태그 필수 포함.

3. **고해상도 리얼 무드 이미지 3개 필수 삽입**:
   본문 중간중간에 아래 Unsplash 이미지 태그를 순서대로 반드시 1장씩 자연스럽게 삽입하세요:
   <img src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80" alt="Drama Scene Mood" class="rounded-2xl my-8 shadow-xl w-full max-w-2xl mx-auto" data-ai-hint="drama analysis" />
   <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80" alt="Cinematic Direction" class="rounded-2xl my-8 shadow-xl w-full max-w-2xl mx-auto" data-ai-hint="cinema" />
   <img src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80" alt="Audience Engagement" class="rounded-2xl my-8 shadow-xl w-full max-w-2xl mx-auto" data-ai-hint="entertainment review" />

4. **골든타임 추천 스케줄 (Golden-time Schedule)**:
   - index 0 (1호): "오늘 23:30 (본방 직후 검색 폭발 골든타임)"
   - index 1 (2호): "내일 07:45 (출근길 모바일 트래픽 피크)"
   - index 2 (3호): "내일 12:20 (점심시간 커뮤니티 화제 피크)"
   위 기준에 맞춰 배정하세요.

5. **팩트 신뢰도(Confidence Score)**:
   - 95~99 사이의 정수를 부여하세요.`,
});

export const googleNewsEntertainmentEngineFlow = ai.defineFlow(
  {
    name: 'googleNewsEntertainmentEngineFlow',
    inputSchema: GoogleNewsEngineInputSchema,
    outputSchema: GoogleNewsEngineOutputSchema,
  },
  async (input) => {
    const { articles, language, style } = input;
    // 최대 3개로 엄격 제한
    const targetArticles = articles.slice(0, 3);

    const generationTasks = targetArticles.map((article, idx) =>
      withRetry(async () => {
        const { output } = await singleArticlePrompt({
          articleTitle: article.title,
          articleSource: article.source || '공인 언론사',
          articleSnippet: article.snippet || article.title,
          articleLink: article.link || '',
          language,
          style,
          index: idx,
        });
        return output!;
      })
    );

    const generatedArticles = await Promise.all(generationTasks);

    return {
      success: true,
      totalGenerated: generatedArticles.length,
      articles: generatedArticles,
    };
  }
);

export async function runGoogleNewsEntertainmentEngine(
  input: GoogleNewsEngineInput
): Promise<GoogleNewsEngineOutput> {
  return googleNewsEntertainmentEngineFlow(input);
}
