import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TicketListItem, STATUSES, PRIORITIES } from '../../models/models';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <h1>Tickets</h1>
    <a routerLink="/tickets/new" class="btn-primary">+ New Ticket</a>
  </div>

  <!-- Filters -->
  <div class="filters">
    <select [(ngModel)]="filter.status" (change)="load()">
      <option value="">All Status</option>
      <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
    </select>
    <select [(ngModel)]="filter.priority" (change)="load()">
      <option value="">All Priority</option>
      <option *ngFor="let p of priorities" [value]="p">{{ p }}</option>
    </select>
    <button class="btn-ghost" (click)="clearFilters()">Clear</button>
  </div>

  <!-- Table -->
  <div class="table-wrap">
    <table *ngIf="tickets.length > 0">
      <thead>
        <tr>
          <th>Ticket #</th><th>Subject</th><th>Customer</th>
          <th>Type</th><th>Priority</th><th>Status</th>
          <th>Assignee</th><th>SLA Due</th><th>Updated</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of tickets" [routerLink]="['/tickets',t.id]" class="clickable-row">
          <td><span class="ticket-no">{{ t.ticketNo }}</span></td>
          <td class="subject">{{ t.subject }}</td>
          <td>{{ t.customerName }}</td>
          <td><span class="badge badge-type">{{ t.type }}</span></td>
          <td><span class="badge" [ngClass]="'p-'+t.priority.toLowerCase()">{{ t.priority }}</span></td>
          <td><span class="badge badge-status">{{ t.status }}</span></td>
          <td>{{ t.assigneeName || '—' }}</td>
          <td [class.overdue]="isOverdue(t.slaDueAt)">{{ t.slaDueAt | date:'dd MMM HH:mm' }}</td>
          <td>{{ t.updatedAt | date:'dd MMM' }}</td>
        </tr>
      </tbody>
    </table>
    <div class="empty" *ngIf="tickets.length === 0 && !loading">No tickets found.</div>
    <div class="loading" *ngIf="loading">Loading…</div>
  </div>
</div>
  `,
  styles: [`
.page { padding:28px 32px; }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0; }
.btn-primary { background:#3b82f6; color:#fff; padding:9px 18px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:600; }
.btn-primary:hover { background:#2563eb; }
.btn-ghost { background:transparent; border:1px solid #e2e8f0; padding:8px 14px; border-radius:8px; font-size:13px; cursor:pointer; color:#374151; }
.filters { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
.filters select { padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; background:#fff; }
.table-wrap { background:#fff; border-radius:12px; border:1px solid #e2e8f0; overflow:auto; }
table { width:100%; border-collapse:collapse; }
th { padding:12px 14px; text-align:left; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; border-bottom:1px solid #e2e8f0; background:#f8fafc; }
td { padding:12px 14px; font-size:13px; color:#374151; border-bottom:1px solid #f1f5f9; }
.clickable-row { cursor:pointer; transition:background .1s; }
.clickable-row:hover td { background:#f0f9ff; }
.ticket-no { font-family:monospace; font-weight:600; color:#3b82f6; font-size:12px; }
.subject { max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:500; }
.badge { padding:3px 8px; border-radius:20px; font-size:11px; font-weight:600; }
.badge-type { background:#e0f2fe; color:#0369a1; }
.badge-status { background:#f0fdf4; color:#15803d; }
.p-critical { background:#fee2e2; color:#dc2626; }
.p-high     { background:#fef3c7; color:#d97706; }
.p-medium   { background:#e0f2fe; color:#0369a1; }
.p-low      { background:#f1f5f9; color:#64748b; }
.overdue { color:#dc2626; font-weight:600; }
.empty, .loading { padding:40px; text-align:center; color:#94a3b8; }
  `]
})
export class TicketListComponent implements OnInit {
  tickets: TicketListItem[] = [];
  loading = false;
  filter: any = { status: '', priority: '' };
  statuses  = STATUSES;
  priorities = ['Critical','High','Medium','Low'];

  constructor(private api: ApiService, private route: ActivatedRoute) {}

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
      next: t => { this.tickets = t; this.loading = false; },
      error: () => this.loading = false
    });
  }

  clearFilters() { this.filter = { status:'', priority:'' }; this.load(); }

  isOverdue(due?: string) {
    return due && new Date(due) < new Date();
  }
}
