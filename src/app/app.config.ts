import { ApplicationConfig, Provider, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router, RouterModule } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { DatePipe } from '@angular/common';
import { LoadingService } from './loading.service';
import { LoaderInterceptor } from './loader-interceptor';

export const loaderInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: LoaderInterceptor,
  multi: true
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    loaderInterceptorProvider,
    CommonService,
    DatePipe
  ]
};
