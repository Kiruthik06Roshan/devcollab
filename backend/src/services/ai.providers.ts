export type AiProviderName = 'openai' | 'gemini' | 'mock';

export type AiPromptResult = {
  provider: AiProviderName;
  output: string;
};

export const aiProviders = {
  openai: 'openai',
  gemini: 'gemini',
  mock: 'mock'
} as const;