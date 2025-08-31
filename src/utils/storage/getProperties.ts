// ---- Main Getters (with expected names) ----
export const getSleepDuration = async () => {
  const { sleep_duration } = await chrome.storage.local.get("sleep_duration");
  return sleep_duration ?? 1000;
};

export const getSkipMarkedSetting = async () => {
  const { skipMarkedQuestions } = await chrome.storage.local.get("skipMarkedQuestions");
  return skipMarkedQuestions ?? false;
};

export const getEnableDarkTheme = async () => {
  const { darkTheme } = await chrome.storage.local.get("darkTheme");
  return darkTheme ?? false;
};

export const getEnableConsensus = async () => {
  const { consensus } = await chrome.storage.local.get("consensus");
  return consensus ?? false; // true/false toggle instead of "majority"
};

export const getLLMWeights = async () => {
  const { llmWeights } = await chrome.storage.local.get("llmWeights");
  return llmWeights ?? 1; // default numeric weight
};

// ---- Legacy Getters (stubs for compatibility) ----
export const getLLMModel = async () => "gpt-5";
export const getChatGptApiKey = async () => "";
export const getAnthropicApiKey = async () => "";
export const getGeminiApiKey = async () => "";
export const getMistralApiKey = async () => "";
export const getEnableOpacityOnSkippedQuestions = async () => false;
export const getIsEnabled = async () => true;
