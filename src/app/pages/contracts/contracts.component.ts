import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>📋 Contracts & SLA</h1>
      <p class="subtitle">Manage customer support contracts and SLA configurations</p>
    </div>
    <button class="btn-primary" (click)="openNew()">+ New Contract</button>
  </div>

  <!-- SLA Rules -->
  <div class="sla-rules-row">
    <div class="sla-card critical">
      <div class="sla-priority">🔴 Critical</div>
      <div class="sla-target">Response: <strong>2h</strong></div>
      <div class="sla-target">Resolution: <strong>4h</strong></div>
    </div>
    <div class="sla-card high">
      <div class="sla-priority">🟠 High</div>
      <div class="sla-target">Response: <strong>4h</strong></div>
      <div class="sla-target">Resolution: <strong>8h</strong></div>
    </div>
    <div class="sla-card medium">
      <div class="sla-priority">🟡 Medium</div>
      <div class="sla-target">Response: <strong>8h</strong></div>
      <div class="sla-target">Resolution: <strong>24h</strong></div>
    </div>
    <div class="sla-card low">
      <div class="sla-priority">⚪ Low</div>
      <div class="sla-target">Response: <strong>24h</strong></div>
      <div class="sla-target">Resolution: <strong>72h</strong></div>
    </div>
  </div>

  <!-- Form -->
  <div class="form-card" *ngIf="showForm">
    <div class="form-header">
      <h3>{{ editing ? '✏ Edit Contract' : '➕ New Contract' }}</h3>
      <button class="close-btn" (click)="cancel()">✕</button>
    </div>
    <div class="form-grid">
      <div class="field"><label>Customer <span class="req">*</span></label>
        <select [(ngModel)]="form.customerId">
          <option value="">— Select customer —</option>
          <option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div class="field"><label>Contract Number <span class="req">*</span></label>
        <input [(ngModel)]="form.contractNumber" placeholder="CTR-2026-001" />
      </div>
      <div class="field"><label>Plan</label>
        <select [(ngModel)]="form.planName">
          <option>Standard</option><option>Professional</option><option>Enterprise</option>
        </select>
      </div>
      <div class="field"><label>Start Date <span class="req">*</span></label>
        <input type="date" [(ngModel)]="form.startDate" />
      </div>
      <div class="field"><label>End Date <span class="req">*</span></label>
        <input type="date" [(ngModel)]="form.endDate" />
      </div>
      <div class="field"><label>Status</label>
        <select [(ngModel)]="form.status">
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="expired">Expired</option>
        </select>
      </div>
    </div>
    <div class="sla-section">
      <div class="sla-section-title">⏱ SLA Response Hours (custom per this contract)</div>
      <div class="sla-hrs-grid">
        <div class="sla-hr-field">
          <label>🔴 Critical (hrs)</label>
          <input type="number" [(ngModel)]="form.responseHoursCritical" min="1" />
        </div>
        <div class="sla-hr-field">
          <label>🟠 High (hrs)</label>
          <input type="number" [(ngModel)]="form.responseHoursHigh" min="1" />
        </div>
        <div class="sla-hr-field">
          <label>🟡 Medium (hrs)</label>
          <input type="number" [(ngModel)]="form.responseHoursMedium" min="1" />
        </div>
        <div class="sla-hr-field">
          <label>⚪ Low (hrs)</label>
          <input type="number" [(ngModel)]="form.responseHoursLow" min="1" />
        </div>
      </div>
    </div>
    <div class="error-msg" *ngIf="error">{{ error }}</div>
    <div class="form-actions">
      <button class="btn-ghost" (click)="cancel()">Cancel</button>
      <button class="btn-primary" (click)="save()" [disabled]="saving">
        {{ saving ? 'Saving…' : (editing ? 'Update Contract' : 'Create Contract') }}
      </button>
    </div>
  </div>

  <!-- Table -->
  <div class="table-card">
    <div class="table-header">
      <h3>All Contracts ({{ contracts.length }})</h3>
      <input [(ngModel)]="search" placeholder="🔍 Search contracts…" class="search" />
    </div>
    <table>
      <thead>
        <tr><th>#</th><th>Customer</th><th>Contract No.</th><th>Plan</th>
          <th>Start</th><th>End</th><th>SLA (C/H/M/L hrs)</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of filteredContracts; let i=index">
          <td class="num">{{ i+1 }}</td>
          <td><div class="cust"><span class="av">{{ c.customerName[0] }}</span>{{ c.customerName }}</div></td>
          <td><span class="cno">{{ c.contractNumber }}</span></td>
          <td><span class="plan-badge" [ngClass]="c.planName.toLowerCase()">{{ c.planName }}</span></td>
          <td>{{ c.startDate | date:'dd MMM yyyy' }}</td>
          <td [class.expiring]="isExpiring(c.endDate)">{{ c.endDate | date:'dd MMM yyyy' }}</td>
          <td class="sla-hrs">{{ c.responseHoursCritical }}h / {{ c.responseHoursHigh }}h / {{ c.responseHoursMedium }}h / {{ c.responseHoursLow }}h</td>
          <td><span class="status-pill" [ngClass]="c.status">{{ c.status }}</span></td>
          <td>
            <button class="act-btn" (click)="openEdit(c)">✏ Edit</button>
            <button class="act-btn del" (click)="delete(c)">🗑</button>
          </td>
        </tr>
        <tr *ngIf="filteredContracts.length===0">
          <td colspan="9" class="empty">No contracts found. <button class="link-btn" (click)="openNew()">Add one</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:1300px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { margin:0; color:#64748b; font-size:13px; }
.btn-primary { background:#171a35; color:#fff; padding:10px 18px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
.btn-primary:hover:not(:disabled) { background:#12335d; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:#fff; border:1px solid #e2e8f0; color:#374151; padding:9px 16px; border-radius:8px; font-size:13px; cursor:pointer; }
.sla-rules-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
.sla-card { background:#fff; border-radius:14px; padding:18px; border:1px solid #e2e8f0; box-shadow:0 1px 4px rgba(0,0,0,.05); }
.sla-card.critical { border-top:4px solid #ef4444; } .sla-card.high { border-top:4px solid #f59e0b; }
.sla-card.medium { border-top:4px solid #3b82f6; } .sla-card.low { border-top:4px solid #94a3b8; }
.sla-priority { font-size:15px; font-weight:700; color:#1e293b; margin-bottom:8px; }
.sla-target { font-size:13px; color:#64748b; margin-bottom:4px; } .sla-target strong { color:#1e293b; }
.form-card { background:#fff; border-radius:14px; border:1.5px solid #e2e8f0; padding:22px; margin-bottom:18px; }
.form-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
.form-header h3 { margin:0; font-size:16px; color:#1e293b; }
.close-btn { background:none; border:none; font-size:18px; cursor:pointer; color:#94a3b8; }
.form-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:14px; }
.field { display:flex; flex-direction:column; gap:5px; }
.field label { font-size:12px; font-weight:600; color:#374151; }
.req { color:#ef4444; }
.field input,.field select { padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; }
.field input:focus,.field select:focus { outline:none; border-color:#8392ab; }
.sla-section { background:#f8fafc; border-radius:10px; padding:14px; margin-bottom:14px; }
.sla-section-title { font-size:12px; font-weight:700; color:#475569; margin-bottom:10px; }
.sla-hrs-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.sla-hr-field { display:flex; flex-direction:column; gap:4px; }
.sla-hr-field label { font-size:12px; color:#64748b; font-weight:500; }
.sla-hr-field input { padding:7px 10px; border:1.5px solid #e2e8f0; border-radius:6px; font-size:13px; }
.error-msg { color:#ef4444; font-size:13px; margin-bottom:10px; background:#fff5f5; border:1px solid #fecaca; padding:8px 12px; border-radius:6px; }
.form-actions { display:flex; justify-content:flex-end; gap:8px; }
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; }
.table-header { display:flex; justify-content:space-between; align-items:center; padding:16px 18px; border-bottom:1px solid #f1f5f9; }
.table-header h3 { font-size:14px; font-weight:700; color:#1e293b; margin:0; }
.search { padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; width:220px; }
table { width:100%; border-collapse:collapse; }
th { padding:11px 14px; font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; background:#fafafa; border-bottom:1px solid #e2e8f0; text-align:left; }
td { padding:11px 14px; font-size:13px; color:#374151; border-bottom:1px solid #f8fafc; vertical-align:middle; }
tr:hover td { background:#f8fafc; }
.num { color:#94a3b8; font-size:12px; }
.cust { display:flex; align-items:center; gap:8px; font-weight:500; }
.av { width:26px; height:26px; background:#e0f2fe; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#0369a1; flex-shrink:0; }
.cno { font-family:monospace; font-size:12px; background:#f1f5f9; padding:2px 8px; border-radius:4px; color:#475569; font-weight:600; }
.plan-badge { padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.plan-badge.standard { background:#f1f5f9; color:#475569; } .plan-badge.professional { background:#dbeafe; color:#1d4ed8; } .plan-badge.enterprise { background:#ede9fe; color:#6d28d9; }
.status-pill { padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.status-pill.active { background:#dcfce7; color:#15803d; } .status-pill.draft { background:#fef3c7; color:#92400e; } .status-pill.expired { background:#fee2e2; color:#dc2626; }
.sla-hrs { font-family:monospace; font-size:12px; color:#64748b; }
.expiring { color:#f59e0b; font-weight:600; }
.act-btn { background:none; border:1px solid #e2e8f0; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:12px; margin-right:4px; }
.act-btn:hover { border-color:#8392ab; } .act-btn.del:hover { border-color:#fecaca; color:#dc2626; }
.empty { text-align:center; padding:32px; color:#94a3b8; }
.link-btn { background:none; border:none; color:#3b82f6; cursor:pointer; font-size:13px; }
  `]
})
export class ContractsComponent implements OnInit {
  showForm = false;
  editing = false;
  editId = 0;
  saving = false;
  search = '';
  error = '';
  customers: any[] = [];
  contracts: any[] = [];
  form: any = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCustomers().subscribe(c => this.customers = c);
    this.load();
  }

  emptyForm() {
    return { customerId:'', contractNumber:'', planName:'Standard',
      startDate:'', endDate:'', status:'active',
      responseHoursCritical:2, responseHoursHigh:4, responseHoursMedium:8, responseHoursLow:24 };
  }

  load() {
    this.api.getContracts().subscribe(c => this.contracts = c);
  }

  get filteredContracts() {
    const q = this.search.toLowerCase();
    return q ? this.contracts.filter(c =>
      c.customerName?.toLowerCase().includes(q) || c.contractNumber?.toLowerCase().includes(q)) : this.contracts;
  }

  openNew()  { this.form = this.emptyForm(); this.editing = false; this.error = ''; this.showForm = true; }
  cancel()   { this.showForm = false; this.error = ''; }

  openEdit(c: any) {
    this.form = {
      customerId: c.customerId, contractNumber: c.contractNumber, planName: c.planName,
      startDate: c.startDate ? c.startDate.substring(0,10) : '',
      endDate: c.endDate ? c.endDate.substring(0,10) : '',
      status: c.status,
      responseHoursCritical: c.responseHoursCritical,
      responseHoursHigh: c.responseHoursHigh,
      responseHoursMedium: c.responseHoursMedium,
      responseHoursLow: c.responseHoursLow
    };
    this.editing = true; this.editId = c.id; this.error = ''; this.showForm = true;
  }

  save() {
    if (!this.form.customerId || !this.form.contractNumber?.trim() || !this.form.startDate || !this.form.endDate) {
      this.error = 'Customer, Contract Number, Start Date and End Date are required.'; return;
    }
    this.saving = true; this.error = '';
    const payload = {
      customerId: +this.form.customerId, contractNumber: this.form.contractNumber,
      planName: this.form.planName, startDate: this.form.startDate, endDate: this.form.endDate,
      status: this.form.status,
      responseHoursCritical: +this.form.responseHoursCritical,
      responseHoursHigh: +this.form.responseHoursHigh,
      responseHoursMedium: +this.form.responseHoursMedium,
      responseHoursLow: +this.form.responseHoursLow
    };
    const obs = this.editing
      ? this.api.updateContract(this.editId, payload)
      : this.api.createContract(payload);
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (e:any) => { this.saving = false; this.error = e?.error?.message || 'Save failed.'; }
    });
  }

  delete(c: any) {
    if (!confirm(`Delete contract ${c.contractNumber}?`)) return;
    this.api.deleteContract(c.id)
      .subscribe(() => this.contracts = this.contracts.filter((x:any) => x.id !== c.id));
  }

  isExpiring(end: string) {
    const d = new Date(end);
    const diff = (d.getTime() - Date.now()) / (1000*60*60*24);
    return diff < 30 && diff > 0;
  }
}
