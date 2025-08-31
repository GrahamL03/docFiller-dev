enum LLMEngineType {
  GPT5 = 'gpt-5',
}

interface LLMRequirements {
  requiresApiKey: boolean;
}

const LLM_REQUIREMENTS: Record<LLMEngineType, LLMRequirements> = {
  [LLMEngineType.GPT5]: { requiresApiKey: false }, // 👈 handled server-side
};

function getModelName(modelType: LLMEngineType): string {
  switch (modelType) {
    case LLMEngineType.GPT5:
      return 'GPT-5';
  }
}

function getModelTypeFromName(modelName: string): LLMEngineType | null {
  switch (modelName) {
    case 'GPT-5':
      return LLMEngineType.GPT5;
  }
  return null;
}

export { LLMEngineType, getModelName, getModelTypeFromName, LLM_REQUIREMENTS };
