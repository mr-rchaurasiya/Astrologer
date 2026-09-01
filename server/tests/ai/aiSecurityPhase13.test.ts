import { describe, it, expect } from 'vitest';
import { SystemPromptBuilder } from '../../src/ai/prompts/systemPrompt';

describe('Phase 13: AI Security & Prompt Injection Defense Suite', () => {
  it('enforces anti-prompt-injection guidelines and never exposes private system instructions', () => {
    const dummyContext = {
      contextVersion: '2.0',
      intent: 'GENERAL' as const,
      intentConfidence: 0.9,
      profile: {
        name: 'Test User',
        relationship: 'Self',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00:00',
        placeName: 'Delhi',
        latitude: 28.6,
        longitude: 77.2,
        timezone: 'Asia/Kolkata',
      },
      ayanamsa: { system: 'Lahiri', formatted: '23° 43\'' },
      ascendant: { sign: 'Aries' as const, degree: 15.0, nakshatra: 'Bharani', pada: 1, lord: 'Mars' as const },
      relevantPlanets: [],
      relevantHouses: [],
      divisionalCharts: {},
      groundTruth: {} as any,
    };

    const prompt = SystemPromptBuilder.buildSystemPrompt(dummyContext);

    expect(prompt).toContain('PROMPT INJECTION DEFENSE');
    expect(prompt).toContain('ZERO FABRICATION / NO RE-CALCULATION');
    expect(prompt).toContain('MANDATORY SAFETY & NON-DIAGNOSIS BOUNDARIES');
  });
});
