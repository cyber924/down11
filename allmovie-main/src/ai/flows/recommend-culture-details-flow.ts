'use server';
/**
 * @fileOverview 특정 지역의 K-문화 체험(전시, 팝업 등) 정보를 AI가 추천하는 Flow.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendCultureDetailsInputSchema = z.object({
  location: z.string().describe('지역 이름'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('출력 언어'),
});
export type RecommendCultureDetailsInput = z.infer<typeof RecommendCultureDetailsInputSchema>;

const RecommendCultureDetailsOutputSchema = z.object({
  title: z.string().describe('체험 이름/제목'),
  location: z.string().describe('상세 위치'),
  description: z.string().describe('상세 설명'),
  photoZone: z.string().describe('포토존 및 하이라이트'),
  booking: z.string().describe('예약 및 티켓 정보'),
});
export type RecommendCultureDetailsOutput = z.infer<typeof RecommendCultureDetailsOutputSchema>;

export async function recommendCultureDetails(input: RecommendCultureDetailsInput): Promise<RecommendCultureDetailsOutput> {
  return recommendCultureDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendCultureDetailsPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: RecommendCultureDetailsInputSchema},
  output: {schema: RecommendCultureDetailsOutputSchema},
  prompt: `당신은 대한민국의 가장 트렌디한 문화 예술 에디터입니다. 
주어진 지역({{{location}}})에서 현재 가장 핫하거나 추천할 만한 전시회, 팝업 스토어, 또는 로컬 클래스 하나를 선정하여 상세 데이터를 제공하세요.

가이드라인:
1. 실제로 현재 진행 중이거나 곧 시작될 법한 트렌디한 장소를 선정하세요.
2. '인생샷'을 건질 수 있는 포토존 정보와 예약 팁을 구체적으로 명시하세요.
3. 언어: {{{language}}}`,
});

const recommendCultureDetailsFlow = ai.defineFlow(
  {
    name: 'recommendCultureDetailsFlow',
    inputSchema: RecommendCultureDetailsInputSchema,
    outputSchema: RecommendCultureDetailsOutputSchema,
  },
  async (input) => {
    const {output} = await withRetry(() => prompt(input));
    return output!;
  }
);
