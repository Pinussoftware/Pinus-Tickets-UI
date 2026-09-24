import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TicketListItem } from '../../models/models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-workbench',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>🔧 My Workbench</h1>
      <p class="subtitle">Your assigned tickets and active work</p>
    </div>
    <div class="header-right">
      <div class="user-chip">
        <div class="av">{{ initials }}</div>
        <span>{{ userName }}</span>
        <span class="role-tag">{{ userRole }}</span>
      </div>
    </div>
  </div>

  <!-- Work summary -->
  <div class="work-summary">
    <div class="ws-card urgent">
      <div class="ws-icon">🚨</div>
      <div class="ws-val">{{ urgent.length }}</div>
      <div class="ws-lbl">Urgent (Critical/High)</div>
    </div>
    <div class="ws-card progress">
      <div class="ws-icon">🔧</div>
      <div class="ws-val">{{ inProgress.length }}</div>
      <div class="ws-lbl">In Progress</div>
    </div>
    <div class="ws-card waiting">
      <div class="ws-icon">⏳</div>
      <div class="ws-val">{{ waiting.length }}</div>
      <div class="ws-lbl">Waiting for Customer</div>
    </div>
    <div class="ws-card qa">
      <div class="ws-icon">🔬</div>
      <div class="ws-val">{{ readyForQa.length }}</div>
      <div class="ws-lbl">Ready for QA</div>
    </div>
    <div class="ws-card total">
      <div class="ws-icon">🎫</div>
      <div class="ws-val">{{ myTickets.length }}</div>
      <div class="ws-lbl">Total Assigned</div>
    </div>
  </div>

  <!-- Kanban-style columns -->
  <div class="kanban">
    <!-- Urgent -->
    <div class="kanban-col">
      <div class="col-header urgent">🚨 Urgent <span class="col-count">{{ urgent.length }}</span></div>
      <div *ngFor="let t of urgent" class="ticket-card" [routerLink]="['/tickets',t.id]">
        <div class="tc-no">{{ t.ticketNo }}</div>
        <div class="tc-subj">{{ t.subject }}</div>
        <div class="tc-meta">
          <span class="badge p-critical">{{ t.priority }}</span>
          <span class="tc-cust">{{ t.customerName }}</span>
        </div>
        <div class="tc-sla" [class.overdue]="isOverdue(t.slaDueAt)">
          ⏱ {{ t.slaDueAt ? (t.slaDueAt | date:'dd MMM HH:mm') : 'No SLA' }}
        </div>
      </div>
      <div class="empty-col" *ngIf="!urgent.length">✅ No urgent items</div>
    </div>

    <!-- In Progress -->
    <div class="kanban-col">
      <div class="col-header progress">🔧 In Progress <span class="col-count">{{ inProgress.length }}</span></div>
      <div *ngFor="let t of inProgress" class="ticket-card" [routerLink]="['/tickets',t.id]">
        <div class="tc-no">{{ t.ticketNo }}</div>
        <div class="tc-subj">{{ t.subject }}</div>
        <div class="tc-meta">
          <span class="badge" [ngClass]="'p-'+t.priority.toLowerCase()">{{ t.priority }}</span>
          <span class="tc-cust">{{ t.customerName }}</span>
        </div>
        <div class="tc-sla" [class.overdue]="isOverdue(t.slaDueAt)">
          ⏱ {{ t.slaDueAt ? (t.slaDueAt | date:'dd MMM HH:mm') : 'No SLA' }}
        </div>
      </div>
      <div class="empty-col" *ngIf="!inProgress.length">No tickets in progress</div>
    </div>

    <!-- Waiting -->
    <div class="kanban-col">
      <div class="col-header waiting">⏳ Waiting for Customer <span class="col-count">{{ waiting.length }}</span></div>
      <div *ngFor="let t of waiting" class="ticket-card" [routerLink]="['/tickets',t.id]">
        <div class="tc-no">{{ t.ticketNo }}</div>
        <div class="tc-subj">{{ t.subject }}</div>
        <div class="tc-meta">
          <span class="badge" [ngClass]="'p-'+t.priority.toLowerCase()">{{ t.priority }}</span>
          <span class="tc-cust">{{ t.customerName }}</span>
        </div>
      </div>
      <div class="empty-col" *ngIf="!waiting.length">No tickets waiting</div>
    </div>

    <!-- Ready for QA -->
    <div class="kanban-col">
      <div class="col-header qa">🔬 Ready for QA <span class="col-count">{{ readyForQa.length }}</span></div>
      <div *ngFor="let t of readyForQa" class="ticket-card" [routerLink]="['/tickets',t.id]">
        <div class="tc-no">{{ t.ticketNo }}</div>
        <div class="tc-subj">{{ t.subject }}</div>
        <div class="tc-meta">
          <span class="badge" [ngClass]="'p-'+t.priority.toLowerCase()">{{ t.priority }}</span>
          <span class="tc-cust">{{ t.customerName }}</span>
        </div>
      </div>
      <div class="empty-col" *ngIf="!readyForQa.length">No tickets pending QA</div>
    </div>
  </div>

  <!-- All assigned tickets table -->
  <div class="table-card">
    <div class="table-header">
      <h3>All My Assigned Tickets</h3>
      <input [(ngModel)]="search" placeholder="🔍 Search…" class="search" />
    </div>
    <table>
      <thead>
        <tr><th>Ticket #</th><th>Subject</th><th>Customer</th><th>Priority</th>
          <th>Status</th><th>SLA Due</th><th>Action</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of filtered" class="tr-row">
          <td><span class="tno">{{ t.ticketNo }}</span></td>
          <td class="subj">{{ t.subject }}</td>
          <td>{{ t.customerName }}</td>
          <td><span class="badge" [ngClass]="'p-'+t.priority.toLowerCase()">{{ t.priority }}</span></td>
          <td><span class="sbadge">{{ t.status }}</span></td>
          <td [class.overdue]="isOverdue(t.slaDueAt)">
            {{ t.slaDueAt ? (t.slaDueAt | date:'dd MMM HH:mm') : '—' }}
          </td>
          <td><a [routerLink]="['/tickets',t.id]" class="open-btn">Open →</a></td>
        </tr>
        <tr *ngIf="myTickets.length===0">
          <td colspan="7" class="empty">No tickets assigned to you yet.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:1400px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { margin:0; color:#64748b; font-size:13px; }
.user-chip { display:flex; align-items:center; gap:8px; background:#fff;
  border:1px solid #e2e8f0; padding:8px 14px; border-radius:20px; }
.av { width:30px; height:30px; background:linear-gradient(135deg,#8392ab,#ee8299);
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700; color:#fff; }
.role-tag { font-size:11px; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:10px; }
.work-summary { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:18px; }
.ws-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:16px;
  text-align:center; box-shadow:0 1px 4px rgba(0,0,0,.05); }
.ws-card.urgent  { border-top:3px solid #ef4444; }
.ws-card.progress{ border-top:3px solid #3b82f6; }
.ws-card.waiting { border-top:3px solid #f59e0b; }
.ws-card.qa      { border-top:3px solid #a855f7; }
.ws-card.total   { border-top:3px solid #22c55e; }
.ws-icon { font-size:22px; margin-bottom:6px; }
.ws-val  { font-size:28px; font-weight:700; color:#1e293b; }
.ws-lbl  { font-size:11.5px; color:#64748b; margin-top:2px; }
.kanban { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
.kanban-col { display:flex; flex-direction:column; gap:8px; }
.col-header { display:flex; align-items:center; justify-content:space-between;
  font-size:13px; font-weight:700; padding:10px 14px; border-radius:10px; margin-bottom:4px; }
.col-header.urgent  { background:#fee2e2; color:#dc2626; }
.col-header.progress{ background:#dbeafe; color:#1d4ed8; }
.col-header.waiting { background:#fef3c7; color:#92400e; }
.col-header.qa      { background:#ede9fe; color:#6d28d9; }
.col-count { background:rgba(0,0,0,.1); border-radius:10px; padding:1px 8px; font-size:12px; }
.ticket-card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px;
  cursor:pointer; transition:all .15s; }
.ticket-card:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.08); border-color:#8392ab; }
.tc-no { font-family:monospace; font-size:11px; color:#3b82f6; font-weight:700; margin-bottom:4px; }
.tc-subj { font-size:13px; font-weight:500; color:#1e293b; margin-bottom:8px;
  overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.tc-meta { display:flex; align-items:center; gap:6px; margin-bottom:6px; flex-wrap:wrap; }
.tc-cust { font-size:11px; color:#64748b; }
.tc-sla { font-size:11px; color:#64748b; }
.tc-sla.overdue { color:#dc2626; font-weight:600; }
.badge { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
.p-critical { background:#fee2e2; color:#dc2626; }
.p-high { background:#fef3c7; color:#d97706; }
.p-medium { background:#e0f2fe; color:#0369a1; }
.p-low { background:#f1f5f9; color:#64748b; }
.empty-col { text-align:center; font-size:12px; color:#94a3b8; padding:20px; background:#fafafa; border-radius:8px; }
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; }
.table-header { display:flex; justify-content:space-between; align-items:center;
  padding:16px 18px; border-bottom:1px solid #f1f5f9; }
.table-header h3 { font-size:14px; font-weight:700; color:#1e293b; margin:0; }
.search { padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; width:200px; }
table { width:100%; border-collapse:collapse; }
th { padding:10px 14px; font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.5px; background:#fafafa;
  border-bottom:1px solid #e2e8f0; text-align:left; }
td { padding:11px 14px; font-size:13px; border-bottom:1px solid #f8fafc; color:#374151; }
.tr-row:hover td { background:#f8fafc; }
.tno { font-family:monospace; font-size:11.5px; color:#3b82f6; font-weight:700;
  background:#eff6ff; padding:2px 6px; border-radius:4px; }
.subj { font-weight:500; color:#1e293b; max-width:220px; overflow:hidden;
  text-overflow:ellipsis; white-space:nowrap; }
.sbadge { padding:2px 8px; border-radius:20px; font-size:11px; background:#f0fdf4; color:#15803d; }
.overdue { color:#dc2626 !important; font-weight:600; }
.open-btn { color:#3b82f6; font-size:12.5px; font-weight:600; text-decoration:none; }
.open-btn:hover { text-decoration:underline; }
.empty { text-align:center; padding:32px; color:#94a3b8; }
  `]
})
export class WorkbenchComponent implements OnInit {
  myTickets: TicketListItem[] = [];
  search = '';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    this.api.getTickets({}).subscribe(t => this.myTickets = t);
  }

  get urgent()     { return this.myTickets.filter(t => ['Critical','High'].includes(t.priority)); }
  get inProgress() { return this.myTickets.filter(t => t.status === 'In Progress'); }
  get waiting()    { return this.myTickets.filter(t => t.status === 'Waiting for Customer'); }
  get readyForQa() { return this.myTickets.filter(t => t.status === 'Ready for QA'); }
  get filtered()   {
    const q = this.search.toLowerCase();
    return q ? this.myTickets.filter(t => t.subject.toLowerCase().includes(q) || t.ticketNo.toLowerCase().includes(q)) : this.myTickets;
  }

  get userName()  { return this.auth.currentUser?.name || ''; }
  get userRole()  { return this.auth.currentUser?.role || ''; }
  get initials()  { return this.userName.split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2); }
  isOverdue(d?: string) { return d && new Date(d) < new Date(); }
}
