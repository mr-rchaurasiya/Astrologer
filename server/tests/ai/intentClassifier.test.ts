import { describe, it, expect } from 'vitest';
import { IntentClassifier } from '../../src/ai/astrology/intentClassifier';

describe('Phase 13: Intent Classifier Suite', () => {
  it('correctly classifies career queries', () => {
    const res = IntentClassifier.classify('Will I get a promotion in my job as software engineer?');
    expect(res.intent).toBe('CAREER');
    expect(res.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('correctly classifies marriage and relationship queries', () => {
    const marriage = IntentClassifier.classify('When will I get married to my life partner?');
    expect(marriage.intent).toBe('MARRIAGE');

    const rel = IntentClassifier.classify('Will my relationship with my partner survive?');
    expect(rel.intent).toBe('RELATIONSHIP');
  });

  it('correctly classifies education and finance queries', () => {
    const edu = IntentClassifier.classify('Will I clear the university admission exam for my master degree?');
    expect(edu.intent).toBe('EDUCATION');

    const fin = IntentClassifier.classify('How will my stock investments and wealth grow?');
    expect(fin.intent).toBe('FINANCE');
  });

  it('correctly classifies dasha, transit, and yoga queries', () => {
    const dasha = IntentClassifier.classify('Which mahadasha and antardasha am I currently running?');
    expect(dasha.intent).toBe('DASHA');

    const transit = IntentClassifier.classify('Is my Sade Sati active right now with Saturn transit?');
    expect(transit.intent).toBe('TRANSIT');

    const yoga = IntentClassifier.classify('Do I have any Raja Yoga or Gaja Kesari Yoga?');
    expect(yoga.intent).toBe('YOGA');
  });

  it('correctly classifies compatibility and remedy queries', () => {
    const compat = IntentClassifier.classify('Please check our 36-point Ashtakoota Kundli Milan and Kuja Dosha.');
    expect(compat.intent).toBe('COMPATIBILITY');

    const rem = IntentClassifier.classify('What remedies or gemstone can pacify Mars?');
    expect(rem.intent).toBe('REMEDY');
  });

  it('falls back to GENERAL for ambiguous queries', () => {
    const res = IntentClassifier.classify('Hello, tell me something interesting.');
    expect(res.intent).toBe('GENERAL');
  });
});
