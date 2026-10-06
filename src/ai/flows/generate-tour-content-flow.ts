'use server';
/**
 * @fileOverview 관광지 및 로컬 투어 전문 콘텐츠 생성 AI 에이전트.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTourContentInputSchema = z.object({
  tourName: z.string().describe('관광지 또는 투어 이름'),
  location: z.string().describe('위치'),
  accessibility: z.string().describe('접근성 및 교통편'),
  duration: z.string().describe('권장 소요 시간'),
  workspaceInfo: z.string().describe('주변 업무 가능 공간 (카페 등)'),
  highlights: z.string().describe('주요 하이라이트 및 포토존'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('출력 언어'),
});

const GenerateTourContentOutputSchema = z.object({
  title: z.string().describe('콘텐츠 제목'),
  introduction: z.string().describe('관광지 소개 HTML'),
  experienceGuide: z.string().describe('상세 경험 가이드 HTML'),
  digitalNomadTip: z.string().describe('디지털 노마드용 팁 HTML'),
  snsCaption: z.string().describe('SNS 홍보용 캡션'),
});

const prompt = ai.definePrompt({
  name: 'generateTourContentPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: GenerateTourContentInputSchema},
  output: {schema: GenerateTourContentOutputSchema},
  prompt: `당신은 글로벌 K-여행 명소 전문 도슨트입니다. 제공된 데이터를 바탕으로 관광지의 매력을 극대화한 가이드를 작성하세요.

가장 중요한 규칙: 리치 HTML 및 이모지
1. 문단은 <p> 태그로 감싸세요.
2. 강조 포인트는 <span class="text-accent" style="font-weight: 800; color: #0ea5e9;">태그를 사용하세요.</span>
3. 풍부한 이모지와 <strong> 태그를 활용하세요.
4. 요청된 언어({{{language}}})로 작성하세요.

---
[관광지 데이터]
이름: {{{tourName}}}
위치: {{{location}}}
접근성: {{{accessibility}}}
소요시간: {{{duration}}}
업무환경: {{{workspaceInfo}}}
하이라이트: {{{highlights}}}
---`,
});

export async function generateTourContent(input: z.infer<typeof GenerateTourContentInputSchema>) {
  const {output} = await withRetry(() => prompt(input));
  return output!;
}
