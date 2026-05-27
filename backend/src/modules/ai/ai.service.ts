import { aiService } from '../../services/ai.service.js';

export const moduleAiService = {
  taskBreakdown(prompt: string) {
    return aiService.generateTaskBreakdown(prompt);
  },
  sprintSummary(prompt: string) {
    return aiService.generateSprintSummary(prompt);
  },
  blockerDetection(prompt: string) {
    return aiService.detectBlockers(prompt);
  },
  standupReport(prompt: string) {
    return aiService.generateStandupReport(prompt);
  },
  codeReview(prompt: string) {
    return aiService.reviewCode(prompt);
  }
};