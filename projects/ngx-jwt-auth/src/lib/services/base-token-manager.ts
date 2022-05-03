import { BaseTokenStorage } from '../token-storages';
import { BaseTokenStorageManager } from './base-token-storage-manager';

/**
 * Base class for TokenManager.
 */
export abstract class BaseTokenManager {
  protected get _tokenStorage(): BaseTokenStorage {
    return this._tokenStorageService.storage;
  }

  constructor(protected readonly _tokenStorageService: BaseTokenStorageManager) {}

  /**
   * Gets token.
   *
   * @param tokenKey token key.
   */
  public get(tokenKey: string): string | null {
    return this._tokenStorage.get(tokenKey);
  }

  /**
   * Sets token.
   *
   * @param tokenKey token key.
   * @param token token.
   */
  public set(tokenKey: string, token: string): void {
    this._tokenStorage.set(tokenKey, token);
  }

  /**
   * Delete token.
   *
   * @param tokenKey token key.
   */
  public delete(tokenKey: string): void {
    this._tokenStorage.delete(tokenKey);
  }

  /**
   * Checks validity of token.
   *
   * @param tokenKey token key.
   */
  public isValid(tokenKey: string): boolean {
    return this._tokenStorage.isValid(tokenKey);
  }
}
