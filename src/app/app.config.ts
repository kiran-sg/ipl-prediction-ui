import { ApplicationConfig, Injectable, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
 
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { CommonService } from './common.service';
import { CustomDatePipe } from './custom-date.pipe';
 
@Injectable()
class CredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const userId = localStorage.getItem('userId');
    const headers: {[name: string]: string} = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    return next.handle(req.clone({ withCredentials: true, setHeaders: headers }));
  }
}
 
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true },
    CommonService,
    CustomDatePipe
  ]
};