import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';

// Ordered candidate list for high availability and future deprecation resilience
export const CANDIDATE_GEMINI_MODELS: string[] = [
  'gemini-3.6-flash',
  process.env.GEMINI_MODEL || '',
  'gemini-3.5-flash',
  'gemini-flash-latest',
].filter(Boolean);

/**
 * Executes generateContent trying candidate models in sequence.
 * If a model fails (e.g. 404 deprecated or temporarily unavailable),
 * it seamlessly advances to the next candidate model.
 */
export async function generateContentWithFallback(
  genAI: GoogleGenerativeAI,
  contents: Parameters<ReturnType<GoogleGenerativeAI['getGenerativeModel']>['generateContent']>[0]
): Promise<{ result: GenerateContentResult; modelName: string }> {
  let lastError: any = null;

  for (const modelName of CANDIDATE_GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(contents);
      return { result, modelName };
    } catch (err: any) {
      console.warn(`[GeminiHelper] Model '${modelName}' attempt failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
}

/**
 * Strips markdown code block wrappers (```json ... ```) safely.
 */
export function cleanJsonString(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}
