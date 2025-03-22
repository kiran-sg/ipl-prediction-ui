import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoadingService } from './loading.service';
import { MatchResult } from './models/match-result';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = environment.apiUrl + '/admin';

  constructor(private http: HttpClient, private loadingService: LoadingService) { }

  getMatchResult(matchId: string): Observable<any> {
    this.loadingService.show(); // Show loader
    return this.http.get(`${this.baseUrl}/match/result?matchId=${matchId}`).pipe(
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

  updateMatchResults(matchResult: MatchResult): Observable<any> {
      this.loadingService.show(); // Show loader
      return this.http.post(`${this.baseUrl}/match/result`, matchResult, {
        withCredentials: true,
      }).pipe(
        finalize(() => this.loadingService.hide()) // Hide loader when the request completes
      );
    }
}
