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
<div class="login-page">
  <div class="login-card">

    <!-- Logo -->
    <img src="assets/logo1.png" alt="Pinus Software" class="login-logo" />

    <!-- Heading -->
    <h1 class="login-heading">TICKET SYSTEM</h1>
    <p class="login-subtitle">Software Maintenance Management</p>

    <!-- Form -->
    <form (ngSubmit)="login()" class="login-form" #f="ngForm">

      <div class="field-group">
        <label>Email Address</label>
        <div class="input-wrap">
          <span class="input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </span>
          <input type="email" [(ngModel)]="email" name="email"
                 placeholder="Enter your email" required autocomplete="email" />
        </div>
      </div>

      <div class="field-group">
        <label>Password</label>
        <div class="input-wrap">
          <span class="input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="password" name="password"
                 placeholder="Enter your password" required autocomplete="current-password" />
          <button type="button" class="toggle-pwd" (click)="showPwd=!showPwd" tabindex="-1">
            <svg *ngIf="!showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <svg *ngIf="showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="error-msg" *ngIf="error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>

      <button type="submit" class="btn-login" [disabled]="loading || f.invalid">
        <span class="btn-spinner" *ngIf="loading"></span>
        <span>{{ loading ? 'Signing in…' : 'Sign In' }}</span>
      </button>

    </form>

    <!-- Footer -->
    <p class="login-footer">
      © {{ year }} Pinus Software Solutions Pvt. Ltd.
    </p>
  </div>

  <!-- Background blobs -->
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="blob blob-3"></div>
</div>
  `,
  styles: [`


/* ── Page ─────────────────────────────────────────────── */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(112deg, #171a35 0%, #182443 50%, #12335d 100%);
  font-family: 'Inter', Arial, sans-serif;
  position: relative;
  overflow: hidden;
}

/* ── Animated background blobs ───────────────────────── */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  animation: float 8s ease-in-out infinite;
  pointer-events: none;
}
.blob-1 {
  width: 420px; height: 420px;
  background: #e94560;
  top: -120px; left: -120px;
  animation-delay: 0s;
}
.blob-2 {
  width: 350px; height: 350px;
  background: #0f3460;
  bottom: -80px; right: -80px;
  animation-delay: -3s;
}
.blob-3 {
  width: 260px; height: 260px;
  background: #8392ab;
  top: 50%; left: 60%;
  animation-delay: -5s;
}
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50%       { transform: translateY(-30px) scale(1.05); }
}

/* ── Card ─────────────────────────────────────────────── */
.login-card {
  position: relative;
  z-index: 1;
  width: 440px;
  max-width: 100%;
  padding: 44px 46px 36px;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 24px 64px rgba(3, 11, 31, 0.40);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Logo ─────────────────────────────────────────────── */
.login-logo {
  width: 320px;
  max-width: 88%;
  height: auto;
  object-fit: contain;
  margin-bottom: 12px;
}

/* ── Headings ─────────────────────────────────────────── */
.login-heading {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #171a35;
  letter-spacing: 2.5px;
  text-align: center;
}
.login-subtitle {
  margin: 6px 0 28px;
  font-size: 13px;
  color: #617086;
  text-align: center;
  font-weight: 400;
}

/* ── Divider under heading ───────────────────────────── */
.login-heading::after {
  content: '';
  display: block;
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #0f3460, #e94560);
  border-radius: 2px;
  margin: 10px auto 0;
}

/* ── Form ─────────────────────────────────────────────── */
.login-form {
  width: 100%;
}

.field-group {
  margin-bottom: 18px;
}
.field-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #172033;
  margin-bottom: 7px;
}

/* ── Input wrap ──────────────────────────────────────── */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  color: #8392ab;
  display: flex;
  align-items: center;
  pointer-events: none;
}
.input-wrap input {
  width: 100%;
  min-height: 50px;
  padding: 0 44px 0 42px;
  border: 1.5px solid #d7dbe1;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Inter', Arial, sans-serif;
  color: #111827;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.input-wrap input::placeholder { color: #8392ab; }
.input-wrap input:focus {
  outline: none;
  border-color: #8392ab;
  box-shadow: 0 0 0 3px rgba(131, 146, 171, 0.15);
}

/* ── Show/hide password toggle ───────────────────────── */
.toggle-pwd {
  position: absolute;
  right: 13px;
  background: none;
  border: none;
  cursor: pointer;
  color: #8392ab;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.toggle-pwd:hover { color: #0f3460; }

/* ── Error message ───────────────────────────────────── */
.error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff0f3;
  border: 1px solid #fcd0d8;
  color: #c0384e;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* ── Sign In button ──────────────────────────────────── */
.btn-login {
  width: 100%;
  min-height: 52px;
  margin-top: 4px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(100deg, #8392ab 0%, #b894a8 48%, #ee8299 100%);
  color: #ffffff;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms;
  box-shadow: 0 4px 16px rgba(154, 116, 143, 0.30);
}
.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(154, 116, 143, 0.38);
}
.btn-login:active:not(:disabled) { transform: translateY(0); }
.btn-login:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* ── Spinner ─────────────────────────────────────────── */
.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Footer ──────────────────────────────────────────── */
.login-footer {
  margin: 24px 0 0;
  font-size: 11.5px;
  color: #617086;
  text-align: center;
}

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 480px) {
  .login-card { padding: 36px 24px 28px; border-radius: 18px; }
  .login-logo  { width: 260px; }
  .login-heading { font-size: 19px; }
  .btn-login { font-size: 15px; min-height: 50px; }
}
  `]
})
export class LoginComponent {
  email    = '';
  password = '';
  loading  = false;
  error    = '';
  showPwd  = false;
  year     = new Date().getFullYear();

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) router.navigate(['/']);
  }

  login() {
    this.loading = true; this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => { this.error = 'Invalid email or password'; this.loading = false; }
    });
  }
}
