export interface PaginationQuery {
  limit?: number;
  cursor?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
    totalCount?: number;
  };
}

export class PaginationHelper {
  /**
   * Encodes an object or timestamp into an opaque base64 cursor string.
   */
  public static encodeCursor(data: { id: string; timestamp?: Date | number | string }): string {
    const raw = JSON.stringify(data);
    return Buffer.from(raw, 'utf-8').toString('base64');
  }

  /**
   * Decodes an opaque base64 cursor string back into data object.
   */
  public static decodeCursor(cursor?: string): { id: string; timestamp?: number } | null {
    if (!cursor) return null;
    try {
      const raw = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Normalizes pagination options with strict limits to prevent unbounded memory allocation.
   */
  public static normalizeParams(params: PaginationQuery, defaultLimit = 20, maxLimit = 100): {
    limit: number;
    cursor: string | null;
    order: 'asc' | 'desc';
  } {
    const rawLimit = Number(params.limit);
    const limit = isNaN(rawLimit) || rawLimit <= 0 ? defaultLimit : Math.min(rawLimit, maxLimit);
    const order = params.order === 'asc' ? 'asc' : 'desc';

    return {
      limit,
      cursor: params.cursor || null,
      order,
    };
  }
}
