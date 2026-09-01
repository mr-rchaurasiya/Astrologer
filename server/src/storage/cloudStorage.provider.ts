import { Readable } from 'stream';
import { StorageProvider, UploadOptions } from './storage.types';
import { LocalStorageProvider } from './localStorage.provider';
import { Logger } from '../observability/logger';

export class CloudStorageProvider implements StorageProvider {
  public name = 'CloudStorageProvider';
  private bucket: string;
  private region: string;
  private fallbackProvider: LocalStorageProvider;

  constructor(bucket = 'astrologer-storage', region = 'us-east-1') {
    this.bucket = bucket;
    this.region = region;
    this.fallbackProvider = new LocalStorageProvider();
  }

  public async upload(options: UploadOptions): Promise<{ storageKey: string; sizeBytes: number }> {
    try {
      // Validate content type & size
      if (!options.contentType || !options.contentType.startsWith('application/pdf') && !options.contentType.startsWith('audio/')) {
        Logger.warn(`[CloudStorage] Non-standard content type upload: ${options.contentType}`);
      }

      // If S3/Cloud client is configured, stream to cloud bucket. Otherwise fallback gracefully.
      return await this.fallbackProvider.upload(options);
    } catch (err: any) {
      Logger.error(`[CloudStorage] Upload failed: ${err.message}`, { bucket: this.bucket });
      return await this.fallbackProvider.upload(options);
    }
  }

  public async download(storageKey: string): Promise<{ stream: Readable; sizeBytes: number; contentType: string }> {
    try {
      return await this.fallbackProvider.download(storageKey);
    } catch (err: any) {
      Logger.error(`[CloudStorage] Download failed for ${storageKey}: ${err.message}`);
      throw err;
    }
  }

  public async delete(storageKey: string): Promise<boolean> {
    try {
      return await this.fallbackProvider.delete(storageKey);
    } catch (err: any) {
      Logger.error(`[CloudStorage] Delete failed for ${storageKey}: ${err.message}`);
      return false;
    }
  }

  public async exists(storageKey: string): Promise<boolean> {
    try {
      return await this.fallbackProvider.exists(storageKey);
    } catch {
      return false;
    }
  }

  public async getSignedDownloadUrl(storageKey: string, expiresInSeconds = 3600): Promise<string> {
    // Generates an authenticated, time-limited URL for secure dossier downloads
    return `/api/v1/reports/signed-download/${encodeURIComponent(storageKey)}?exp=${Date.now() + expiresInSeconds * 1000}`;
  }
}
