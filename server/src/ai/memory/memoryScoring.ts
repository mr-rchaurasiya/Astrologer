import { IAIMemory } from '../../models/AIMemory';

export class MemoryScorer {
  /**
   * Scores and ranks memories by confidence, recency, and source weight
   */
  public static rankMemories(memories: IAIMemory[]): IAIMemory[] {
    const now = Date.now();
    const oneDayMs = 24 * 3600 * 1000;

    return [...memories].sort((a, b) => {
      // 1. Explicit preferences have highest baseline weight
      const sourceWeightA = a.source === 'user_explicit' ? 1.5 : a.source === 'session_summary' ? 1.2 : 1.0;
      const sourceWeightB = b.source === 'user_explicit' ? 1.5 : b.source === 'session_summary' ? 1.2 : 1.0;

      // 2. Recency decay (half-life of 30 days)
      const ageDaysA = (now - new Date(a.lastUsedAt || a.createdAt).getTime()) / oneDayMs;
      const ageDaysB = (now - new Date(b.lastUsedAt || b.createdAt).getTime()) / oneDayMs;

      const recencyScoreA = Math.exp(-ageDaysA / 30);
      const recencyScoreB = Math.exp(-ageDaysB / 30);

      const totalScoreA = (a.confidence || 1.0) * sourceWeightA * (0.5 + 0.5 * recencyScoreA);
      const totalScoreB = (b.confidence || 1.0) * sourceWeightB * (0.5 + 0.5 * recencyScoreB);

      return totalScoreB - totalScoreA;
    });
  }
}
