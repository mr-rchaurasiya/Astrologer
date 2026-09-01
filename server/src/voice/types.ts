export interface TranscribeOptions {
  audioBuffer: Buffer;
  mimeType: string;
  language?: string;
  prompt?: string;
}

export interface TranscribeResult {
  text: string;
  language?: string;
  durationSeconds?: number;
}

export interface SynthesizeOptions {
  text: string;
  voice?: string;
  model?: string;
  speed?: number;
}

export interface SynthesizeResult {
  audioBuffer: Buffer;
  contentType: string;
}

export interface VoiceProvider {
  name: string;
  isConfigured(): boolean;
  transcribe(options: TranscribeOptions): Promise<TranscribeResult>;
  synthesize(options: SynthesizeOptions): Promise<SynthesizeResult>;
}
