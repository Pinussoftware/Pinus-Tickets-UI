import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TicketListItem, STATUSES, PRIORITIES } from '../../models/models';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="page">
  <!-- Stats row -->
  <div class="stat-row">
    <div class="stat" (click)="setFilter('','')">
      <span class="stat-val">{{ tickets.length }}</span><span class="stat-lbl">Total</span>
    </div>
    <div class="stat warn" (click)="setFilter('New','')">
      <span class="stat-val">{{ count('New') }}</span><span class="stat-lbl">New</span>
    </div>
    <div class="stat blue" (click)="setFilter('In Progress','')">
      <span class="stat-val">{{ count('In Progress') }}</span><span class="stat-lbl">In Progress</span>
    </div>
    <div class="stat purple" (click)="setFilter('Ready for QA','')">
      <span class="stat-val">{{ count('Ready for QA') }}</span><span class="stat-lbl">Ready for QA</span>
    </div>
    <div class="stat red" (click)="setFilter('','Critical')">
      <span class="stat-val">{{ countP('Critical') }}</span><span class="stat-lbl">Critical</span>
    </div>
    <div class="stat green" (click)="setFilter('Resolved','')">
      <span class="stat-val">{{ count('Resolved') }}</span><span class="stat-lbl">Resolved</span>
    </div>
  </div>

  <!-- Filters -->
  <div class="filter-bar">
    <input [(ngModel)]="search" (ngModelChange)="applySearch()" class="search-input"
           placeholder="🔍  Search by ticket no, subject, customer…" />
    <select [(ngModel)]="filter.status" (change)="load()">
      <option value="">All Status</option>
      <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
    </select>
    <select [(ngModel)]="filter.priority" (change)="load()">
      <option value="">All Priority</option>
      <option *ngFor="let p of priorities" [value]="p">{{ p }}</option>
    </select>
    <button class="btn-clear" (click)="clearFilters()">✕ Clear</button>
    <div class="spacer"></div>
    <span class="count-badge">{{ filtered.length }} tickets</span>
    <a routerLink="/tickets/new" class="btn-new">+ New Ticket</a>
  </div>

  <!-- Table -->
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>Ticket #</th><th>Subject</th><th>Customer</th><th>Application</th>
          <th>Type</th><th>Priority</th><th>Status</th>
          <th>Assignee</th><th>SLA Due</th><th>Updated</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of filtered" class="tr-row">
          <td (click)="open(t.id)" class="tno-cell"><span class="tno">{{ t.ticketNo }}</span></td>
          <td (click)="open(t.id)" class="subj-cell">
            <span class="subj">{{ t.subject }}</span>
            <span class="type-mini">{{ t.type }}</span>
          </td>
          <td (click)="open(t.id)">
            <div class="cust-cell">
              <span class="cust-avatar">{{ t.customerName[0] }}</span>
              {{ t.customerName }}
            </div>
          </td>
          <td (click)="open(t.id)">{{ t.applicationName || '—' }}</td>
          <td (click)="open(t.id)"><span class="badge type-badge">{{ t.type }}</span></td>
          <td (click)="open(t.id)"><span class="badge" [ngClass]="'p-'+t.priority.toLowerCase()">
            <span class="p-dot"></span>{{ t.priority }}</span></td>
          <td (click)="open(t.id)"><span class="status-pill" [ngClass]="statusClass(t.status)">{{ t.status }}</span></td>
          <td (click)="open(t.id)">
            <div class="assignee-cell" *ngIf="t.assigneeName; else unassigned">
              <div class="user-av">{{ t.assigneeName[0] }}</div> {{ t.assigneeName }}
            </div>
            <ng-template #unassigned><span class="unassigned">Unassigned</span></ng-template>
          </td>
          <td (click)="open(t.id)" [class.overdue]="isOverdue(t.slaDueAt)">
            <div class="sla-wrap" *ngIf="t.slaDueAt; else noSla">
              <span class="sla-icon">{{ isOverdue(t.slaDueAt) ? '🔴' : '🟡' }}</span>
              {{ t.slaDueAt | date:'dd MMM HH:mm' }}
            </div>
            <ng-template #noSla>—</ng-template>
          </td>
          <td (click)="open(t.id)" class="date-cell">{{ t.updatedAt | date:'dd MMM' }}</td>
          <td class="actions-cell">
            <button class="act-btn" title="Open" (click)="open(t.id)">👁</button>
            <button class="act-btn" title="Copy link" (click)="copyLink(t.ticketNo,$event)">🔗</button>
          </td>
        </tr>
        <tr *ngIf="filtered.length===0 && !loading">
          <td colspan="11" class="empty">
            <div class="empty-state">
              <span class="empty-icon">🎫</span>
              <p>No tickets found</p>
              <a routerLink="/tickets/new" class="btn-new sm">Create your first ticket</a>
            </div>
          </td>
        </tr>
        <tr *ngIf="loading">
          <td colspan="11" class="empty">Loading…</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; }
.stat-row { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
.stat { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 18px;
  cursor:pointer; display:flex; flex-direction:column; align-items:center;
  transition:all .15s; min-width:90px; }
.stat:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.08); }
.stat.warn  { border-top:3px solid #f59e0b; }
.stat.blue  { border-top:3px solid #3b82f6; }
.stat.purple{ border-top:3px solid #a855f7; }
.stat.red   { border-top:3px solid #ef4444; }
.stat.green { border-top:3px solid #22c55e; }
.stat-val { font-size:22px; font-weight:700; color:#1e293b; }
.stat-lbl { font-size:11px; color:#64748b; font-weight:500; }
.filter-bar { display:flex; align-items:center; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
.search-input { flex:1; min-width:240px; padding:9px 14px; border:1px solid #e2e8f0;
  border-radius:8px; font-size:13px; background:#fff; }
.search-input:focus { outline:none; border-color:#3b82f6; }
.filter-bar select { padding:9px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; background:#fff; }
.btn-clear { padding:9px 12px; border:1px solid #fecaca; color:#ef4444; background:#fff;
  border-radius:8px; font-size:13px; cursor:pointer; }
.btn-clear:hover { background:#fee2e2; }
.spacer { flex:1; }
.count-badge { font-size:12px; background:#f1f5f9; color:#475569; padding:5px 12px;
  border-radius:20px; font-weight:500; white-space:nowrap; }
.btn-new { background:#171a35; color:#fff; padding:9px 16px; border-radius:8px;
  text-decoration:none; font-size:13px; font-weight:600; white-space:nowrap; }
.btn-new.sm { font-size:12px; padding:7px 14px; }
.btn-new:hover { background:#12335d; }
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0;
  overflow:auto; box-shadow:0 1px 4px rgba(0,0,0,.05); }
table { width:100%; border-collapse:collapse; min-width:1000px; }
th { padding:11px 14px; font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase;
  letter-spacing:.5px; background:#fafafa; border-bottom:1px solid #e2e8f0; text-align:left;
  white-space:nowrap; position:sticky; top:0; }
td { padding:11px 14px; font-size:13px; color:#374151; border-bottom:1px solid #f8fafc;
  cursor:pointer; }
.tr-row:hover td { background:#f8fafc; }
.tno-cell { cursor:pointer; }
.tno { font-family:monospace; font-size:11.5px; color:#3b82f6; font-weight:700;
  background:#eff6ff; padding:2px 8px; border-radius:4px; }
.subj-cell { max-width:220px; }
.subj { display:block; font-weight:500; color:#1e293b; overflow:hidden;
  text-overflow:ellipsis; white-space:nowrap; }
.type-mini { font-size:11px; color:#94a3b8; }
.cust-cell { display:flex; align-items:center; gap:7px; }
.cust-avatar { width:24px; height:24px; background:#e0f2fe; border-radius:50%;
  display:flex; align-items:center; justify-content:center; font-size:11px;
  font-weight:600; color:#0369a1; flex-shrink:0; }
.badge { padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600;
  display:inline-flex; align-items:center; gap:4px; }
.type-badge { background:#f1f5f9; color:#475569; }
.p-dot { width:6px; height:6px; border-radius:50%; display:inline-block; }
.p-critical .p-dot { background:#dc2626; }
.p-high .p-dot    { background:#d97706; }
.p-medium .p-dot  { background:#0369a1; }
.p-low .p-dot     { background:#94a3b8; }
.p-critical { background:#fee2e2; color:#dc2626; }
.p-high     { background:#fef3c7; color:#d97706; }
.p-medium   { background:#e0f2fe; color:#0369a1; }
.p-low      { background:#f1f5f9; color:#64748b; }
.status-pill { padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
.s-new { background:#f1f5f9; color:#475569; }
.s-review { background:#fef3c7; color:#92400e; }
.s-assigned { background:#e0f2fe; color:#0369a1; }
.s-progress { background:#dbeafe; color:#1d4ed8; }
.s-waiting { background:#fce7f3; color:#9d174d; }
.s-qa { background:#ede9fe; color:#6d28d9; }
.s-testing { background:#d1fae5; color:#065f46; }
.s-resolved { background:#dcfce7; color:#15803d; }
.s-closed { background:#f1f5f9; color:#6b7280; }
.s-reopened { background:#fee2e2; color:#dc2626; }
.assignee-cell { display:flex; align-items:center; gap:6px; }
.user-av { width:22px; height:22px; background:#dbeafe; border-radius:50%;
  display:flex; align-items:center; justify-content:center; font-size:10px;
  font-weight:700; color:#1d4ed8; flex-shrink:0; }
.unassigned { font-size:12px; color:#94a3b8; font-style:italic; }
.overdue { color:#dc2626 !important; font-weight:600; }
.sla-wrap { display:flex; align-items:center; gap:4px; font-size:12px; }
.date-cell { font-size:12px; color:#94a3b8; }
.actions-cell { white-space:nowrap; cursor:default; }
.act-btn { background:none; border:1px solid #e2e8f0; padding:5px 8px; border-radius:6px;
  cursor:pointer; font-size:13px; margin-right:4px; transition:all .15s; }
.act-btn:hover { border-color:#3b82f6; background:#eff6ff; }
.empty { text-align:center; padding:40px; color:#94a3b8; }
.empty-state { display:flex; flex-direction:column; align-items:center; gap:8px; }
.empty-icon { font-size:36px; }
.empty-state p { margin:0; color:#94a3b8; font-size:14px; }
  `]
})
export class TicketListComponent implements OnInit {
  tickets: TicketListItem[] = [];
  filtered: TicketListItem[] = [];
  loading = false;
  search = '';
  filter: any = { status:'', priority:'' };
  statuses = STATUSES;
  priorities = PRIORITIES;

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['status'])   this.filter.status   = p['status'];
      if (p['priority']) this.filter.priority = p['priority'];
      this.load();
    });
  }

  load() {
    this.loading = true;
    this.api.getTickets(this.filter).subscribe({
      next: t => { this.tickets = t; this.applySearch(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  applySearch() {
    const q = this.search.toLowerCase();
    this.filtered = q
      ? this.tickets.filter(t =>
          t.ticketNo.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          (t.assigneeName||'').toLowerCase().includes(q))
      : [...this.tickets];
  }

  setFilter(status: string, priority: string) {
    this.filter.status = status; this.filter.priority = priority; this.load();
  }

  clearFilters() { this.search=''; this.filter={status:'',priority:''}; this.load(); }

  count(status: string)   { return this.tickets.filter(t => t.status===status).length; }
  countP(priority: string){ return this.tickets.filter(t => t.priority===priority).length; }

  statusClass(s: string) {
    const m: Record<string,string> = {
      'New':'s-new','Under Review':'s-review','Assigned':'s-assigned',
      'In Progress':'s-progress','Waiting for Customer':'s-waiting',
      'Ready for QA':'s-qa','Testing':'s-testing',
      'Resolved':'s-resolved','Closed':'s-closed','Reopened':'s-reopened'
    };
    return m[s] || 's-new';
  }

  isOverdue(d?: string) { return d && new Date(d) < new Date(); }
  open(id: number) { this.router.navigate(['/tickets', id]); }
  copyLink(no: string, e: Event) {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + '/tickets?search=' + no);
  }
}
