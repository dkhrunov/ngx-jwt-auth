import { DOCUMENT } from "@angular/common";
import { InjectionToken, inject } from "@angular/core";

export const WINDOW = new InjectionToken<Window>(
  'ngx-jwt-auth/WINDOW',
  {
    factory: () => inject(DOCUMENT).defaultView!
  },
);