import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { isReachedRefreshThreshold } from '../helpers';
import { JWT_AUTH_CONFIG } from '../injection-tokens';
import { JwtAuthConfig } from '../jwt-auth-config';
import { AuthTokenManager, JwtAuthService } from '../services';

/**
 * JWT Auth interceptor.
 * 
 * **Do not intercept requests whose URL is specified in the `unsecuredUrls` parameter.**
 * 
 * Before each request, it checks if the access token is valid
 * or if the refresh threshold has not been reached.
 * And sets a JWT to the Headers for every request.
 */
@Injectable()
export class JwtAuthInterceptor implements HttpInterceptor {
  private _refreshTokenInProgress = false;

  private readonly _tokenRefreshed$ = new Subject<void>();
  public readonly tokenRefreshed$ = this._tokenRefreshed$.asObservable();

  // Hack to avoid circular dependency
  private get _jwtAuthService(): JwtAuthService {
    return this._injector.get(JwtAuthService);
  }

  constructor(
    private readonly _injector: Injector,
    private readonly _authTokenManager: AuthTokenManager,
    @Inject(JWT_AUTH_CONFIG) private readonly _config: JwtAuthConfig
  ) {}

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const skip = this._config.unsecuredUrls?.some((unsecuredUrl) =>
      request.url.includes(unsecuredUrl)
    );

    if (skip) {
      return next.handle(request);
    }

    const accessToken = this._authTokenManager.getAccessToken();
    const _isReachedRefreshThreshold = accessToken && this._config.refreshThreshold && isReachedRefreshThreshold(accessToken, this._config.refreshThreshold);

    if (!this._authTokenManager.isValidAccessToken() || _isReachedRefreshThreshold) {
      return this._refreshToken().pipe(
        switchMap(() => {
          const requestWithToken = this._requestWithAccessToken(request);
          return next.handle(requestWithToken);
        })
      );
    }

    const requestWithToken = this._requestWithAccessToken(request);
    return next.handle(requestWithToken);
  }

  /**
   * Sets a JWT to the Headers.
   * 
   * @param request the original request.
   */
  private _requestWithAccessToken(request: HttpRequest<unknown>): HttpRequest<unknown> {
    const accessToken = this._authTokenManager.getAccessToken();

    if (!this._config.authHeaderName) {
      return request;
    }

    return request.clone({
      setHeaders: {
        [this._config.authHeaderName]: `${this._config.authScheme} ${accessToken}`,
      },
    });
  }

  /**
   * Refresh access token.
   */
  private _refreshToken(): Observable<unknown> {
    if (this._refreshTokenInProgress) {
      return new Observable((observer) => {
        this.tokenRefreshed$.subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    } else {
      this._refreshTokenInProgress = true;

      return this._jwtAuthService.refresh().pipe(
        tap(() => this._tokenRefreshed$.next()),
        finalize(() => (this._refreshTokenInProgress = false))
      );
    }
  }
}
