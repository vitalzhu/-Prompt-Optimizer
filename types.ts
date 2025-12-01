export interface CrispeState {
  context: string;
  role: string;
  instruction: string;
  specifics: string;
  process: string;
  example: string;
}

export const INITIAL_CRISPE_STATE: CrispeState = {
  context: '',
  role: '',
  instruction: '',
  specifics: '',
  process: '',
  example: '',
};

export interface GeneratedPrompts {
  en: string;
  cn: string;
}

export interface OptimizationResult {
  prompt: string;
  timestamp: number;
}

export type Language = 'en' | 'cn';
