// Simplified properties management for GPT-5 MVP
// Removed multi-model complexity and localStorage dependency

// Storage keys
const STORAGE_KEYS = {
  IS_ENABLED: 'isEnabled',
  SKIP_MARKED: 'skipMarked'
} as const;

// Enable/disable extension
export function setIsEnabled(value: boolean): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.IS_ENABLED]: value }, () => {
      resolve();
    });
  });
}

// Set skip marked option (kept if still needed for UX)
export function setSkipMarkedSetting(skip: boolean): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.SKIP_MARKED]: skip }, () => {
      resolve();
    });
  });
}

// Get extension enabled status
export function getIsEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.IS_ENABLED], (result) => {
      resolve(result[STORAGE_KEYS.IS_ENABLED] ?? true); // Default to enabled
    });
  });
}

// Get skip marked setting
export function getSkipMarkedSetting(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.SKIP_MARKED], (result) => {
      resolve(result[STORAGE_KEYS.SKIP_MARKED] ?? false); // Default to false
    });
  });
}

// Backward compatibility exports (if other files are still using these)
export const isEnabled = getIsEnabled;
export const skipMarked = getSkipMarkedSetting;

// Clear all settings (useful for reset functionality)
export function clearAllSettings(): void {
  chrome.storage.local.clear();
}

// REMOVED:
// - setEnableConsensus (no longer needed without multi-model)
// - setLLMWeights (no longer needed with single GPT-5 model)
// - localStorage dependency (using chrome.storage.local directly)