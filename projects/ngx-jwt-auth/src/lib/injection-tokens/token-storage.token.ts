import { InjectionToken } from '@angular/core';
import { BaseTokenStorage } from '../token-storages';

/**
 * Injection token of the JWT storage.
 */
export const TOKEN_STORAGE = new InjectionToken<BaseTokenStorage>(
  'ngx-jwt-auth/TOKEN_STORAGE'
);
