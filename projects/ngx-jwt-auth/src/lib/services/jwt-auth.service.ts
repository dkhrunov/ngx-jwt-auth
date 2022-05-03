import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AUTH_API_SERVICE, JWT_AUTH_CONFIG } from '../injection-tokens';
import { AuthResponseTokens, IAuthApiService } from '../interfaces';
import { JwtAuthConfig } from '../jwt-auth-config';
import { AuthTokenManager } from './auth-token-manager.service';
import { BaseAuthApiService } from './base-auth-api-service';

/**
 * A wrapper class (proxy) that implements the `IAuthApiService` interface.
 * The same interface implements `BaseAuthApiService`
 *
 * This class wraps method calls from the provided in
 * `JwtAuthConfig.authApiService` HTTP service,
 * and executes the authorization token management logic.
 */
@Injectable({
  providedIn: 'root',
})
export class JwtAuthService implements IAuthApiService {
  private readonly _isLoggedIn$ = new ReplaySubject<boolean>(1);
  public readonly isLoggedIn$ = this._isLoggedIn$.asObservable();

  private get _isValidAccessToken(): boolean {
    return this._authTokenManager.isValidAccessToken();
  }

  constructor(
    private readonly _authTokenManager: AuthTokenManager,
    @Inject(AUTH_API_SERVICE) private readonly _authApiService: BaseAuthApiService,
    @Inject(JWT_AUTH_CONFIG) private readonly _config: JwtAuthConfig
  ) {
    if (this._isValidAccessToken) {
      this._isLoggedIn$.next(true);
    } else {
      this.refresh().subscribe();
    }
  }

  /**
   * Proxy the call to the `login()` from BaseAuthApiService.
   *
   * @param args arguments to be passed in the same order to the proxied method `login()`.
   */
  public login(...args: any[]): Observable<AuthResponseTokens> {
    return this._authApiService.login(...args).pipe(
      tap((authTokens) => {
        if (this._config.saveRefreshTokenInStorage && authTokens.refreshToken) {
          this._authTokenManager.setRefreshToken(authTokens.refreshToken);
        }

        this._authTokenManager.setAccessToken(authTokens.accessToken);
        this._isLoggedIn$.next(this._isValidAccessToken);
      }),
      catchError((error) => {
        this._isLoggedIn$.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Proxy the call to the `logout()` from BaseAuthApiService.
   *
   * @param args arguments to be passed in the same order to the proxied method `logout()`.
   */
  public logout(...args: any[]): Observable<void> {
    return this._authApiService.logout(...args).pipe(
      tap(() => {
        if (this._config.saveRefreshTokenInStorage) {
          this._authTokenManager.deleteRefreshToken();
        }

        this._authTokenManager.deleteAccessToken();
        this._isLoggedIn$.next(this._isValidAccessToken);
      })
    );
  }

  /**
   * Proxy the call to the `refresh()` from BaseAuthApiService.
   *
   * @param args arguments to be passed in the same order to the proxied method `refresh()`.
   */
  public refresh(...args: any[]): Observable<AuthResponseTokens> {
    return this._authApiService.refresh(...args).pipe(
      tap((authTokens) => {
        if (this._config.saveRefreshTokenInStorage && authTokens.refreshToken) {
          this._authTokenManager.setRefreshToken(authTokens.refreshToken);
        }

        this._authTokenManager.setAccessToken(authTokens.accessToken);
        this._isLoggedIn$.next(this._isValidAccessToken);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.logout();
        }

        this._isLoggedIn$.next(false);
        return throwError(() => error);
      })
    );
  }
}
