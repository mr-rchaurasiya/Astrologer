import { MemoryRepository } from './memory.repository';
import { MemorySanitizer } from './memorySanitizer';
import { MemoryScorer } from './memoryScoring';
import { MemoryCreateInput, MemoryUpdateInput, SanitizedMemoryDTO, MemoryContextSnippet } from './memory.types';
import { MemoryConfidenceLevel } from '../../models/AIMemory';
import { ValidationError, NotFoundError } from '../../middleware/errorHandler';

export class AIMemoryService {
  /**
   * Saves or updates a memory with deterministic conflict resolution and confidence leveling.
   */
  public static async saveMemory(input: MemoryCreateInput): Promise<SanitizedMemoryDTO> {
    if (!MemorySanitizer.isSafe(input.key, input.value)) {
      throw new ValidationError('Memory contains sensitive or disallowed information.');
    }

    const sanitizedValue = MemorySanitizer.sanitize(input.value);
    const source = input.source || 'user_explicit';

    // Map default confidence & level based on source
    let confidenceLevel: MemoryConfidenceLevel = input.confidenceLevel || 'HIGH';
    let confidence = input.confidence ?? 0.9;

    if (source === 'user_explicit') {
      confidenceLevel = input.confidenceLevel || 'HIGH';
      confidence = input.confidence ?? 0.95;
    } else if (source === 'inferred') {
      confidenceLevel = input.confidenceLevel || 'MEDIUM';
      confidence = input.confidence ?? 0.5;
    } else if (source === 'session_summary') {
      confidenceLevel = input.confidenceLevel || 'MEDIUM';
      confidence = input.confidence ?? 0.65;
    }

    // Check for existing memory with the same key
    const existing = await MemoryRepository.findByUserId(input.userId, 100);
    const match = existing.find(
      (m) =>
        (m.category === input.category || m.key.toLowerCase() === input.key.toLowerCase()) &&
        m.key.toLowerCase() === input.key.toLowerCase()
    );

    if (match) {
      // Deterministic Conflict Resolution
      const oldIsExplicit = match.source === 'user_explicit';
      const newIsExplicit = source === 'user_explicit';

      // Rule: Explicit user statements supersede previous values
      if (newIsExplicit || !oldIsExplicit) {
        const updated = await MemoryRepository.update(match.id, input.userId, {
          value: sanitizedValue,
          confidence,
          confidenceLevel,
          category: input.category,
        });
        return this.toDTO(updated!);
      } else {
        // Inferred memory does not overwrite explicit user statement
        return this.toDTO(match);
      }
    }

    const created = await MemoryRepository.create({
      ...input,
      value: sanitizedValue,
      confidence,
      confidenceLevel,
      source,
    });

    return this.toDTO(created);
  }

  public static async getUserMemories(userId: string): Promise<SanitizedMemoryDTO[]> {
    const rawMemories = await MemoryRepository.findByUserId(userId, 50);
    const ranked = MemoryScorer.rankMemories(rawMemories);
    return ranked.map((m) => this.toDTO(m));
  }

  public static async getRelevantContextSnippets(userId: string, limit: number = 8): Promise<MemoryContextSnippet[]> {
    const rawMemories = await MemoryRepository.findByUserId(userId, 30);
    const ranked = MemoryScorer.rankMemories(rawMemories).slice(0, limit);

    // Touch last used timestamp asynchronously
    if (ranked.length > 0) {
      MemoryRepository.touchLastUsed(ranked.map((m) => m.id)).catch(() => {});
    }

    return ranked.map((m) => ({
      category: m.category,
      key: m.key,
      value: m.value,
    }));
  }

  public static async updateMemory(id: string, userId: string, update: MemoryUpdateInput): Promise<SanitizedMemoryDTO> {
    if (update.value && !MemorySanitizer.isSafe('key', update.value)) {
      throw new ValidationError('Memory contains sensitive or disallowed information.');
    }

    const sanitizedUpdate = {
      ...update,
      value: update.value ? MemorySanitizer.sanitize(update.value) : undefined,
    };

    const updated = await MemoryRepository.update(id, userId, sanitizedUpdate);
    if (!updated) {
      throw new NotFoundError('Memory not found');
    }

    return this.toDTO(updated);
  }

  public static async deleteMemory(id: string, userId: string): Promise<boolean> {
    const deleted = await MemoryRepository.deleteById(id, userId);
    if (!deleted) {
      throw new NotFoundError('Memory not found');
    }
    return true;
  }

  public static async clearAllMemories(userId: string): Promise<number> {
    return MemoryRepository.deleteAllForUser(userId);
  }

  private static toDTO(memory: any): SanitizedMemoryDTO {
    return {
      id: memory.id || (memory._id ? memory._id.toString() : ''),
      category: memory.category,
      key: memory.key,
      value: memory.value,
      confidence: memory.confidence ?? 1.0,
      confidenceLevel: memory.confidenceLevel || (memory.confidence >= 0.8 ? 'HIGH' : 'MEDIUM'),
      source: memory.source || 'user_explicit',
      lastUsedAt: memory.lastUsedAt ? new Date(memory.lastUsedAt).toISOString() : new Date().toISOString(),
      createdAt: memory.createdAt ? new Date(memory.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}
