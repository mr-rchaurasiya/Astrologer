import { StorageProvider } from './storage.types';
import { LocalStorageProvider } from './localStorage.provider';
import { CloudStorageProvider } from './cloudStorage.provider';
import { config } from '../config/environment';

let defaultStorageProvider: StorageProvider | null = null;

export const getStorageProvider = (): StorageProvider => {
  if (!defaultStorageProvider) {
    if (config.storage.provider === 'cloud') {
      defaultStorageProvider = new CloudStorageProvider(config.storage.bucket, config.storage.region);
    } else {
      defaultStorageProvider = new LocalStorageProvider();
    }
  }
  return defaultStorageProvider;
};

export const setStorageProvider = (provider: StorageProvider) => {
  defaultStorageProvider = provider;
};

export * from './storage.types';
export * from './localStorage.provider';
export * from './cloudStorage.provider';
