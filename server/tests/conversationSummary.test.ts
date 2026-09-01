import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { ConversationSummaryService } from '../src/ai/conversation/conversationSummary.service';
import { ChatSession } from '../src/models/ChatSession';
import { ChatMessage } from '../src/models/ChatMessage';
import { mockDb } from './setup';

describe('Phase 10: AI Conversation Summarization Service', () => {
  let userId: string;
  let sessionId: string;

  beforeEach(async () => {
    mockDb.reset();
    userId = new mongoose.Types.ObjectId().toString();
    const session = await ChatSession.create({
      userId,
      title: 'Saturn Transit Consultation',
    });
    sessionId = session.id;

    // Create 4 messages
    await ChatMessage.create({
      userId,
      sessionId,
      role: 'user',
      content: 'When will my Saturn Sade Sati end?',
    });
    await ChatMessage.create({
      userId,
      sessionId,
      role: 'assistant',
      content: 'Your Sade Sati phase is currently transitioning through the 12th house.',
    });
    await ChatMessage.create({
      userId,
      sessionId,
      role: 'user',
      content: 'What remedies should I perform?',
    });
    await ChatMessage.create({
      userId,
      sessionId,
      role: 'assistant',
      content: 'Chant Hanuman Chalisa on Saturdays and light a mustard oil lamp.',
    });
  });

  it('should generate a structured summary for long conversations', async () => {
    const summary = await ConversationSummaryService.generateAndSaveSummary(sessionId, userId);

    expect(summary).toBeDefined();
    expect(summary?.summary).toBeDefined();
    expect(summary?.version).toBe(1);
    expect(summary?.userId.toString()).toBe(userId);
  });

  it('should retrieve existing summary with user ownership check', async () => {
    await ConversationSummaryService.generateAndSaveSummary(sessionId, userId);
    const summary = await ConversationSummaryService.getSummary(sessionId, userId);

    expect(summary).toBeDefined();
    expect(summary?.sessionId.toString()).toBe(sessionId);

    // Other user should not be able to retrieve it
    const otherUserId = new mongoose.Types.ObjectId().toString();
    const otherSummary = await ConversationSummaryService.getSummary(sessionId, otherUserId);
    expect(otherSummary).toBeNull();
  });
});
