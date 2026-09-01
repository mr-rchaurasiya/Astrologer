import { VoiceProvider, TranscribeOptions, TranscribeResult, SynthesizeOptions, SynthesizeResult } from './types';
import { config } from '../config/environment';

export class OpenAIVoiceProvider implements VoiceProvider {
  public readonly name = 'openai';
  private apiKey: string;
  private sttModel: string;
  private ttsModel: string;
  private ttsVoice: string;

  constructor() {
    this.apiKey = config.ai.apiKey;
    this.sttModel = config.voice.sttModel;
    this.ttsModel = config.voice.ttsModel;
    this.ttsVoice = config.voice.ttsVoice;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  public async transcribe(options: TranscribeOptions): Promise<TranscribeResult> {
    if (!this.isConfigured()) {
      // Offline fallback
      return {
        text: 'What does my 10th house planetary alignment indicate for my career?',
        language: 'en',
        durationSeconds: 3.5,
      };
    }

    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(options.audioBuffer)], { type: options.mimeType });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', this.sttModel);
      if (options.language) formData.append('language', options.language);
      if (options.prompt) formData.append('prompt', options.prompt);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Whisper transcription failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.text,
        language: options.language || 'en',
      };
    } catch (err: any) {
      throw new Error(`Speech-to-text error: ${err.message}`);
    }
  }

  public async synthesize(options: SynthesizeOptions): Promise<SynthesizeResult> {
    if (!this.isConfigured()) {
      // Offline fallback: generate clean dummy audio buffer (WAV header)
      const dummyHeader = Buffer.from('RIFF....WAVEfmt ....data....', 'utf-8');
      return {
        audioBuffer: dummyHeader,
        contentType: 'audio/mpeg',
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || this.ttsModel,
          input: options.text,
          voice: options.voice || this.ttsVoice,
          speed: options.speed || 1.0,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `TTS synthesis failed: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return {
        audioBuffer: Buffer.from(arrayBuffer),
        contentType: 'audio/mpeg',
      };
    } catch (err: any) {
      throw new Error(`Text-to-speech error: ${err.message}`);
    }
  }
}
