import { InjectionToken } from '@angular/core';
import { BaseTokenStorage } from '../token-storages';

/**
 * Injection token of the authentication JWT storage.
 */
export const AUTH_TOKEN_STORAGE = new InjectionToken<BaseTokenStorage>(
  'ngx-jwt-auth/AUTH_TOKEN_STORAGE'
);
