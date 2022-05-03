import { JwtDecoder } from '../helpers';

/**
 * The base class of the TokenStorage.
 */
export abstract class BaseTokenStorage {
  /**
   * Gets the token.
   *
   * @param key The key to store the token.
   */
  public abstract get(key: string): string | null;

  /**
   * Sets the token.
   *
   * @param key The key to store the token.
   * @param token the token.
   */
  public abstract set(key: string, token: string): void;

  /**
   * Delete the token.
   *
   * @param key The key to store the token.
   */
  public abstract delete(key: string): void;

  /**
   * Checks validity of the token.
   *
   * @param key The key to store the token.
   */
  public isValid(key: string): boolean {
    const token = this.get(key);

    if (!token) {
      return false;
    }

    const expireIn = JwtDecoder.expireIn(token);

    const isInfiniteToken = expireIn === -1;
    if (isInfiniteToken) {
      return true;
    }

    return expireIn > Math.floor(Date.now() / 1000);
  }
}
