import { Inject, Injectable } from '@angular/core';
import { EAuthToken } from '../enums';
import { AuthTokens } from '../interfaces';
import { AuthTokenStorageManager } from './auth-token-storage-manager.service';
import { BaseTokenManager } from './base-token-manager';
import { BaseTokenStorageManager } from './base-token-storage-manager';

type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 * JWT authentication token manager.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthTokenManager extends BaseTokenManager {
  constructor(
    @Inject(AuthTokenStorageManager)
    protected readonly _authTokenStorageService: BaseTokenStorageManager
  ) {
    super(_authTokenStorageService);
  }

  /**
   * Gets access token.
   */
  public getAccessToken(): string | null {
    return this.get(EAuthToken.accessToken);
  }

  /**
   * Sets access token to TokenStorage.
   *
   * @param token JWT token.
   */
  public setAccessToken(token: string): void {
    this.set(EAuthToken.accessToken, token);
  }

  /**
   * Delete access token.
   */
  public deleteAccessToken(): void {
    this.delete(EAuthToken.accessToken);
  }

  /**
   * Checks validity of access token.
   */
  public isValidAccessToken(): boolean {
    return this.isValid(EAuthToken.accessToken);
  }

  /**
   * Gets refresh token.
   */
  public getRefreshToken(): string | null {
    return this.get(EAuthToken.refreshToken);
  }

  /**
   * Sets refresh token to TokenStorage.
   *
   * @param token JWT token.
   */
  public setRefreshToken(token: string): void {
    this.set(EAuthToken.refreshToken, token);
  }

  /**
   * Delete refresh token.
   */
  public deleteRefreshToken(): void {
    this.delete(EAuthToken.refreshToken);
  }

  /**
   * Checks validity of refresh token.
   */
  public isValidRefreshToken(): boolean {
    return this.isValid(EAuthToken.refreshToken);
  }

  /**
   * Gets access and refresh tokens.
   */
  public getAuthTokens(): Nullable<AuthTokens> {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    };
  }

  /**
   * Sets access and refresh tokens to TokenStorage.
   *
   * @param tokens JWT tokens (access and refresh tokens).
   */
  public setAuthTokens(tokens: AuthTokens): void {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }

  /**
   * Delete access and refresh tokens.
   */
  public deleteAuthTokens(): void {
    this.deleteAccessToken();
    this.deleteRefreshToken();
  }
}
