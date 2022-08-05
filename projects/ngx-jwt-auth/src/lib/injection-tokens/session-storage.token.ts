import {inject, InjectionToken} from '@angular/core';

import { WINDOW } from './window.token';

export const SESSION_STORAGE = new InjectionToken<Storage>(
    'ngx-jwt-auth/SESSION_STORAGE',
    {
        factory: () => inject(WINDOW).sessionStorage,
    },
);