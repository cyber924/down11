'use server';
/**
 * @fileOverview 특정 지역의 대표 숙소 정보를 AI가 추천하여 폼 데이터를 생성하는 Flow.
 */

import {ai, withRetry} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendHotelDetailsInputSchema = z.object({
  location: z.string().describe('숙소 추천을 받을 지역 이름 (예: 제주, 부산 영도)'),
  language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko').describe('출력 언어'),
});
export type RecommendHotelDetailsInput = z.infer<typeof RecommendHotelDetailsInputSchema>;

const RecommendHotelDetailsOutputSchema = z.object({
  hotelName: z.string().describe('추천 호텔 이름'),
  location: z.string().describe('정확한 위치 주소'),
  wifiSpeed: z.string().describe('Wi-Fi 환경 정보'),
  meetingRooms: z.string().describe('회의실 정보'),
  surroundings: z.string().describe('주변 업무 환경'),
  amenities: z.string().describe('어메니티 정보'),
});
export type RecommendHotelDetailsOutput = z.infer<typeof RecommendHotelDetailsOutputSchema>;

export async function recommendHotelDetails(input: RecommendHotelDetailsInput): Promise<RecommendHotelDetailsOutput> {
  return recommendHotelDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendHotelDetailsPrompt',
  model: 'googleai/gemini-3.6-flash',
  input: {schema: RecommendHotelDetailsInputSchema},
  output: {schema: RecommendHotelDetailsOutputSchema},
  prompt: `당신은 대한민국 최고의 워케이션 숙소 전문 컨설턴트입니다. 
제공된 지역({{{location}}})에서 가장 대표적인 워케이션 친화적 호텔이나 숙소를 하나 선정하여 상세 데이터를 제공하세요.

가이드라인:
1. 실제로 존재하는 유명 숙소를 선정하세요.
2. 해당 숙소의 Wi-Fi, 회의실, 주변 카페 인프라 등 디지털 노마드에게 꼭 필요한 정보를 구체적으로 작성하세요.
3. 모든 내용은 지정된 언어({{{language}}})로 작성하세요.

지역: {{{location}}}
언어: {{{language}}}`,
});

const recommendHotelDetailsFlow = ai.defineFlow(
  {
    name: 'recommendHotelDetailsFlow',
    inputSchema: RecommendHotelDetailsInputSchema,
    outputSchema: RecommendHotelDetailsOutputSchema,
  },
  async (input) => {
    const {output} = await withRetry(() => prompt(input));
    return output!;
  }
);
