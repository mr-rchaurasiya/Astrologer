import { describe, it, expect } from 'vitest';
import { RemedyEngine } from '../../src/ai/remedies/remedyEngine';

describe('Phase 13: Remedy Intelligence Engine Suite', () => {
  it('retrieves peaceful traditional remedies for specified planets', () => {
    const remedies = RemedyEngine.getRemediesForPlanets(['Saturn', 'Jupiter']);

    expect(remedies.length).toBeGreaterThan(0);
    for (const rem of remedies) {
      expect(['Saturn', 'Jupiter']).toContain(rem.planet);
      expect(rem.title).toBeDefined();
      expect(rem.description).toBeDefined();
      expect(rem.traditionalRationale).toBeDefined();
      expect(rem.safetyNote).toBeDefined();
      // Ensure remedies do not contain prohibited harmful phrases
      expect(rem.description).not.toMatch(/harm|poison|sacrifice|curse/i);
    }
  });
});
