import { InjectionToken } from '@angular/core';
import { BaseAuthApiService } from '../services';

/**
 * Injection token of the API-service for authentication.
 */
export const AUTH_API_SERVICE = new InjectionToken<BaseAuthApiService>(
  'ngx-jwt-auth/AUTH_API_SERVICE'
);
