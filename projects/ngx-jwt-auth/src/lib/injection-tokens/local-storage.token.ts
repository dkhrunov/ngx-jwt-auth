import {inject, InjectionToken} from '@angular/core';

import { WINDOW } from './window.token';

export const LOCAL_STORAGE = new InjectionToken<Storage>(
    'ngx-jwt-auth/LOCAL_STORAGE',
    {
        factory: () => inject(WINDOW).localStorage,
    },
);