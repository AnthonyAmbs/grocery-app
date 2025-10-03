import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.scss']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.username || !this.email || !this.password || this.password !== this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields and make sure passwords match';
      return;
    }

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => this.errorMessage = err.error?.message || 'Registration failed'
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
