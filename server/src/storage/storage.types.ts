import { Readable } from 'stream';

export interface UploadOptions {
  storageKey: string;
  contentType: string;
  buffer: Buffer;
  metadata?: Record<string, string>;
}

export interface StorageProvider {
  name: string;
  upload(options: UploadOptions): Promise<{ storageKey: string; sizeBytes: number }>;
  download(storageKey: string): Promise<{ stream: Readable; sizeBytes: number; contentType: string }>;
  delete(storageKey: string): Promise<boolean>;
  exists(storageKey: string): Promise<boolean>;
}
