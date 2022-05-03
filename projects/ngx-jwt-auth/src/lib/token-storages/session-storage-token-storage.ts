import { BaseTokenStorage } from './base-token-storage';

/**
 * Manage tokens in the SessionStorage.
 */
export class SessionStorageTokenStorage extends BaseTokenStorage {
  public get(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  public set(key: string, token: string): void {
    sessionStorage.setItem(key, token);
  }

  public delete(key: string): void {
    sessionStorage.removeItem(key);
  }
}
