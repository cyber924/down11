
'use server';
/**
 * @fileOverview K-여행 콘텐츠 지능형 에디터 Flow.
 * Unsplash 리얼 이미지 시스템 적용.
 */

import { ai, withRetry } from '@/ai/genkit';
import { z } from 'genkit';

const IntelligentEditorInputSchema = z.object({
  currentContent: z.string().optional().describe('현재 작성된 내용입니다.'),
  instruction: z.string().describe('AI 지시사항 (예: "이미지 추가", "번역해줘", "다듬어줘").'),
});
export type IntelligentEditorInput = z.infer<typeof IntelligentEditorInputSchema>;

const IntelligentEditorOutputSchema = z.object({
  updatedContent: z.string().describe('수정된 리치 HTML 콘텐츠입니다.'),
  agentComment: z.string().describe('수정 사항에 대한 에이전트 코멘트.'),
});
export type IntelligentEditorOutput = z.infer<typeof IntelligentEditorOutputSchema>;

const prompt = ai.definePrompt({
  name: 'intelligentEditorPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: { schema: IntelligentEditorInputSchema },
  output: { schema: IntelligentEditorOutputSchema },
  prompt: `당신은 대한민국 최고의 여행 전문 에디터입니다. 사용자의 지시에 따라 콘텐츠를 지능적으로 수정하세요.

스타일 및 이미지 규칙:
1. 문단은 반드시 <p> 태그로 감싸세요.
2. 핵심 정보는 <span class="text-accent" style="font-weight: 800; color: #0ea5e9;">태그로 강조하세요.</span>
3. **이미지 삽입 요청 시**: 지시사항에 이미지를 넣어달라는 말이 있다면, 적절한 위치에 다음 Unsplash 태그를 삽입하세요:
   <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80" class="rounded-2xl my-8 shadow-lg ai-generated-img" data-ai-hint="modern magazine" /> 
4. 잡지처럼 풍부한 이모지를 사용하세요.

---
[현재 내용]
{{{currentContent}}}

[지시사항]
{{{instruction}}}
---`,
});

export async function processIntelligentEdit(input: IntelligentEditorInput): Promise<IntelligentEditorOutput> {
  const { output } = await withRetry(() => prompt(input));
  return output!;
}
