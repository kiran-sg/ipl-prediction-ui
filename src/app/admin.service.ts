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
    this.loadingService.show();
    return this.http.get(`${this.baseUrl}/match/result?matchId=${matchId}`).pipe(
      finalize(() => this.loadingService.hide())
    );
  }

  updateMatchResults(matchResult: MatchResult): Observable<any> {
    this.loadingService.show();
    return this.http.post(`${this.baseUrl}/match/result`, matchResult, {
      withCredentials: true,
    }).pipe(
      finalize(() => this.loadingService.hide())
    );
  }

  getPredictionsByMatch(matchId: string): Observable<any> {
    this.loadingService.show();
    return this.http.get(`${this.baseUrl}/predictions/match?matchId=${matchId}`).pipe(
      finalize(() => this.loadingService.hide())
    );
  }

  saveTournamentResult(result: any): Observable<any> {
    this.loadingService.show();
    return this.http.post(`${this.baseUrl}/tournament/result`, result, {
      withCredentials: true,
    }).pipe(
      finalize(() => this.loadingService.hide())
    );
  }

  getTournamentResult(): Observable<any> {
    this.loadingService.show();
    return this.http.get(`${this.baseUrl}/tournament/result`).pipe(
      finalize(() => this.loadingService.hide())
    );
  }

  getAllTournamentPredictions(): Observable<any> {
    this.loadingService.show();
    return this.http.get(`${this.baseUrl}/tournament/predictions`).pipe(
      finalize(() => this.loadingService.hide())
    );
  }
}
