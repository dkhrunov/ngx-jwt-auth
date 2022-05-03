import { BaseTokenStorage } from './base-token-storage';

/**
 * Manage tokens in the aplication memory.
 */
export class InMemoryTokenStorage extends BaseTokenStorage {
  private readonly _storage = new Map<string, string>();

  public get(key: string): string | null {
    return this._storage.get(key) ?? null;
  }

  public set(key: string, token: string): void {
    this._storage.set(key, token);
  }

  public delete(key: string): void {
    this._storage.delete(key);
  }
}
