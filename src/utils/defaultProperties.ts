import { LLMEngineType } from '@utils/llmEngineTypes';

interface TypeDefaultProperties {
  model: LLMEngineType;
  sleep_duration: number;
  enableDarkTheme: boolean;
  automaticFillingEnabled: boolean;
  defaultProfileKey: string;
  defaultProfile: Profile;
  skipMarkedQuestions: boolean;
  enableOpacityOnSkippedQuestions: boolean;
}

const DEFAULT_PROPERTIES: TypeDefaultProperties = {
  sleep_duration: 1500,
  model: LLMEngineType.GPT5, // 👈 set your only model here
  enableDarkTheme: true,
  automaticFillingEnabled: true,
  defaultProfileKey: 'default',
  defaultProfile: {
    system_prompt: `You are a helpful assistant that fills out forms accurately and concisely.
Start directly with the answer. Use simple, natural, and clear language.
Avoid unnecessary prefaces, emojis, or formatting. Provide plain text only.`,
    image_url: '/assets/profile/avatars/default_placeholder.png',
    name: 'Form Assistant',
    short_description: 'Accurate and concise form filler',
    is_custom: false,
  },
  skipMarkedQuestions: true,
  enableOpacityOnSkippedQuestions: true,
};

export { DEFAULT_PROPERTIES };
