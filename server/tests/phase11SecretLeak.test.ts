import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 11: Production Client Secret Leak Audit Suite', () => {
  it('ensures no server secrets or environment variables exist in client dist bundles', () => {
    const distDir = path.resolve(__dirname, '../../client/dist');
    if (!fs.existsSync(distDir)) {
      // Skip if client dist not built yet in this test run
      return;
    }

    const secretPatterns = [
      /AI_API_KEY/,
      /RAZORPAY_KEY_SECRET/,
      /JWT_ACCESS_SECRET/,
      /JWT_REFRESH_SECRET/,
      /SMTP_PASSWORD/,
      /MONGODB_URI/,
      /STORAGE_SECRET_KEY/,
    ];

    const scanDirectory = (dir: string): string[] => {
      let foundLeaks: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          foundLeaks = foundLeaks.concat(scanDirectory(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              foundLeaks.push(`Secret leak matching ${pattern} found in: ${fullPath}`);
            }
          }
        }
      }
      return foundLeaks;
    };

    const leaks = scanDirectory(distDir);
    expect(leaks).toEqual([]);
  });
});
