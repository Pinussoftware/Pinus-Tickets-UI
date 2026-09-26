import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="shell">
  <!-- Sidebar -->
  <aside class="sidebar" [class.collapsed]="collapsed">
    <div class="brand">
      <img src="assets/logo1.png" alt="Pinus" class="brand-logo" *ngIf="!collapsed" />
      <span class="brand-icon" *ngIf="collapsed">🎫</span>
      <button class="collapse-btn" (click)="collapsed=!collapsed">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>

    <nav class="nav">
      <div class="nav-section">
        <span class="nav-label" *ngIf="!collapsed">OVERVIEW</span>
        <a *ngIf="can('dashboard')" routerLink="/dashboard" routerLinkActive="active" class="nav-item" title="Dashboard">
          <span class="nav-icon">📊</span><span class="nav-text" *ngIf="!collapsed">Dashboard</span>
        </a>
      </div>

      <div class="nav-section">
        <span class="nav-label" *ngIf="!collapsed">TICKETS</span>
        <a *ngIf="can('tickets')" routerLink="/tickets" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-item" title="All Tickets">
          <span class="nav-icon">🎫</span><span class="nav-text" *ngIf="!collapsed">All Tickets</span>
        </a>
        <a *ngIf="can('ticket_create')" routerLink="/tickets/new" routerLinkActive="active" class="nav-item" title="New Ticket">
          <span class="nav-icon">➕</span><span class="nav-text" *ngIf="!collapsed">Create Ticket</span>
        </a>
        <a *ngIf="can('workbench')" routerLink="/workbench" routerLinkActive="active" class="nav-item" title="My Workbench">
          <span class="nav-icon">🔧</span><span class="nav-text" *ngIf="!collapsed">My Workbench</span>
        </a>
        <a *ngIf="can('qa_queue')" routerLink="/qa-queue" routerLinkActive="active" class="nav-item" title="QA Queue">
          <span class="nav-icon">🔬</span><span class="nav-text" *ngIf="!collapsed">QA Queue</span>
        </a>
      </div>

      <div class="nav-section">
        <span class="nav-label" *ngIf="!collapsed">MANAGEMENT</span>
        <a *ngIf="can('assignment')"    routerLink="/assignment"   routerLinkActive="active" class="nav-item" title="Assignment">
          <span class="nav-icon">🎯</span><span class="nav-text" *ngIf="!collapsed">Assignment</span>
        </a>
        <a *ngIf="can('customers')"     routerLink="/customers"    routerLinkActive="active" class="nav-item" title="Customers">
          <span class="nav-icon">🏢</span><span class="nav-text" *ngIf="!collapsed">Customers</span>
        </a>
        <a *ngIf="can('applications')"  routerLink="/applications" routerLinkActive="active" class="nav-item" title="Applications">
          <span class="nav-icon">💻</span><span class="nav-text" *ngIf="!collapsed">Applications</span>
        </a>
        <a *ngIf="can('contracts')"     routerLink="/contracts"    routerLinkActive="active" class="nav-item" title="Contracts & SLA">
          <span class="nav-icon">📋</span><span class="nav-text" *ngIf="!collapsed">Contracts & SLA</span>
        </a>
        <a *ngIf="can('reports')"       routerLink="/reports"      routerLinkActive="active" class="nav-item" title="Reports">
          <span class="nav-icon">📈</span><span class="nav-text" *ngIf="!collapsed">Reports</span>
        </a>
        <a *ngIf="can('notifications')" routerLink="/notifications" routerLinkActive="active" class="nav-item" title="Notifications">
          <span class="nav-icon">📬</span><span class="nav-text" *ngIf="!collapsed">Notifications</span>
        </a>
      </div>

      <div class="nav-section" *ngIf="isAdmin">
        <span class="nav-label" *ngIf="!collapsed">ADMIN</span>
        <a routerLink="/users" routerLinkActive="active" class="nav-item" title="Users">
          <span class="nav-icon">👥</span><span class="nav-text" *ngIf="!collapsed">Users</span>
        </a>
        <a routerLink="/role-permissions" routerLinkActive="active" class="nav-item" title="Role Permissions">
          <span class="nav-icon">🔐</span><span class="nav-text" *ngIf="!collapsed">Role Permissions</span>
        </a>
      </div>
    </nav>

    <!-- User profile -->
    <div class="sidebar-profile" *ngIf="!collapsed">
      <div class="avatar">{{ initials }}</div>
      <div class="profile-info">
        <span class="profile-name">{{ user?.name }}</span>
        <span class="profile-role">{{ user?.role }}</span>
      </div>
      <button class="logout-btn" (click)="logout()" title="Logout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
    <div class="sidebar-profile-collapsed" *ngIf="collapsed">
      <div class="avatar sm">{{ initials }}</div>
      <button class="logout-btn sm" (click)="logout()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  </aside>

  <!-- Main area -->
  <div class="main-wrap">
    <!-- Top bar -->
    <header class="topbar">
      <div class="breadcrumb">
        <span class="bc-home">🏠</span>
        <span class="bc-sep">›</span>
        <span class="bc-page">{{ pageTitle }}</span>
      </div>
      <div class="topbar-right">
        <div class="org-badge">
          <span class="org-dot"></span>
          {{ user?.organizationName }}
        </div>
        <a *ngIf="can('ticket_create')" routerLink="/tickets/new" class="topbar-new-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Ticket
        </a>
      </div>
    </header>

    <main class="content">
      <router-outlet />
    </main>
  </div>
</div>
  `,
  styles: [`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }

.shell { display:flex; height:100vh; font-family:'Inter',sans-serif; background:#f1f5f9; overflow:hidden; }

/* ── Sidebar ── */
.sidebar { width:240px; min-width:240px; background:#171a35; color:#f1f5f9;
  display:flex; flex-direction:column; transition:width .2s ease; flex-shrink:0; overflow:hidden; }
.sidebar.collapsed { width:64px; min-width:64px; }

.brand { padding:16px 14px; display:flex; align-items:center; justify-content:space-between;
  border-bottom:1px solid rgba(255,255,255,.08); min-height:64px; }
.brand-logo { height:48px; object-fit:contain; background:#fff; border-radius:8px; padding:5px 12px; }
.brand-icon { font-size:22px; }
.collapse-btn { background:none; border:none; cursor:pointer; color:#8392ab; padding:4px;
  border-radius:6px; display:flex; align-items:center; flex-shrink:0; }
.collapse-btn:hover { background:rgba(255,255,255,.08); color:#fff; }

.nav { flex:1; padding:12px 8px; overflow-y:auto; }
.nav::-webkit-scrollbar { width:4px; }
.nav::-webkit-scrollbar-thumb { background:#334155; border-radius:2px; }
.nav-section { margin-bottom:8px; }
.nav-label { display:block; font-size:10px; font-weight:700; letter-spacing:1.2px;
  color:#475569; padding:8px 8px 4px; text-transform:uppercase; white-space:nowrap; }
.nav-item { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px;
  color:#94a3b8; text-decoration:none; font-size:13.5px; font-weight:500;
  transition:all .15s; white-space:nowrap; margin-bottom:1px; }
.nav-item:hover { background:rgba(255,255,255,.07); color:#e2e8f0; }
.nav-item.active { background:linear-gradient(90deg,rgba(238,130,153,.18),rgba(131,146,171,.12));
  color:#fff; border-left:3px solid #ee8299; padding-left:7px; }
.nav-icon { font-size:16px; flex-shrink:0; width:20px; text-align:center; }
.nav-text { overflow:hidden; text-overflow:ellipsis; }

/* ── Profile ── */
.sidebar-profile { padding:12px 14px; border-top:1px solid rgba(255,255,255,.08);
  display:flex; align-items:center; gap:10px; }
.avatar { width:34px; height:34px; background:linear-gradient(135deg,#8392ab,#ee8299);
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }
.avatar.sm { width:28px; height:28px; font-size:11px; }
.profile-info { flex:1; overflow:hidden; }
.profile-name { display:block; font-size:12.5px; font-weight:600; color:#e2e8f0;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.profile-role { display:block; font-size:11px; color:#64748b; margin-top:1px; }
.logout-btn { background:none; border:none; cursor:pointer; color:#475569;
  padding:6px; border-radius:6px; display:flex; align-items:center; }
.logout-btn:hover { background:rgba(239,68,68,.15); color:#ef4444; }
.logout-btn.sm { padding:4px; }
.sidebar-profile-collapsed { padding:10px 8px; border-top:1px solid rgba(255,255,255,.08);
  display:flex; flex-direction:column; align-items:center; gap:8px; }

/* ── Main wrap ── */
.main-wrap { flex:1; display:flex; flex-direction:column; overflow:hidden; }

/* ── Topbar ── */
.topbar { height:56px; background:#fff; border-bottom:1px solid #e2e8f0;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 24px; flex-shrink:0; }
.breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#64748b; }
.bc-home { font-size:15px; }
.bc-sep { color:#cbd5e1; }
.bc-page { font-weight:600; color:#1e293b; }
.topbar-right { display:flex; align-items:center; gap:14px; }
.org-badge { display:flex; align-items:center; gap:6px; font-size:12px;
  color:#64748b; background:#f8fafc; padding:5px 12px; border-radius:20px;
  border:1px solid #e2e8f0; }
.org-dot { width:7px; height:7px; background:#22c55e; border-radius:50%; flex-shrink:0; }
.topbar-new-btn { display:flex; align-items:center; gap:6px; background:#171a35;
  color:#fff; padding:8px 14px; border-radius:8px; text-decoration:none;
  font-size:13px; font-weight:600; transition:background .15s; }
.topbar-new-btn:hover { background:#12335d; }

/* ── Content ── */
.content { flex:1; overflow-y:auto; }
.content::-webkit-scrollbar { width:6px; }
.content::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
  `]
})
export class LayoutComponent implements OnInit {
  collapsed = false;
  pageTitle = 'Dashboard';
  // Map of pageKey -> canAccess (null = not loaded yet, Admin = all true)
  private perms: Record<string, boolean> = {};
  private permsLoaded = false;

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects;
      this.pageTitle =
        url.includes('/dashboard')     ? 'Dashboard' :
        url.includes('/tickets/new')   ? 'Create Ticket' :
        url.match(/\/tickets\/\d+/)    ? 'Ticket Detail' :
        url.includes('/tickets')       ? 'All Tickets' :
        url.includes('/workbench')     ? 'My Workbench' :
        url.includes('/qa-queue')      ? 'QA Queue' :
        url.includes('/customers')     ? 'Customers' :
        url.includes('/applications')  ? 'Applications' :
        url.includes('/contracts')     ? 'Contracts & SLA' :
        url.includes('/assignment')    ? 'Ticket Assignment' :
        url.includes('/notifications') ? 'Notifications' :
        url.includes('/reports')       ? 'Reports' :
        url.includes('/role-permissions') ? 'Role Permissions' :
        url.includes('/users')         ? 'User Management' : 'Dashboard';
    });

    this.loadPermissions();
  }

  loadPermissions() {
    const role = this.auth.role;
    // Admin always sees everything — no lookup needed
    if (role === 'Admin') { this.permsLoaded = true; return; }
    this.api.getRolePermissions(role).subscribe({
      next: (data: any[]) => {
        this.perms = {};
        data.forEach((d: any) => { this.perms[d.pageKey] = d.canAccess; });
        this.permsLoaded = true;
      },
      error: () => { this.permsLoaded = true; } // fail open — show all if API fails
    });
  }

  // Admin always true; others check loaded perms (default true while loading)
  can(pageKey: string): boolean {
    if (this.auth.role === 'Admin') return true;
    if (!this.permsLoaded) return false;
    return this.perms[pageKey] === true;
  }

  get user()    { return this.auth.currentUser; }
  get isAdmin() { return ['Admin', 'SupportManager'].includes(this.auth.role); }
  get initials() {
    const n = this.auth.currentUser?.name || 'U';
    return n.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }
  logout() { this.auth.logout(); }
}
