import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { LAST_PATH_KEY } from '../const/last-path-key';
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

  // TODO use inject in v14
  constructor(private readonly router: Router) { 
    super(router);
    this.watch();
  }

  public savePath(route: string): void {
    localStorage.setItem(LAST_PATH_KEY, route);
  }
  
  public getPath(): string | null {
    return localStorage.getItem(LAST_PATH_KEY);
  }
}
