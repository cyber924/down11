'use server';
/**
 * @fileOverview This file provides a Genkit flow for generating visual assets (blog cover and SNS card images) based on text content.
 *
 * - generateVisualAssetsForContent - A function that handles the visual asset generation process.
 * - GenerateVisualAssetsForContentInput - The input type for the generateVisualAssetsForContent function.
 * - GenerateVisualAssetsForContentOutput - The return type for the generateVisualAssetsForContent function.
 */

import { ai, withRetry } from '@/ai/genkit';
import { z } from 'zod';

const GenerateVisualAssetsForContentInputSchema = z.object({
  topic: z.string().describe('The main topic or title of the content.'),
  context: z.string().describe('Additional context or details about the content for visual asset generation.'),
});
export type GenerateVisualAssetsForContentInput = z.infer<typeof GenerateVisualAssetsForContentInputSchema>;

const GenerateVisualAssetsForContentOutputSchema = z.object({
  blogCoverImageUrl: z.string().describe('The data URI of the generated blog cover image.'),
  snsCardImageUrl: z.string().describe('The data URI of the generated SNS card news image.'),
});
export type GenerateVisualAssetsForContentOutput = z.infer<typeof GenerateVisualAssetsForContentOutputSchema>;

export async function generateVisualAssetsForContent(input: GenerateVisualAssetsForContentInput): Promise<GenerateVisualAssetsForContentOutput> {
  return generateVisualAssetsForContentFlow(input);
}

const generateVisualAssetsForContentFlow = ai.defineFlow(
  {
    name: 'generateVisualAssetsForContentFlow',
    inputSchema: GenerateVisualAssetsForContentInputSchema,
    outputSchema: GenerateVisualAssetsForContentOutputSchema,
  },
  async (input) => {
    const blogCoverPromptText = `Create a visually appealing and professional blog cover image. The main topic is '${input.topic}'. Additional context: '${input.context}'. The image should be eye-catching and relevant to a workation content studio, possibly incorporating elements of travel, work, and creativity. Focus on a 16:9 aspect ratio suitable for a blog header.`;
    const snsCardPromptText = `Design a minimalist and engaging social media card image suitable for SNS news. The main topic is '${input.topic}'. Additional context: '${input.context}'. The image should be concise, convey the essence of a workation, and be optimized for mobile viewing, possibly with a 1:1 aspect ratio.`;

    // Generate blog cover image with Gemini 2.5 Flash Image
    const blogCoverResponse = await withRetry(() => ai.generate({
      model: 'googleai/gemini-3.6-flash-image',
      prompt: blogCoverPromptText,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }));
    const blogCoverImageUrl = blogCoverResponse.media?.url;
    if (!blogCoverImageUrl) {
      throw new Error('Failed to generate blog cover image.');
    }

    // Generate SNS card image with Gemini 2.5 Flash Image
    const snsCardResponse = await withRetry(() => ai.generate({
      model: 'googleai/gemini-3.6-flash-image',
      prompt: snsCardPromptText,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }));
    const snsCardImageUrl = snsCardResponse.media?.url;
    if (!snsCardImageUrl) {
      throw new Error('Failed to generate SNS card image.');
    }

    return {
      blogCoverImageUrl: blogCoverImageUrl,
      snsCardImageUrl: snsCardImageUrl,
    };
  }
);
