import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('userId');
  }

  get userId(): string | null {
    return localStorage.getItem('userId');
  }

  get isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  get location(): string | null {
    return localStorage.getItem('location');
  }

  login(userId: string, isAdmin: boolean, location?: string): void {
    localStorage.setItem('userId', userId);
    localStorage.setItem('isAdmin', String(isAdmin));
    if (location) localStorage.setItem('location', location);
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('location');
    this.router.navigate(['/login']);
  }
}
