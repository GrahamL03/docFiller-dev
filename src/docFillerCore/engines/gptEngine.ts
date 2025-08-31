import { DEFAULT_PROPERTIES } from '@utils/defaultProperties';
import { LLMEngineType } from '@utils/llmEngineTypes';
import type { QType } from '@utils/questionTypes';
import { MetricsManager } from '@utils/storage/metricsManager';
import {
  getSelectedProfileKey,
  loadProfiles,
} from '@utils/storage/profiles/profileManager';

// Simplified types for GPT-5 responses
type MagicPromptResponse = {
  subject_context: string;
  expertise_level: string;
  system_prompt: string;
};

// Logger for consistent error handling
const logger = {
  error: (message: string, error?: unknown) => {
    // biome-ignore lint/suspicious/noConsole: Error logging necessary for debugging
    console.error(`[LLMEngine] ${message}`, error);
  },
  info: (message: string, data?: unknown) => {
    // biome-ignore lint/suspicious/noConsole: Info logging for debugging
    console.log(`[LLMEngine] ${message}`, data || '');
  },
};

export class LLMEngine {
  private metricsManager = MetricsManager.getInstance();
  private readonly modelType = LLMEngineType.GPT5;

  constructor() {
    // No API key fetching needed - handled server-side
    logger.info('LLMEngine initialized for GPT-5 server-side processing');
  }

  /**
   * Main method to get LLM response through server-side API
   */
  public async getResponse(
    promptText: string,
    questionType: QType,
  ): Promise<LLMResponse | null> {
    const startTime = performance.now();

    try {
      // Get the system prompt from selected profile
      const selectedProfileKey = (await getSelectedProfileKey()).trim();
      const profiles = await loadProfiles();
      const systemPrompt =
        profiles[selectedProfileKey]?.system_prompt ??
        DEFAULT_PROPERTIES.defaultProfile.system_prompt;

      // Send request to your server-side API
      const response = await chrome.runtime.sendMessage({
        type: 'API_CALL',
        prompt: promptText,
        systemPrompt: systemPrompt,
        questionType: questionType,
        model: this.modelType,
      });

      if (!response) {
        throw new Error('No response received from server');
      }

      if (response?.error) {
        const errorMessage =
          typeof response.error === 'string'
            ? response.error
            : JSON.stringify(response.error);
        throw new Error(errorMessage);
      }

      // Track response time
      const endTime = performance.now();
      const responseTime = (endTime - startTime) / 1000;
      this.metricsManager.addResponseTime(responseTime);

      return response.value ?? null;
    } catch (error) {
      logger.error('Error getting LLM response:', error);
      return null;
    }
  }

  /**
   * Magic prompt generation for intelligent form analysis
   */
  async invokeMagicLLM(questions: string[]): Promise<MagicPromptResponse> {
    try {
      logger.info('Generating magic prompt for questions:', questions);

      const response = await chrome.runtime.sendMessage({
        type: 'MAGIC_PROMPT_GEN',
        questions: questions,
        model: this.modelType,
      });

      if (!response?.value) {
        throw new Error('No response received from magic prompt generation');
      }

      logger.info('Magic prompt generated successfully');
      return {
        subject_context: response.value.subject_context,
        expertise_level: response.value.expertise_level,
        system_prompt: response.value.system_prompt,
      };
    } catch (error) {
      logger.error('Error in magic prompt generation:', error);
      throw error;
    }
  }

  /**
   * Get the current model type (always GPT-5 for MVP)
   */
  public getModelType(): LLMEngineType {
    return this.modelType;
  }
}

// REMOVED FROM ORIGINAL:
// - All LangChain imports and dependencies
// - ChatOpenAI model instantiation
// - API key fetching and management (getChatGptApiKey)
// - Complex parser logic (moved to server-side)
// - invokeLLM method (redundant with getResponse)
// - getMagicResponse method (simplified to invokeMagicLLM)
// - patchResponse method (handled server-side)
// - getParser method (moved to server-side)
// - All Zod schema definitions (handled server-side)
// - LangChain prompt templates and chains
// - Direct OpenAI API calls
