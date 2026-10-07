
'use server';
/**
 * @fileOverview K-여행 대량 콘텐츠 글로벌 팩토리 Flow.
 * 다국어 및 SNS 캡션 생성을 지원합니다.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const SubRegionInputSchema = z.object({
  name: z.string().describe('하위 지역의 이름'),
  description: z.string().describe('하위 지역에 대한 간략한 설명'),
  pointsOfInterest: z.array(z.string()).describe('주요 관광 명소'),
  localCuisine: z.array(z.string()).describe('대표 음식'),
  accommodationTypes: z.array(z.string()).describe('숙박 유형'),
  activities: z.array(z.string()).describe('활동'),
});

const BulkContentGenerationForRegionsInputSchema = z.object({
  parentRegionName: z.string().describe('광역 자치 단체 이름'),
  subRegions: z.array(SubRegionInputSchema).describe('하위 지역 정보'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('생성 언어'),
});
export type BulkContentGenerationForRegionsInput = z.infer<typeof BulkContentGenerationForRegionsInputSchema>;

const ContentPieceOutputSchema = z.object({
  subRegionName: z.string().describe('하위 지역명'),
  title: z.string().describe('콘텐츠 제목'),
  introduction: z.string().describe('도입부 HTML'),
  regionOverview: z.string().describe('개요 HTML'),
  accommodationGuide: z.string().describe('숙박 HTML'),
  travelCourseSuggestion: z.string().describe('코스 HTML'),
  localDelicacies: z.string().describe('미식 HTML'),
  keywords: z.array(z.string()).describe('핵심 키워드'),
  summaryForNewsletter: z.string().describe('뉴스레터 요약'),
  snsCaption: z.string().describe('SNS 마케팅 캡션'),
});

const BulkContentGenerationForRegionsOutputSchema = z.array(ContentPieceOutputSchema);
export type BulkContentGenerationForRegionsOutput = z.infer<typeof BulkContentGenerationForRegionsOutputSchema>;

const generateRegionContentPrompt = ai.definePrompt({
  name: 'generateRegionContentPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: SubRegionInputSchema.extend({parentRegionName: z.string(), language: z.string()})},
  output: {schema: ContentPieceOutputSchema},
  prompt: `당신은 글로벌 K-여행 전문 작가입니다. 주어진 정보를 바탕으로 지정된 언어({{{language}}})로 워드프레스 리치 HTML 콘텐츠를 작성하세요.

가장 중요한 규칙: HTML 구조 및 현지화
1. 모든 콘텐츠는 지정된 언어({{{language}}})로 작성하세요.
2. 문단은 <p> 태그로 감싸세요.
3. 핵심은 <span class="text-accent" style="font-weight: 800; color: #0ea5e9;">태그로 강조하세요.</span>
4. 풍부한 이모지를 사용하세요.
5. SNS 캡션 필드에는 해시태그를 포함한 마케팅 문구를 생성하세요.

---
지역 정보: {{{parentRegionName}}} - {{{name}}}
설명: {{{description}}}
언어: {{{language}}}
---`,
});

const bulkContentGenerationForRegionsFlow = ai.defineFlow(
  {
    name: 'bulkContentGenerationForRegionsFlow',
    inputSchema: BulkContentGenerationForRegionsInputSchema,
    outputSchema: BulkContentGenerationForRegionsOutputSchema,
  },
  async input => {
    const {parentRegionName, subRegions, language} = input;
    const generatedContents: z.infer<typeof ContentPieceOutputSchema>[] = [];

    for (const subRegion of subRegions) {
      const {output} = await withRetry(() => generateRegionContentPrompt({
        ...subRegion,
        parentRegionName,
        language,
      }));
      if (output) {
        generatedContents.push({...output, subRegionName: subRegion.name});
      }
    }
    return generatedContents;
  }
);

export async function bulkContentGenerationForRegions(
  input: BulkContentGenerationForRegionsInput
): Promise<BulkContentGenerationForRegionsOutput> {
  return bulkContentGenerationForRegionsFlow(input);
}
