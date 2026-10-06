'use server';
/**
 * @fileOverview 특정 지역의 미식 맛집 정보를 AI가 추천하는 Flow.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendGourmetDetailsInputSchema = z.object({
  location: z.string().describe('지역 이름'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('출력 언어'),
});
export type RecommendGourmetDetailsInput = z.infer<typeof RecommendGourmetDetailsInputSchema>;

const RecommendGourmetDetailsOutputSchema = z.object({
  shopName: z.string().describe('식당/카페명'),
  location: z.string().describe('상세 위치'),
  mainMenu: z.string().describe('대표 메뉴 및 가격대'),
  priceRange: z.string().describe('가격대 정보'),
  waitingInfo: z.string().describe('웨이팅 정보'),
  vibe: z.string().describe('분위기 및 특징'),
});
export type RecommendGourmetDetailsOutput = z.infer<typeof RecommendGourmetDetailsOutputSchema>;

export async function recommendGourmetDetails(input: RecommendGourmetDetailsInput): Promise<RecommendGourmetDetailsOutput> {
  return recommendGourmetDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendGourmetDetailsPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: RecommendGourmetDetailsInputSchema},
  output: {schema: RecommendGourmetDetailsOutputSchema},
  prompt: `당신은 대한민국 최고의 미식 평론가입니다. 
주어진 지역({{{location}}})에서 가장 평점이 높거나 로컬 사이에서 유명한 '찐 맛집' 또는 카페 하나를 선정하여 상세 데이터를 제공하세요.

가이드라인:
1. 대표 메뉴와 대략적인 가격, 그리고 웨이팅 앱(캐치테이블 등) 사용 여부를 구체적으로 알려주세요.
2. 식당의 분위기와 어떤 사람들에게 추천하는지(예: 혼밥, 데이트)를 명시하세요.
3. 언어: {{{language}}}`,
});

const recommendGourmetDetailsFlow = ai.defineFlow(
  {
    name: 'recommendGourmetDetailsFlow',
    inputSchema: RecommendGourmetDetailsInputSchema,
    outputSchema: RecommendGourmetDetailsOutputSchema,
  },
  async (input) => {
    const {output} = await withRetry(() => prompt(input));
    return output!;
  }
);
