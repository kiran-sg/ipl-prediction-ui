import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ErrorDialogComponent } from './shared/error-dialog/error-dialog.component';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_DURATION_MS = 2 * 60 * 1000; // 30 minutes
  private sessionTimer: any;

  constructor(private router: Router, private dialog: MatDialog) {
    this.startSessionCheck();
  }

  get isLoggedIn(): boolean {
    if (!localStorage.getItem('userId')) return false;
    if (this.isSessionExpired()) {
      this.logout();
      return false;
    }
    return true;
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

  get surgesRemaining(): number {
    const val = parseInt(localStorage.getItem('surgesRemaining') || '', 10);
    return isNaN(val) ? 3 : val;
  }

  setSurgesRemaining(count: number): void {
    localStorage.setItem('surgesRemaining', String(count));
  }

  login(userId: string, isAdmin: boolean, location?: string, surgesRemaining?: number): void {
    localStorage.setItem('userId', userId);
    localStorage.setItem('isAdmin', String(isAdmin));
    localStorage.setItem('loginTime', String(Date.now()));
    if (location) localStorage.setItem('location', location);
    localStorage.setItem('surgesRemaining', String(surgesRemaining ?? 3));
    this.startSessionCheck();
  }

  logout(sessionExpired = false): void {
    this.dialog.closeAll();
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('location');
    localStorage.removeItem('surgesRemaining');
    localStorage.removeItem('loginTime');
    clearInterval(this.sessionTimer);
    this.router.navigate(['/login']);
    if (sessionExpired) {
      this.dialog.open(ErrorDialogComponent, {
        width: '340px',
        data: { title: 'Session Expired', message: 'Your session has expired. Please log in again.' }
      });
    }
  }

  private isSessionExpired(): boolean {
    const loginTime = parseInt(localStorage.getItem('loginTime') || '0', 10);
    return Date.now() - loginTime > this.SESSION_DURATION_MS;
  }

  getSessionRemainingText(): string {
    const loginTime = parseInt(localStorage.getItem('loginTime') || '0', 10);
    const remaining = this.SESSION_DURATION_MS - (Date.now() - loginTime);
    if (remaining <= 0) return 'Expired';
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }

  private startSessionCheck(): void {
    clearInterval(this.sessionTimer);
    this.sessionTimer = setInterval(() => {
      if (localStorage.getItem('userId') && this.isSessionExpired()) {
        this.logout(true);
      }
    }, 60 * 1000); // check every minute
  }
}
