import {
  getModelName,
  getModelTypeFromName,
  LLMEngineType,
} from '@utils/llmEngineTypes';

// No need for API key links anymore — GPT-5 handled server-side
function updateApiKeyLink(
  modelSelect: HTMLSelectElement,
  apiKeyInputLink: HTMLAnchorElement,
): void {
  const selectedModel = modelSelect.value;
  const selectedModelType = getModelTypeFromName(selectedModel);

  if (!selectedModelType) return;

  // Since we don’t expose API keys, always hide link
  apiKeyInputLink.style.display = 'none';

  const warningMessage = document.querySelector(
    '.warning-message',
  ) as HTMLElement;
  if (warningMessage) {
    warningMessage.style.display = 'none';
  }
}

// Consensus mode not needed anymore, so just hide that section
function updateConsensusApiLinks(
  enableConsensusCheckbox: HTMLInputElement,
): void {
  const consensusSection = document.getElementById(
    'consensusWeights',
  ) as HTMLElement;
  if (consensusSection) {
    consensusSection.classList.add('hidden');
  }
}

export { updateApiKeyLink, updateConsensusApiLinks };
