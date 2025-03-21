import { ApplicationConfig, Provider, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router, RouterModule } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { DatePipe } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    CommonService,
    DatePipe
  ]
};
