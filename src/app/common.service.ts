import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { PredictedMatch } from './models/predicted-match.model';
import { LoadingService } from './loading.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TournamentPrediction } from './models/tournament-prediction.model';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private baseUrl = environment.apiUrl;
  private _snackBar = inject(MatSnackBar);

  constructor(
    private http: HttpClient, 
    private loadingService: LoadingService,
    private router: Router
  ) { }

  validateUser(userId: string, pwd: string): Observable<any> {
    this.loadingService.show(); // Show loader
    const user = { userId, pwd };
    return this.http.post(`${this.baseUrl}/users/validate`, user).pipe(
      tap((data: any) => {
        if (data.validUser) {
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
      catchError((error) => {
        if (error.status === 401) {
          // Handle 401 Unauthorized error
          console.error('Unauthorized access - redirecting to login');
          this._snackBar.open(error.message, "Close");
          sessionStorage.removeItem('userId');
          this.router.navigate(['/login']); // Redirect to login page
        }
        return throwError(() => error); // Re-throw the error for further handling
      }),
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

  getPredictionsByUserId(): Observable<any> {
    this.loadingService.show(); // Show loader
    const userId = sessionStorage.getItem('userId');
    return this.http.get(`${this.baseUrl}/predictions?user=${userId}`).pipe(
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

  saveTournamentPrediction(prediction: TournamentPrediction): Observable<any> {
    this.loadingService.show(); // Show loader
    return this.http.post(`${this.baseUrl}/predictions/tournament`, prediction, {
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        if (error.status === 401) {
          // Handle 401 Unauthorized error
          console.error('Unauthorized access - redirecting to login');
          this._snackBar.open(error.message, "Close");
          sessionStorage.removeItem('userId');
          this.router.navigate(['/login']); // Redirect to login page
        }
        if (error.status === 400 && error.error.message !== null) {
          alert(error.error.message);// Redirect to login page
        }
        return throwError(() => error); // Re-throw the error for further handling
      }),
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

  getTournamentPredictionByUserId(): Observable<any> {
    this.loadingService.show(); // Show loader
    const userId = sessionStorage.getItem('userId');
    return this.http.get(`${this.baseUrl}/predictions/tournament?user=${userId}`).pipe(
      finalize(() => this.loadingService.hide()) // Hide loader when the request completes
    );
  }

}
