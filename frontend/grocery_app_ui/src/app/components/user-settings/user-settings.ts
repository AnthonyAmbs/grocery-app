import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-settings.html',
  styleUrls: ['./user-settings.scss']
})
export class UserSettingsComponent {
  step: 'menu' | 'verify' | 'change' = 'menu'; 
  action: 'username' | 'email' | 'password' | null = null;

  currentUsername = '';
  currentPassword = '';

  newValue = '';

  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  goBack() {
    this.router.navigate(['/lists']);
  }

  selectAction(action: 'username' | 'email' | 'password') {
    this.action = action;
    this.step = 'verify';
    this.error = '';
    this.currentUsername = '';
    this.currentPassword = '';
  }

  verifyCredentials() {
    this.authService.login(this.currentUsername, this.currentPassword).subscribe({
      next: () => {
        this.step = 'change';
        this.error = '';
      },
      error: () => {
        this.error = 'Invalid credentials';
      }
    });
  }

  submitChange() {
    if (!this.action) return;

    let body: any = {};
    if (this.action === 'username') body.newUsername = this.newValue;
    if (this.action === 'email') body.newEmail = this.newValue;
    if (this.action === 'password') body.newPassword = this.newValue;

    this.authService.updateUser(body).subscribe({
      next: () => {
        alert(`${this.action} changed successfully`);
        this.reset();
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to update ' + this.action;
      }
    });
  }

  reset() {
    this.step = 'menu';
    this.action = null;
    this.currentUsername = '';
    this.currentPassword = '';
    this.newValue = '';
    this.error = '';
  }
}
