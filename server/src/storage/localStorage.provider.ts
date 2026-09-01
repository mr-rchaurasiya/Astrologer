import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { StorageProvider, UploadOptions } from './storage.types';
import { config } from '../config/environment';

export class LocalStorageProvider implements StorageProvider {
  public readonly name = 'local';
  private baseDir: string;

  constructor() {
    this.baseDir = config.storage.localReportsDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private resolvePath(storageKey: string): string {
    // Sanitize storage key to avoid path traversal
    const safeKey = path.basename(storageKey);
    return path.join(this.baseDir, safeKey);
  }

  public async upload(options: UploadOptions): Promise<{ storageKey: string; sizeBytes: number }> {
    const filePath = this.resolvePath(options.storageKey);
    await fs.promises.writeFile(filePath, options.buffer);
    return {
      storageKey: options.storageKey,
      sizeBytes: options.buffer.length,
    };
  }

  public async download(storageKey: string): Promise<{ stream: Readable; sizeBytes: number; contentType: string }> {
    const filePath = this.resolvePath(storageKey);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found in storage: ${storageKey}`);
    }

    const stat = await fs.promises.stat(filePath);
    const stream = fs.createReadStream(filePath);

    return {
      stream,
      sizeBytes: stat.size,
      contentType: 'application/pdf',
    };
  }

  public async delete(storageKey: string): Promise<boolean> {
    const filePath = this.resolvePath(storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  public async exists(storageKey: string): Promise<boolean> {
    const filePath = this.resolvePath(storageKey);
    return fs.existsSync(filePath);
  }
}
