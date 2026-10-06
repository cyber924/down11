
'use server';
/**
 * @fileOverview K-엔터테인먼트 콘텐츠 생성 AI 에이전트.
 * Unsplash 리얼 이미지 시스템 적용.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOneClickEnterPackageInputSchema = z.object({
  title: z.string().describe('작품명 또는 주제'),
  category: z.enum(['drama', 'movie', 'show', 'vlog', 'tips']).describe('콘텐츠 카테고리'),
  theme: z.string().optional().describe('작품 정보 또는 팩트'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('콘텐츠 생성 언어'),
});
export type GenerateOneClickEnterPackageInput = z.infer<typeof GenerateOneClickEnterPackageInputSchema>;

const GenerateOneClickEnterPackageOutputSchema = z.object({
  title: z.string().describe('콘텐츠 제목'),
  fullContent: z.string().describe('하나의 구조로 길게 작성된 전체 매거진 스타일 HTML 콘텐츠'),
  snsCaption: z.string().describe('SNS(인스타그램, X) 홍보용 캡션'),
});
export type GenerateOneClickEnterPackageOutput = z.infer<typeof GenerateOneClickEnterPackageOutputSchema>;

export async function generateOneClickEnterPackage(
  input: GenerateOneClickEnterPackageInput
): Promise<GenerateOneClickEnterPackageOutput> {
  return generateOneClickEnterPackageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOneClickEnterPackagePrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: GenerateOneClickEnterPackageInputSchema},
  output: {schema: GenerateOneClickEnterPackageOutputSchema},
  prompt: `당신은 글로벌 라이프스타일 및 엔터테인먼트 전문 칼럼니스트입니다.
주제({{{title}}})와 카테고리({{{category}}})를 바탕으로 고품질의 롱폼 블로그 콘텐츠를 작성하세요.

가장 중요한 규칙: Unsplash 기반 고해상도 리얼 이미지 삽입
1. **이미지 3개 의무 삽입**: 글의 흐름에 맞춰 관련 무드 이미지를 다음 형식으로 반드시 삽입하세요:
   <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80" alt="Cinematic" class="rounded-2xl my-8 shadow-lg" data-ai-hint="cinema" />
   <img src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80" alt="Drama" class="rounded-2xl my-8 shadow-lg" data-ai-hint="drama" />
   <img src="https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80" alt="Broadcast" class="rounded-2xl my-8 shadow-lg" data-ai-hint="news" />
2. 모든 문단은 <p> 태그로 감싸고 핵심은 <span class="text-accent" style="font-weight: 800; color: #0ea5e9;">태그로 강조하세요.</span>
3. 잡지처럼 풍부한 이모지와 <strong> 태그를 활용하세요.

---
주제/제목: {{{title}}}
카테고리: {{{category}}}
입력 정보(팩트): {{#if theme}}{{{theme}}}{{else}}일반 분석{{/if}}
언어: {{{language}}}
---`,
});

const generateOneClickEnterPackageFlow = ai.defineFlow(
  {
    name: 'generateOneClickEnterPackageFlow',
    inputSchema: GenerateOneClickEnterPackageInputSchema,
    outputSchema: GenerateOneClickEnterPackageOutputSchema,
  },
  async (input) => {
    const {output} = await withRetry(() => prompt(input));
    return output!;
  }
);
