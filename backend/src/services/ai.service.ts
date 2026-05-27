import { aiProviders, type AiProviderName, type AiPromptResult } from './ai.providers.js';

function makeResult(provider: AiProviderName, output: string): AiPromptResult {
  return { provider, output };
}

export const aiService = {
  getProvider(): AiProviderName {
    const provider = process.env.AI_PROVIDER as AiProviderName | undefined;
    return provider && provider in aiProviders ? provider : 'mock';
  },
  async generateTaskBreakdown(prompt: string) {
    return makeResult(this.getProvider(), `Task breakdown placeholder for: ${prompt}`);
  },
  async generateSprintSummary(prompt: string) {
    return makeResult(this.getProvider(), `Sprint summary placeholder for: ${prompt}`);
  },
  async detectBlockers(prompt: string) {
    return makeResult(this.getProvider(), `Blocker detection placeholder for: ${prompt}`);
  },
  async generateStandupReport(prompt: string) {
    return makeResult(this.getProvider(), `Standup report placeholder for: ${prompt}`);
  },
  async reviewCode(prompt: string) {
    return makeResult(this.getProvider(), `Code review placeholder for: ${prompt}`);
  }
};