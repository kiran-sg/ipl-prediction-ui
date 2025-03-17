import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  validateUser(userId: string, pwd: string): Observable<boolean> {
    const user = { userId, pwd };
    return this.http.post<boolean>(`${this.baseUrl}/users/validate`, user);
  }
}
