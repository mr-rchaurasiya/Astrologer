import { describe, it, expect } from 'vitest';
import { CloudStorageProvider } from '../src/storage/cloudStorage.provider';

describe('Phase 11: Storage Abstraction Suite', () => {
  it('CloudStorageProvider uploads and downloads with authenticated streaming', async () => {
    const storage = new CloudStorageProvider('test-bucket', 'us-east-1');
    const testKey = 'reports/test_phase11_report.pdf';

    const uploadRes = await storage.upload({
      storageKey: testKey,
      contentType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Mock Vedic PDF Dossier'),
    });

    expect(uploadRes.storageKey).toBe(testKey);
    expect(uploadRes.sizeBytes).toBeGreaterThan(0);

    const exists = await storage.exists(testKey);
    expect(exists).toBe(true);

    const downloadRes = await storage.download(testKey);
    expect(downloadRes.contentType).toBe('application/pdf');
    expect(downloadRes.sizeBytes).toBe(uploadRes.sizeBytes);

    // Consume stream chunks to ensure file handle is released cleanly
    const chunks: Buffer[] = [];
    for await (const chunk of downloadRes.stream) {
      chunks.push(Buffer.from(chunk));
    }
    const combined = Buffer.concat(chunks).toString();
    expect(combined).toContain('%PDF-1.4');

    const signedUrl = await storage.getSignedDownloadUrl(testKey);
    expect(signedUrl).toContain('/api/v1/reports/signed-download/');
    expect(signedUrl).toContain('exp=');

    const deleted = await storage.delete(testKey);
    expect(deleted).toBe(true);
  });
});
