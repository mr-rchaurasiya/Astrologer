import { VoiceProvider } from './types';
import { OpenAIVoiceProvider } from './openaiVoice.provider';

let defaultVoiceProvider: VoiceProvider | null = null;

export const getVoiceProvider = (): VoiceProvider => {
  if (!defaultVoiceProvider) {
    defaultVoiceProvider = new OpenAIVoiceProvider();
  }
  return defaultVoiceProvider;
};

export const setVoiceProvider = (provider: VoiceProvider) => {
  defaultVoiceProvider = provider;
};
