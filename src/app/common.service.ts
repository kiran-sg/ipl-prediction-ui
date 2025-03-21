import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { PredictedMatch } from './models/predicted-match.model';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private loadingService: LoadingService) { }

  validateUser(userId: string, pwd: string): Observable<boolean> {
    this.loadingService.show(); // Show loader
    const user = { userId, pwd };
    return this.http.post<boolean>(`${this.baseUrl}/users/validate`, user).pipe(
      tap((isValid: boolean) => {
        if (isValid) {
          sessionStorage.removeItem('userId');
          sessionStorage.setItem('userId', userId);
        }
      }),
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

  getMatches(): Observable<any> {
    this.loadingService.show(); // Show loader
    return this.http.get(`${this.baseUrl}/matches`).pipe(
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

  getLeaderBoard(location: string): Observable<any> {
    this.loadingService.show(); // Show loader
    return this.http.get(`${this.baseUrl}/predictions/leaderboard?location=${location}`).pipe(
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

  getPlayersByTeam(teams: string[]): Observable<any> {
    this.loadingService.show(); // Show loader
    const body = { teams };
    return this.http.post(`${this.baseUrl}/players`, body).pipe(
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

  getPredictionByMatchId(matchId: string): Observable<any> {
    this.loadingService.show(); // Show loader
    const userId = sessionStorage.getItem('userId');
    const body = { userId, matchId };
    return this.http.post(`${this.baseUrl}/predictions/match`, body).pipe(
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

  predictMatch(predictedMatch: PredictedMatch): Observable<any> {
    this.loadingService.show(); // Show loader
    return this.http.post(`${this.baseUrl}/predictions`, predictedMatch, {
      withCredentials: true,
    }).pipe(
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

}
