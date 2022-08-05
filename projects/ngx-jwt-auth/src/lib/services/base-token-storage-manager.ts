import { inject } from '@angular/core';
import { LOCAL_STORAGE } from '../injection-tokens';
import { BaseTokenStorage } from '../token-storages';
import { TokenStorageRegistry } from './token-storage-registry.service';

/**
 * Base class for TokenStorageManager.
 */
export abstract class BaseTokenStorageManager {
  private readonly _localStorage = inject(LOCAL_STORAGE);
  private _storage: BaseTokenStorage;

  /**
   * Get current TokenStorage
   */
  public get storage(): BaseTokenStorage {
    return this._storage;
  }

  constructor(
    protected readonly _key: string,
    protected readonly _tokenStorage: BaseTokenStorage,
    protected readonly _tokenStorageRegistry: TokenStorageRegistry
  ) {
    this._storage = this._rehydrate();
  }

  /**
   * Change current token storage to the given token storage.
   *
   * @param storage instance of the token storage
   */
  public setStorage(storage: BaseTokenStorage): void {
    this._storage = storage;
    this._hydrate(storage);
  }

  private _hydrate(storage: BaseTokenStorage): void {
    this._localStorage.setItem(this._key, JSON.stringify(storage.constructor.name));
  }

  private _rehydrate(): BaseTokenStorage {
    const tokenStorageName = this._localStorage.getItem(this._key);

    if (!tokenStorageName) {
      this._hydrate(this._tokenStorage);
      return this._tokenStorage;
    }

    const tokenStorage: string = JSON.parse(tokenStorageName);

    return this._tokenStorageRegistry.get(tokenStorage) || this._tokenStorage;
  }
}
