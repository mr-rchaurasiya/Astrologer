const DISALLOWED_PATTERNS = [
  /password/i,
  /secret/i,
  /bearer\s+[a-zA-Z0-9_\-\.]+/i,
  /api[_\-]?key/i,
  /rzp_[live|test]_[a-zA-Z0-9]+/i,
  /sk-[a-zA-Z0-9]{20,}/i,
  /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/, // Credit card numbers
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
];

export class MemorySanitizer {
  /**
   * Validates that the memory key and value contain safe personal preferences
   * and do NOT leak authentication tokens, passwords, payment info, or secrets.
   */
  public static isSafe(key: string, value: string): boolean {
    const combined = `${key} ${value}`;

    for (const pattern of DISALLOWED_PATTERNS) {
      if (pattern.test(combined)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sanitizes a memory value by trimming and stripping control characters
   */
  public static sanitize(value: string): string {
    return value
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove control chars
      .trim()
      .slice(0, 1000);
  }
}
