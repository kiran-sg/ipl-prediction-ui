import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { PredictedMatch } from './models/predicted-match.model';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  validateUser(userId: string, pwd: string): Observable<boolean> {
    const user = { userId, pwd };
    return this.http.post<boolean>(`${this.baseUrl}/users/validate`, user).pipe(
      tap((isValid: boolean) => {
        if (isValid) {
          //const encryptedUserId = this.encryptionService.encrypt(userId);
          sessionStorage.removeItem('userId');
          sessionStorage.setItem('userId', userId);
        }
      })
    );
  }

  getMatches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/matches`);
  }

  getLeaderBoard(location: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/predictions/leaderboard?location=${location}`);
  }

  getPlayersByTeam(teams: string[]): Observable<any> {
    const body = { teams };
    return this.http.post(`${this.baseUrl}/players`, body);
  }

  getPredictionByMatchId(matchId: string): Observable<any> {
    const userId = sessionStorage.getItem('userId');
    const body = { userId, matchId };
    return this.http.post(`${this.baseUrl}/predictions/match`, body);
  }

  predictMatch(predictedMatch: PredictedMatch): Observable<any> {
    return this.http.post(`${this.baseUrl}/predictions`, predictedMatch, {
      withCredentials: true
    });
  }

}
