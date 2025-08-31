import { DetectBoxType } from '@docFillerCore/detectors/detectBoxType';
import { FieldExtractorEngine } from '@docFillerCore/engines/fieldExtractorEngine';
import { FillerEngine } from '@docFillerCore/engines/fillerEngine';
import { LLMEngine } from '@docFillerCore/engines/gptEngine';
import { PrefilledChecker } from '@docFillerCore/engines/prefilledChecker';
import { PromptEngine } from '@docFillerCore/engines/promptEngine';
import { QuestionExtractorEngine } from '@docFillerCore/engines/questionExtractorEngine';
import { ValidatorEngine } from '@docFillerCore/engines/validatorEngine';
import { LLMEngineType } from '@utils/llmEngineTypes'; // Add the enum import
import {
  getEnableOpacityOnSkippedQuestions,
  getSkipMarkedSetting,
} from '@utils/storage/getProperties';
import { MetricsManager } from '@utils/storage/metricsManager';
import {
  getSelectedProfileKey,
  loadProfiles,
} from '@utils/storage/profiles/profileManager';
import { getStorageItem, setStorageItem } from '@utils/storage/storageHelper';

// Simple logger for consistent logging
const logger = {
  error: (message: string, error?: unknown) => {
    // biome-ignore lint/suspicious/noConsole: Error logging necessary for debugging
    console.error(`[DocFiller Core] ${message}`, error);
  },
  info: (message: string, data?: unknown) => {
    // biome-ignore lint/suspicious/noConsole: Info logging for debugging form filling process
    console.log(`[DocFiller Core] ${message}`, data || '');
  }
};

async function runDocFillerEngine() {
  try {
    const questions = new QuestionExtractorEngine().getValidQuestions();
    
    // Initialize engines
    const checker = new DetectBoxType();
    const fields = new FieldExtractorEngine();
    const prompts = new PromptEngine();
    const validator = new ValidatorEngine();
    const filler = new FillerEngine();
    const isMarked = new PrefilledChecker();
    const metricsManager = MetricsManager.getInstance();
    
    // Initialize GPT-5 engine only
    let llm: LLMEngine | null = null;
    try {
      llm = new LLMEngine(); // No parameters needed
    } catch (error) {
      logger.error('Failed to initialize LLM engine:', error);
      return;
    }

    const totalQuestions = questions.length;
    logger.info(`Processing ${totalQuestions} questions`);
    
    metricsManager.incrementTotalQuestions(totalQuestions);
    metricsManager?.startFormFilling(totalQuestions);

    // Handle profile selection and magic prompts
    const selectedProfile = await getSelectedProfileKey();
    const profiles = await loadProfiles();

    if (profiles[selectedProfile]?.is_magic) {
      const questionsToSend = [];
      for (const ques of questions) {
        const fieldType = checker.detectType(ques);
        if (fieldType !== null) {
          const fieldValue = fields.getFields(ques, fieldType);
          questionsToSend.push(fieldValue.title);
        }
      }
      
      try {
        const response: { value?: { system_prompt: string } } =
          await chrome.runtime.sendMessage({
            type: 'MAGIC_PROMPT_GEN',
            questions: questionsToSend,
            model: LLMEngineType.GPT5, // Use the enum value
          });
          
        if (response?.value) {
          profiles[selectedProfile].system_prompt = response.value.system_prompt;
          
          // Save the magic prompt
          const existingCustom =
            (await getStorageItem<Profiles>('customProfiles')) || {};
          await setStorageItem('customProfiles', {
            ...existingCustom,
            [selectedProfile]: {
              ...profiles[selectedProfile],
              system_prompt: response.value.system_prompt,
            },
          });
        }
      } catch (error) {
        logger.error('Failed to generate or save magic prompt:', error);
        // Continue execution even if magic prompt fails
      }
    }

    // Process each question
    for (const question of questions) {
      try {
        const fieldType = checker.detectType(question);

        if (fieldType !== null) {
          const fieldValue = fields.getFields(question, fieldType);
          
          logger.info(`Processing field type: ${fieldType}`);
          logger.info('Field value:', fieldValue);

          // Check if already filled
          const isFilled = isMarked.markedCheck(fieldType, fieldValue);
          const skipMarkedSettingValue = await getSkipMarkedSetting();
          const enableOpacity = await getEnableOpacityOnSkippedQuestions();
          
          if (skipMarkedSettingValue && isFilled) {
            if (enableOpacity) {
              question.style.opacity = '0.6';
            }
            logger.info('Skipping already filled question');
            continue;
          }

          metricsManager.incrementToBeFilledQuestions();

          // Generate prompt
          const promptString = prompts.getPrompt(fieldType, fieldValue);
          logger.info('Generated prompt:', promptString);

          // Get LLM response (GPT-5 only)
          const response = await llm.getResponse(promptString, fieldType);
          logger.info('LLM response:', response);

          if (response === null) {
            logger.info('No response from LLM');
            continue;
          }

          // Validate and fill
          const parsed_response = validator.validate(fieldType, fieldValue, response);
          logger.info(`Parsed response: ${parsed_response}`);

          if (parsed_response) {
            const fillerStatus = await filler.fill(fieldType, fieldValue, response);
            logger.info(`Filler status: ${fillerStatus}`);

            if (fillerStatus) {
              metricsManager.incrementSuccessfulQuestions();
            }
          }
        }
      } catch (error) {
        logger.error('Error processing question:', error);
      }
    }

    // Complete metrics tracking  
    await metricsManager.endFormFilling(LLMEngineType.GPT5); // Use the enum value
    logger.info('Form filling completed');
    
  } catch (error) {
    logger.error('Fatal error in runDocFillerEngine:', error);
  }
}

export { runDocFillerEngine };

// REMOVED FROM ORIGINAL:
// - ConsensusEngine import and usage
// - Settings.getInstance() calls for model selection
// - enableConsensus logic and conditional engine creation
// - validateLLMConfiguration() - no longer needed
// - Complex model switching logic
// - Multiple console.log statements (replaced with logger)