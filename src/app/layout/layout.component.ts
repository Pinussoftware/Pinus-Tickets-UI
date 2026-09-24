import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <span class="logo">🎫</span>
      <span class="brand-name">Pinus Tickets</span>
    </div>
    <nav class="nav">
      <a routerLink="/dashboard"  routerLinkActive="active" class="nav-item">📊 Dashboard</a>
      <a routerLink="/tickets"    routerLinkActive="active" class="nav-item">🎫 Tickets</a>
      <a routerLink="/customers"  routerLinkActive="active" class="nav-item">🏢 Customers</a>
      <a *ngIf="isAdmin" routerLink="/users" routerLinkActive="active" class="nav-item">👥 Users</a>
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <strong>{{ user?.name }}</strong>
        <span class="role-badge">{{ user?.role }}</span>
      </div>
      <button class="btn-logout" (click)="logout()">Logout</button>
    </div>
  </aside>
  <main class="content">
    <router-outlet />
  </main>
</div>
  `,
  styles: [`
.shell { display:flex; height:100vh; font-family:'Inter',sans-serif; background:#f8fafc; }
.sidebar { width:240px; min-width:240px; background:#1e293b; color:#f1f5f9; display:flex; flex-direction:column; }
.brand { padding:20px 16px; display:flex; align-items:center; gap:10px; border-bottom:1px solid #334155; }
.brand-name { font-size:16px; font-weight:700; color:#fff; }
.logo { font-size:22px; }
.nav { flex:1; padding:12px 8px; display:flex; flex-direction:column; gap:2px; }
.nav-item { padding:10px 12px; border-radius:8px; color:#94a3b8; text-decoration:none; font-size:14px; transition:all .15s; }
.nav-item:hover, .nav-item.active { background:#334155; color:#fff; }
.sidebar-footer { padding:12px 16px; border-top:1px solid #334155; }
.user-info { margin-bottom:8px; }
.user-info strong { display:block; font-size:13px; color:#f1f5f9; }
.role-badge { font-size:11px; background:#3b82f6; color:#fff; padding:2px 8px; border-radius:20px; }
.btn-logout { width:100%; background:transparent; border:1px solid #475569; color:#94a3b8; padding:6px; border-radius:6px; cursor:pointer; font-size:13px; }
.btn-logout:hover { border-color:#ef4444; color:#ef4444; }
.content { flex:1; overflow-y:auto; }
  `]
})
export class LayoutComponent {
  constructor(private auth: AuthService) {}
  get user()    { return this.auth.currentUser; }
  get isAdmin() { return this.auth.role === 'Admin'; }
  logout()      { this.auth.logout(); }
}
