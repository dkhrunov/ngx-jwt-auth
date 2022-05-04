# Ngx JWT Auth
<a href="https://jwt.io/">
  <img src="https://jwt.io/img/badge-compatible.svg">
</a>

A library for Token-Based Authentication (JWT Authentication).

This library is configurable for any use cases.

## Other languages
- [Russian](./projects/ngx-jwt-auth/src/doc/ru/README.md)

## Content
- [Description](#description)
- [Setup and use](#setup-and-use)
- [Description of all library parameters](#description-of-all-library-parameters)
- [List of predefined Token Storages](#list-of-predefined-token-storages)
- [Creating your own Token Storage](#creating-your-own-token-storage)
- [Changing token storage at runtime](#changing-token-storage-at-runtime)
- [Troubleshooting](#troubleshooting)

## Description

This library implements the main features and basic requirements for Token-Based Authentication in an Angular application.

Features:
- choose where tokens will be stored by choosing a token storage;
- change the storage of tokens directly in runtime;
- create your own custom storage of tokens;
- automatically refresh the access token. Refresh occurs either after the validity period of the access token expires, or specify the `refreshThreshold` token decay coefficient, upon reaching which the token will be updated, for these purposes the interceptor [JwtAuthInterceptor](./projects/ngx-jwt-auth/src/lib/interceptors/jwt-auth.interceptor.ts) is used).
- restrict access to certain routes for unauthorized users using [AuthGuard](./projects/ngx-jwt-auth/src/lib/guards/auth.guard.ts);
- restrict access to certain routes for authorized users using [UnAuthGuard](./projects/ngx-jwt-auth/src/lib/guards/un-auth.guard.ts);
- subscribe to the `isLoggedIn$` stream, which stores the current user authentication status [JwtAuthService](./projects/ngx-jwt-auth/src/lib/services/jwt-auth.service.ts);
- manage tokens yourself (get, delete, save a token) through the service [AuthTokenManager](./projects/ngx-jwt-auth/src/lib/services/auth-token-manager.service.ts);
- manage not only authorization tokens, but any other JWT tokens for these purposes, there are separate settings in `JwtAuthModule`, a separate token storage (you can use the same predefined storages, or create your own), a separate service for working with tokens [TokenManager] (. /src/lib/services/token-manager.service.ts) and a separate service for managing token storage [TokenStorageManager](./projects/ngx-jwt-auth/src/lib/services/token-storage-manager.service.ts).
- extend the basic features by creating custom token stores, custom token management solutions (extend [BaseTokenManager](./projects/ngx-jwt-auth/src/lib/services/base-token-manager.ts)) and token stores (extend [BaseTokenStorageManager](./projects/ngx-jwt-auth/src /lib/services/base-token-storage-manager.ts)).

## Setup and use
1. Import `JwtAuthModule` into the App/Core module of your application with a call to the `forRoot` method, and pass parameters to this method:

```typescript
import { JwtAuthModule } from '@dekh/ngx-jwt-auth';

@NgModule({
  imports: [
    JwtAuthModule.forRoot(options),
  ],
})
export class AppModule {}
```

2. You need to create an Api-service by implementing the [BaseAuthApiService](./projects/ngx-jwt-auth/src/lib/services/base-auth-api-service.ts) base class. This class obliges to implement 3 methods `login`, `logout` and `refresh`. The `login` and `refresh` methods must return an Observable with the value `{ accessToken: string; refreshToken?: string; }`, if your server in the `login` authorization method and\or in the `refresh` access token refresh method returns a different format, then it is quite easy to map the value with the `map` operator from rxjs to the desired format. An example of such a service:

```typescript
@Injectable({
	providedIn: 'root',
})
export class AuthApiService extends BaseAuthApiService {
  constructor(private readonly _httpClient: HttpClient) {
    super();
  }

  // This method returns AuthResponseTokens which has the structure
  // { accessToken: string; refreshToken?: string; }, so you don't need to map anything!
  public login(credentials: Login): Observable<AuthResponseTokens> {
    return this._httpClient.post<AuthResponseTokens>(
      environments.apiUrl + '/auth/login',
      credentials,
      { withCredentials: true }
    );
  }

  public logout(): Observable<void> {
    return this._httpClient.post<void>(environments.apiUrl + '/auth/logout', null, {
      withCredentials: true,
    });
  }

  // Since this method does not return the model we need from the server,
  // we map it using the map operator in { accessToken: string; refreshToken?: string; }
  public refresh(): Observable<RefreshTokenResponse> {
    return this._httpClient.post<RefreshTokenResponse>(environments.apiUrl + '/auth/refresh', null, {
      withCredentials: true,
    }).pipe(
      map((res) => ({
        accessToken: res.tokens.newAccessToken,
        refreshToken: res.tokens.newRefreshToken,
      }))
    );
  }

  public register(credentials: Registration): Observable<void> {
    return this._httpClient.post<void>(environments.apiUrl + '/auth/register', credentials);
  }
}
```

3. Next, you need to pass the required parameters to the `JwtAuthModule.forRoot(options)` parameters:

```typescript
import {
  JwtAuthModule,
  InMemoryTokenStorage,
  LocalStorageTokenStorage
} from '@dekh/ngx-jwt-auth';
import { AuthApiService } from '../services';

@NgModule({
  imports: [
    JwtAuthModule.forRoot({
      // Our previously created AuthApiService
      authApiService: AuthApiService,
      tokenStorage: LocalStorageTokenStorage,
      authTokenStorage: InMemoryTokenStorage,
    }),
  ],
})
export class AppModule {}
```

4. Provide Interceptor [JwtAuthInterceptor](./projects/ngx-jwt-auth/src/lib/interceptors/jwt-auth.interceptor.ts).

> `JwtAuthInterceptor` implements an access token refresh mechanism by checking the validity of the token and the `refreshTreshold` validity threshold before each request, except for requests whose URL is specified in the `unsecuredUrls` parameter. If the token is not valid, then an attempt will be made to refresh the token followed by the original request, but if the token cannot be refreshed, then the user will be logged out using the `logout` method from `BaseAuthApiService`. 

> It is not mandatory to use `JwtAuthInterceptor`, you can implement your own mechanism for intercepting requests with subsequent refresh of the access token.

Example:

```typescript
import {
  JwtAuthModule,
  InMemoryTokenStorage,
  LocalStorageTokenStorage,
  JwtAuthInterceptor
} from '@dekh/ngx-jwt-auth';
import { AuthApiService } from '../services';

@NgModule({
  imports: [
    JwtAuthModule.forRoot({
      authApiService: AuthApiService,
      tokenStorage: LocalStorageTokenStorage,
      authTokenStorage: InMemoryTokenStorage,
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtAuthInterceptor,
      multi: true,
    },
  ],
})
export class AppModule {}
```

5. If in the application we need to get authorization or log out, then we must use the `JwtAuthService` proxy service, which under the hood offers methods from our `AuthApiService` service, and performs additional actions - saves accessToken and refreshToken in storage, updates the authorization status in ` isLoggedIn$`.

Example:

On the authorization form, when sending it, you need to use `JwtAuthService` and call the `login(...args[]: any)` method; all arguments passed to this method will be passed to the `login(...args[]: any)` method our previously created Api-service for authorization `AuthApiService` (all parameters are passed for each method defined in `BaseAuthApiService`):

```typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy {
  public form: FormGroup;

  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  public readonly isLoading$ = this._isLoading$.asObservable();

  private readonly _loginError$ = new BehaviorSubject<string | null>(null);
  public readonly loginError$ = this._loginError$.asObservable();

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _jwtAuthService: JwtAuthService, 
  ) {
    this._createForm();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public login(): void {
    this._isLoading$.next(true);

    // Login class it`s Domain model
    const credentials = new Login(this.form.value);

    this._authService
      .login(credentials)
      .pipe(
        tap(() => this._loginError$.next(null)),
        catchError((error: HttpError<ServerErrorDto>) => {
          this._loginError$.next(error.error.message);
          return EMPTY;
        }),
        finalize(() => this._isLoading$.next(false))
      )
      .subscribe();
  }

  private _createForm(): void {
    this.form = this._fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
    });
  }
}
```

6. Restrict access to routes that can only be accessed by an authorized user or vice versa only by an unauthorized user.
In the example below, only an unauthorized user can access the `/auth/login` and `/auth/registration` pages, and only an authorized user can open the `/dashboard` page:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, UnAuthGuard } from '@dekh/ngx-jwt-auth';
import { LoginComponent, RegistrationComponent } from '../auth';
import { DashboardComponent } from '../dashboard';

const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [UnAuthGuard],
      },
      {
        path: 'registration',
        component: RegistrationComponent,
        canActivate: [UnAuthGuard],
      },
    ],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

## Description of all library parameters
- `authApiService: Type<BaseAuthApiService>` - A class that implements `BaseAuthApiService` and makes requests to the server.

- `tokenStorage: Type<BaseTokenStorage>` - Storage of regular jwt tokens (not authorization ones).

- `authTokenStorage: Type<BaseTokenStorage>` - Storage of authorization tokens.

- `authHeaderName?: string` - The name of the Http Header that will be used for authorization. By default `Authorization`.

- `authScheme?: string` - A prefix in the Http Header value that defines the authorization scheme. By default `Bearer`.

- `tokenExpField?: string` - The field in the payload of the token, in which the timestamp is stored when the token expires. By default `exp`.

- `tokenIatField?: string` - A field in the payload of the token that stores the timestamp when the token was issued. By default `iat`.

- `customTokenStorages?: BaseTokenStorage[]` - An array of custom (custom) token storages. By default empty array `[]`.

- `unsecuredUrls?: string[]` - An array of URLs and Paths that will not be processed by the AuthInterceptor. those. the access token will not be checked on the specified URL and Path and the access token will be updated if it has expired. By default empty array `[]`.
  > **Notice:** specify your URL for authorization, for example `http://localhost:5000/auth` or part of the URL - `/auth/refresh`,`/auth/login`, `/auth/registration` or all URLs for authentication `/auth ` to avoid an infinitely recursive token refresh call when a 401 status code is issued.

  > **Notice:** always specify the URL for updating the token, otherwise there will be a circular dependency:
  >> ERROR Error: NG0200: Circular dependency in DI detected for JwtAuthService.
  >
  > This is because `HttpClient` depends on `Interceptor (JwtAuthInterceptor)` depends on `AuthApiService` depends on `HttpClient`.
  > 
  > [The way to fix this error is here.](#troubleshooting)

- `refreshThreshold?: number` - The coefficient of the token refresh threshold, if the expireIn access token approaches this coefficient, then the token will be refreshed. By default `0.8`.

- `saveRefreshTokenInStorage?: boolean` - Whether to save the refresh token that comes with authorization and / or when refreshing the token. By default `false`.
  > You should enable this option only if the server does not store the refresh token in the cookie, then to refresh the token you need to pass it in the refresh request, and you will have to store it on the client, which is initially a bad practice and can lead to problems in protecting the application by stealing access and refresh tokens.

  > **Notice:** if this option is enabled, then you should change `authTokenStorage` from `InMemoryTokenStorage` to any other predefined or custom `TokenStorage`. If this is not done, then the user will have to log in every time the page is updated, since when the page is updated, the memory and, accordingly, `InMemoryTokenStorage` will be cleared, this is how JS is arranged.

- `unAuthGuardRedirectUrl?: string` - The URL where the authorized user will be redirected to if he tries to access the route protected by UnAuthGuard. If you do not set a value, then routes protected by UnAuthGuard will simply reject the transition to this route.

- `authGuardRedirectUrl?: string` - The URL where an unauthorized user will be redirected to if they try to access a route protected by AuthGuard. If not set, then routes protected by AuthGuard will simply reject the transition to this route.

## List of predefined Token Storages

- `CookiesTokenStorage` - abstraction over cookies, saves tokens in cookies;
- `LocalStorageTokenStorage` - abstraction over localStorage, stores tokens in localStorage;
- `SessionStorageTokenStorage` - abstraction over sessionStorage, saves tokens in sessionStorage;
- `InMemoryTokenStorage` - saves tokens in the application memory, there are some drawbacks, when using this storage for authorization tokens, after reloading the page, a request will be made to update the access token (for SPA applications this is not critical), but the most secure storage for authorization tokens;

## Creating your own Token Storage

In order to create your own token storage, it is enough to implement the [BaseTokenStorage](./projects/ngx-jwt-auth/src/lib/token-storages/base-token-storage.ts) base class and specify an array of custom storage of tokens. Example:

```typescript
// my-custom-token-storage.ts
import { BaseTokenStorage } from '@dekh/ngx-jwt-auth';

export class MyCustomTokenStorage extends BaseTokenStorage {
  public get(key: string): string | null {
    // custom realisation
  }

  public set(key: string, token: string): void {
    // custom realisation
  }

  public delete(key: string): void {
    // custom realisation
  }

  // We can override the method to check the validity of tokens
  // but this is not recommended!
  public override isValid(key: string): boolean {
    // super.isValid();
    // custom realisation
  }
}
```

We define our storage in the parameters of the `JwtAuthModule` module:

```typescript
// app.module.ts
import { JwtAuthModule } from '@dekh/ngx-jwt-auth';
import { MyCustomTokenStorage } from '../auth';

@NgModule({
  imports: [
    JwtAuthModule.forRoot({
      customTokenStorages: [new MyCustomTokenStorage()],
    }),
  ],
})
export class AppModule {}
```

Or we can register our storage using the `TokenStorageRegistry` service:

```typescript
// app.service.ts
import {
  LocalStorageTokenStorage,
  InMemoryTokenStorage,
  TokenStorageRegistry
} from '@dekh/ngx-jwt-auth';
import { AuthApiService } from '../services';
import { MyCustomTokenStorage } from '../auth';

@NgModule({
  imports: [
    JwtAuthModule.forRoot({
      authApiService: AuthApiService,
      tokenStorage: LocalStorageTokenStorage,
      authTokenStorage: InMemoryTokenStorage,
    }),
  ],
})
export class AppModule {
  constructor(private readonly _tokenStorageRegistry: TokenStorageRegistry) {
    this._tokenStorageRegistry.register(new MyCustomTokenStorage());
  }
}
```

## Changing token storage at runtime

In rare cases, you may need to change the token storage at runtime, for this there are two services [TokenStorageManager](./projects/ngx-jwt-auth/src/lib/services/token-storage-manager.service.ts) and [AuthTokenStorageManager](./projects/ngx-jwt-auth/src/lib/services/auth-token-storage-manager.service.ts), both of these services have the same interaction interface. `TokenStorageManager` is used to manage the storage of __non-authorization__ tokens, and `AuthTokenStorageManager` is used to manage the storage of __authorization__ tokens.

Example:

```typescript
// token-storage-changer.service.ts
import {
  AuthTokenStorageManager,
  TokenStorageRegistry,
  CookiesTokenStorage,
  BaseTokenStorage,
} from '@dekh/ngx-jwt-auth';
import { MyCustomTokenStorage } from '../auth';

@Injectable({
  provideIn: 'root'
})
export class TokenStorageChangerService {
  constructor(
    private readonly _authTokenStorageManager: AuthTokenStorageManager,
    private readonly _tokenStorageRegistry: TokenStrageRegistry,
  ) {
    this._tokenStorageRegistry.register(new MyCustomTokenStorage());
  }

  public setMyCustomStorage(): void {
    if (!this._tokenStorageRegistry.isRegistered(MyCustomTokenStorage)) {
      throw new Error('MyCustomTokenStorage is not registered!'); 
    }

    const myCustomStorage = this._tokenStorageRegistry.get(MyCustomTokenStorage);
    // or
    // const myCustomStorage = this._tokenStorageRegistry.get(new MyCustomTokenStorage());
    // or
    // const myCustomStorage = this._tokenStorageRegistry.get('MyCustomTokenStorage');
    this.changeAuthStorage(myCustomStorage);
  }

  public setCookiesStorage(): void {
    const cookiesStorage = this._tokenStorageRegistry.get(CookiesTokenStorage);
    // or
    // const cookiesStorage = this._tokenStorageRegistry.get(new CookiesTokenStorage());
    // or
    // const cookiesStorage = this._tokenStorageRegistry.get('CookiesTokenStorage');
    this.changeAuthStorage(storage);
  }

  public changeAuthStorage(storage: BaseTokenStorage): void {
    this._authTokenStorageManager.setStorage(storage);
  }
}
```

## Troubleshooting

- When starting the application, it gives an error __"ERROR Error: NG0200: Circular dependency in DI detected for JwtAuthService."__

  The reason for this error is a cyclic call to `JwtAuthInterceptor`. Since the interceptor handles every request, except for those url requests specified in the `unsecuredUrls` config parameter, the token refresh request creates a circular dependency.

  The solution to this problem is to specify in the `unsecuredUrls` array the URL or path of the accessToken update request, or specify the root path for all requests related to user authorization/registration, for example: `"/auth/"`, then all requests c path auth will be excluded from the interceptor check - `server.api/auth/login`, `server.api/auth/register`, `server.api/auth/refresh` and etc.