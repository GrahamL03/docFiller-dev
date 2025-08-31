import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import type { LLMEngineType } from '@utils/llmEngineTypes';
import type { QType } from '@utils/questionTypes';
import { MetricsManager } from '@utils/storage/metricsManager';

// Updated message interfaces to match new LLMEngine
interface ApiCallMessage {
  type: 'API_CALL';
  prompt: string;
  systemPrompt: string;
  questionType: QType;
  model: LLMEngineType;
}

interface MagicPromptMessage {
  type: 'MAGIC_PROMPT_GEN';
  questions: string[];
  model: LLMEngineType;
}

// Simple logger for consistent error handling
const logger = {
  error: (message: string, error?: unknown) => {
    // biome-ignore lint/suspicious/noConsole: Error logging necessary for debugging
    console.error(`[Background Script] ${message}`, error);
  },
  info: (message: string) => {
    // biome-ignore lint/suspicious/noConsole: Info logging for extension lifecycle
    console.log(`[Background Script] ${message}`);
  },
};

// Initialize metrics on extension install
chrome.runtime.onInstalled.addListener(async () => {
  try {
    await MetricsManager.getInstance().getMetrics();
    logger.info('Extension installed and metrics initialized');
  } catch (error) {
    logger.error('Failed to initialize metrics:', error);
  }
});

// Single LLM engine instance (reused for performance)
let llmEngine: LLMEngine | null = null;

function getLLMEngine(): LLMEngine {
  if (!llmEngine) {
    llmEngine = new LLMEngine(); // No parameters needed
  }
  return llmEngine;
}

// Handle messages from content script
chrome.runtime.onMessage.addListener(
  (message: ApiCallMessage | MagicPromptMessage, _sender, sendResponse) => {
    // Handle magic prompt generation
    if (message.type === 'MAGIC_PROMPT_GEN') {
      const magicMessage = message as MagicPromptMessage;

      try {
        const engine = getLLMEngine();

        engine
          .invokeMagicLLM(magicMessage.questions)
          .then((response) => {
            logger.info('Magic prompt generated successfully');
            sendResponse({ value: response });
          })
          .catch((error: unknown) => {
            logger.error('Error generating magic prompt:', error);
            sendResponse({
              error: error instanceof Error ? error.message : String(error),
            });
          });
      } catch (error) {
        logger.error('Error in magic prompt handler:', error);
        sendResponse({
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return true; // Keep listener alive for async response
    }

    // Handle regular API calls
    if (message.type === 'API_CALL') {
      const apiMessage = message as ApiCallMessage;

      try {
        const engine = getLLMEngine();

        // TODO: Replace this with actual server-side API call
        // For now, using the simplified LLMEngine getResponse method
        engine
          .getResponse(apiMessage.prompt, apiMessage.questionType)
          .then((response) => {
            logger.info('API call completed successfully');
            sendResponse({ value: response });
          })
          .catch((error: unknown) => {
            logger.error('Error in API call:', error);
            sendResponse({
              error: {
                message: error instanceof Error ? error.message : String(error),
                context: 'Failed to get response from LLM',
              },
            });
          });
      } catch (error) {
        logger.error('Error in API call handler:', error);
        sendResponse({
          error: {
            message: error instanceof Error ? error.message : String(error),
            context: 'Failed to process API call',
          },
        });
      }

      return true; // Keep listener alive for async response
    }

    return false; // Message not handled
  },
);

// TODO: For your monetized version, replace the LLMEngine calls above with:
//
// async function callYourServerAPI(prompt: string, systemPrompt: string, questionType: QType) {
//   const response = await fetch('https://your-api.com/generate', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${await getUserToken()}` // Clerk token
//     },
//     body: JSON.stringify({
//       prompt,
//       systemPrompt,
//       questionType,
//       model: 'gpt-5'
//     })
//   });
//   return response.json();
// }
//
// This is where you'll:
// 1. Authenticate users with Clerk
// 2. Check Stripe subscription status
// 3. Make GPT-5 API calls server-side
// 4. Return responses to the extension

// CHANGES FROM ORIGINAL:
// - Fixed LLMEngine constructor (no parameters)
// - Updated message interfaces to match new API
// - Added engine instance reuse for performance
// - Removed invokeLLM calls (method doesn't exist in new engine)
// - Added proper error handling and logging
// - Added TODO comments for server-side API integration
