import { safeGetElementById } from '@utils/domUtils';
import { getModelName, type LLMEngineType } from '@utils/llmEngineTypes';
import {
  getEnableConsensus,
  getEnableDarkTheme,
  getLLMModel,
  getLLMWeights,
  getSkipMarkedSetting,
  getSleepDuration,
} from '@utils/storage/getProperties';
import {
  setEnableConsensus,
  setEnableDarkTheme,
  setLLMModel,
  setLLMWeights,
  setSleepDuration,
  setToggleSkipMarkedStatus,
} from '@utils/storage/setProperties';
import { showToast } from '@utils/toastUtils';
import { MetricsUI } from './metrics';
import { updateConsensusApiLinks } from './optionApiHandler';
import { initializeOptionPasswordField } from './optionPasswordField';
import {
  createProfileCards,
  handleProfileSelection,
  initProfileOptions,
} from './profiles/profileOptions';

// ✅ Only keep GPT-5 as the default + only model
const DEFAULT_MODEL = {
  id: 'gpt-5',
  name: 'GPT-5',
  provider: 'openai' as LLMEngineType,
  description: 'Default and only model for docFiller MVP.',
};

function initializeOptions() {
  // Handle model selection (fixed to GPT-5)
  setLLMModel(DEFAULT_MODEL.id);

  // Handle theme toggle
  const darkThemeCheckbox = safeGetElementById<HTMLInputElement>('darkTheme');
  if (darkThemeCheckbox) {
    darkThemeCheckbox.checked = getEnableDarkTheme();
    darkThemeCheckbox.addEventListener('change', () => {
      setEnableDarkTheme(darkThemeCheckbox.checked);
      showToast('Theme updated');
    });
  }

  // Handle consensus toggle
  const consensusCheckbox = safeGetElementById<HTMLInputElement>('consensus');
  if (consensusCheckbox) {
    consensusCheckbox.checked = getEnableConsensus();
    consensusCheckbox.addEventListener('change', () => {
      setEnableConsensus(consensusCheckbox.checked);
      updateConsensusApiLinks();
      showToast('Consensus setting updated');
    });
  }

  // Handle skip marked toggle
  const skipMarkedCheckbox = safeGetElementById<HTMLInputElement>('skipMarked');
  if (skipMarkedCheckbox) {
    skipMarkedCheckbox.checked = getSkipMarkedSetting();
    skipMarkedCheckbox.addEventListener('change', () => {
      setToggleSkipMarkedStatus(skipMarkedCheckbox.checked);
      showToast('Skip marked setting updated');
    });
  }

  // Handle sleep duration
  const sleepDurationInput =
    safeGetElementById<HTMLInputElement>('sleepDuration');
  if (sleepDurationInput) {
    sleepDurationInput.value = getSleepDuration().toString();
    sleepDurationInput.addEventListener('change', () => {
      const val = parseInt(sleepDurationInput.value, 10);
      if (!isNaN(val)) {
        setSleepDuration(val);
        showToast('Sleep duration updated');
      }
    });
  }

  // Handle weights (optional model tuning)
  const weightsInput = safeGetElementById<HTMLInputElement>('llmWeights');
  if (weightsInput) {
    weightsInput.value = getLLMWeights().toString();
    weightsInput.addEventListener('change', () => {
      const val = parseFloat(weightsInput.value);
      if (!isNaN(val)) {
        setLLMWeights(val);
        showToast('LLM weights updated');
      }
    });
  }

  // Init profiles + metrics
  initProfileOptions();
  createProfileCards();
  handleProfileSelection();
  MetricsUI.initialize();
  initializeOptionPasswordField();
}

// Run initializer
document.addEventListener('DOMContentLoaded', initializeOptions);
