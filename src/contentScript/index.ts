import { runDocFillerEngine } from '@docFillerCore/index';
import { isFillFormMessage, type MessageResponse } from '@utils/messageTypes';
import { getIsEnabled } from '@utils/storage/getProperties';

// Simple logger for development
const logger = {
  error: (message: string, error?: Error) => {
    // biome-ignore lint/suspicious/noConsole: Error logging is necessary for debugging
    console.error(`[DocFiller] ${message}`, error);
  },
  info: (message: string) => {
    // biome-ignore lint/suspicious/noConsole: Info logging for extension status
    console.log(`[DocFiller] ${message}`);
  }
};

// Handle messages from popup/background
chrome.runtime.onMessage.addListener(
  (
    message: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    if (isFillFormMessage(message)) {
      void runDocFillerEngine()
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error: Error) => {
          logger.error('Error running doc filler:', error);
          sendResponse({
            success: false,
            error: error.message || 'Failed to fill document',
          });
        });

      return true; // Keep listener alive for async response
    }

    return false;
  },
);

// Auto-run when page loads if extension is enabled
getIsEnabled()
  .then((isEnabled) => {
    if (isEnabled === true) {
      runDocFillerEngine().catch((error: Error) => {
        logger.error('Auto-run failed:', error);
      });
    } else {
      logger.info('Doc Filler is currently disabled');
    }
    return Promise.resolve();
  })
  .catch((error: Error) => {
    logger.error('Failed to check if extension is enabled:', error);
  });

// REMOVED:
// - ConsensusEngine import and disposal (multi-model complexity)
// - beforeunload event listener (no longer needed without ConsensusEngine)