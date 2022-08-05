import { Type } from "@angular/core";
import { BaseAuthApiService, BaseLastPageWatcher } from "./services";
import { BaseTokenStorage } from "./token-storages";

export class JwtAuthConfig {
  /**
   * A class that implements `BaseAuthApiService` and makes requests to the server for authorization.
   */
  public authApiService!: Type<BaseAuthApiService>;
  /**
   * Storage of tokens.
   */
  public tokenStorage!: Type<BaseTokenStorage>;
  /**
   * Storage of authorization tokens.
   */
  public authTokenStorage!: Type<BaseTokenStorage>;
  /**
   * The name of the Header that will be used for authorization.
   *
   * By default `Authorization`.
   */
  public authHeaderName?: string = 'Authorization';
  /**
   * A prefix in the Header value that defines the authorization scheme.
   *
   * By default `Bearer`.
   */
  public authScheme?: string = 'Bearer';
  /**
   * The field in the payload of the token that is responsible for the issued at of the token.
   *
   * By default `exp`.
   */
  public tokenExpField?: string = 'exp';
  /**
   * The field in the payload of the token that is responsible for the date the token was issued.
   *
   * By default `iat`.
   */
  public tokenIatField?: string = 'iat';
  /**
   * An array of custom TokenStorages.
   *
   * By default empty array `[]`.
   */
  public customTokenStorages?: BaseTokenStorage[] = [];
  /**
   * An array of URLs and Paths that will not be processed by the AuthInterceptor.
   *
   * that is, the access token will not be checked on the specified URL
   * and Path and the access token will be updated if it has expired.
   *
   * **Notice:**
   * Specify your authorization URLs, such as `http://localhost:5000/auth`,
   * to avoid an infinitely recursive token refresh call when a 401 status code is returned.
   *
   * By default empty array `[]`.
   */
  public unsecuredUrls?: string[] = [];
  /**
   * The coefficient of the token refresh threshold,
   * if the expireIn access token approaches this coefficient, then the token will be refreshed.
   *
   * By default `0.8`.
   */
  public refreshThreshold?: number = 0.8;
  /**
   * If true then the refresh token will be stored in TokenStorage.
   *
   * **Notice:**
   * - If this option is enabled, then change `authTokenStorage` from `InMemoryTokenStorage`to any other predefined `TokenStorage`.
   * If this is not done, then the user will have to log in every time the page is updated,
   * so when the page is updated, `InMemoryTokenStorage` will be cleared, this is how JS works.
   *
   * - It is necessary to enable this option only if the server does not store the refresh token in the cookie,
   * then to refresh the token, you need to pass it in the refresh request,
   * and store it on the client,which is initially a bad practice
   * and can lead to problems in protecting the application by stealing access and refresh tokens.
   *
   * By default `false`.
   */
  public saveRefreshTokenInStorage?: boolean = false;
  /**
   * The URL where the authorized user will be redirected if he tries to access the route protected by UnAuthGuard.
   *
   * If you do not set a value, then routes protected by UnAuthGuard will simply reject the transition to this route.
   */
  public unAuthGuardRedirectUrl?: string = undefined;
  /**
   * The URL where an unauthorized user will be redirected if he tries to access the route protected by AuthGuard.
   *
   * If not set, then routes protected by AuthGuard will simply reject the transition to this route.
   */
  public authGuardRedirectUrl?: string = undefined;
  /**
   * Redirects the user to the last visited page after authorization.
   * 
   * ---------
   * If you set the value of `Type<BaseLastPageWatcher>`, then your provider will be used.
   * On the other hand, if you set it to `true`, the default `LastPageWatcher` will be used.
   * By default `false`.
   */
  public readonly redirectToLastPage?: boolean | Type<BaseLastPageWatcher> = false;

  constructor(params: JwtAuthConfig) {
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        let value = (params as Record<string, any>)[key];
        Object.defineProperty(this, key, { value })
      }
    }
  }
}