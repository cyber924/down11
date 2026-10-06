'use server';
/**
 * @fileOverview 특정 지역의 생활 정보 및 꿀팁을 AI가 추천하는 Flow.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendLifeDetailsInputSchema = z.object({
  location: z.string().describe('지역 이름 (예: 서울 강남, 제주)'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('출력 언어'),
});
export type RecommendLifeDetailsInput = z.infer<typeof RecommendLifeDetailsInputSchema>;

const RecommendLifeDetailsOutputSchema = z.object({
  title: z.string().describe('가이드 제목'),
  region: z.string().describe('대상 지역'),
  essentials: z.string().describe('필수 생활 수칙 (분리수거 등)'),
  transport: z.string().describe('교통편 및 이동 팁'),
  emergency: z.string().describe('비상 연락 및 안전 정보'),
  tips: z.string().describe('로컬 생활 꿀팁'),
});
export type RecommendLifeDetailsOutput = z.infer<typeof RecommendLifeDetailsOutputSchema>;

export async function recommendLifeDetails(input: RecommendLifeDetailsInput): Promise<RecommendLifeDetailsOutput> {
  return recommendLifeDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendLifeDetailsPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: RecommendLifeDetailsInputSchema},
  output: {schema: RecommendLifeDetailsOutputSchema},
  prompt: `당신은 대한민국 로컬 생활 전문가입니다. 
주어진 지역({{{location}}})에서 외국인이나 초보 거주자에게 꼭 필요한 실용적인 생활 정보 하나를 선정하여 상세 데이터를 제공하세요.

가이드라인:
1. 해당 지역의 특수한 분리수거 규칙, 대중교통 특징, 비상시 연락처(현지 보건소 등)를 구체적으로 포함하세요.
2. 실질적으로 도움이 되는 '로컬 꿀팁'을 반드시 포함하세요.
3. 모든 내용은 지정된 언어({{{language}}})로 작성하세요.

지역: {{{location}}}
언어: {{{language}}}`,
});

const recommendLifeDetailsFlow = ai.defineFlow(
  {
    name: 'recommendLifeDetailsFlow',
    inputSchema: RecommendLifeDetailsInputSchema,
    outputSchema: RecommendLifeDetailsOutputSchema,
  },
  async (input) => {
    const {output} = await withRetry(() => prompt(input));
    return output!;
  }
);
