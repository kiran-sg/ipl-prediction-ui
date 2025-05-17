import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LeaderBoardComponent } from './leader-board/leader-board.component';
import { AuthGuard } from './auth.guard';
import { AdminComponent } from './admin/admin.component';
import { InfoComponent } from './info/info.component';

export const routes: Routes = [
    { path: 'login', component: InfoComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: InfoComponent, canActivate: [AuthGuard] },
    { path: 'leaderboard', component: InfoComponent, canActivate: [AuthGuard] },
    { path: 'admin', component: InfoComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/home' }
];
