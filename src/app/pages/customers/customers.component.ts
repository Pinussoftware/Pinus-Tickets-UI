import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Customer } from '../../models/models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <h1>Customers</h1>
    <button class="btn-primary" (click)="showForm=!showForm">+ Add Customer</button>
  </div>

  <div class="form-card" *ngIf="showForm">
    <h3>New Customer</h3>
    <div class="form-row">
      <div class="field"><label>Name *</label><input [(ngModel)]="form.name" placeholder="Customer name" /></div>
      <div class="field"><label>Account Code *</label><input [(ngModel)]="form.accountCode" placeholder="CUST001" /></div>
    </div>
    <div class="error-msg" *ngIf="error">{{ error }}</div>
    <div class="form-actions">
      <button class="btn-ghost" (click)="showForm=false">Cancel</button>
      <button class="btn-primary" (click)="create()" [disabled]="!form.name || !form.accountCode">Save</button>
    </div>
  </div>

  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>Name</th><th>Account Code</th><th>Status</th></tr></thead>
      <tbody>
        <tr *ngFor="let c of customers">
          <td>{{ c.id }}</td>
          <td><strong>{{ c.name }}</strong></td>
          <td><span class="mono">{{ c.accountCode }}</span></td>
          <td><span class="badge" [class.active]="c.status==='active'">{{ c.status }}</span></td>
        </tr>
      </tbody>
    </table>
    <div class="empty" *ngIf="customers.length===0">No customers yet.</div>
  </div>
</div>
  `,
  styles: [`
.page { padding:28px 32px; }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0; }
.btn-primary { background:#3b82f6; color:#fff; padding:9px 18px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
.btn-ghost { background:#fff; border:1px solid #e2e8f0; color:#374151; padding:9px 16px; border-radius:8px; font-size:13px; cursor:pointer; }
.form-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:20px; }
.form-card h3 { margin:0 0 16px; font-size:16px; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.field { display:flex; flex-direction:column; margin-bottom:12px; }
.field label { font-size:13px; font-weight:600; color:#374151; margin-bottom:4px; }
.field input { padding:9px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; }
.form-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:8px; }
.table-wrap { background:#fff; border-radius:12px; border:1px solid #e2e8f0; overflow:auto; }
table { width:100%; border-collapse:collapse; }
th { padding:12px 14px; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; border-bottom:1px solid #e2e8f0; background:#f8fafc; text-align:left; }
td { padding:12px 14px; font-size:13px; color:#374151; border-bottom:1px solid #f1f5f9; }
.mono { font-family:monospace; font-size:12px; }
.badge { padding:3px 10px; border-radius:20px; font-size:11px; background:#fee2e2; color:#dc2626; }
.badge.active { background:#d1fae5; color:#065f46; }
.error-msg { color:#ef4444; font-size:13px; margin-bottom:8px; }
.empty { padding:30px; text-align:center; color:#94a3b8; }
  `]
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  showForm = false;
  error = '';
  form = { name: '', accountCode: '', organizationId: 1 };

  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getCustomers().subscribe(c => this.customers = c); }

  create() {
    this.api.createCustomer(this.form).subscribe({
      next: c => { this.customers.unshift(c); this.showForm = false; this.form = { name:'', accountCode:'', organizationId:1 }; },
      error: () => this.error = 'Failed to create customer'
    });
  }
}
