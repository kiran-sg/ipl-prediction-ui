import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { User } from './enums/user';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      if (state.url === '/login') {
        this.router.navigate(['/home']);
        return false;
      }
      if (state.url === '/admin' && userId !== User.ADMIN && userId !== User.SUPER_ADMIN) {
        this.router.navigate(['/home']);
        return false;
      }
      if (state.url === '/home' && (userId === User.ADMIN || userId === User.SUPER_ADMIN)) {
        this.router.navigate(['/admin']);
        return false;
      }
      if (state.url === '/leaderboard' && userId !== User.SUPER_ADMIN) {
        this.router.navigate(['/home']);
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
