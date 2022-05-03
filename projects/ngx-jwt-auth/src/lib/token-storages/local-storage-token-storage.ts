import { BaseTokenStorage } from './base-token-storage';

/**
 * Manage tokens in the LocalStorage.
 */
export class LocalStorageTokenStorage extends BaseTokenStorage {
  public get(key: string): string | null {
    return localStorage.getItem(key);
  }
  
  public set(key: string, token: string): void {
    localStorage.setItem(key, token);
  }

  public delete(key: string): void {
    localStorage.removeItem(key);
  }
}
