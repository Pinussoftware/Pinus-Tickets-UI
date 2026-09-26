import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

const ROLES = ['Admin','SupportManager','SupportExecutive','Developer','QA','CustomerAdmin','CustomerUser'];
const CUSTOMER_ROLES = ['CustomerAdmin','CustomerUser'];

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>👥 User Management</h1>
      <p class="subtitle">Manage system users, roles and access</p>
    </div>
    <button class="btn-primary" (click)="openNew()">+ Add User</button>
  </div>

  <!-- Stats -->
  <div class="stats-row">
    <div class="stat-card"><span class="si">👥</span><div><div class="sv">{{ users.length }}</div><div class="sl">Total Users</div></div></div>
    <div class="stat-card"><span class="si">✅</span><div><div class="sv">{{ active }}</div><div class="sl">Active</div></div></div>
    <div class="stat-card"><span class="si">🔴</span><div><div class="sv">{{ inactive }}</div><div class="sl">Inactive</div></div></div>
    <div class="stat-card"><span class="si">🛡️</span><div><div class="sv">{{ admins }}</div><div class="sl">Admins</div></div></div>
  </div>

  <!-- Filter bar -->
  <div class="filter-bar">
    <input [(ngModel)]="search" (ngModelChange)="applyFilter()" class="search-input" placeholder="🔍 Search name, email, role…" />
    <select [(ngModel)]="roleFilter" (change)="applyFilter()" class="filter-sel">
      <option value="">All Roles</option>
      <option *ngFor="let r of roles">{{ r }}</option>
    </select>
    <select [(ngModel)]="statusFilter" (change)="applyFilter()" class="filter-sel">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
    <span class="count-lbl">{{ filtered.length }} users</span>
  </div>

  <!-- Form -->
  <div class="form-card" *ngIf="showForm">
    <div class="form-header">
      <h3>{{ editing ? '✏ Edit User' : '➕ Add New User' }}</h3>
      <button class="close-btn" (click)="cancel()">✕</button>
    </div>
    <div class="form-grid">
      <div class="field"><label>Full Name <span class="req">*</span></label><input [(ngModel)]="form.name" placeholder="John Doe" /></div>
      <div class="field"><label>Email <span class="req">*</span></label><input [(ngModel)]="form.email" type="email" placeholder="john@example.com" [disabled]="editing" /></div>
      <div class="field"><label>{{ editing ? 'New Password (blank = keep)' : 'Password *' }}</label><input [(ngModel)]="form.password" type="password" placeholder="Min 6 characters" /></div>
      <div class="field"><label>Phone</label><input [(ngModel)]="form.phone" placeholder="+91 98765 43210" /></div>
      <div class="field"><label>Role <span class="req">*</span></label>
        <select [(ngModel)]="form.role" (change)="onRoleChange()">
          <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
        </select>
      </div>
      <div class="field" *ngIf="editing"><label>Status</label>
        <select [(ngModel)]="form.status"><option value="active">Active</option><option value="inactive">Inactive</option></select>
      </div>
      <!-- Customer dropdown — shown only for CustomerAdmin / CustomerUser roles -->
      <div class="field customer-field" *ngIf="isCustomerRole">
        <label>Customer Account <span class="req">*</span></label>
        <select [(ngModel)]="form.customerId">
          <option [ngValue]="null">— Select Customer —</option>
          <option *ngFor="let c of customers" [ngValue]="c.id">{{ c.name }} ({{ c.accountCode }})</option>
        </select>
        <span class="field-hint">This user will only see tickets and data for the selected customer.</span>
      </div>
    </div>
    <div class="role-guide">
      <div class="rg-title">Role permissions:</div>
      <div class="rg-grid">
        <span class="rg-item" *ngFor="let r of roleGuide"><strong>{{ r.role }}</strong> — {{ r.desc }}</span>
      </div>
    </div>
    <div class="error-msg" *ngIf="error">{{ error }}</div>
    <div class="form-actions">
      <button class="btn-ghost" (click)="cancel()">Cancel</button>
      <button class="btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Saving…' : (editing ? 'Update User' : 'Create User') }}</button>
    </div>
  </div>

  <!-- Table -->
  <div class="table-card">
    <table>
      <thead>
        <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Customer</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of filtered">
          <td class="id-col">{{ u.id }}</td>
          <td><div class="user-cell"><div class="av">{{ u.name[0] }}</div><strong>{{ u.name }}</strong></div></td>
          <td class="email-col">{{ u.email }}</td>
          <td>{{ u.phone || '—' }}</td>
          <td><span class="role-pill" [ngClass]="u.role">{{ u.role }}</span></td>
          <td class="customer-col">
            <span *ngIf="u.customerName" class="customer-badge">🏢 {{ u.customerName }}</span>
            <span *ngIf="!u.customerName" class="no-customer">—</span>
          </td>
          <td><span class="status-pill" [ngClass]="u.status">{{ u.status }}</span></td>
          <td class="date-col">{{ u.createdAt ? (u.createdAt | date:'dd MMM yyyy') : '—' }}</td>
          <td class="actions-col">
            <button class="act-btn" (click)="openEdit(u)" title="Edit">✏</button>
            <button class="act-btn" (click)="toggleStatus(u)" [title]="u.status==='active'?'Deactivate':'Activate'">
              {{ u.status === 'active' ? '🔴' : '✅' }}
            </button>
          </td>
        </tr>
        <tr *ngIf="filtered.length === 0"><td colspan="9" class="empty-row">No users found</td></tr>
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
.btn-primary { background:#171a35; color:#fff; padding:10px 20px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
.btn-primary:hover:not(:disabled) { background:#12335d; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:#fff; border:1.5px solid #e2e8f0; color:#374151; padding:9px 16px; border-radius:8px; font-size:13px; cursor:pointer; }
.stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:18px; }
.stat-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; display:flex; align-items:center; gap:12px; }
.si { font-size:26px; } .sv { font-size:24px; font-weight:800; color:#1e293b; } .sl { font-size:12px; color:#64748b; margin-top:2px; }
.filter-bar { display:flex; gap:10px; margin-bottom:14px; align-items:center; flex-wrap:wrap; }
.search-input { padding:8px 14px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; min-width:240px; }
.filter-sel { padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; }
.count-lbl { margin-left:auto; font-size:12px; color:#94a3b8; }
.form-card { background:#fff; border:1.5px solid #e2e8f0; border-radius:14px; padding:22px; margin-bottom:18px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.form-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
.form-header h3 { margin:0; font-size:16px; color:#1e293b; }
.close-btn { background:none; border:none; font-size:18px; cursor:pointer; color:#94a3b8; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
.customer-field { grid-column: 1 / -1; }
.field { display:flex; flex-direction:column; gap:5px; }
.field label { font-size:12px; font-weight:600; color:#374151; }
.req { color:#ef4444; }
.field input,.field select { padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; }
.field input:focus,.field select:focus { outline:none; border-color:#8392ab; }
.field input:disabled { background:#f8fafc; color:#94a3b8; }
.field-hint { font-size:11.5px; color:#64748b; margin-top:2px; }
.role-guide { background:#f8fafc; border-radius:8px; padding:12px; margin-bottom:14px; }
.rg-title { font-size:12px; font-weight:600; color:#64748b; margin-bottom:8px; }
.rg-grid { display:flex; flex-wrap:wrap; gap:8px; }
.rg-item { font-size:11.5px; color:#374151; background:#fff; border:1px solid #e2e8f0; padding:3px 10px; border-radius:6px; }
.form-actions { display:flex; justify-content:flex-end; gap:8px; }
.error-msg { color:#ef4444; font-size:13px; margin-bottom:10px; background:#fff5f5; border:1px solid #fecaca; padding:8px 12px; border-radius:6px; }
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; background:#fafafa; border-bottom:1px solid #f1f5f9; }
td { padding:11px 14px; border-bottom:1px solid #f8fafc; color:#374151; vertical-align:middle; }
tr:hover td { background:#f8fafc; }
.id-col { color:#94a3b8; font-family:monospace; } .email-col { font-size:12.5px; color:#64748b; }
.date-col { font-size:12px; color:#94a3b8; white-space:nowrap; } .actions-col { white-space:nowrap; }
.customer-col { font-size:12.5px; }
.customer-badge { background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:12px; font-size:12px; font-weight:500; }
.no-customer { color:#cbd5e1; }
.user-cell { display:flex; align-items:center; gap:10px; }
.av { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#171a35,#8392ab); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }
.role-pill { padding:2px 9px; border-radius:20px; font-size:11px; font-weight:600; }
.Admin { background:#fef3c7; color:#d97706; } .SupportManager { background:#ede9fe; color:#7c3aed; }
.SupportExecutive { background:#dbeafe; color:#1d4ed8; } .Developer { background:#dcfce7; color:#15803d; }
.QA { background:#fce7f3; color:#be185d; } .CustomerAdmin,.CustomerUser { background:#f1f5f9; color:#475569; }
.status-pill { padding:2px 9px; border-radius:20px; font-size:11px; font-weight:600; }
.status-pill.active { background:#dcfce7; color:#15803d; } .status-pill.inactive { background:#fee2e2; color:#dc2626; }
.act-btn { padding:5px 8px; border:1.5px solid #e2e8f0; background:#fff; border-radius:6px; cursor:pointer; font-size:13px; margin-right:4px; }
.act-btn:hover { background:#f8fafc; } .empty-row { text-align:center; padding:36px; color:#94a3b8; }
  `]
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  customers: any[] = [];
  filtered: any[] = [];
  roles = ROLES;
  showForm = false;
  editing = false;
  editId = 0;
  saving = false;
  error = '';
  search = '';
  roleFilter = '';
  statusFilter = '';
  form: any = this.emptyForm();

  roleGuide = [
    { role:'Admin', desc:'Full system access' },
    { role:'SupportManager', desc:'Manage tickets & team' },
    { role:'SupportExecutive', desc:'Handle assigned tickets' },
    { role:'Developer', desc:'Work on bug fixes' },
    { role:'QA', desc:'Test and validate fixes' },
    { role:'CustomerAdmin', desc:'Customer account admin — sees only their customer data' },
    { role:'CustomerUser', desc:'Raise & track tickets — sees only their customer data' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.getCustomers().subscribe({ next: (c: any) => this.customers = c, error: () => {} });
  }

  load() {
    this.api.getUsers().subscribe({ next: (u: any) => { this.users = u; this.applyFilter(); }, error: () => {} });
  }

  emptyForm() { return { name:'', email:'', password:'', phone:'', role:'SupportExecutive', status:'active', organizationId:1, customerId: null }; }

  applyFilter() {
    const q = this.search.toLowerCase();
    this.filtered = this.users.filter(u =>
      (!q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q)) &&
      (!this.roleFilter || u.role === this.roleFilter) &&
      (!this.statusFilter || u.status === this.statusFilter));
  }

  get active()   { return this.users.filter(u => u.status === 'active').length; }
  get inactive() { return this.users.filter(u => u.status !== 'active').length; }
  get admins()   { return this.users.filter(u => u.role === 'Admin').length; }
  get isCustomerRole() { return CUSTOMER_ROLES.includes(this.form.role); }

  onRoleChange() {
    if (!this.isCustomerRole) this.form.customerId = null;
  }

  openNew()  { this.form = this.emptyForm(); this.editing = false; this.error = ''; this.showForm = true; }
  cancel()   { this.showForm = false; this.error = ''; }

  openEdit(u: any) {
    this.form = {
      name: u.name, email: u.email, password: '', phone: u.phone || '',
      role: u.role, status: u.status, organizationId: 1,
      customerId: u.customerId ?? null
    };
    this.editing = true; this.editId = u.id; this.error = ''; this.showForm = true;
  }

  save() {
    if (!this.form.name?.trim() || !this.form.email?.trim()) { this.error = 'Name and Email are required.'; return; }
    if (!this.editing && !this.form.password?.trim()) { this.error = 'Password is required for new users.'; return; }
    if (this.isCustomerRole && !this.form.customerId) { this.error = 'Please select a Customer for this role.'; return; }
    this.saving = true; this.error = '';
    const obs = this.editing
      ? this.api.updateUser(this.editId, {
          name: this.form.name, role: this.form.role, phone: this.form.phone || null,
          status: this.form.status, password: this.form.password || null,
          customerId: this.isCustomerRole ? this.form.customerId : 0 })
      : this.api.createUser({ name: this.form.name, email: this.form.email,
          password: this.form.password, role: this.form.role, phone: this.form.phone || null,
          organizationId: 1, customerId: this.form.customerId });
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (e: any) => { this.saving = false; this.error = e?.error?.message || 'Save failed.'; }
    });
  }

  toggleStatus(u: any) {
    const s = u.status === 'active' ? 'inactive' : 'active';
    this.api.updateUser(u.id, { status: s })
      .subscribe(() => { u.status = s; this.applyFilter(); });
  }
}
