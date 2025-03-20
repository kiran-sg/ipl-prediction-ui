import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoadingService } from "./loading.service";
import { Observable, map, catchError, throwError } from "rxjs";

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];

    constructor(private loadingService: LoadingService) {}

    removeRequest(req: HttpRequest<any>) {
        const i = this.requests.indexOf(req);
        this.requests.splice(i, 1);
        this.loadingService.isLoading.next(this.requests.length > 0);
    }
     
    intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.requests.push(httpRequest);
        this.loadingService.isLoading.next(true);
        
        return next.handle(httpRequest).pipe(map(
            (event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                this.removeRequest(httpRequest);
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
            this.removeRequest(httpRequest);
            return throwError(error);
            })
        );
    }
}