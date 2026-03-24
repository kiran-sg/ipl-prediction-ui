import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface ApiTeam {
  id: number;
  shortName: string;
  teamName: string;
  logoUrl: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private baseUrl = environment.apiUrl;
  private teams: ApiTeam[] = [];

  constructor(private http: HttpClient) {}

  loadTeams(): Observable<ApiTeam[]> {
    if (this.teams.length) return of(this.teams);
    return this.http.get<ApiTeam[]>(`${this.baseUrl}/teams`).pipe(
      tap(data => this.teams = data)
    );
  }

  getShortName(fullName: string): string {
    return this.teams.find(t => t.teamName === fullName)?.shortName || fullName;
  }

  getLogo(fullName: string): string {
    return this.teams.find(t => t.teamName === fullName)?.logoUrl || '';
  }

  getLogoByShortName(shortName: string): string {
    return this.teams.find(t => t.shortName === shortName)?.logoUrl || '';
  }

  getAllShortNames(): string[] {
    return this.teams.map(t => t.shortName);
  }
}
