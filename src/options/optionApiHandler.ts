import { safeGetElementById } from '@utils/domUtils';
import { showToast } from '@utils/toastUtils';

// In MVP: no API keys needed, but consensus toggle still uses this file
export function updateConsensusApiLinks() {
  const consensusLink = safeGetElementById<HTMLAnchorElement>('consensus-link');
  if (consensusLink) {
    consensusLink.href = "https://openai.com/research"; 
    consensusLink.textContent = "Powered by GPT-5";
  }
  showToast("Consensus links updated for GPT-5 only.");
}
