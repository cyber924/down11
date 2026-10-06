'use server';
/**
 * @fileOverview 멀티 에이전트 협업 분석을 위한 Genkit Flow.
 * 4가지 전문 에이전트(Planner, Writer, SEO, Fact-checker)가 콘텐츠를 분석합니다.
 */

import { ai, withRetry } from '@/ai/genkit';
import { z } from 'genkit';

const MultiAgentInputSchema = z.object({
  content: z.string().describe('분석할 워케이션 콘텐츠 내용입니다.'),
});
export type MultiAgentInput = z.infer<typeof MultiAgentInputSchema>;

const AgentFeedbackSchema = z.object({
  planner: z.object({
    analysis: z.string().describe('구조 분석 결과'),
    suggestions: z.array(z.string()).describe('구조 개선 제안'),
  }),
  writer: z.object({
    alternativeText: z.string().describe('더 나은 표현으로 다듬어진 텍스트'),
    comment: z.string().describe('작가의 조언'),
  }),
  seo: z.object({
    score: z.number().describe('SEO 점수 (0-100)'),
    keywordsMissing: z.array(z.string()).describe('누락된 핵심 키워드'),
    advice: z.string().describe('SEO 최적화 조언'),
  }),
  factChecker: z.object({
    warnings: z.array(z.string()).describe('검증이 필요한 정보 목록'),
    status: z.enum(['verified', 'needs_check', 'warning']).describe('신뢰도 상태'),
  }),
});
export type MultiAgentOutput = z.infer<typeof AgentFeedbackSchema>;

const prompt = ai.definePrompt({
  name: 'multiAgentCollaborationPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: { schema: MultiAgentInputSchema },
  output: { schema: AgentFeedbackSchema },
  prompt: `당신은 대한민국 최고의 워케이션 콘텐츠 전문가 그룹입니다. 
다음 콘텐츠를 4명의 전문가(기획자, 작가, SEO전문가, 팩트체커)가 각각의 시각에서 분석하여 리포트를 제출하세요.

---
[분석 대상 콘텐츠]
{{{content}}}
---

전문가별 분석 지침:
1. 기획자(Planner): 글의 구조가 논리적인지, 워케이션의 가치를 잘 전달하는지 분석하고 목차 개선안을 제안하세요.
2. 작가(Writer): 훨씬 더 감성적이고 몰입감 있는 도입부나 문장을 하나 제안하세요. (alternativeText 필드에 작성)
3. SEO전문가(SEO): 검색 최적화 상태를 점검하고, '디지털 노마드', '워케이션' 등 필수 키워드 누락 여부를 확인하세요.
4. 팩트체커(Fact-checker): 수치, 지역 정보, 시설 운영 시간 등 사실 확인이 필요한 부분을 찾아내세요.

모든 결과는 한국어로 작성하세요.`,
});

export async function collaborateWithAgents(input: MultiAgentInput): Promise<MultiAgentOutput> {
  const { output } = await withRetry(() => prompt(input));
  return output!;
}
