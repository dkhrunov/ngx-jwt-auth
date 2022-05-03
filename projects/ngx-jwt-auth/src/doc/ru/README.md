# JwtAuth

Библиотека для Token-Based Authentication на основе Access и Refresh токенов.

## На других языках
- [English](../en/README.md)

## Содержание
- [Описание](#описание)
- [Настройка и применение](#настройка-и-применение)
- [Описание всех параметров библиотеки](#описание-всех-параметров-библиотеки)
- [Список предопределенных хранилищ токенов](#список-предопределенных-хранилищ-токенов)
- [Создание своего хранилища токенов](#создание-своего-хранилища-токенов)
- [Смена хранилища токенов в рантайме](#смена-хранилища-токенов-в-рантайме)
- [Troubleshooting](#troubleshooting)

## Описание

Данная библиотека реализует управление аутентификацией на сайте. 

Позволяет:
- выбирать где будут храниться токены, выбирая хранилище токенов (подробнее далее);
- изменять хранилища токенов прямо в рантайме (подробнее далее);
- создать свое кастомное хранилище токенов (подробнее далее);
- автоматически обновлять токен доступа (access token). Обновление происходит либо по истечению срока валидности токена доступа, либо указать коэффициент протухания токена `refreshThreshold` по достижению которого будет выполнено обновление токена, для этих целей используется interceptor [JwtAuthInterceptor](../../lib/interceptors/jwt-auth.interceptor.ts).
- ограничивать доступ на определенные роуты для не авторизованных пользователей, используя [AuthGuard](../../lib/guards/auth.guard.ts);
- ограничивать доступ на определенные роуты для авторизованных пользователей, используя [UnAuthGuard](../../lib/guards/un-auth.guard.ts);
- подписаться на поток `isLoggedIn$`, в котором храниться текущий статус аутентификации пользователя [JwtAuthService](../../lib/services/jwt-auth.service.ts);
- самому управлять токенами (получит, удалить, сохранить токен) через сервис [AuthTokenManager](../../lib/services/auth-token-manager.service.ts);
- управлять не только авторизационнами токенами, а любыми другими JWT токенами для этих целей выделены отдельные настройки в `JwtAuthModule`, отдельное хранилище токенов (можно использовать те же предопределенные хранилища, либо создать свое), отдельный сервис для работы с токенами [TokenManager](../../lib/services/token-manager.service.ts) и отдельный сервис для управления хранилищем токенов [TokenStorageManager](../../lib/services/token-storage-manager.service.ts).
- расширить базовые возможности путем создания кастомных хранилищ токенов, кастомных решений для управления токенами (расширить [BaseTokenManager](../../lib/services/base-token-manager.ts)) и хранилищами токенов (расширить [BaseTokenStorageManager](../../lib/services/base-token-storage-manager.ts)).

## Настройка и применение
1. Импортировать `JwtAuthModule` в root/core модуль вашего приложения с вызовом метода `forRoot`, и в данный метод передать параметры:

```typescript
import { JwtAuthModule } from 'jwt-auth';

@NgModule({
  imports: [
    JwtAuthModule.forRoot(options),
  ],
})
export class AppModule {}
```

2. Необходимо создать Api-сервис, реализуя базовый класс [BaseAuthApiService](../../lib/services/base-auth-http-service.ts). Данный класс обязует реализовать 3 метода `login`, `logout` и `refresh`. Методы `login` и `refresh` должны возвращать Observable cо значение `{ accessToken: string; refreshToken?: string; }`, если ваш сервер в методе авторизации `login` и\или в методе  обновления токена доступа `refresh` возвращает другой формат, то достаточно просто можно смаппить значение оператором `map` из rxjs в нужный формат. Пример такого сервиса:

```typescript
@Injectable({
	providedIn: 'root',
})
export class AuthApiService extends BaseAuthApiService {
  constructor(private readonly _httpClient: HttpClient) {
    super();
  }

  // Данный метод возвращает AuthResponseTokens который имеет структуру
  // { accessToken: string; refreshToken?: string; }, 
  // поэтому маппить ничего не нужно!
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

  // Так как данный метод не возвращает с сервера нужную нам модель,
  // то мы ее с помощью оператора map маппим в { accessToken: string; refreshToken?: string; }
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

3. Далее нужно передать в параметры `JwtAuthModule.forRoot(options)` обязательные параметры:

```typescript
import {
  JwtAuthModule,
  InMemoryTokenStorage,
  LocalStorageTokenStorage
} from 'jwt-auth';
import { AuthApiService } from '../services';

@NgModule({
  imports: [
    JwtAuthModule.forRoot({
      // Наш ранее созданный AuthApiService
      authApiService: AuthApiService,
      tokenStorage: LocalStorageTokenStorage,
      authTokenStorage: InMemoryTokenStorage,
    }),
  ],
})
export class AppModule {}
```

4. Запровайдить Interceptor [JwtAuthInterceptor](../../lib/interceptors/jwt-auth.interceptor.ts).

> `JwtAuthInterceptor` реализует механизм обновления токена доступа путем проверки валидности токена и порога валидности `refreshTreshold` перед каждым запросом за исключением url запросов, которые указаны в параметре `unsecuredUrls`. Если токен не валиден, то будет произведена попытка обновления токена с последующим выполнением оригинального запроса, но если токен не сможет обновиться тогда пользователя разлогинет методом `logout` из `BaseAuthApiService`. 

> Не обязательное использовать `JwtAuthInterceptor`, можно реализовать собственный механизм перехвата запросов с последущим обновлением токена доступа.

Пример:

```typescript
import {
  JwtAuthModule,
  InMemoryTokenStorage,
  LocalStorageTokenStorage,
  JwtAuthInterceptor
} from 'jwt-auth';
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

5. Если в приложении нам нужно выполнить авторизацию или разлогиниться, то мы должны использовать proxy сервис `JwtAuthService`, который под капотом вызывает методы из нашего `AuthApiService` сервиса и выполняет дополнительные действия - сохраняет accessToken и refreshToken в хранилище, обновляет статус авторизации в `isLoggedIn$`.

Например:

На форме авторизации при ее отправки нужно использовать `JwtAuthService` и вызывать метод `login(...args[]: any)` все перданные аргументы в данный метод будут прокинуты в метод `login(...args[]: any)` нашего ранее созданного Api-сервиса для авторизации `AuthApiService` (все параметры прокидываются для каждого метода определенного в `BaseAuthApiService`):

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

6. Ограничить доступ на роуты, на которые может заходить только авторизованный пользователь или наоборот только не авторизованный.
На примере ниже на страницу `/auth/login` и `/auth/registration` может зайти только не авторизованный пользователь, а открыть страницу `/dashboard` может только авторизованный:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, UnAuthGuard } from 'jwt-auth';
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

## Описание всех параметров библиотеки
- `authApiService: Type<BaseAuthApiService>` - Класс реализующий BaseAuthApiService и выполняющий запросы к серверу.

- `tokenStorage: Type<BaseTokenStorage>` - Хранилище обычных jwt токенов (не авторизационных).

- `authTokenStorage: Type<BaseTokenStorage>` - Хранилище авторизационных токенов.

- `authHeaderName?: string` - Название Http Header который будет использоваться для авторизации. By default `Authorization`.

- `authScheme?: string` - Префикс в значении Http Header определяющее схему авторизации. By default `Bearer`.

- `tokenExpField?: string` - Поле в payload токена, в котором храниться timestamp когда токен просрочиться. By default `exp`.

- `tokenIatField?: string` - Поле в payload токена, в котором храниться timestamp когда токен был выпущен. By default `iat`.

- `customTokenStorages?: BaseTokenStorage[]` - Массив кастомных (пользовательских) хранилищ токена. By default empty array `[]`.

- `unsecuredUrls?: string[]` - Массив URL и Path, которые не будут обрабатываться AuthInterceptor'ом. т.е. на указанных URL и Path не будет проверяться access token и выполнятся обновление access token'а если он истек. By default empty array `[]`.
  > **Важно:** указывайте ваши URL для авторизации, например `http://localhost:5000/auth` или часть URL - `/auth/refresh`,`/auth/login`, `/auth/registration` или все URL для аутентификации `/auth`, чтобы избежать бесконечно рекурсивного вызова обновления токена при выдаче 401 статус кода.

  > **Важно:** всегда указывайте URL для обновления токена, иначе будет циркулярная зависимость:
  >> ERROR Error: NG0200: Circular dependency in DI detected for JwtAuthService.
  >
  > Это происходит потому что `HttpClient` зависит от `Interceptor (JwtAuthInterceptor)` зависит от `AuthApiService` зависит от `HttpClient`.
  > 
  > [Способ исправления данной ошибки здесь.](#troubleshooting)

- `refreshThreshold?: number` - Коэффициент порога обновления токена, если expireIn access token'а приблизиться к данному коэффициенту, то будет произведен рефреш токена. By default `0.8`.

- `saveRefreshTokenInStorage?: boolean` - Сохранять ли refresh token который приходит при авторизации и/или при обновлении токена. By default `false`.
  > Стоит включать данную опцию только если сервер не сохраняет refresh token в cookie, тогда для обновления токена нужно его передавать в запрос на обновление, а хранить придется на клиенте, что изначально является плохой практикой и может привести к проблемам в защите приложения путем кражи злоумышленником access и refresh токенов.

  > **Важно:** если данная опция включена, то следует сменить `authTokenStorage` с `InMemoryTokenStorage` на любой другой предопределенный или кастомный `TokenStorage`. Если этого не сделать, то пользователю придется каждый раз логинится при обновлении страницы, так как при обновлении страницы будет очищатся память и соответственно `InMemoryTokenStorage`, так устроен JS.

- `unAuthGuardRedirectUrl?: string` - URL куда будет редиректить авторизованного пользователя, если он попробует зайти на route защищенный UnAuthGuard. Если не задать значение, то route защищенный UnAuthGuard будут просто отклонять переход на данный route.

- `authGuardRedirectUrl?: string` - URL куда будет редиректить не авторизованного пользователя, если он попробует зайти на route защищенный AuthGuard. Если не задать значение, то route защищенный AuthGuard будут просто отклонять переход на данный route.

## Список предопределенных хранилищ токенов

- `CookiesTokenStorage` - абстракция над cookies, сохраняет токены в cookies;
- `LocalStorageTokenStorage` - абстракция над localStorage, сохраняет токены в localStorage;
- `SessionStorageTokenStorage` - абстракция над sessionStorage, сохраняет токены в sessionStorage;
- `InMemoryTokenStorage` - сохраняет токены в памяти приложения, есть свои недостатки, при использовании данного хранилища для авторизационных токенов после перезагрузки страницы будет выполнен запрос на обновление токена доступа (для SPA приложений это не критично), но зато самое безопасное хранилище для авторизационных токенов;

## Создание своего хранилища токенов

Для того чтобы создать свое хранилище токенов достаточно реализовать базовый класс [BaseTokenStorage](../../lib/token-storages/base-token-storage.ts) и указать в параметре `customTokenStorages` модуля `JwtAuthModule.forRoot()` массив кастомных хранилище токенов. Пример:

```typescript
// my-custom-token-storage.ts
import { BaseTokenStorage } from 'jwt-auth';

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

  // можем переопределить метод для проверки валидности токенами
  // но делать это не рекомендуется!
  public override isValid(key: string): boolean {
    // super.isValid();
    // custom realisation
  }
}
```

Определяем наше хранилище в параметрах модуля `JwtAuthModule`:

```typescript
// app.module.ts
import { JwtAuthModule } from 'jwt-auth';
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

Либо мы можем зарегистрировать наше хранилище посредством сервиса `TokenStorageRegistry`:

```typescript
// app.service.ts
import { TokenStorageRegistry } from 'jwt-auth';
import { MyCustomTokenStorage } from '../auth';

@Injactable({
  provideIn: 'root'
})
export class AppModule {
  constructor(private readonly _tokenStorageRegistry: TokenStorageRegistry) {
    this._tokenStorageRegistry.register(new MyCustomTokenStorage());
  }
}
```

Исходный код `TokenStorageRegistry` [здесь](../../lib/services/token-storage-registry.service.ts).

## Смена хранилища токенов в рантайме

В редких случаях может понадобится в рантайме изменить хранилище токенов, для этого существует два сервиса [TokenStorageManager](../../lib/services/token-storage-manager.service.ts) и [AuthTokenStorageManager](../../lib/services/auth-token-storage-manager.service.ts), оба этих сервиса имеют одинаковый интерфейс взаимодествия. `TokenStorageManager` используется для управление хранилищем __не авторизационных__ токенов, а `AuthTokenStorageManager` для управление хранилищем __авторизационных__ токенов. 

Пример:

```typescript
// app.service.ts
import {
  AuthTokenStorageManager,
  TokenStorageRegistry,
  CookiesTokenStorage,
  BaseTokenStorage,
} from 'jwt-auth';
import { MyCustomTokenStorage } from '../auth';

@Injactable({
	provideIn: 'root'
})
export class AppModule {
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

- При старте приложения выдает ошибку __"ERROR Error: NG0200: Circular dependency in DI detected for JwtAuthService."__

  Причинной данной обишбки - цикличный вызов `JwtAuthInterceptor`. Так как interceptor обработавыает каждый запрос, за исключением тех зопросов url которые указаны в параметре конфига `unsecuredUrls`, запрос на обновление токена создает цикличную зависимость.

  Решением данной проблемы является указать в массиве `unsecuredUrls` URL или path запроса на обновление accessToken'а, либо указать корневой path для всех запросов связанных с авторизацией/регистрацией пользователя, например: `"/auth/"`, тогда все запросы c path auth будут исключены из проверки interceptor'a - `server.api/auth/login`, `server.api/auth/register`, `server.api/auth/refresh` и подобные.