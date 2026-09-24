import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>📬 Email Notifications</h1>
      <p class="subtitle">Track all email notifications sent by the system</p>
    </div>
    <button class="refresh-btn" (click)="load()">↻ Refresh</button>
  </div>

  <!-- Stats row -->
  <div class="stats-row">
    <div class="stat-card total">
      <div class="stat-icon">📨</div>
      <div class="stat-info">
        <div class="stat-val">{{ stats.total || 0 }}</div>
        <div class="stat-lbl">Total Sent</div>
      </div>
    </div>
    <div class="stat-card success">
      <div class="stat-icon">✅</div>
      <div class="stat-info">
        <div class="stat-val">{{ stats.sent || 0 }}</div>
        <div class="stat-lbl">Delivered</div>
      </div>
    </div>
    <div class="stat-card failed">
      <div class="stat-icon">❌</div>
      <div class="stat-info">
        <div class="stat-val">{{ stats.failed || 0 }}</div>
        <div class="stat-lbl">Failed</div>
      </div>
    </div>
    <div class="stat-card skipped">
      <div class="stat-icon">⏭️</div>
      <div class="stat-info">
        <div class="stat-val">{{ stats.skipped || 0 }}</div>
        <div class="stat-lbl">Skipped (SMTP off)</div>
      </div>
    </div>
  </div>

  <!-- SMTP config notice -->
  <div class="smtp-notice" *ngIf="stats.skipped > 0 || stats.total === 0">
    <div class="notice-icon">⚙️</div>
    <div class="notice-body">
      <strong>SMTP is currently disabled.</strong>
      Notifications are being logged but not sent. To enable, update
      <code>appsettings.json</code> on the server:
      set <code>"Enabled": true</code> and fill in your SMTP credentials.
    </div>
    <div class="smtp-sample">
      <pre>{{ smtpSample }}</pre>
    </div>
  </div>

  <!-- Filters -->
  <div class="filters-bar">
    <select [(ngModel)]="filterStatus" (change)="load()" class="filter-select">
      <option value="">All Status</option>
      <option>Sent</option><option>Failed</option><option>Skipped</option><option>Pending</option>
    </select>
    <select [(ngModel)]="filterEvent" (change)="load()" class="filter-select">
      <option value="">All Events</option>
      <option>TicketCreated</option>
      <option>TicketAssigned</option>
      <option>TicketResolved</option>
      <option>StatusChanged</option>
    </select>
    <input [(ngModel)]="search" (ngModelChange)="applySearch()"
           class="search-input" placeholder="🔍 Search subject…" />
    <span class="count-label">{{ filtered.length }} records</span>
  </div>

  <!-- Table -->
  <div class="table-card">
    <table class="notif-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Event</th>
          <th>Ticket</th>
          <th>Subject</th>
          <th>Channel</th>
          <th>Status</th>
          <th>Sent At</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let n of filtered">
          <td class="id-col">{{ n.id }}</td>
          <td><span class="event-badge" [ngClass]="'ev-'+eventClass(n.eventType)">{{ n.eventType }}</span></td>
          <td>
            <span *ngIf="n.ticketId" class="ticket-ref">#{{ n.ticketId }}</span>
            <span *ngIf="!n.ticketId" class="dash">—</span>
          </td>
          <td class="subject-col">{{ n.subject }}</td>
          <td><span class="channel-badge">{{ n.channel }}</span></td>
          <td><span class="status-pill" [ngClass]="'st-'+n.status.toLowerCase()">{{ n.status }}</span></td>
          <td class="date-col">{{ n.sentAt ? (n.sentAt | date:'dd MMM HH:mm') : '—' }}</td>
          <td class="error-col">
            <span *ngIf="n.errorMessage" class="error-txt" [title]="n.errorMessage">
              {{ n.errorMessage | slice:0:40 }}{{ n.errorMessage.length > 40 ? '…' : '' }}
            </span>
          </td>
        </tr>
        <tr *ngIf="filtered.length === 0">
          <td colspan="8" class="empty-row">No notifications found</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Email template preview -->
  <div class="template-section">
    <h2>📋 Email Templates</h2>
    <div class="template-grid">
      <div class="template-card" *ngFor="let t of templates" (click)="previewTemplate = previewTemplate === t.key ? null : t.key">
        <div class="tc-icon">{{ t.icon }}</div>
        <div class="tc-name">{{ t.name }}</div>
        <div class="tc-trigger">Trigger: <strong>{{ t.trigger }}</strong></div>
        <div class="tc-recipients">To: {{ t.recipients }}</div>
        <div class="tc-toggle">{{ previewTemplate === t.key ? '▲ Hide' : '▼ Preview' }}</div>
      </div>
    </div>

    <div class="preview-box" *ngIf="previewTemplate">
      <div class="preview-header">
        <strong>{{ getTemplate(previewTemplate)?.name }} — Sample Email</strong>
        <button (click)="previewTemplate = null" class="close-btn">✕</button>
      </div>
      <div class="preview-body" [innerHTML]="getPreviewHtml(previewTemplate)"></div>
    </div>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:1300px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { margin:0; color:#64748b; font-size:13px; }
.refresh-btn { background:#fff; border:1.5px solid #e2e8f0; padding:8px 16px; border-radius:8px; font-size:13px; cursor:pointer; font-weight:600; }
.refresh-btn:hover { background:#f8fafc; }

/* Stats */
.stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:18px; }
.stat-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:18px;
  display:flex; align-items:center; gap:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
.stat-icon { font-size:28px; }
.stat-val  { font-size:26px; font-weight:800; color:#1e293b; }
.stat-lbl  { font-size:12px; color:#64748b; font-weight:500; margin-top:2px; }
.stat-card.success { border-top:3px solid #22c55e; }
.stat-card.failed  { border-top:3px solid #ef4444; }
.stat-card.skipped { border-top:3px solid #f59e0b; }
.stat-card.total   { border-top:3px solid #3b82f6; }

/* SMTP notice */
.smtp-notice { background:#fffbeb; border:1px solid #fde68a; border-radius:12px;
  padding:16px 20px; margin-bottom:18px; display:flex; gap:12px; flex-wrap:wrap; }
.notice-icon { font-size:22px; flex-shrink:0; }
.notice-body { font-size:13.5px; color:#78350f; flex:1; }
.notice-body code { background:#fef3c7; padding:1px 5px; border-radius:4px; font-family:monospace; }
.smtp-sample { width:100%; margin-top:10px; }
.smtp-sample pre { background:#1e293b; color:#f1f5f9; padding:14px; border-radius:8px; font-size:12px; line-height:1.6; overflow-x:auto; }

/* Filters */
.filters-bar { display:flex; gap:10px; align-items:center; margin-bottom:14px; flex-wrap:wrap; }
.filter-select { padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; }
.search-input  { padding:8px 14px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; min-width:220px; }
.count-label   { margin-left:auto; font-size:12px; color:#94a3b8; }

/* Table */
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; margin-bottom:24px; }
.notif-table { width:100%; border-collapse:collapse; font-size:13px; }
.notif-table th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700;
  color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; background:#fafafa; border-bottom:1px solid #f1f5f9; }
.notif-table td { padding:11px 14px; border-bottom:1px solid #f8fafc; color:#374151; vertical-align:middle; }
.notif-table tr:hover td { background:#f8fafc; }
.id-col   { color:#94a3b8; font-family:monospace; font-size:12px; }
.subject-col { max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.date-col { white-space:nowrap; font-size:12px; color:#64748b; }
.error-col { max-width:180px; }
.error-txt { color:#dc2626; font-size:11.5px; cursor:help; }
.dash { color:#cbd5e1; }
.empty-row { text-align:center; padding:32px; color:#94a3b8; }

.event-badge { padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; }
.ev-created  { background:#eff6ff; color:#1d4ed8; }
.ev-assigned { background:#f0fdf4; color:#15803d; }
.ev-resolved { background:#faf5ff; color:#7c3aed; }
.ev-status   { background:#fff7ed; color:#c2410c; }
.ev-general  { background:#f1f5f9; color:#475569; }

.channel-badge { background:#f1f5f9; color:#475569; font-size:11px; padding:2px 8px; border-radius:10px; }

.status-pill { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.st-sent    { background:#dcfce7; color:#15803d; }
.st-failed  { background:#fee2e2; color:#dc2626; }
.st-skipped { background:#fef3c7; color:#d97706; }
.st-pending { background:#e0f2fe; color:#0369a1; }

/* Templates */
.template-section h2 { font-size:16px; font-weight:700; color:#1e293b; margin:0 0 14px; }
.template-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
.template-card { background:#fff; border:1.5px solid #e2e8f0; border-radius:12px; padding:16px;
  cursor:pointer; transition:all .15s; }
.template-card:hover { border-color:#8392ab; box-shadow:0 2px 8px rgba(0,0,0,.07); }
.tc-icon { font-size:28px; margin-bottom:8px; }
.tc-name { font-size:14px; font-weight:700; color:#1e293b; margin-bottom:4px; }
.tc-trigger,.tc-recipients { font-size:12px; color:#64748b; margin-bottom:2px; }
.tc-toggle { font-size:11px; color:#3b82f6; margin-top:8px; font-weight:600; }

.preview-box { background:#fff; border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden; }
.preview-header { display:flex; justify-content:space-between; align-items:center;
  padding:12px 18px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-size:14px; }
.close-btn { background:none; border:none; font-size:18px; cursor:pointer; color:#94a3b8; }
.preview-body { padding:20px; overflow-x:auto; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  filtered: any[] = [];
  stats: any = {};
  filterStatus = '';
  filterEvent  = '';
  search       = '';
  previewTemplate: string | null = null;

  smtpSample = `"Smtp": {
  "Enabled":   true,
  "Host":      "smtp.gmail.com",
  "Port":       587,
  "UseSsl":    false,
  "Username":  "your@gmail.com",
  "Password":  "app-password",
  "FromEmail": "your@gmail.com",
  "FromName":  "Pinus Ticket System"
}`;

  templates = [
    { key:'created',  icon:'📋', name:'Ticket Created',  trigger:'On ticket create',  recipients:'Support team + creator' },
    { key:'assigned', icon:'🔧', name:'Ticket Assigned', trigger:'On assignment',     recipients:'Assigned engineer' },
    { key:'resolved', icon:'✅', name:'Ticket Resolved', trigger:'Status → Resolved', recipients:'Customer / creator' },
    { key:'status',   icon:'🔄', name:'Status Changed',  trigger:'Closed / Reopened', recipients:'Customer / creator' },
  ];

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }

  load() {
    const filters: any = {};
    if (this.filterStatus) filters['status'] = this.filterStatus;
    if (this.filterEvent)  filters['eventType'] = this.filterEvent;
    this.api.getNotifications(filters).subscribe(n => { this.notifications = n; this.applySearch(); });
    this.api.getNotificationStats().subscribe(s => this.stats = s);
  }

  applySearch() {
    const q = this.search.toLowerCase();
    this.filtered = this.notifications.filter(n =>
      !q || n.subject?.toLowerCase().includes(q) || n.eventType?.toLowerCase().includes(q));
  }

  eventClass(e: string) {
    if (e === 'TicketCreated')  return 'created';
    if (e === 'TicketAssigned') return 'assigned';
    if (e === 'TicketResolved') return 'resolved';
    if (e === 'StatusChanged')  return 'status';
    return 'general';
  }

  getTemplate(key: string) { return this.templates.find(t => t.key === key); }

  getPreviewHtml(key: string): string {
    const base = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#171a35;padding:18px 24px;border-radius:10px 10px 0 0">
          <span style="color:#fff;font-size:17px;font-weight:700">🎫 PINUS TICKET SYSTEM</span>
        </div>
        <div style="background:#fff;border-radius:0 0 10px 10px;padding:24px;border:1px solid #e2e8f0">`;
    const end = `</div></div>`;
    const card = `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin:14px 0">
        <div style="font-family:monospace;font-size:11px;color:#3b82f6;font-weight:700">TKT-2024-001</div>
        <div style="font-size:14px;font-weight:600;color:#1e293b;margin:4px 0">Unable to login to customer portal</div>
        <div style="font-size:12px;color:#64748b"><span style="background:#fee2e2;color:#dc2626;padding:1px 7px;border-radius:10px;font-size:11px">Critical</span> · Acme Corp</div>
      </div>`;
    const btn  = (lbl: string) => `<a style="display:inline-block;background:#171a35;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;margin:12px 0">${lbl}</a>`;

    if (key === 'created') return base +
      `<div style="font-size:18px;font-weight:700;color:#171a35;margin-bottom:14px">📋 New Support Ticket Created</div>
       <p style="font-size:14px;color:#374151">A new support ticket has been raised and requires your attention.</p>
       ${card}${btn('View Ticket →')}` + end;

    if (key === 'assigned') return base +
      `<div style="font-size:18px;font-weight:700;color:#171a35;margin-bottom:14px">🔧 Ticket Assigned to You</div>
       <p style="font-size:14px;color:#374151">Hello <strong>John Developer</strong>, a ticket has been assigned to you.</p>
       ${card}<p style="font-size:13px;color:#64748b"><strong>SLA Due:</strong> 25 Sep 2026 18:00</p>${btn('Open My Workbench →')}` + end;

    if (key === 'resolved') return base +
      `<div style="font-size:18px;font-weight:700;color:#171a35;margin-bottom:14px">✅ Your Ticket Has Been Resolved</div>
       <p style="font-size:14px;color:#374151">Hello <strong>Acme Corp</strong>, your ticket has been resolved.</p>
       ${card}<p style="font-size:13px;color:#64748b"><strong>Resolution:</strong> Fixed the auth token expiry issue.</p>
       ${btn('Confirm Resolution →')}<p style="font-size:12px;color:#94a3b8">If the issue persists, you can reopen the ticket.</p>` + end;

    return base +
      `<div style="font-size:18px;font-weight:700;color:#171a35;margin-bottom:14px">🔄 Ticket Status Updated</div>
       <p style="font-size:14px;color:#374151">Your ticket <strong>TKT-2024-001</strong> status has changed:</p>
       <div style="display:flex;align-items:center;gap:12px;margin:14px 0">
         <span style="padding:5px 12px;border-radius:20px;background:#f1f5f9;color:#374151;font-weight:600">Resolved</span>
         <span style="font-size:20px;color:#94a3b8">→</span>
         <span style="padding:5px 12px;border-radius:20px;background:#dcfce7;color:#15803d;font-weight:600">Closed</span>
       </div>${btn('Track Your Ticket →')}` + end;
  }
}
