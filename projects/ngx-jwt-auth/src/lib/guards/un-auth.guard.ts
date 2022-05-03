import { Inject, Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { JWT_AUTH_CONFIG } from '../injection-tokens';
import { JwtAuthConfig } from '../jwt-auth-config';
import { JwtAuthService } from '../services';

/**
 * Guard to restrict route access to authorized users.
 */
@Injectable({
  providedIn: 'root',
})
export class UnAuthGuard implements CanLoad, CanActivate {
  constructor(
    private readonly _router: Router,
    private readonly _jwtAuthService: JwtAuthService,
    @Inject(JWT_AUTH_CONFIG) private readonly _config: JwtAuthConfig
  ) {}

  public canLoad(): Observable<boolean | UrlTree> {
    return this._guarantee();
  }

  public canActivate(): Observable<boolean | UrlTree> {
    return this._guarantee();
  }

  private _guarantee(): Observable<boolean | UrlTree> {
    return this._jwtAuthService.isLoggedIn$.pipe(
      take(1),
      map((x) => {
        if (this._config.unAuthGuardRedirectUrl !== undefined && x) {
          return this._router.createUrlTree([this._config.unAuthGuardRedirectUrl]);
        }

        return !x;
      })
    );
  }
}
