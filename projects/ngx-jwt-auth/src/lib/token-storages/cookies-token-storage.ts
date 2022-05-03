import { ESamesiteOption } from '../enums';
import { CookieBuilder, JwtDecoder } from '../helpers';
import { BaseTokenStorage } from './base-token-storage';

/**
 * Manage tokens in the Cookie.
 */
export class CookiesTokenStorage extends BaseTokenStorage {
  public get(key: string): string | null {
    const matches = document.cookie.match(
      new RegExp('(?:^|; )' + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
    );

    return matches ? decodeURIComponent(matches[1]) : null;
  }

  public set(key: string, token: string): void {
    const cookie = encodeURIComponent(key) + '=' + encodeURIComponent(token);
    const tokenTtl = JwtDecoder.expireIn(token);
    const tenYearsInMilliseconds = 10 * 365 * 24 * 60 * 60 * 1000;
    const infiniteToken = Date.now() + tenYearsInMilliseconds;
    const tokenExpireIn = tokenTtl === -1 ? new Date(infiniteToken) : new Date(tokenTtl * 1000);

    document.cookie = CookieBuilder.instantiate(cookie)
      .expires(tokenExpireIn)
      .path('/')
      .secure()
      .samesite(ESamesiteOption.strict)
      .build();
  }

  public delete(key: string): void {
    const cookie = encodeURIComponent(key) + '=';

    document.cookie = CookieBuilder.instantiate(cookie).path('/').expires(new Date(0)).build();
  }
}
