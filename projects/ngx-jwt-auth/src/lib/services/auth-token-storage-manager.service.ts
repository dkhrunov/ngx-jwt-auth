import { Inject, Injectable } from '@angular/core';
import { JWT_AUTH_TOKEN_STORAGE } from '../const';
import { AUTH_TOKEN_STORAGE } from '../injection-tokens';
import { BaseTokenStorage } from '../token-storages';
import { BaseTokenStorageManager } from './base-token-storage-manager';
import { TokenStorageRegistry } from './token-storage-registry.service';

/**
 * Authentication token storage manager.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthTokenStorageManager extends BaseTokenStorageManager {
  constructor(
    @Inject(AUTH_TOKEN_STORAGE)
    protected override readonly _tokenStorage: BaseTokenStorage,
    protected override readonly _tokenStorageRegistry: TokenStorageRegistry
  ) {
    super(JWT_AUTH_TOKEN_STORAGE, _tokenStorage, _tokenStorageRegistry);
  }
}
