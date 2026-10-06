'use server';
/**
 * @fileOverview 정부 및 지자체 여행 정책 전문 콘텐츠 생성 AI 에이전트.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePolicyContentInputSchema = z.object({
  policyName: z.string().describe('정책 또는 사업 이름'),
  region: z.string().describe('시행 지역'),
  target: z.string().describe('지원 대상 및 자격'),
  benefits: z.string().describe('주요 혜택 및 지원 내용'),
  howToApply: z.string().describe('신청 방법 및 절차'),
  deadline: z.string().describe('신청 기한'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('출력 언어'),
});

const GeneratePolicyContentOutputSchema = z.object({
  title: z.string().describe('콘텐츠 제목'),
  introduction: z.string().describe('정책 배경 소개 HTML'),
  benefitAnalysis: z.string().describe('혜택 요약 및 분석 HTML'),
  stepByStepGuide: z.string().describe('단계별 신청 가이드 HTML'),
  snsCaption: z.string().describe('SNS 홍보용 캡션'),
});

const prompt = ai.definePrompt({
  name: 'generatePolicyContentPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: GeneratePolicyContentInputSchema},
  output: {schema: GeneratePolicyContentOutputSchema},
  prompt: `당신은 대한민국 정책 전문 브리핑 에디터입니다. 
딱딱한 정부 정책을 여행객과 디지털 노마드들이 한눈에 이해할 수 있는 매력적인 가이드로 재구성하세요.

가장 중요한 규칙: 가독성 및 신뢰도
1. 문단은 <p> 태그로 감싸세요.
2. 지원 대상과 혜택 금액 등은 <span class="text-accent" style="font-weight: 800; color: #0ea5e9;">태그로 강조하세요.</span>
3. 풍부한 이모지와 <strong> 태그를 활용하세요.
4. 요청된 언어({{{language}}})로 작성하세요.

---
[정책 데이터]
정책명: {{{policyName}}}
지역: {{{region}}}
대상: {{{target}}}
혜택: {{{benefits}}}
절차: {{{howToApply}}}
기한: {{{deadline}}}
---`,
});

export async function generatePolicyContent(input: z.infer<typeof GeneratePolicyContentInputSchema>) {
  const {output} = await withRetry(() => prompt(input));
  return output!;
}
