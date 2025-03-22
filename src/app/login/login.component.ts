import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { CommonService } from '../common.service';

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

  constructor(private fb: FormBuilder, private router: Router, 
    private service: CommonService) {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required]],
      password: ['']
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login Form Submitted', this.loginForm.value);
      const { userId, password } = this.loginForm.value;
      this.service.validateUser(userId, password).subscribe(
        (data: any) => {
          if (data.isValidUser) {
            this.router.navigate(['/home']);
          } else {
            console.error('Invalid user');
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
