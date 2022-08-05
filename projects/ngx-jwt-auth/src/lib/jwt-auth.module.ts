import { Injector, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import {
  AUTH_API_SERVICE,
  AUTH_TOKEN_STORAGE,
  JWT_AUTH_CONFIG,
  TOKEN_STORAGE
} from './injection-tokens';
import { JwtAuthConfig } from './jwt-auth-config';
import { LastPageWatcher } from './services/last-page-watcher.service';

/**
 * Core module of JWT auth lib.
 */
@NgModule({})
export class JwtAuthModule {
  public static injector: Injector;

  constructor(injector: Injector) {
    JwtAuthModule.injector = injector;
  }

  /**
   * Sets global configuration for JWT auth lib.
   * 
   * This method is called once in the Root module, AppModule or CoreModule.
   * 
   * @param options the configuration object.
   */
  public static forRoot(options: JwtAuthConfig): ModuleWithProviders<JwtAuthModule> {
    const providers: Provider[] = [
      {
        provide: JWT_AUTH_CONFIG,
        useValue: new JwtAuthConfig(options),
      },
      {
        provide: AUTH_API_SERVICE,
        useClass: options.authApiService,
      },
      {
        provide: TOKEN_STORAGE,
        useClass: options.tokenStorage!,
      },
      {
        provide: AUTH_TOKEN_STORAGE,
        useClass: options.authTokenStorage!,
      },
    ];

    if (options.redirectToLastPage) {
      typeof options.redirectToLastPage === 'boolean'
        ? providers.push(LastPageWatcher)
        : providers.push({
            provide: LastPageWatcher,
            useClass: options.redirectToLastPage
          });
    }

    return {
      ngModule: JwtAuthModule,
      providers,
    };
  }
}