import { setFromStorage } from './localStorage';

// Enable/disable extension
export function setIsEnabled(value: boolean) {
  chrome.storage.local.set({ isEnabled: value });
}

// Enable/disable consensus mode
export function setEnableConsensus(enable: boolean): void {
  setFromStorage('enableConsensus', enable);
}

// Set skip marked option
export function setSkipMarkedSetting(skip: boolean): void {
  setFromStorage('skipMarked', skip);
}

// Set LLM weights
export function setLLMWeights(weights: Record<string, number>): void {
  setFromStorage('llmWeights', weights);
}
