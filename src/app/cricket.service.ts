import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CricketService {
  private apiKey = '13a5c1ca-6531-4f90-8c82-128b3a76c886';
  private apiUrl = 'https://api.cricapi.com/v1';

  constructor(private http: HttpClient) { }

  // Fetch upcoming matches
  getUpcomingMatches(): Observable<any> {
    const url = `${this.apiUrl}/matches?apikey=${this.apiKey}`;
    return this.http.get(url);
  }

  // Fetch live scores
  getLiveScores(): Observable<any> {
    const url = `${this.apiUrl}/cricketScore?apikey=${this.apiKey}`;
    return this.http.get(url);
  }

  // Fetch match details by ID
  getMatchDetails(matchId: string): Observable<any> {
    const url = `${this.apiUrl}/cricketScore?apikey=${this.apiKey}&unique_id=${matchId}`;
    return this.http.get(url);
  }
}