import { JwtDecoder } from './jwt-decoder';

/**
 * Calculate the token refresh threshold.
 * 
 * @param token JWT token.
 */
export function calcRefreshThreshold(token: string): number {
  const now = Math.round(Date.now() / 1000);
  const iat = JwtDecoder.issuedAt(token);
  const exp = JwtDecoder.expireIn(token);

  return (now - iat) / (exp - iat);
}

/**
 * Checks if the token has reached the refresh threshold.
 * 
 * @param token JWT token.
 * @param threshold number between 0 and 1.
 */
export function isReachedRefreshThreshold(token: string, threshold: number): boolean {
  return calcRefreshThreshold(token) >= threshold;
}
