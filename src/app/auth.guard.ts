import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    if (this.authService.isLoggedIn) {
      if (state.url === '/login') {
        this.router.navigate([this.authService.isAdmin ? '/admin' : '/home']);
        return false;
      }
      if (state.url === '/admin' && !this.authService.isAdmin) {
        this.router.navigate(['/home']);
        return false;
      }
      if (state.url === '/home' && this.authService.isAdmin) {
        this.router.navigate(['/admin']);
        return false;
      }
      return true;
    } else {
      if (state.url !== '/login') {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    }
  }
}
