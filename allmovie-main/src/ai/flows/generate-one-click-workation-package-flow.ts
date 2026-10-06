
'use server';
/**
 * @fileOverview K-여행 글로벌 콘텐츠 패키지 생성 AI 에이전트.
 * 다국어 지원 및 SNS 캡션 생성을 지원합니다.
 * Unsplash 리얼 이미지 시스템 적용.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOneClickWorkationPackageInputSchema = z.object({
  location: z.string().describe('여행 콘텐츠를 생성할 지역 이름입니다.'),
  durationDays: z.number().int().min(1).describe('여행 기간 (일수)입니다.'),
  theme: z.string().optional().describe('여행의 테마 (예: 워케이션, 식도락, 쇼핑, 역사 탐방, 힐링).'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('콘텐츠 생성 언어입니다.'),
});
export type GenerateOneClickWorkationPackageInput = z.infer<typeof GenerateOneClickWorkationPackageInputSchema>;

const GenerateOneClickWorkationPackageOutputSchema = z.object({
  localGuide: z.string().describe('지역 가이드 (명소, 쇼핑, 미식 포함). HTML 태그와 이모지 포함.'),
  accommodationIntro: z.string().describe('숙소 추천 및 인사이트. HTML 태그와 이모지 포함.'),
  travelItinerary: z.string().describe('상세 여행 코스. HTML 태그와 이모지 포함.'),
  newsletterContent: z.string().describe('마케팅용 뉴스레터 콘텐츠.'),
  snsCaption: z.string().describe('인스타그램/SNS용 캡션. 해시태그와 이모지 포함.'),
});
export type GenerateOneClickWorkationPackageOutput = z.infer<typeof GenerateOneClickWorkationPackageOutputSchema>;

export async function generateOneClickWorkationPackage(
  input: GenerateOneClickWorkationPackageInput
): Promise<GenerateOneClickWorkationPackageOutput> {
  return generateOneClickWorkationPackageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOneClickWorkationPackagePrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: GenerateOneClickWorkationPackageInputSchema},
  output: {schema: GenerateOneClickWorkationPackageOutputSchema},
  prompt: `당신은 대한민국 최고의 글로벌 여행 콘텐츠 전문가입니다. 사용자의 요청에 맞춰 지정된 언어로 최상의 여행 가이드를 작성하세요.

가장 중요한 규칙: 워드프레스 발행용 리치 HTML 구조 및 Unsplash 고해상도 리얼 이미지 삽입
1. 모든 콘텐츠는 반드시 요청된 언어({{{language}}})로 작성하세요.
2. 모든 문단은 <p> 태그로 감싸세요.
3. 주요 명소, 맛집은 <span class="text-accent" style="font-weight: 800; color: #0ea5e9;">태그로 감싸 강조하세요.</span>
4. **시각적 요소**: 콘텐츠 중간중간에 맥락과 어울리는 이미지를 다음 Unsplash 주소 형식으로 2~3개 반드시 삽입하세요: 
   <img src="https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80" alt="Korea Travel" class="rounded-2xl my-8 shadow-lg ai-generated-img" data-ai-hint="korean travel" />
   <img src="https://images.unsplash.com/photo-1538669715515-5c3758c07cb7?auto=format&fit=crop&w=800&q=80" alt="Seoul City" class="rounded-2xl my-8 shadow-lg ai-generated-img" data-ai-hint="seoul city" />
5. 풍부한 이모지(Emoji)와 <strong> 태그를 활용하세요.

---
[여행 콘텐츠 요청]
지역: {{{location}}}
기간: {{{durationDays}}}일
테마: {{#if theme}}{{{theme}}}{{else}}종합 여행{{/if}}
---

세부 지침:
1. 로컬 가이드: 지역의 정체성, 숨은 명소, 미식 정보를 매거진 스타일로 서술하세요.
2. 숙소 정보: 테마에 맞는 최적의 숙소를 추천하세요.
3. 여행 코스: 동선을 고려한 {{{durationDays}}}일 일정을 구성하세요.
4. SNS 캡션: 인스타그램 마케팅용 감성 캡션을 별도 작성하세요.`,
});

const generateOneClickWorkationPackageFlow = ai.defineFlow(
  {
    name: 'generateOneClickWorkationPackageFlow',
    inputSchema: GenerateOneClickWorkationPackageInputSchema,
    outputSchema: GenerateOneClickWorkationPackageOutputSchema,
  },
  async (input) => {
    const {output} = await withRetry(() => prompt(input));
    return output!;
  }
);
