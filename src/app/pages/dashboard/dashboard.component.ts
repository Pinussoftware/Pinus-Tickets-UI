import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DashboardStats } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Dashboard</h1>
      <p class="subtitle">Software Maintenance Overview</p>
    </div>
    <a routerLink="/tickets/new" class="btn-primary">+ New Ticket</a>
  </div>

  <div class="kpi-grid" *ngIf="stats">
    <div class="kpi-card">
      <div class="kpi-icon open">🎫</div>
      <div class="kpi-value">{{ stats.openTickets }}</div>
      <div class="kpi-label">Open Tickets</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon unassigned">👤</div>
      <div class="kpi-value">{{ stats.unassignedTickets }}</div>
      <div class="kpi-label">Unassigned</div>
    </div>
    <div class="kpi-card critical">
      <div class="kpi-icon">🔴</div>
      <div class="kpi-value">{{ stats.criticalHighTickets }}</div>
      <div class="kpi-label">Critical / High</div>
    </div>
    <div class="kpi-card warning">
      <div class="kpi-icon">⏰</div>
      <div class="kpi-value">{{ stats.slaAtRisk }}</div>
      <div class="kpi-label">SLA At Risk</div>
    </div>
    <div class="kpi-card danger">
      <div class="kpi-icon">🚨</div>
      <div class="kpi-value">{{ stats.overdueTickets }}</div>
      <div class="kpi-label">Overdue</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon">📈</div>
      <div class="kpi-value">{{ stats.avgResolutionHours | number:'1.1-1' }}h</div>
      <div class="kpi-label">Avg Resolution</div>
    </div>
  </div>

  <div class="loading" *ngIf="!stats">Loading dashboard…</div>

  <div class="quick-actions">
    <h2>Quick Actions</h2>
    <div class="actions-row">
      <a routerLink="/tickets" [queryParams]="{status:'New'}" class="action-card">📥 New Tickets</a>
      <a routerLink="/tickets" [queryParams]="{status:'In Progress'}" class="action-card">🔧 In Progress</a>
      <a routerLink="/tickets" [queryParams]="{status:'Ready for QA'}" class="action-card">🔬 Ready for QA</a>
      <a routerLink="/tickets" [queryParams]="{priority:'Critical'}" class="action-card critical-action">🔴 Critical</a>
    </div>
  </div>
</div>
  `,
  styles: [`
.page { padding:28px 32px; max-width:1200px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; }
h1 { font-size:24px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { color:#64748b; margin:0; font-size:14px; }
.btn-primary { background:#3b82f6; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-size:14px; font-weight:600; }
.btn-primary:hover { background:#2563eb; }
.kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:32px; }
.kpi-card { background:#fff; border-radius:12px; padding:20px; border:1px solid #e2e8f0; }
.kpi-card.critical { border-left:4px solid #ef4444; }
.kpi-card.warning  { border-left:4px solid #f59e0b; }
.kpi-card.danger   { border-left:4px solid #dc2626; }
.kpi-icon { font-size:28px; margin-bottom:8px; }
.kpi-value { font-size:32px; font-weight:700; color:#1e293b; }
.kpi-label { font-size:13px; color:#64748b; margin-top:4px; }
.loading { text-align:center; padding:40px; color:#94a3b8; }
.quick-actions h2 { font-size:18px; font-weight:600; color:#1e293b; margin-bottom:12px; }
.actions-row { display:flex; gap:12px; flex-wrap:wrap; }
.action-card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; text-decoration:none; color:#374151; font-size:14px; font-weight:500; transition:all .15s; }
.action-card:hover { border-color:#3b82f6; color:#3b82f6; box-shadow:0 4px 12px rgba(59,130,246,.15); }
.action-card.critical-action { border-color:#fecaca; color:#dc2626; }
  `]
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe({ next: s => this.stats = s });
  }
}
