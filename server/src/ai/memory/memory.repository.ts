import { AIMemory, IAIMemory, MemoryCategory } from '../../models/AIMemory';
import { MemoryCreateInput, MemoryUpdateInput } from './memory.types';

export class MemoryRepository {
  public static async create(input: MemoryCreateInput): Promise<IAIMemory> {
    return AIMemory.create({
      userId: input.userId as any,
      profileId: input.profileId ? (input.profileId as any) : undefined,
      category: input.category,
      key: input.key,
      value: input.value,
      confidence: input.confidence ?? 1.0,
      confidenceLevel: input.confidenceLevel || 'HIGH',
      source: input.source ?? 'user_explicit',
      expiresAt: input.expiresAt,
      lastUsedAt: new Date(),
    });
  }

  public static async findByUserId(userId: string, limit: number = 50): Promise<IAIMemory[]> {
    return AIMemory.find({
      userId: userId as any,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    })
      .sort({ lastUsedAt: -1 })
      .limit(limit);
  }

  public static async findById(id: string, userId: string): Promise<IAIMemory | null> {
    return AIMemory.findOne({ _id: id as any, userId: userId as any });
  }

  public static async update(id: string, userId: string, update: MemoryUpdateInput): Promise<IAIMemory | null> {
    const memory = await AIMemory.findOne({ _id: id as any, userId: userId as any });
    if (!memory) return null;

    if (update.value !== undefined) memory.value = update.value;
    if (update.confidence !== undefined) memory.confidence = update.confidence;
    if (update.confidenceLevel !== undefined) memory.confidenceLevel = update.confidenceLevel;
    if (update.category !== undefined) memory.category = update.category;
    memory.lastUsedAt = new Date();

    return memory.save();
  }

  public static async touchLastUsed(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await AIMemory.updateMany(
      { _id: { $in: ids as any } },
      { $set: { lastUsedAt: new Date() } }
    );
  }

  public static async deleteById(id: string, userId: string): Promise<boolean> {
    const res = await AIMemory.deleteOne({ _id: id as any, userId: userId as any });
    return (res.deletedCount ?? 0) > 0;
  }

  public static async deleteAllForUser(userId: string): Promise<number> {
    const res = await AIMemory.deleteMany({ userId: userId as any });
    return res.deletedCount ?? 0;
  }
}
