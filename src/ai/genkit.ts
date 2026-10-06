
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-3.6-flash',
});

/**
 * Helper function to retry AI operations that fail due to transient issues (503, 429).
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || '';
      const isTransient = 
        errorMessage.includes('503') || 
        errorMessage.includes('429') || 
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('high demand');
      
      if (!isTransient || i === retries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw lastError;
}
