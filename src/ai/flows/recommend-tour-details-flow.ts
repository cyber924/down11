'use server';
/**
 * @fileOverview 특정 지역의 명소 정보를 AI가 추천하는 Flow.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendTourDetailsInputSchema = z.object({
  location: z.string().describe('지역 이름'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('출력 언어'),
});

const RecommendTourDetailsOutputSchema = z.object({
  tourName: z.string().describe('추천 명소 이름'),
  location: z.string().describe('상세 위치'),
  accessibility: z.string().describe('교통편 정보'),
  duration: z.string().describe('권장 소요 시간'),
  workspaceInfo: z.string().describe('주변 업무 가능 공간'),
  highlights: z.string().describe('주요 하이라이트'),
});

const prompt = ai.definePrompt({
  name: 'recommendTourDetailsPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: RecommendTourDetailsInputSchema},
  output: {schema: RecommendTourDetailsOutputSchema},
  prompt: `당신은 대한민국 대표 로컬 여행 가이드입니다. 
주어진 지역({{{location}}})에서 가장 인기가 높거나 숨겨진 보석 같은 관광지 하나를 선정하여 상세 데이터를 제공하세요.

지역: {{{location}}}
언어: {{{language}}}`,
});

export async function recommendTourDetails(input: z.infer<typeof RecommendTourDetailsInputSchema>) {
  const {output} = await withRetry(() => prompt(input));
  return output!;
}
