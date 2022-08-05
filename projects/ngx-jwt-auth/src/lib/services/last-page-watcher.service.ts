import { inject, Injectable } from '@angular/core';

import { LAST_PATH_KEY } from '../const/last-path-key';
import { LOCAL_STORAGE } from '../injection-tokens';
import { BaseLastPageWatcher } from './base-last-page-watcher';

/**
 * Keeps track of each transition between pages and
 * stores in localStorage the previous page on which the user was.
 * 
 * ------------
 * This Watcher is suitable for simple redirect scenarios after user logout.
 * If the login logic is more complex (in terms of routing),
 * then it is worth creating a custom Watcher
 * that implements BaseLastPageWatcher and requesting it in app.module / core.module.
 */
@Injectable()
export class LastPageWatcher extends BaseLastPageWatcher {
  private readonly _localStorage = inject(LOCAL_STORAGE);

  constructor() { 
    super();
    this.watch();
  }

  public savePath(route: string): void {
    this._localStorage.setItem(LAST_PATH_KEY, route);
  }
  
  public getPath(): string | null {
    return this._localStorage.getItem(LAST_PATH_KEY);
  }
}
