'use server';
/**
 * @fileOverview 호텔 및 숙박 시설 전문 콘텐츠 생성 AI 에이전트.
 * 숙박 시설의 인프라 데이터를 바탕으로 전문적인 워케이션 리뷰를 생성합니다.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHotelContentInputSchema = z.object({
  hotelName: z.string().describe('호텔 또는 숙소의 이름'),
  location: z.string().describe('숙소 위치'),
  wifiSpeed: z.string().describe('객실 내 Wi-Fi 환경 및 속도'),
  meetingRooms: z.string().describe('회의실 및 워크스테이션 인프라'),
  surroundings: z.string().describe('주변 업무 환경 (카페, 공유 오피스 등)'),
  amenities: z.string().describe('업무 지원 어메니티'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('출력 언어'),
});
export type GenerateHotelContentInput = z.infer<typeof GenerateHotelContentInputSchema>;

const GenerateHotelContentOutputSchema = z.object({
  title: z.string().describe('콘텐츠 제목'),
  introduction: z.string().describe('숙소 소개 HTML'),
  infrastructureAnalysis: z.string().describe('업무 인프라 분석 HTML'),
  locationInsight: z.string().describe('주변 인프라 인사이트 HTML'),
  snsCaption: z.string().describe('인스타그램 홍보용 캡션'),
});
export type GenerateHotelContentOutput = z.infer<typeof GenerateHotelContentOutputSchema>;

export async function generateHotelContent(input: GenerateHotelContentInput): Promise<GenerateHotelContentOutput> {
  return generateHotelContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHotelContentPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: GenerateHotelContentInputSchema},
  output: {schema: GenerateHotelContentOutputSchema},
  prompt: `당신은 글로벌 프리미엄 숙박 시설 전문 에디터입니다. 제공된 데이터를 바탕으로 디지털 노마드와 워케이션 여행객을 위한 정밀 숙소 분석 리포트를 작성하세요.

가장 중요한 규칙: 워드프레스 최적화 리치 HTML
1. 모든 문단은 <p> 태그로 감싸세요.
2. 강조 포인트는 <span class="text-accent" style="font-weight: 800; color: #0ea5e9;">태그를 사용하세요.</span>
3. 풍부한 이모지와 <strong> 태그를 활용하세요.
4. 요청된 언어({{{language}}})로 작성하세요.

---
[숙소 데이터]
호텔명: {{{hotelName}}}
위치: {{{location}}}
Wi-Fi: {{{wifiSpeed}}}
회의실: {{{meetingRooms}}}
주변환경: {{{surroundings}}}
어메니티: {{{amenities}}}
---

작성 지침:
1. 도입부: 호텔의 전반적인 무드와 워케이션 장소로서의 가치를 감성적으로 서술하세요.
2. 인프라 분석: Wi-Fi, 회의실, 콘센트 위치 등 업무에 직결되는 하드웨어를 정밀 분석하세요.
3. 주변 인사이트: 퇴근 후 즐길 수 있는 로컬 카페나 업무하기 좋은 주변 장소를 추천하세요.
4. SNS 캡션: 인스타그램 마케팅용 캡션을 작성하세요.`,
});

const generateHotelContentFlow = ai.defineFlow(
  {
    name: 'generateHotelContentFlow',
    inputSchema: GenerateHotelContentInputSchema,
    outputSchema: GenerateHotelContentOutputSchema,
  },
  async (input) => {
    const {output} = await withRetry(() => prompt(input));
    return output!;
  }
);
