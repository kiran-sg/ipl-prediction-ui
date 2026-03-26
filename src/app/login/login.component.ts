import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { CommonService } from '../common.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  invalidPwd: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: CommonService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { userId } = this.loginForm.value;
      this.service.validateUser(userId, '').subscribe(
        (data: any) => {
          if (data.validUser) {
            this.authService.login(userId, data.user?.isAdmin || false, data.user?.location, data.user?.surgesRemaining);
            this.router.navigate([data.user?.isAdmin ? '/admin' : '/home']);
          } else {
            this.invalidPwd = true;
          }
        },
        (error) => {
          console.error('Error validating user:', error);
        }
      );
    }
  }
}
