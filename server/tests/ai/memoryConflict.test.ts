import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { AIMemoryService } from '../../src/ai/memory/memory.service';
import { AIMemory } from '../../src/models/AIMemory';

describe('Phase 13: AI Memory & Deterministic Conflict Resolution Suite', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  beforeEach(async () => {
    await AIMemory.deleteMany({ userId });
  });

  it('saves explicit user statement with HIGH confidence level', async () => {
    const mem = await AIMemoryService.saveMemory({
      userId,
      category: 'CAREER_CONTEXT',
      key: 'target_role',
      value: 'Senior Tech Lead',
      source: 'user_explicit',
    });

    expect(mem.confidenceLevel).toBe('HIGH');
    expect(mem.confidence).toBeGreaterThanOrEqual(0.9);
    expect(mem.value).toBe('Senior Tech Lead');
  });

  it('allows explicit user statement to supersede previous memory without duplicate creation', async () => {
    await AIMemoryService.saveMemory({
      userId,
      category: 'CAREER_CONTEXT',
      key: 'target_role',
      value: 'Junior Developer',
      source: 'inferred',
    });

    // New explicit statement
    const updated = await AIMemoryService.saveMemory({
      userId,
      category: 'CAREER_CONTEXT',
      key: 'target_role',
      value: 'Government Officer',
      source: 'user_explicit',
    });

    expect(updated.value).toBe('Government Officer');
    expect(updated.confidenceLevel).toBe('HIGH');

    const all = await AIMemoryService.getUserMemories(userId);
    expect(all.length).toBe(1);
    expect(all[0].value).toBe('Government Officer');
  });

  it('prevents low-confidence inferred statement from overwriting explicit user statement', async () => {
    await AIMemoryService.saveMemory({
      userId,
      category: 'USER_PREFERENCE',
      key: 'language_preference',
      value: 'Hindi',
      source: 'user_explicit',
    });

    // Inferred statement attempting to overwrite
    const res = await AIMemoryService.saveMemory({
      userId,
      category: 'USER_PREFERENCE',
      key: 'language_preference',
      value: 'French',
      source: 'inferred',
    });

    expect(res.value).toBe('Hindi'); // Retained explicit statement

    const all = await AIMemoryService.getUserMemories(userId);
    expect(all[0].value).toBe('Hindi');
  });
});
