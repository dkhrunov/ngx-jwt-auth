import { inject } from '@angular/core';
import { SESSION_STORAGE } from '../injection-tokens';
import { BaseTokenStorage } from './base-token-storage';

/**
 * Manage tokens in the SessionStorage.
 */
export class SessionStorageTokenStorage extends BaseTokenStorage {
  private readonly _sessionStorage = inject(SESSION_STORAGE);

  public get(key: string): string | null {
    return this._sessionStorage.getItem(key);
  }

  public set(key: string, token: string): void {
    this._sessionStorage.setItem(key, token);
  }

  public delete(key: string): void {
    this._sessionStorage.removeItem(key);
  }
}
