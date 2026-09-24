import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Contracts & SLA</h1>
      <p class="subtitle">Manage customer support contracts and SLA configurations</p>
    </div>
    <button class="btn-primary" (click)="showForm=!showForm">+ New Contract</button>
  </div>

  <!-- SLA Rules Card -->
  <div class="sla-rules-row">
    <div class="sla-card critical">
      <div class="sla-priority">Critical</div>
      <div class="sla-target">Response: <strong>2h</strong></div>
      <div class="sla-target">Resolution: <strong>4h</strong></div>
      <div class="sla-badge">🔴 Highest</div>
    </div>
    <div class="sla-card high">
      <div class="sla-priority">High</div>
      <div class="sla-target">Response: <strong>4h</strong></div>
      <div class="sla-target">Resolution: <strong>8h</strong></div>
      <div class="sla-badge">🟠 High</div>
    </div>
    <div class="sla-card medium">
      <div class="sla-priority">Medium</div>
      <div class="sla-target">Response: <strong>8h</strong></div>
      <div class="sla-target">Resolution: <strong>24h</strong></div>
      <div class="sla-badge">🟡 Medium</div>
    </div>
    <div class="sla-card low">
      <div class="sla-priority">Low</div>
      <div class="sla-target">Response: <strong>24h</strong></div>
      <div class="sla-target">Resolution: <strong>72h</strong></div>
      <div class="sla-badge">⚪ Low</div>
    </div>
  </div>

  <!-- New Contract Form -->
  <div class="form-card" *ngIf="showForm">
    <h3>New Contract</h3>
    <div class="form-grid">
      <div class="field"><label>Customer *</label>
        <select [(ngModel)]="form.customerId">
          <option value="">— Select customer —</option>
          <option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div class="field"><label>Contract Number *</label>
        <input [(ngModel)]="form.contractNumber" placeholder="CTR-2026-001" /></div>
      <div class="field"><label>Plan</label>
        <select [(ngModel)]="form.planName">
          <option>Standard</option><option>Professional</option><option>Enterprise</option>
        </select>
      </div>
      <div class="field"><label>Start Date</label>
        <input type="date" [(ngModel)]="form.startDate" /></div>
      <div class="field"><label>End Date</label>
        <input type="date" [(ngModel)]="form.endDate" /></div>
      <div class="field"><label>Status</label>
        <select [(ngModel)]="form.status">
          <option>active</option><option>draft</option><option>expired</option>
        </select>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn-ghost" (click)="showForm=false">Cancel</button>
      <button class="btn-primary" (click)="createContract()">Save Contract</button>
    </div>
  </div>

  <!-- Contracts Table -->
  <div class="table-card">
    <div class="table-header">
      <h3>All Contracts ({{ contracts.length }})</h3>
      <input [(ngModel)]="search" placeholder="🔍 Search contracts…" class="search" />
    </div>
    <table>
      <thead>
        <tr><th>#</th><th>Customer</th><th>Contract No.</th><th>Plan</th>
          <th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of filteredContracts; let i=index">
          <td class="num">{{ i+1 }}</td>
          <td><div class="cust"><span class="av">{{ c.customer[0] }}</span>{{ c.customer }}</div></td>
          <td><span class="cno">{{ c.contractNo }}</span></td>
          <td><span class="plan-badge" [ngClass]="c.plan.toLowerCase()">{{ c.plan }}</span></td>
          <td>{{ c.start }}</td>
          <td [class.expiring]="isExpiring(c.end)">{{ c.end }}</td>
          <td><span class="status-pill" [ngClass]="c.status">{{ c.status }}</span></td>
          <td>
            <button class="act-btn">✏ Edit</button>
            <button class="act-btn view">📄 View</button>
          </td>
        </tr>
        <tr *ngIf="filteredContracts.length===0">
          <td colspan="8" class="empty">No contracts found. <button class="link-btn" (click)="showForm=true">Add one</button></td>
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
.btn-primary { background:#171a35; color:#fff; padding:10px 18px; border:none;
  border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
.btn-primary:hover { background:#12335d; }
.btn-ghost { background:#fff; border:1px solid #e2e8f0; color:#374151;
  padding:9px 16px; border-radius:8px; font-size:13px; cursor:pointer; }
.sla-rules-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
.sla-card { background:#fff; border-radius:14px; padding:18px; border:1px solid #e2e8f0;
  box-shadow:0 1px 4px rgba(0,0,0,.05); }
.sla-card.critical { border-top:4px solid #ef4444; }
.sla-card.high     { border-top:4px solid #f59e0b; }
.sla-card.medium   { border-top:4px solid #3b82f6; }
.sla-card.low      { border-top:4px solid #94a3b8; }
.sla-priority { font-size:16px; font-weight:700; color:#1e293b; margin-bottom:8px; }
.sla-target { font-size:13px; color:#64748b; margin-bottom:4px; }
.sla-target strong { color:#1e293b; }
.sla-badge { margin-top:10px; font-size:12px; font-weight:500; }
.form-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0;
  padding:20px; margin-bottom:18px; }
.form-card h3 { font-size:15px; font-weight:700; color:#1e293b; margin:0 0 16px; }
.form-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.field { display:flex; flex-direction:column; margin-bottom:4px; }
.field label { font-size:12px; font-weight:600; color:#374151; margin-bottom:5px; }
.field input, .field select { padding:9px 12px; border:1px solid #e2e8f0;
  border-radius:8px; font-size:13px; }
.field input:focus, .field select:focus { outline:none; border-color:#8392ab; }
.form-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:14px; }
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0;
  overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.05); }
.table-header { display:flex; justify-content:space-between; align-items:center;
  padding:16px 18px; border-bottom:1px solid #f1f5f9; }
.table-header h3 { font-size:14px; font-weight:700; color:#1e293b; margin:0; }
.search { padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; width:220px; }
table { width:100%; border-collapse:collapse; }
th { padding:11px 14px; font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.5px; background:#fafafa;
  border-bottom:1px solid #e2e8f0; text-align:left; }
td { padding:11px 14px; font-size:13px; color:#374151; border-bottom:1px solid #f8fafc; }
.num { color:#94a3b8; font-size:12px; }
.cust { display:flex; align-items:center; gap:8px; font-weight:500; }
.av { width:26px; height:26px; background:#e0f2fe; border-radius:50%;
  display:flex; align-items:center; justify-content:center; font-size:11px;
  font-weight:700; color:#0369a1; flex-shrink:0; }
.cno { font-family:monospace; font-size:12px; background:#f1f5f9; padding:2px 8px;
  border-radius:4px; color:#475569; font-weight:600; }
.plan-badge { padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.plan-badge.standard     { background:#f1f5f9; color:#475569; }
.plan-badge.professional { background:#dbeafe; color:#1d4ed8; }
.plan-badge.enterprise   { background:#ede9fe; color:#6d28d9; }
.status-pill { padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.status-pill.active  { background:#dcfce7; color:#15803d; }
.status-pill.draft   { background:#fef3c7; color:#92400e; }
.status-pill.expired { background:#fee2e2; color:#dc2626; }
.expiring { color:#f59e0b; font-weight:600; }
.act-btn { background:none; border:1px solid #e2e8f0; padding:5px 10px;
  border-radius:6px; cursor:pointer; font-size:12px; margin-right:4px; }
.act-btn:hover { border-color:#8392ab; }
.act-btn.view { color:#3b82f6; }
.empty { text-align:center; padding:32px; color:#94a3b8; }
.link-btn { background:none; border:none; color:#3b82f6; cursor:pointer; font-size:13px; }
  `]
})
export class ContractsComponent implements OnInit {
  showForm = false;
  search = '';
  customers: any[] = [];
  form: any = { customerId:'', contractNumber:'', planName:'Standard',
    startDate:'', endDate:'', status:'active' };

  contracts = [
    { customer:'Demo Customer', contractNo:'CTR-2026-001', plan:'Enterprise', start:'01 Jan 2026', end:'31 Dec 2026', status:'active' },
    { customer:'Pinus Internal', contractNo:'CTR-2026-002', plan:'Professional', start:'01 Mar 2026', end:'28 Feb 2027', status:'active' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() { this.api.getCustomers().subscribe(c => this.customers = c); }

  get filteredContracts() {
    const q = this.search.toLowerCase();
    return q ? this.contracts.filter(c =>
      c.customer.toLowerCase().includes(q) || c.contractNo.toLowerCase().includes(q)) : this.contracts;
  }

  createContract() {
    const c = this.customers.find(x => x.id == this.form.customerId);
    this.contracts.unshift({
      customer: c?.name || 'Unknown', contractNo: this.form.contractNumber,
      plan: this.form.planName, start: this.form.startDate, end: this.form.endDate, status: this.form.status
    });
    this.showForm = false;
    this.form = { customerId:'', contractNumber:'', planName:'Standard', startDate:'', endDate:'', status:'active' };
  }

  isExpiring(end: string) {
    const d = new Date(end);
    const diff = (d.getTime() - Date.now()) / (1000*60*60*24);
    return diff < 30 && diff > 0;
  }
}
