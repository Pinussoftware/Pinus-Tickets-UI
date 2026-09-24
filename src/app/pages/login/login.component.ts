import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="login-bg">
  <div class="login-card">
    <div class="login-header">
      <span class="login-logo">🎫</span>
      <h1>Pinus Ticket System</h1>
      <p>Software Maintenance Management</p>
    </div>
    <form (ngSubmit)="login()" class="login-form">
      <label>Email</label>
      <input type="email" [(ngModel)]="email" name="email" placeholder="admin@pinussoftware.com" required />
      <label>Password</label>
      <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
      <div class="error-msg" *ngIf="error">{{ error }}</div>
      <button type="submit" [disabled]="loading" class="btn-primary">
        {{ loading ? 'Signing in…' : 'Sign In' }}
      </button>
    </form>
  </div>
</div>
  `,
  styles: [`
.login-bg { min-height:100vh; background:linear-gradient(135deg,#1e3a5f 0%,#1e293b 100%); display:flex; align-items:center; justify-content:center; }
.login-card { background:#fff; border-radius:16px; padding:40px; width:100%; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,.3); }
.login-header { text-align:center; margin-bottom:28px; }
.login-logo { font-size:48px; display:block; margin-bottom:8px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
p { color:#64748b; font-size:14px; margin:0; }
.login-form label { display:block; font-size:13px; font-weight:600; color:#374151; margin:16px 0 4px; }
.login-form input { width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; box-sizing:border-box; }
.login-form input:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
.btn-primary { width:100%; margin-top:20px; padding:12px; background:#3b82f6; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; }
.btn-primary:hover:not(:disabled) { background:#2563eb; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.error-msg { color:#ef4444; font-size:13px; margin-top:8px; }
  `]
})
export class LoginComponent {
  email = ''; password = ''; loading = false; error = '';

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) router.navigate(['/']);
  }

  login() {
    this.loading = true; this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => { this.error = 'Invalid credentials'; this.loading = false; }
    });
  }
}
