import { JWT_AUTH_CONFIG } from '../injection-tokens';
import { JwtAuthModule } from '../jwt-auth.module';

export abstract class JwtDecoder {
  /**
   * Decoding JWT token. return token payload.
   *
   * @param token JWT token.
   */
  public static decode<T extends Record<string, unknown>>(token: string): T {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  /**
   * Gets info when the token issued at.
   *
   * This method get prop by name provided by `TokenManagerModule.forRoot` options
   * in the `JwtAuthConfig.tokenIatField`.
   *
   * @param token JWT token.
   */
  public static issuedAt(token: string): number {
    const iatField = JwtAuthModule.injector.get(JWT_AUTH_CONFIG).tokenIatField;

    if (!iatField) {
      throw new Error('Error in JwtDecoder: tokenIatField should not be undefined');
    }

    const expireIn = JwtDecoder.decode(token)[iatField] as number | string | undefined | null;

    if (expireIn === undefined || expireIn === null) {
      throw new Error(
        `Error in JwtDecoder: invalid expireIn field or JWT token. Field "${iatField}" doesn't exist or value not setted.`
      );
    }

    return Number(expireIn);
  }

  /**
   * Gets info when the token expires.
   *
   * This method get prop by name provided by `TokenManagerModule.forRoot` options
   * in the `JwtAuthConfig.tokenExpField`.
   *
   * @param token JWT token.
   */
  public static expireIn(token: string): number {
    const expField = JwtAuthModule.injector.get(JWT_AUTH_CONFIG).tokenExpField;

    if (!expField) {
      throw new Error('Error in JwtDecoder: tokenExpField should not be undefined');
    }

    const expireIn = JwtDecoder.decode(token)[expField] as number | string | undefined | null;

    if (expireIn === undefined || expireIn === null) {
      throw new Error(
        `Invalid expireIn field or JWT token. Field "${expField}" doesn't exist or value not setted.`
      );
    }

    return Number(expireIn);
  }
}
