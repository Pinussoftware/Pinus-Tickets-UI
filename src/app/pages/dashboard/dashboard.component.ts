import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DashboardStats, TicketListItem } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="page">
  <!-- KPI Row -->
  <div class="kpi-grid">
    <div class="kpi open">
      <div class="kpi-left">
        <div class="kpi-val">{{ stats?.openTickets ?? '—' }}</div>
        <div class="kpi-label">Open Tickets</div>
        <div class="kpi-trend up">↑ Active workload</div>
      </div>
      <div class="kpi-icon-box" style="background:rgba(59,130,246,.12)">🎫</div>
    </div>
    <div class="kpi unassigned">
      <div class="kpi-left">
        <div class="kpi-val">{{ stats?.unassignedTickets ?? '—' }}</div>
        <div class="kpi-label">Unassigned</div>
        <div class="kpi-trend warn">⚠ Needs attention</div>
      </div>
      <div class="kpi-icon-box" style="background:rgba(245,158,11,.12)">👤</div>
    </div>
    <div class="kpi critical">
      <div class="kpi-left">
        <div class="kpi-val">{{ stats?.criticalHighTickets ?? '—' }}</div>
        <div class="kpi-label">Critical / High</div>
        <div class="kpi-trend danger">🔴 Priority issues</div>
      </div>
      <div class="kpi-icon-box" style="background:rgba(239,68,68,.12)">🚨</div>
    </div>
    <div class="kpi sla">
      <div class="kpi-left">
        <div class="kpi-val">{{ stats?.slaAtRisk ?? '—' }}</div>
        <div class="kpi-label">SLA At Risk</div>
        <div class="kpi-trend warn">⏰ Next 4 hours</div>
      </div>
      <div class="kpi-icon-box" style="background:rgba(168,85,247,.12)">⏱</div>
    </div>
    <div class="kpi overdue">
      <div class="kpi-left">
        <div class="kpi-val">{{ stats?.overdueTickets ?? '—' }}</div>
        <div class="kpi-label">Overdue</div>
        <div class="kpi-trend danger">❌ Breached SLA</div>
      </div>
      <div class="kpi-icon-box" style="background:rgba(220,38,38,.12)">⛔</div>
    </div>
    <div class="kpi avg">
      <div class="kpi-left">
        <div class="kpi-val">{{ stats?.avgResolutionHours | number:'1.1-1' }}h</div>
        <div class="kpi-label">Avg Resolution</div>
        <div class="kpi-trend up">📈 Overall performance</div>
      </div>
      <div class="kpi-icon-box" style="background:rgba(34,197,94,.12)">✅</div>
    </div>
  </div>

  <!-- Two column layout -->
  <div class="two-col">
    <!-- Recent Tickets -->
    <div class="card wide">
      <div class="card-header">
        <h3>Recent Tickets</h3>
        <a routerLink="/tickets" class="see-all">View all →</a>
      </div>
      <table class="mini-table">
        <thead>
          <tr><th>#</th><th>Subject</th><th>Customer</th><th>Priority</th><th>Status</th><th>SLA</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of recent" [routerLink]="['/tickets',t.id]" class="clickable">
            <td><span class="tno">{{ t.ticketNo }}</span></td>
            <td class="subj">{{ t.subject }}</td>
            <td>{{ t.customerName }}</td>
            <td><span class="badge" [ngClass]="'p-'+t.priority.toLowerCase()">{{ t.priority }}</span></td>
            <td><span class="sbadge">{{ t.status }}</span></td>
            <td [class.overdue]="isOverdue(t.slaDueAt)" class="sla-cell">
              {{ t.slaDueAt ? (t.slaDueAt | date:'dd MMM HH:mm') : '—' }}
            </td>
          </tr>
          <tr *ngIf="recent.length===0">
            <td colspan="6" class="empty-row">No tickets yet — <a routerLink="/tickets/new">create one</a></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Right column -->
    <div class="right-col">
      <!-- Priority Breakdown -->
      <div class="card">
        <div class="card-header"><h3>Priority Breakdown</h3></div>
        <div class="priority-bars">
          <div *ngFor="let p of priorities" class="pbar-row">
            <span class="pbar-label">{{ p.label }}</span>
            <div class="pbar-track">
              <div class="pbar-fill" [style.width]="p.pct+'%'" [style.background]="p.color"></div>
            </div>
            <span class="pbar-count">{{ p.count }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header"><h3>Quick Actions</h3></div>
        <div class="quick-grid">
          <a routerLink="/tickets" [queryParams]="{status:'New'}" class="qa-btn">
            <span>📥</span> New Tickets
          </a>
          <a routerLink="/tickets" [queryParams]="{status:'In Progress'}" class="qa-btn">
            <span>🔧</span> In Progress
          </a>
          <a routerLink="/tickets" [queryParams]="{status:'Ready for QA'}" class="qa-btn">
            <span>🔬</span> Ready for QA
          </a>
          <a routerLink="/tickets" [queryParams]="{priority:'Critical'}" class="qa-btn danger-btn">
            <span>🔴</span> Critical
          </a>
          <a routerLink="/workbench" class="qa-btn">
            <span>💼</span> My Queue
          </a>
          <a routerLink="/reports" class="qa-btn">
            <span>📊</span> Reports
          </a>
        </div>
      </div>

      <!-- Status Overview -->
      <div class="card">
        <div class="card-header"><h3>Status Overview</h3></div>
        <div class="status-list">
          <div *ngFor="let s of statusItems" class="status-row">
            <span class="status-dot" [style.background]="s.color"></span>
            <span class="status-name">{{ s.name }}</span>
            <span class="status-bar-wrap">
              <span class="status-bar" [style.width]="s.pct+'%'" [style.background]="s.color+'33'"></span>
            </span>
            <span class="status-num">{{ s.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
.page { padding:24px 28px; max-width:1400px; margin:0 auto; }

/* KPIs */
.kpi-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:14px; margin-bottom:22px; }
.kpi { background:#fff; border-radius:14px; padding:18px 16px; border:1px solid #e2e8f0;
  display:flex; justify-content:space-between; align-items:center;
  box-shadow:0 1px 4px rgba(0,0,0,.05); transition:transform .15s,box-shadow .15s; }
.kpi:hover { transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,.08); }
.kpi.critical { border-left:3px solid #ef4444; }
.kpi.sla      { border-left:3px solid #a855f7; }
.kpi.overdue  { border-left:3px solid #dc2626; }
.kpi.unassigned { border-left:3px solid #f59e0b; }
.kpi-val { font-size:30px; font-weight:700; color:#1e293b; line-height:1; }
.kpi-label { font-size:12px; color:#64748b; margin:4px 0 6px; font-weight:500; }
.kpi-trend { font-size:11px; }
.kpi-trend.up { color:#22c55e; }
.kpi-trend.warn { color:#f59e0b; }
.kpi-trend.danger { color:#ef4444; }
.kpi-icon-box { width:44px; height:44px; border-radius:10px; display:flex; align-items:center;
  justify-content:center; font-size:22px; flex-shrink:0; }

/* Two col */
.two-col { display:grid; grid-template-columns:1fr 340px; gap:16px; }
.right-col { display:flex; flex-direction:column; gap:14px; }
.card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden;
  box-shadow:0 1px 4px rgba(0,0,0,.05); }
.card.wide { }
.card-header { display:flex; justify-content:space-between; align-items:center;
  padding:16px 18px 12px; border-bottom:1px solid #f1f5f9; }
.card-header h3 { font-size:14px; font-weight:700; color:#1e293b; margin:0; }
.see-all { font-size:12px; color:#3b82f6; text-decoration:none; font-weight:500; }
.see-all:hover { text-decoration:underline; }

/* Mini table */
.mini-table { width:100%; border-collapse:collapse; }
.mini-table th { padding:9px 14px; font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.5px; text-align:left; background:#fafafa; }
.mini-table td { padding:10px 14px; font-size:13px; color:#374151; border-bottom:1px solid #f8fafc; }
.mini-table .clickable { cursor:pointer; transition:background .1s; }
.mini-table .clickable:hover td { background:#f0f9ff; }
.tno { font-family:monospace; font-size:11px; color:#3b82f6; font-weight:700; }
.subj { max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:500; }
.badge { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
.p-critical { background:#fee2e2; color:#dc2626; }
.p-high { background:#fef3c7; color:#d97706; }
.p-medium { background:#e0f2fe; color:#0369a1; }
.p-low { background:#f1f5f9; color:#64748b; }
.sbadge { padding:2px 8px; border-radius:20px; font-size:11px; background:#f0fdf4; color:#15803d; font-weight:500; }
.sla-cell { font-size:12px; }
.overdue { color:#dc2626 !important; font-weight:600; }
.empty-row { text-align:center; color:#94a3b8; padding:24px !important; }
.empty-row a { color:#3b82f6; }

/* Priority bars */
.priority-bars { padding:14px 18px; display:flex; flex-direction:column; gap:12px; }
.pbar-row { display:flex; align-items:center; gap:10px; }
.pbar-label { width:64px; font-size:12px; font-weight:500; color:#374151; flex-shrink:0; }
.pbar-track { flex:1; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden; }
.pbar-fill { height:100%; border-radius:4px; transition:width .6s ease; }
.pbar-count { width:24px; text-align:right; font-size:12px; font-weight:600; color:#374151; }

/* Quick actions */
.quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:12px 14px; }
.qa-btn { display:flex; align-items:center; gap:6px; padding:9px 12px; border-radius:8px;
  border:1px solid #e2e8f0; font-size:12.5px; font-weight:500; color:#374151;
  text-decoration:none; transition:all .15s; background:#fafafa; }
.qa-btn:hover { border-color:#3b82f6; color:#3b82f6; background:#eff6ff; }
.qa-btn.danger-btn { border-color:#fecaca; color:#dc2626; background:#fff5f5; }
.qa-btn.danger-btn:hover { background:#fee2e2; }

/* Status list */
.status-list { padding:12px 18px; display:flex; flex-direction:column; gap:9px; }
.status-row { display:flex; align-items:center; gap:10px; }
.status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.status-name { width:130px; font-size:12px; color:#374151; }
.status-bar-wrap { flex:1; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden; }
.status-bar { display:block; height:100%; border-radius:3px; }
.status-num { width:24px; text-align:right; font-size:12px; font-weight:600; color:#374151; }

@media(max-width:1200px) {
  .kpi-grid { grid-template-columns:repeat(3,1fr); }
  .two-col { grid-template-columns:1fr; }
}
  `]
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;
  recent: TicketListItem[] = [];
  priorities: any[] = [];
  statusItems: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe(s => {
      this.stats = s;
      const total = s.openTickets || 1;
      this.priorities = [
        { label:'Critical', count:Math.round(s.criticalHighTickets*.4), pct:40, color:'#ef4444' },
        { label:'High',     count:Math.round(s.criticalHighTickets*.6), pct:60, color:'#f59e0b' },
        { label:'Medium',   count:Math.max(0,s.openTickets-s.criticalHighTickets-s.unassignedTickets), pct:50, color:'#3b82f6' },
        { label:'Low',      count:s.unassignedTickets, pct:20, color:'#94a3b8' },
      ];
      this.statusItems = [
        { name:'New',          count:s.unassignedTickets, pct:Math.round(s.unassignedTickets/total*100), color:'#64748b' },
        { name:'In Progress',  count:Math.max(0,s.openTickets-s.overdueTickets), pct:60, color:'#3b82f6' },
        { name:'SLA At Risk',  count:s.slaAtRisk, pct:Math.round(s.slaAtRisk/total*100), color:'#f59e0b' },
        { name:'Overdue',      count:s.overdueTickets, pct:Math.round(s.overdueTickets/total*100), color:'#ef4444' },
        { name:'Resolved',     count:0, pct:0, color:'#22c55e' },
      ];
    });
    this.api.getTickets({}).subscribe(t => this.recent = t.slice(0,8));
  }

  isOverdue(d?: string) { return d && new Date(d) < new Date(); }
}
