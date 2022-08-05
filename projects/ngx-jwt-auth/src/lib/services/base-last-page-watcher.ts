import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { filter, pairwise, takeUntil } from 'rxjs/operators';

@Injectable()
export abstract class BaseLastPageWatcher implements OnDestroy {
  protected readonly _stop$ = new Subject<void>();
  protected readonly _destroy$ = new Subject<void>();

  // TODO use inject in v14
  constructor(private readonly _router: Router) { 
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Starts monitoring for a change in routing.
   */
  public watch(): void {
    const stop$ = merge(this._stop$, this._destroy$);

    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        pairwise(),
        takeUntil(stop$),
      )
      .subscribe(([prev]) => this.savePath(prev.url));
  }

  /**
   * Stops monitoring for a change in routing.
   */
  public stopWatch(): void {
    this._stop$.next();
  }

  /**
   * Save path.
   * @param path Url string
   */
  public abstract savePath(path: string): void;
  
  /**
   * Get path.
   */
  public abstract getPath(): string | null;
}
