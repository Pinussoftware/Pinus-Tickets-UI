import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Customer, AppModel } from '../../models/models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<!-- ═══════════════════ LIST VIEW ═══════════════════ -->
<div *ngIf="!showForm" class="page">
  <div class="page-header">
    <div>
      <h1>Customer Master</h1>
      <p class="subtitle">Manage all customer organisations and their support scope</p>
    </div>
    <button class="btn-primary" (click)="openNew()">+ Add Customer</button>
  </div>

  <!-- Summary cards -->
  <div class="summary-row">
    <div class="sum-card total">
      <div class="sum-icon">🏢</div>
      <div class="sum-val">{{ customers.length }}</div>
      <div class="sum-lbl">Total Customers</div>
    </div>
    <div class="sum-card active">
      <div class="sum-icon">✅</div>
      <div class="sum-val">{{ activeCount }}</div>
      <div class="sum-lbl">Active</div>
    </div>
    <div class="sum-card inactive">
      <div class="sum-icon">⏸</div>
      <div class="sum-val">{{ customers.length - activeCount }}</div>
      <div class="sum-lbl">Inactive</div>
    </div>
    <div class="sum-card apps">
      <div class="sum-icon">💻</div>
      <div class="sum-val">{{ totalApps }}</div>
      <div class="sum-lbl">Applications</div>
    </div>
  </div>

  <!-- Search & filter bar -->
  <div class="filter-bar">
    <input class="search-input" [(ngModel)]="search" (ngModelChange)="applySearch()"
           placeholder="🔍  Search name, code, GSTIN, phone, email…" />
    <select [(ngModel)]="statusFilter" (change)="applySearch()" class="filter-sel">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
    <button class="btn-clear" *ngIf="search || statusFilter" (click)="clearFilters()">✕ Clear</button>
    <div class="spacer"></div>
    <span class="count-badge">{{ filtered.length }} of {{ customers.length }}</span>
  </div>

  <!-- Table -->
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Customer Name</th>
          <th>Contact Person</th>
          <th>Phone</th>
          <th>Email</th>
          <th>City / State</th>
          <th>GSTIN</th>
          <th>SLA Plan</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of paged" class="tr-row">
          <td><span class="acct-code">{{ c.accountCode }}</span></td>
          <td>
            <div class="name-cell">
              <div class="cust-av">{{ c.name[0] }}</div>
              <div>
                <span class="cust-name">{{ c.name }}</span>
                <span class="cust-org" *ngIf="asAny(c).industry">{{ asAny(c).industry }}</span>
              </div>
            </div>
          </td>
          <td>{{ asAny(c).contactPerson || '—' }}</td>
          <td>{{ asAny(c).phone || '—' }}</td>
          <td class="email-cell">{{ asAny(c).email || '—' }}</td>
          <td>{{ asAny(c).city ? asAny(c).city + (asAny(c).state ? ', '+asAny(c).state : '') : '—' }}</td>
          <td><span class="gstin" *ngIf="asAny(c).gstin; else noGstin">{{ asAny(c).gstin }}</span>
              <ng-template #noGstin><span class="dash">—</span></ng-template></td>
          <td><span class="plan-badge standard">Standard</span></td>
          <td><span class="status-pill" [ngClass]="c.status">{{ c.status }}</span></td>
          <td class="actions-cell">
            <button class="act-btn edit" (click)="edit(c)" title="Edit">✏</button>
            <button class="act-btn view" (click)="edit(c)" title="View Details">👁</button>
          </td>
        </tr>
        <tr *ngIf="filtered.length === 0">
          <td colspan="10" class="empty-row">
            <div class="empty-state">
              <span>🏢</span>
              <p>No customers found</p>
              <button class="btn-primary sm" (click)="openNew()">Add your first customer</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination" *ngIf="filtered.length > pageSize">
      <button class="pg-btn" [disabled]="currentPage===1" (click)="goPage(currentPage-1)">‹ Prev</button>
      <button *ngFor="let p of pages" class="pg-btn" [class.active]="p===currentPage" (click)="goPage(p)">{{ p }}</button>
      <button class="pg-btn" [disabled]="currentPage===totalPages" (click)="goPage(currentPage+1)">Next ›</button>
      <span class="pg-info">Page {{ currentPage }} of {{ totalPages }} — {{ filtered.length }} records</span>
    </div>
  </div>
</div>

<!-- ═══════════════════ FORM VIEW (Add / Edit) ═══════════════════ -->
<div *ngIf="showForm" class="page">
  <div class="page-header">
    <div>
      <button class="back-btn" (click)="cancel()">← Back to Customers</button>
      <h1>{{ editing ? 'Edit Customer: ' + form.name : 'New Customer' }}</h1>
    </div>
    <div class="header-actions">
      <button class="btn-ghost" (click)="cancel()">Cancel</button>
      <button class="btn-primary" (click)="save()" [disabled]="saving">
        <span *ngIf="saving" class="spinner"></span>
        {{ saving ? 'Saving…' : '💾 Save Customer' }}
      </button>
    </div>
  </div>

  <div class="error-banner" *ngIf="errorMsg">⚠ {{ errorMsg }}</div>

  <!-- Tabs -->
  <div class="form-tabs">
    <button *ngFor="let t of tabs" class="form-tab" [class.active]="activeTab===t" (click)="activeTab=t">{{ t }}</button>
  </div>

  <!-- Tab: General -->
  <div class="form-body" *ngIf="activeTab==='General'">
    <div class="form-section">
      <div class="sec-title"><span class="sec-num">1</span> Basic Information</div>
      <div class="row-3">
        <div class="field">
          <label>Customer Name <span class="req">*</span></label>
          <input [(ngModel)]="form.name" placeholder="e.g. ABC Technologies Pvt. Ltd." />
        </div>
        <div class="field">
          <label>Account Code <span class="req">*</span></label>
          <input [(ngModel)]="form.accountCode" placeholder="CUST-001" />
        </div>
        <div class="field">
          <label>Industry / Sector</label>
          <input [(ngModel)]="form.industry" placeholder="e.g. Manufacturing, IT" />
        </div>
      </div>
      <div class="row-3">
        <div class="field">
          <label>Contact Person <span class="req">*</span></label>
          <input [(ngModel)]="form.contactPerson" placeholder="Primary contact name" />
        </div>
        <div class="field">
          <label>Phone <span class="req">*</span></label>
          <input [(ngModel)]="form.phone" placeholder="+91 98765 43210" />
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="form.email" placeholder="contact@company.com" />
        </div>
      </div>
      <div class="row-3">
        <div class="field">
          <label>Website</label>
          <input [(ngModel)]="form.website" placeholder="https://company.com" />
        </div>
        <div class="field">
          <label>GSTIN</label>
          <input [(ngModel)]="form.gstin" placeholder="22AAAAA0000A1Z5" style="text-transform:uppercase" />
        </div>
        <div class="field">
          <label>Tax / PAN No.</label>
          <input [(ngModel)]="form.taxNo" placeholder="AAAAA1234A" />
        </div>
      </div>
      <div class="row-3">
        <div class="field">
          <label>SLA Plan</label>
          <select [(ngModel)]="form.slaPlan">
            <option value="Standard">Standard</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
        <div class="field">
          <label>Status</label>
          <select [(ngModel)]="form.status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="field">
          <label>Since (Year)</label>
          <input [(ngModel)]="form.since" placeholder="2020" type="number" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="sec-title"><span class="sec-num">2</span> Address Details</div>
      <div class="field full">
        <label>Address</label>
        <textarea [(ngModel)]="form.address" rows="2" placeholder="Street address, building, area…"></textarea>
      </div>
      <div class="row-4">
        <div class="field"><label>City <span class="req">*</span></label><input [(ngModel)]="form.city" /></div>
        <div class="field"><label>State</label><input [(ngModel)]="form.state" /></div>
        <div class="field"><label>Pincode</label><input [(ngModel)]="form.pincode" /></div>
        <div class="field"><label>Country <span class="req">*</span></label>
          <input [(ngModel)]="form.country" placeholder="India" /></div>
      </div>
    </div>
  </div>

  <!-- Tab: Bank Details -->
  <div class="form-body" *ngIf="activeTab==='Bank Details'">
    <div class="form-section">
      <div class="sec-title"><span class="sec-num">3</span> Bank Account Details</div>
      <div class="row-3">
        <div class="field"><label>Bank Name</label><input [(ngModel)]="form.bankName" placeholder="State Bank of India" /></div>
        <div class="field"><label>Branch Name</label><input [(ngModel)]="form.branchName" placeholder="MG Road Branch" /></div>
        <div class="field"><label>Account Name</label><input [(ngModel)]="form.accountName" placeholder="Company Account Name" /></div>
      </div>
      <div class="row-3">
        <div class="field"><label>Account Number</label><input [(ngModel)]="form.accountNumber" placeholder="XXXX XXXX XXXX" /></div>
        <div class="field"><label>Account Type</label>
          <select [(ngModel)]="form.accountType">
            <option value="">Select</option><option>Current</option><option>Savings</option><option>OD</option>
          </select>
        </div>
        <div class="field"><label>IFSC Code</label><input [(ngModel)]="form.ifscCode" placeholder="SBIN0001234" style="text-transform:uppercase" /></div>
      </div>
      <div class="row-3">
        <div class="field"><label>SWIFT Code</label><input [(ngModel)]="form.swiftCode" placeholder="SBININBB" style="text-transform:uppercase" /></div>
        <div class="field"><label>MICR Code</label><input [(ngModel)]="form.micrCode" placeholder="110002010" /></div>
        <div class="field"><label>UPI ID</label><input [(ngModel)]="form.upiId" placeholder="company@bank" /></div>
      </div>
    </div>
  </div>

  <!-- Tab: Support Scope -->
  <div class="form-body" *ngIf="activeTab==='Support Scope'">
    <div class="form-section">
      <div class="sec-title"><span class="sec-num">4</span> Support Configuration</div>
      <div class="row-3">
        <div class="field">
          <label>Support Email</label>
          <input [(ngModel)]="form.supportEmail" placeholder="support@company.com" />
        </div>
        <div class="field">
          <label>Escalation Contact</label>
          <input [(ngModel)]="form.escalationContact" placeholder="Manager name / phone" />
        </div>
        <div class="field">
          <label>Timezone</label>
          <select [(ngModel)]="form.timezone">
            <option>Asia/Kolkata (IST +5:30)</option>
            <option>UTC</option>
            <option>America/New_York (EST)</option>
            <option>Europe/London (GMT)</option>
          </select>
        </div>
      </div>
      <div class="row-3">
        <div class="field">
          <label>Business Hours</label>
          <select [(ngModel)]="form.businessHours">
            <option>9 AM – 6 PM (Mon–Fri)</option>
            <option>24 × 7</option>
            <option>8 AM – 8 PM (Mon–Sat)</option>
          </select>
        </div>
        <div class="field">
          <label>Max Tickets / Month</label>
          <input [(ngModel)]="form.maxTickets" type="number" placeholder="50" />
        </div>
        <div class="field">
          <label>Notes / Remarks</label>
          <input [(ngModel)]="form.notes" placeholder="Any special instructions…" />
        </div>
      </div>
    </div>
  </div>

  <!-- Sticky save bar -->
  <div class="sticky-save">
    <div class="error-inline" *ngIf="errorMsg">⚠ {{ errorMsg }}</div>
    <button class="btn-ghost" (click)="cancel()">Cancel</button>
    <button class="btn-primary" (click)="save()" [disabled]="saving">
      <span *ngIf="saving" class="spinner"></span>
      {{ saving ? 'Saving…' : '💾 Save Customer' }}
    </button>
  </div>
</div>
  `,
  styles: [`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
* { box-sizing:border-box; }
.page { padding:20px 28px; max-width:1400px; margin:0 auto; font-family:'Inter',sans-serif; }

/* Header */
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { margin:0; color:#64748b; font-size:13px; }
.back-btn { background:none; border:none; color:#3b82f6; font-size:13px;
  cursor:pointer; padding:0; margin-bottom:6px; display:block; }
.header-actions { display:flex; gap:10px; align-items:center; }
.btn-primary { background:#171a35; color:#fff; padding:10px 18px; border:none;
  border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;
  display:inline-flex; align-items:center; gap:8px; }
.btn-primary:hover:not(:disabled) { background:#12335d; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-primary.sm { padding:7px 14px; font-size:12px; }
.btn-ghost { background:#fff; border:1px solid #e2e8f0; color:#374151;
  padding:9px 16px; border-radius:8px; font-size:13px; cursor:pointer; }
.btn-ghost:hover { background:#f8fafc; }
.spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; flex-shrink:0; }
@keyframes spin { to { transform:rotate(360deg); } }

/* Summary cards */
.summary-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
.sum-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:16px;
  display:flex; align-items:center; gap:14px; box-shadow:0 1px 4px rgba(0,0,0,.05); }
.sum-card.total    { border-left:4px solid #3b82f6; }
.sum-card.active   { border-left:4px solid #22c55e; }
.sum-card.inactive { border-left:4px solid #94a3b8; }
.sum-card.apps     { border-left:4px solid #a855f7; }
.sum-icon { font-size:26px; }
.sum-val  { font-size:28px; font-weight:700; color:#1e293b; line-height:1; }
.sum-lbl  { font-size:12px; color:#64748b; margin-top:2px; }

/* Filter bar */
.filter-bar { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
.search-input { flex:1; min-width:260px; padding:9px 14px; border:1px solid #e2e8f0;
  border-radius:8px; font-size:13px; background:#fff; }
.search-input:focus { outline:none; border-color:#8392ab; }
.filter-sel { padding:9px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; background:#fff; }
.btn-clear { padding:9px 12px; border:1px solid #fecaca; color:#ef4444;
  background:#fff; border-radius:8px; font-size:13px; cursor:pointer; }
.spacer { flex:1; }
.count-badge { font-size:12px; background:#f1f5f9; color:#475569;
  padding:5px 12px; border-radius:20px; font-weight:500; white-space:nowrap; }

/* Table */
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0;
  overflow:auto; box-shadow:0 1px 4px rgba(0,0,0,.05); }
table { width:100%; border-collapse:collapse; min-width:960px; }
th { padding:11px 14px; font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.5px; background:#fafafa;
  border-bottom:1px solid #e2e8f0; text-align:left; white-space:nowrap;
  position:sticky; top:0; }
td { padding:11px 14px; font-size:13px; color:#374151; border-bottom:1px solid #f8fafc; }
.tr-row:hover td { background:#f8fafc; }
.acct-code { font-family:monospace; font-size:11.5px; font-weight:700;
  background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:4px; }
.name-cell { display:flex; align-items:center; gap:10px; }
.cust-av { width:32px; height:32px; background:linear-gradient(135deg,#8392ab,#ee8299);
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }
.cust-name { display:block; font-weight:600; color:#1e293b; }
.cust-org  { display:block; font-size:11px; color:#94a3b8; margin-top:1px; }
.email-cell { font-size:12.5px; color:#64748b; }
.gstin { font-family:monospace; font-size:11.5px; color:#374151;
  background:#f1f5f9; padding:2px 6px; border-radius:4px; }
.dash { color:#cbd5e1; }
.plan-badge { padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.plan-badge.standard     { background:#f1f5f9; color:#475569; }
.plan-badge.professional { background:#dbeafe; color:#1d4ed8; }
.plan-badge.enterprise   { background:#ede9fe; color:#6d28d9; }
.status-pill { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.status-pill.active   { background:#dcfce7; color:#15803d; }
.status-pill.inactive { background:#fee2e2; color:#dc2626; }
.actions-cell { white-space:nowrap; }
.act-btn { background:none; border:1px solid #e2e8f0; padding:5px 10px;
  border-radius:6px; cursor:pointer; font-size:13px; margin-right:4px; transition:all .15s; }
.act-btn.edit:hover { border-color:#f59e0b; background:#fef3c7; }
.act-btn.view:hover { border-color:#3b82f6; background:#eff6ff; }
.empty-row { text-align:center; padding:40px !important; }
.empty-state { display:flex; flex-direction:column; align-items:center; gap:8px; }
.empty-state span { font-size:36px; }
.empty-state p { margin:0; color:#94a3b8; }

/* Pagination */
.pagination { display:flex; align-items:center; gap:6px; padding:14px 18px;
  border-top:1px solid #f1f5f9; }
.pg-btn { padding:6px 12px; border:1px solid #e2e8f0; border-radius:6px;
  background:#fff; font-size:13px; cursor:pointer; }
.pg-btn.active { background:#171a35; color:#fff; border-color:#171a35; }
.pg-btn:disabled { opacity:.4; cursor:not-allowed; }
.pg-info { margin-left:auto; font-size:12px; color:#64748b; }

/* Error banner */
.error-banner { background:#fee2e2; border:1px solid #fecaca; color:#dc2626;
  padding:12px 16px; border-radius:8px; font-size:13px; margin-bottom:16px; }

/* Form tabs */
.form-tabs { display:flex; gap:0; border-bottom:2px solid #e2e8f0; margin-bottom:18px; }
.form-tab { padding:10px 22px; background:none; border:none;
  border-bottom:3px solid transparent; font-size:13.5px; font-weight:500;
  color:#64748b; cursor:pointer; margin-bottom:-2px; transition:all .15s; }
.form-tab.active { color:#171a35; border-bottom-color:#171a35; font-weight:700; }
.form-tab:hover:not(.active) { color:#374151; }

/* Form sections */
.form-body { display:flex; flex-direction:column; gap:14px; }
.form-section { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:22px; }
.sec-title { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:700;
  color:#1e293b; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid #f1f5f9; }
.sec-num { width:24px; height:24px; background:#171a35; color:#fff; border-radius:50%;
  display:flex; align-items:center; justify-content:center; font-size:12px;
  font-weight:700; flex-shrink:0; }
.row-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:14px; }
.row-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.field { display:flex; flex-direction:column; }
.field.full { margin-bottom:14px; }
.field label { font-size:12.5px; font-weight:600; color:#374151; margin-bottom:6px; }
.req { color:#ef4444; }
.field input, .field select, .field textarea {
  padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px;
  font-size:13.5px; font-family:'Inter',sans-serif; color:#1e293b;
  background:#fff; resize:vertical; transition:border .2s; }
.field input:focus, .field select:focus, .field textarea:focus {
  outline:none; border-color:#8392ab; box-shadow:0 0 0 3px rgba(131,146,171,.12); }

/* Sticky save bar */
.sticky-save { position:sticky; bottom:0; background:#fff; border-top:1px solid #e2e8f0;
  padding:14px 0; margin-top:18px; display:flex; justify-content:flex-end;
  align-items:center; gap:10px; }
.error-inline { flex:1; font-size:13px; color:#dc2626; }

@media(max-width:900px) {
  .summary-row { grid-template-columns:1fr 1fr; }
  .row-3 { grid-template-columns:1fr 1fr; }
  .row-4 { grid-template-columns:1fr 1fr; }
}
  `]
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filtered: Customer[] = [];
  search = '';
  statusFilter = '';
  showForm = false;
  editing = false;
  editId = 0;
  saving = false;
  errorMsg = '';
  totalApps = 0;

  currentPage = 1;
  pageSize = 10;

  tabs = ['General', 'Bank Details', 'Support Scope'];
  activeTab = 'General';

  form: any = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCustomers().subscribe(c => {
      this.customers = c;
      this.applySearch();
    });
    this.api.getApplications().subscribe(a => this.totalApps = a.length);
  }

  emptyForm() {
    return {
      name: '', accountCode: '', industry: '', contactPerson: '', phone: '',
      email: '', website: '', gstin: '', taxNo: '', slaPlan: 'Standard',
      status: 'active', since: '',
      address: '', city: '', state: '', pincode: '', country: 'India',
      bankName: '', branchName: '', accountName: '', accountNumber: '',
      accountType: '', ifscCode: '', swiftCode: '', micrCode: '', upiId: '',
      supportEmail: '', escalationContact: '',
      timezone: 'Asia/Kolkata (IST +5:30)',
      businessHours: '9 AM – 6 PM (Mon–Fri)',
      maxTickets: '', notes: '',
      organizationId: 1
    };
  }

  applySearch() {
    const q = this.search.toLowerCase();
    this.filtered = this.customers.filter(c => {
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.accountCode.toLowerCase().includes(q) ||
        (c as any).phone?.toLowerCase().includes(q) ||
        (c as any).email?.toLowerCase().includes(q) ||
        (c as any).gstin?.toLowerCase().includes(q) ||
        (c as any).contactPerson?.toLowerCase().includes(q);
      const matchStatus = !this.statusFilter || c.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
    this.currentPage = 1;
  }

  clearFilters() { this.search = ''; this.statusFilter = ''; this.applySearch(); }

  asAny(c: any) { return c as any; }

  get activeCount() { return this.customers.filter(c => c.status === 'active').length; }
  get totalPages()  { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pages()       { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get paged()       {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(s, s + this.pageSize);
  }
  goPage(p: number) { this.currentPage = Math.min(Math.max(1, p), this.totalPages); }

  openNew() {
    this.form = this.emptyForm();
    this.editing = false; this.editId = 0;
    this.errorMsg = ''; this.activeTab = 'General';
    this.showForm = true;
  }

  edit(c: any) {
    this.form = {
      name: c.name, accountCode: c.accountCode,
      industry: c.industry || '', contactPerson: c.contactPerson || '',
      phone: c.phone || '', email: c.email || '', website: c.website || '',
      gstin: c.gstin || '', taxNo: c.taxNo || '', slaPlan: c.slaPlan || 'Standard',
      status: c.status || 'active', since: c.sinceYear || '',
      address: c.address || '', city: c.city || '', state: c.state || '',
      pincode: c.pincode || '', country: c.country || 'India',
      bankName: c.bankName || '', branchName: c.branchName || '',
      accountName: c.accountName || '', accountNumber: c.accountNumber || '',
      accountType: c.accountType || '', ifscCode: c.ifscCode || '',
      swiftCode: c.swiftCode || '', micrCode: c.micrCode || '', upiId: c.upiId || '',
      supportEmail: c.supportEmail || '', escalationContact: c.escalationContact || '',
      timezone: c.timezone || '', businessHours: c.businessHours || '',
      maxTicketsPerMonth: c.maxTicketsPerMonth || '', notes: c.notes || ''
    };
    this.editing = true; this.editId = c.id;
    this.errorMsg = ''; this.activeTab = 'General';
    this.showForm = true;
  }

  cancel() { this.showForm = false; this.errorMsg = ''; }

  save() {
    if (!this.form.name?.trim() || !this.form.accountCode?.trim()) {
      this.errorMsg = 'Customer Name and Account Code are required.'; return;
    }
    this.saving = true; this.errorMsg = '';
    const payload = {
      name: this.form.name, accountCode: this.form.accountCode, organizationId: 1,
      industry: this.form.industry, contactPerson: this.form.contactPerson,
      phone: this.form.phone, email: this.form.email, website: this.form.website,
      gstin: this.form.gstin, taxNo: this.form.taxNo, slaPlan: this.form.slaPlan,
      status: this.form.status, sinceYear: this.form.since,
      address: this.form.address, city: this.form.city, state: this.form.state,
      pincode: this.form.pincode, country: this.form.country,
      bankName: this.form.bankName, branchName: this.form.branchName,
      accountName: this.form.accountName, accountNumber: this.form.accountNumber,
      accountType: this.form.accountType, ifscCode: this.form.ifscCode,
      swiftCode: this.form.swiftCode, micrCode: this.form.micrCode, upiId: this.form.upiId,
      supportEmail: this.form.supportEmail, escalationContact: this.form.escalationContact,
      timezone: this.form.timezone, businessHours: this.form.businessHours,
      maxTicketsPerMonth: this.form.maxTicketsPerMonth ? +this.form.maxTicketsPerMonth : null,
      notes: this.form.notes
    };
    const obs = this.editing
      ? this.api.updateCustomer(this.editId, payload)
      : this.api.createCustomer(payload);
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.api.getCustomers().subscribe(c => { this.customers = c; this.applySearch(); }); },
      error: (e: any) => { this.saving = false; this.errorMsg = e?.error?.message || 'Save failed. Please try again.'; }
    });
  }
}
