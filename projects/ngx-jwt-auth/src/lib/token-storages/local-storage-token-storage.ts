import { inject } from '@angular/core';
import { LOCAL_STORAGE } from '../injection-tokens';
import { BaseTokenStorage } from './base-token-storage';

/**
 * Manage tokens in the LocalStorage.
 */
export class LocalStorageTokenStorage extends BaseTokenStorage {
  private readonly _localStorage = inject(LOCAL_STORAGE);
  
  public get(key: string): string | null {
    return this._localStorage.getItem(key);
  }
  
  public set(key: string, token: string): void {
    this._localStorage.setItem(key, token);
  }

  public delete(key: string): void {
    this._localStorage.removeItem(key);
  }
}
