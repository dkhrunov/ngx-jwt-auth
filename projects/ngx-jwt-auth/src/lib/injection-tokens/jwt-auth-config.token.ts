import { InjectionToken } from '@angular/core';
import { JwtAuthConfig } from '../jwt-auth-config';

/**
 * Injection token of the lib config object.
 */
export const JWT_AUTH_CONFIG = new InjectionToken<JwtAuthConfig>(
  'ngx-jwt-auth/JWT_AUTH_CONFIG'
);
