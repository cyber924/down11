'use server';
/**
 * @fileOverview 특정 지역의 실제 여행 지원 정책을 AI가 추천하는 Flow.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendPolicyDetailsInputSchema = z.object({
  location: z.string().describe('지역 이름'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('출력 언어'),
});

const RecommendPolicyDetailsOutputSchema = z.object({
  policyName: z.string().describe('실제 정책/사업 이름'),
  region: z.string().describe('지역'),
  target: z.string().describe('지원 대상'),
  benefits: z.string().describe('혜택 내용'),
  howToApply: z.string().describe('신청 방법'),
  deadline: z.string().describe('기한 정보'),
});

const prompt = ai.definePrompt({
  name: 'recommendPolicyDetailsPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: RecommendPolicyDetailsInputSchema},
  output: {schema: RecommendPolicyDetailsOutputSchema},
  prompt: `당신은 대한민국 지자체 여행 정책 전문가입니다. 
주어진 지역({{{location}}})에서 현재 시행 중인 실제 '워케이션 지원', '한 달 살기 지원', '관광 바우처' 등의 정책을 하나 선정하여 상세 데이터를 제공하세요.

가이드라인:
1. 실제로 보도되었거나 시행 중인 정책을 기반으로 하세요.
2. 혜택 금액이나 신청 자격을 구체적으로 명시하세요.
3. 언어: {{{language}}}`,
});

export async function recommendPolicyDetails(input: z.infer<typeof RecommendPolicyDetailsInputSchema>) {
  const {output} = await withRetry(() => prompt(input));
  return output!;
}
