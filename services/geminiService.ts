import { CrispeState, Language, GeneratedPrompts } from "../types";

// This service is deprecated. Use webLlmService.ts instead.
// We keep the file to avoid breaking imports during refactoring, but remove the @google/genai dependency.

export const optimizePromptWithGemini = async (data: CrispeState, language: Language): Promise<GeneratedPrompts> => {
  console.warn("Gemini service is deprecated. Please use WebLLM service.");
  return { cn: "", en: "" };
};