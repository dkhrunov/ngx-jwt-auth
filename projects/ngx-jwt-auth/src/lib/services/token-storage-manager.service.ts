import { Inject, Injectable } from '@angular/core';
import { TOKEN_STORAGE_KEY } from '../const';
import { TOKEN_STORAGE } from '../injection-tokens';
import { BaseTokenStorage } from '../token-storages';
import { BaseTokenStorageManager } from './base-token-storage-manager';
import { TokenStorageRegistry } from './token-storage-registry.service';

/**
 * JWT token storage manager.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenStorageManager extends BaseTokenStorageManager {
  constructor(
    @Inject(TOKEN_STORAGE)
    protected override readonly _tokenStorage: BaseTokenStorage,
    protected override readonly _tokenStorageRegistry: TokenStorageRegistry
  ) {
    super(TOKEN_STORAGE_KEY, _tokenStorage, _tokenStorageRegistry);
  }
}
