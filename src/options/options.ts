import { safeGetElementById } from '@utils/domUtils';
import { showToast } from '@utils/toastUtils';
import { updateConsensusApiLinks } from './optionApiHandler';

// NOTE: MetricsUI removed because `.initialize()` wasn't available on the export

function initializeOptions() {
  // Theme toggle
  const darkThemeCheckbox = safeGetElementById<HTMLInputElement>('darkTheme');
  if (darkThemeCheckbox) {
    darkThemeCheckbox.addEventListener('change', () => {
      showToast('Theme toggled');
    });
  }

  // Consensus toggle
  const consensusCheckbox = safeGetElementById<HTMLInputElement>('consensus');
  if (consensusCheckbox) {
    consensusCheckbox.addEventListener('change', () => {
      updateConsensusApiLinks();
      showToast('Consensus setting updated');
    });
  }

  // Skip marked toggle
  const skipMarkedCheckbox = safeGetElementById<HTMLInputElement>('skipMarked');
  if (skipMarkedCheckbox) {
    skipMarkedCheckbox.addEventListener('change', () => {
      showToast('Skip marked setting updated');
    });
  }

  // Sleep duration
  const sleepDurationInput =
    safeGetElementById<HTMLInputElement>('sleepDuration');
  if (sleepDurationInput) {
    sleepDurationInput.addEventListener('change', () => {
      showToast('Sleep duration updated');
    });
  }

  // Weights
  const weightsInput = safeGetElementById<HTMLInputElement>('llmWeights');
  if (weightsInput) {
    weightsInput.addEventListener('change', () => {
      showToast('LLM weights updated');
    });
  }
}

// Run initializer
document.addEventListener('DOMContentLoaded', initializeOptions);
