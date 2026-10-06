
'use server';
/**
 * @fileOverview 엔터테인먼트 대량 콘텐츠 팩토리 2.0 Flow.
 * Unsplash 고해상도 이미지 시스템 적용.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const BulkEnterInputSchema = z.object({
  category: z.enum(['drama', 'movie', 'show', 'vlog', 'tips']).describe('콘텐츠 카테고리'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('생성 언어'),
  facts: z.array(z.string()).optional().describe('드라마/무비/예능용 팩트 리스트 (최대 3개)'),
  mainTopic: z.string().optional().describe('일상/정보용 메인 주제'),
});
export type BulkEnterInput = z.infer<typeof BulkEnterInputSchema>;

const SingleContentOutputSchema = z.object({
  title: z.string().describe('SEO 최적화 기사 제목'),
  description: z.string().describe('SEO용 요약 설명 (스니펫)'),
  fullContent: z.string().describe('이미지 3장이 포함된 3문단 이상의 리치 HTML 본문 (최소 15문장 이상)'),
  snsCaption: z.string().describe('마케팅용 SNS 캡션'),
});

const BulkEnterOutputSchema = z.array(SingleContentOutputSchema);
export type BulkEnterOutput = z.infer<typeof BulkEnterOutputSchema>;

const prompt = ai.definePrompt({
  name: 'bulkEnterPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {
    schema: z.object({
      category: z.string(), 
      language: z.string(), 
      factOrTopic: z.string(),
      id: z.string()
    })
  },
  output: {schema: SingleContentOutputSchema},
  prompt: `당신은 대한민국 최고의 엔터테인먼트 및 라이프스타일 전문 에디터입니다.
주어진 정보({{{factOrTopic}}})를 바탕으로 지정된 언어({{{language}}})로 압도적인 퀄리티의 매거진 아티클을 작성하세요.

가장 중요한 규칙: 고해상도 리얼 이미지 삽입 및 롱폼 초압축
1. **이미지 3개 의무 삽입**: 문단 사이사이에 반드시 다음 Unsplash 이미지 태그를 삽입하세요. (데이터의 무결성을 위해 아래 URL 구조를 엄수하세요):
   <img src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80" class="rounded-2xl my-10 shadow-xl" data-ai-hint="drama" />
   <img src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80" class="rounded-2xl my-10 shadow-xl" data-ai-hint="movie" />
   <img src="https://images.unsplash.com/photo-1553163147-622ab57b682c?auto=format&fit=crop&w=800&q=80" class="rounded-2xl my-10 shadow-xl" data-ai-hint="entertainment" />
2. **압도적인 분량**: 각 문단은 최소 7문장 이상의 상세한 분석을 담아야 합니다.
3. 문단은 반드시 <p> 태그로 감싸고 핵심 문구는 <span class="text-accent" style="font-weight: 800; color: #0ea5e9;">태그로 강조하세요.</span>
4. 풍부한 이모지를 활용하세요.

---
카테고리: {{{category}}}
정보/주제: {{{factOrTopic}}}
언어: {{{language}}}
---`,
});

const bulkEnterFlow = ai.defineFlow(
  {
    name: 'bulkEnterFlow',
    inputSchema: BulkEnterInputSchema,
    outputSchema: BulkEnterOutputSchema,
  },
  async input => {
    const {category, language, facts, mainTopic} = input;
    const results: BulkEnterOutput = [];

    if (['drama', 'movie', 'show'].includes(category) && facts) {
      const validFacts = facts.slice(0, 3).filter(f => f.trim() !== "");
      const generationPromises = validFacts.map((fact, idx) => 
        withRetry(() => prompt({
          category, 
          language, 
          factOrTopic: fact,
          id: `fact_${idx}_${Date.now()}`
        }))
      );
      const outputs = await Promise.all(generationPromises);
      for (const res of outputs) {
        if (res.output) results.push(res.output);
      }
    } else if (mainTopic) {
      const {text: subtopicsText} = await ai.generate({
        prompt: `메인 주제 '${mainTopic}'를 바탕으로 독자의 호기심을 자극하는 서로 다른 구체적인 3개의 소주제를 리스트 형태로 나열하세요. (예: 1. 소주제1\n2. 소주제2\n3. 소주제3)`,
      });
      const subtopics = subtopicsText.split('\n').filter(line => line.match(/^\d\./)).map(line => line.replace(/^\d\.\s*/, '')).slice(0, 3);
      const generationPromises = subtopics.map((subtopic, idx) => 
        withRetry(() => prompt({
          category, 
          language, 
          factOrTopic: subtopic,
          id: `topic_${idx}_${Date.now()}`
        }))
      );
      const outputs = await Promise.all(generationPromises);
      for (const res of outputs) {
        if (res.output) results.push(res.output);
      }
    }
    return results;
  }
);

export async function bulkGenerateEnterContent(input: BulkEnterInput): Promise<BulkEnterOutput> {
  return bulkEnterFlow(input);
}
