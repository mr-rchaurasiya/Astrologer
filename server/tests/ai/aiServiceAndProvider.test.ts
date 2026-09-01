import { describe, it, expect } from 'vitest';
import { AIService } from '../../src/ai/services/ai.service';
import { OpenAIProvider } from '../../src/ai/providers/OpenAIProvider';
import { AIProvider } from '../../src/ai/providers/AIProvider';
import { AstrologyService } from '../../src/astrology/service/astrology.service';
import { ChatMessageDTO, AIResponse, StreamChunk } from '../../src/ai/types/ai';

class MockAIProvider implements AIProvider {
  public name = 'mock';

  public async generateResponse(params: {
    messages: ChatMessageDTO[];
    systemPrompt: string;
  }): Promise<AIResponse> {
    expect(params.systemPrompt).toContain('<ASTROLOGY_CONTEXT>');
    expect(params.systemPrompt).toContain('You are the authoritative AI Vedic Astrology Consultant');

    return {
      id: 'mock-test-id-123',
      content:
        'In traditional Vedic astrology, with your Lagna in Taurus and Venus as your Lagna Lord, you possess an inherent stability and an eye for harmony and practical wisdom.',
      model: 'gpt-4o-mini',
      usage: {
        promptTokens: 450,
        completionTokens: 35,
        totalTokens: 485,
      },
      finishReason: 'stop',
      createdAt: new Date(),
    };
  }

  public async streamResponse(params: {
    messages: ChatMessageDTO[];
    systemPrompt: string;
    onChunk: (chunk: StreamChunk) => void | Promise<void>;
  }): Promise<AIResponse> {
    const tokens = ['In ', 'traditional ', 'Vedic ', 'astrology...'];
    for (const tok of tokens) {
      await params.onChunk({ text: tok, isFinal: false });
    }
    await params.onChunk({ text: '', isFinal: true, finishReason: 'stop' });

    return {
      id: 'mock-stream-id-123',
      content: 'In traditional Vedic astrology...',
      model: 'gpt-4o-mini',
      finishReason: 'stop',
      createdAt: new Date(),
    };
  }
}

describe('AI Service & Provider Architecture', () => {
  const mockProfile: any = {
    _id: '507f1f77bcf86cd799439011',
    userId: '507f191e810c19729de860ea',
    name: 'Ramnevas',
    relationship: 'self',
    dateOfBirth: '1995-05-15',
    timeOfBirth: '08:30:00',
    placeName: 'Ujjain, Madhya Pradesh, India',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
  };

  const chart = AstrologyService.calculateBirthChart({
    dateOfBirth: mockProfile.dateOfBirth,
    timeOfBirth: mockProfile.timeOfBirth,
    latitude: mockProfile.latitude,
    longitude: mockProfile.longitude,
    timezone: mockProfile.timezone,
    timezoneOffset: mockProfile.timezoneOffset,
  });

  it('OpenAIProvider returns graceful unconfigured response when no API key configured', async () => {
    const provider = new OpenAIProvider('', 'gpt-4o-mini');
    const res = await provider.generateResponse({
      messages: [{ role: 'user', content: 'Tell me about my chart' }],
      systemPrompt: 'You are an astrologer',
    });

    expect(res.content).toContain('AI consultation is not configured yet with an active API key');
    expect(res.finishReason).toBe('stop');
  });

  it('AIService generates response using configured provider and structured context', async () => {
    const aiService = new AIService(new MockAIProvider());

    const result = await aiService.generateAstrologyResponse({
      profile: mockProfile,
      chart,
      messages: [{ role: 'user', content: 'What does my Lagna indicate?' }],
    });

    expect(result.response.id).toBe('mock-test-id-123');
    expect(result.response.content).toContain('traditional Vedic astrology');
    expect(result.promptVersion).toBe('2.0');
    expect(result.contextVersion).toBe('2.0');
    expect(result.response.usage?.totalTokens).toBe(485);
  });

  it('AIService streams response tokens via onChunk callback', async () => {
    const aiService = new AIService(new MockAIProvider());
    const receivedChunks: string[] = [];

    const result = await aiService.streamAstrologyResponse({
      profile: mockProfile,
      chart,
      messages: [{ role: 'user', content: 'What does my Lagna indicate?' }],
      onChunk: (chunk) => {
        if (chunk.text) {
          receivedChunks.push(chunk.text);
        }
      },
    });

    expect(receivedChunks.join('')).toBe('In traditional Vedic astrology...');
    expect(result.response.content).toBe('In traditional Vedic astrology...');
  });
});
