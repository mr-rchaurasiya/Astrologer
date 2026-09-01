import { getVoiceProvider } from './voice.provider';
import { SubscriptionService } from '../subscription/subscription.service';
import { AuditLog } from '../models/AuditLog';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'audio/webm',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/x-m4a',
  'audio/m4a',
  'audio/mp4',
];

export class VoiceService {
  public static async transcribeAudio(options: {
    userId: string;
    audioBuffer: Buffer;
    mimeType: string;
    language?: string;
  }): Promise<{ text: string; language?: string }> {
    const { userId, audioBuffer, mimeType, language } = options;

    // 1. Validation
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio buffer is empty.');
    }

    if (audioBuffer.length > MAX_AUDIO_BYTES) {
      throw new Error('Audio file exceeds 10MB limit.');
    }

    const cleanMime = mimeType.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(cleanMime)) {
      throw new Error(`Unsupported audio format: ${mimeType}. Allowed formats: webm, mp3, wav, m4a, ogg.`);
    }

    // 2. Subscription Quota Check
    const quota = await SubscriptionService.checkAndIncrementUsage(userId, 'ai_chat');
    if (!quota.allowed) {
      throw new Error(`Daily AI consultation quota exceeded (${quota.limit} messages/day). Please upgrade to Cosmic Premium.`);
    }

    // 3. Transcribe
    const provider = getVoiceProvider();
    const result = await provider.transcribe({
      audioBuffer,
      mimeType: cleanMime,
      language,
    });

    await AuditLog.create({
      userId,
      action: 'VOICE_TRANSCRIBED',
      resource: 'Voice',
      metadata: { byteLength: audioBuffer.length, mimeType: cleanMime },
    });

    return result;
  }

  public static async synthesizeSpeech(options: {
    userId: string;
    text: string;
    voice?: string;
  }): Promise<{ audioBuffer: Buffer; contentType: string }> {
    const { userId, text, voice } = options;

    if (!text || text.trim().length === 0) {
      throw new Error('Text to synthesize cannot be empty.');
    }

    if (text.length > 2000) {
      throw new Error('Text exceeds 2000 characters maximum synthesis length.');
    }

    const provider = getVoiceProvider();
    const result = await provider.synthesize({
      text,
      voice,
    });

    await AuditLog.create({
      userId,
      action: 'VOICE_SYNTHESIZED',
      resource: 'Voice',
      metadata: { charLength: text.length },
    });

    return result;
  }
}
