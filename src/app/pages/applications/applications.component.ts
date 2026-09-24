import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<!-- ══════════════ LIST ══════════════ -->
<div *ngIf="!showForm" class="page">
  <div class="page-header">
    <div>
      <h1>Applications</h1>
      <p class="subtitle">Track all customer applications, versions and environments</p>
    </div>
    <button class="btn-primary" (click)="openNew()">+ Add Application</button>
  </div>

  <!-- Summary cards -->
  <div class="summary-row">
    <div class="sum-card total">
      <div class="sum-icon">💻</div>
      <div><div class="sum-val">{{ all.length }}</div><div class="sum-lbl">Total Applications</div></div>
    </div>
    <div class="sum-card active">
      <div class="sum-icon">✅</div>
      <div><div class="sum-val">{{ count('active') }}</div><div class="sum-lbl">Active</div></div>
    </div>
    <div class="sum-card inactive">
      <div class="sum-icon">⏸</div>
      <div><div class="sum-val">{{ count('inactive') }}</div><div class="sum-lbl">Inactive</div></div>
    </div>
    <div class="sum-card customers">
      <div class="sum-icon">🏢</div>
      <div><div class="sum-val">{{ uniqueCustomers }}</div><div class="sum-lbl">Customers</div></div>
    </div>
    <div class="sum-card tech">
      <div class="sum-icon">🔧</div>
      <div><div class="sum-val">{{ uniqueTech }}</div><div class="sum-lbl">Technologies</div></div>
    </div>
  </div>

  <!-- Filters -->
  <div class="filter-bar">
    <input class="search-input" [(ngModel)]="search" (ngModelChange)="applyFilter()"
           placeholder="🔍  Search name, customer, technology, version…" />
    <select [(ngModel)]="filterCustomer" (change)="applyFilter()" class="filter-sel">
      <option value="">All Customers</option>
      <option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</option>
    </select>
    <select [(ngModel)]="filterStatus" (change)="applyFilter()" class="filter-sel">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="maintenance">Maintenance</option>
    </select>
    <button class="btn-clear" *ngIf="search||filterCustomer||filterStatus" (click)="clearFilters()">✕ Clear</button>
    <div class="spacer"></div>
    <span class="count-badge">{{ filtered.length }} applications</span>
  </div>

  <!-- Card grid view -->
  <div class="app-grid" *ngIf="viewMode==='grid'">
    <div *ngFor="let a of paged" class="app-card" (click)="openEdit(a)">
      <div class="app-card-top">
        <div class="app-icon">{{ appIcon(a.technology) }}</div>
        <div class="app-status-pill" [ngClass]="a.status">{{ a.status }}</div>
      </div>
      <div class="app-name">{{ a.name }}</div>
      <div class="app-version" *ngIf="a.version">v{{ a.version }}</div>
      <div class="app-cust">
        <span class="cust-av-sm">{{ a.customerName[0] }}</span>
        {{ a.customerName }}
      </div>
      <div class="app-tech" *ngIf="a.technology">
        <span class="tech-badge">{{ a.technology }}</span>
      </div>
      <div class="app-card-footer">
        <a [routerLink]="['/tickets']" [queryParams]="{customerId: a.customerId}"
           class="card-link" (click)="$event.stopPropagation()">🎫 View Tickets</a>
        <button class="card-edit-btn" (click)="openEdit(a); $event.stopPropagation()">✏ Edit</button>
      </div>
    </div>
    <div class="empty-grid" *ngIf="filtered.length===0">
      <span>💻</span><p>No applications found.</p>
      <button class="btn-primary sm" (click)="openNew()">Add Application</button>
    </div>
  </div>

  <!-- Table view toggle -->
  <div class="view-toggle">
    <button [class.active]="viewMode==='grid'" (click)="viewMode='grid'">⊞ Grid</button>
    <button [class.active]="viewMode==='table'" (click)="viewMode='table'">☰ Table</button>
  </div>

  <!-- Table view -->
  <div class="table-card" *ngIf="viewMode==='table'">
    <table>
      <thead>
        <tr>
          <th>#</th><th>Application Name</th><th>Customer</th><th>Version</th>
          <th>Technology</th><th>Status</th><th>Open Tickets</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let a of paged; let i=index" class="tr-row">
          <td class="num">{{ i+1 }}</td>
          <td>
            <div class="name-cell">
              <div class="app-av">{{ appIcon(a.technology) }}</div>
              <div>
                <span class="app-name-text">{{ a.name }}</span>
                <span class="app-ver-text" *ngIf="a.version">v{{ a.version }}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="cust-cell">
              <div class="cust-av-sm">{{ a.customerName[0] }}</div>
              {{ a.customerName }}
            </div>
          </td>
          <td><span class="ver-badge" *ngIf="a.version">v{{ a.version }}</span><span *ngIf="!a.version" class="dash">—</span></td>
          <td><span class="tech-badge" *ngIf="a.technology">{{ a.technology }}</span><span *ngIf="!a.technology" class="dash">—</span></td>
          <td><span class="status-pill" [ngClass]="a.status">{{ a.status }}</span></td>
          <td>
            <a [routerLink]="['/tickets']" [queryParams]="{customerId: a.customerId}"
               class="ticket-link">View →</a>
          </td>
          <td class="actions-cell">
            <button class="act-btn edit" (click)="openEdit(a)">✏ Edit</button>
            <button class="act-btn" [ngClass]="a.status==='active'?'deact':'act'"
              (click)="toggleStatus(a)">
              {{ a.status==='active' ? '⏸ Deactivate' : '▶ Activate' }}
            </button>
          </td>
        </tr>
        <tr *ngIf="filtered.length===0">
          <td colspan="8" class="empty">No applications found.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div class="pagination" *ngIf="filtered.length > pageSize">
    <button class="pg-btn" [disabled]="page===1" (click)="page=page-1">‹ Prev</button>
    <button *ngFor="let p of pages" class="pg-btn" [class.active]="p===page" (click)="page=p">{{ p }}</button>
    <button class="pg-btn" [disabled]="page===totalPages" (click)="page=page+1">Next ›</button>
    <span class="pg-info">Page {{ page }} of {{ totalPages }}</span>
  </div>
</div>

<!-- ══════════════ FORM ══════════════ -->
<div *ngIf="showForm" class="page">
  <div class="page-header">
    <div>
      <button class="back-btn" (click)="cancel()">← Back to Applications</button>
      <h1>{{ editing ? 'Edit Application: ' + form.name : 'New Application' }}</h1>
    </div>
    <div class="header-actions">
      <button class="btn-ghost" (click)="cancel()">Cancel</button>
      <button class="btn-primary" (click)="save()" [disabled]="saving">
        <span *ngIf="saving" class="spinner"></span>
        {{ saving ? 'Saving…' : '💾 Save Application' }}
      </button>
    </div>
  </div>

  <div class="error-banner" *ngIf="errorMsg">⚠ {{ errorMsg }}</div>

  <div class="form-grid">
    <div class="form-main">

      <div class="form-section">
        <div class="sec-title"><span class="sec-num">1</span> Application Details</div>
        <div class="row-3">
          <div class="field">
            <label>Application Name <span class="req">*</span></label>
            <input [(ngModel)]="form.name" placeholder="e.g. HR Management System" />
          </div>
          <div class="field">
            <label>Customer <span class="req">*</span></label>
            <select [(ngModel)]="form.customerId">
              <option value="">— Select customer —</option>
              <option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="field">
            <label>Status</label>
            <select [(ngModel)]="form.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
        </div>
        <div class="row-3">
          <div class="field">
            <label>Version</label>
            <input [(ngModel)]="form.version" placeholder="e.g. 2.5.1" />
          </div>
          <div class="field">
            <label>Technology Stack</label>
            <select [(ngModel)]="form.technology">
              <option value="">— Select —</option>
              <option>Angular + .NET</option>
              <option>React + Node.js</option>
              <option>Vue + Laravel</option>
              <option>Python + Django</option>
              <option>Java Spring Boot</option>
              <option>SAP</option>
              <option>Oracle</option>
              <option>Other</option>
            </select>
          </div>
          <div class="field">
            <label>Database</label>
            <select [(ngModel)]="form.database">
              <option value="">— Select —</option>
              <option>PostgreSQL</option><option>MySQL</option>
              <option>SQL Server</option><option>Oracle</option>
              <option>MongoDB</option><option>SQLite</option>
            </select>
          </div>
        </div>
        <div class="field full">
          <label>Description</label>
          <textarea [(ngModel)]="form.description" rows="3"
                    placeholder="Brief description of what this application does…"></textarea>
        </div>
      </div>

      <div class="form-section">
        <div class="sec-title"><span class="sec-num">2</span> Environments</div>
        <div *ngFor="let env of form.environments; let i=index" class="env-row">
          <div class="env-fields">
            <div class="field">
              <label>Environment <span class="req">*</span></label>
              <select [(ngModel)]="env.type">
                <option>Production</option><option>UAT</option>
                <option>Staging</option><option>Development</option>
              </select>
            </div>
            <div class="field">
              <label>URL</label>
              <input [(ngModel)]="env.url" placeholder="https://app.company.com" />
            </div>
            <div class="field">
              <label>Server / Host</label>
              <input [(ngModel)]="env.server" placeholder="prod-server-01" />
            </div>
            <div class="field">
              <label>Version</label>
              <input [(ngModel)]="env.version" placeholder="v2.5.1" />
            </div>
          </div>
          <button class="remove-env" (click)="removeEnv(i)" *ngIf="form.environments.length > 1">✕</button>
        </div>
        <button class="add-env-btn" (click)="addEnv()">+ Add Environment</button>
      </div>

      <div class="form-section">
        <div class="sec-title"><span class="sec-num">3</span> Support Configuration</div>
        <div class="row-3">
          <div class="field">
            <label>Support Team</label>
            <input [(ngModel)]="form.supportTeam" placeholder="Team / person responsible" />
          </div>
          <div class="field">
            <label>Deployment Type</label>
            <select [(ngModel)]="form.deploymentType">
              <option value="">— Select —</option>
              <option>On-Premise</option><option>Cloud (AWS)</option>
              <option>Cloud (Azure)</option><option>Cloud (GCP)</option>
              <option>Hybrid</option>
            </select>
          </div>
          <div class="field">
            <label>SLA Priority</label>
            <select [(ngModel)]="form.slaPriority">
              <option value="Standard">Standard</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
        <div class="field full">
          <label>Deployment Notes</label>
          <textarea [(ngModel)]="form.deploymentNotes" rows="2"
                    placeholder="Deployment instructions, special configurations…"></textarea>
        </div>
      </div>
    </div>

    <!-- Right sidebar -->
    <div class="form-side">
      <div class="side-card">
        <div class="side-title">📋 Summary</div>
        <div class="sum-row"><span>Customer</span>
          <strong>{{ customerName(form.customerId) || '—' }}</strong></div>
        <div class="sum-row"><span>Status</span>
          <span class="status-pill sm" [ngClass]="form.status">{{ form.status }}</span></div>
        <div class="sum-row"><span>Version</span><strong>{{ form.version || '—' }}</strong></div>
        <div class="sum-row"><span>Technology</span><strong>{{ form.technology || '—' }}</strong></div>
        <div class="sum-row"><span>Environments</span><strong>{{ form.environments.length }}</strong></div>
      </div>
      <div class="side-card info-card">
        <div class="side-title">💡 Tips</div>
        <ul class="tips">
          <li>Add all active environments so support team knows where to test fixes</li>
          <li>Keep version updated after every release</li>
          <li>Mark applications as <em>Maintenance</em> during planned downtime</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="sticky-save">
    <div class="error-inline" *ngIf="errorMsg">⚠ {{ errorMsg }}</div>
    <button class="btn-ghost" (click)="cancel()">Cancel</button>
    <button class="btn-primary" (click)="save()" [disabled]="saving">
      {{ saving ? 'Saving…' : '💾 Save Application' }}
    </button>
  </div>
</div>
  `,
  styles: [`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
* { box-sizing:border-box; }
.page { padding:20px 28px; max-width:1400px; margin:0 auto; font-family:'Inter',sans-serif; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { margin:0; color:#64748b; font-size:13px; }
.back-btn { background:none; border:none; color:#3b82f6; font-size:13px; cursor:pointer; padding:0; margin-bottom:6px; display:block; }
.header-actions { display:flex; gap:10px; }
.btn-primary { background:#171a35; color:#fff; padding:10px 18px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; }
.btn-primary.sm { padding:7px 14px; font-size:12px; }
.btn-primary:hover:not(:disabled) { background:#12335d; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:#fff; border:1px solid #e2e8f0; color:#374151; padding:9px 16px; border-radius:8px; font-size:13px; cursor:pointer; }
.spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }

/* Summary */
.summary-row { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:18px; }
.sum-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:16px; display:flex; align-items:center; gap:12px; box-shadow:0 1px 4px rgba(0,0,0,.05); }
.sum-card.total     { border-left:4px solid #3b82f6; }
.sum-card.active    { border-left:4px solid #22c55e; }
.sum-card.inactive  { border-left:4px solid #94a3b8; }
.sum-card.customers { border-left:4px solid #f59e0b; }
.sum-card.tech      { border-left:4px solid #a855f7; }
.sum-icon { font-size:26px; }
.sum-val  { font-size:26px; font-weight:700; color:#1e293b; line-height:1; }
.sum-lbl  { font-size:12px; color:#64748b; margin-top:2px; }

/* Filters */
.filter-bar { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
.search-input { flex:1; min-width:240px; padding:9px 14px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; }
.search-input:focus { outline:none; border-color:#8392ab; }
.filter-sel { padding:9px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; background:#fff; }
.btn-clear { padding:9px 12px; border:1px solid #fecaca; color:#ef4444; background:#fff; border-radius:8px; font-size:13px; cursor:pointer; }
.spacer { flex:1; }
.count-badge { font-size:12px; background:#f1f5f9; color:#475569; padding:5px 12px; border-radius:20px; font-weight:500; }

/* View toggle */
.view-toggle { display:flex; gap:0; margin-bottom:12px; }
.view-toggle button { padding:7px 16px; border:1px solid #e2e8f0; background:#fff; font-size:13px; cursor:pointer; color:#64748b; }
.view-toggle button:first-child { border-radius:8px 0 0 8px; }
.view-toggle button:last-child  { border-radius:0 8px 8px 0; border-left:none; }
.view-toggle button.active { background:#171a35; color:#fff; border-color:#171a35; }

/* App grid */
.app-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; margin-bottom:14px; }
.app-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:18px; cursor:pointer; transition:all .15s; display:flex; flex-direction:column; gap:8px; }
.app-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.08); border-color:#8392ab; }
.app-card-top { display:flex; justify-content:space-between; align-items:center; }
.app-icon { font-size:28px; }
.app-status-pill { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.app-status-pill.active { background:#dcfce7; color:#15803d; }
.app-status-pill.inactive { background:#f1f5f9; color:#64748b; }
.app-status-pill.maintenance { background:#fef3c7; color:#92400e; }
.app-status-pill.deprecated  { background:#fee2e2; color:#dc2626; }
.app-name { font-size:15px; font-weight:700; color:#1e293b; }
.app-version { font-size:12px; color:#94a3b8; }
.app-cust { display:flex; align-items:center; gap:6px; font-size:12.5px; color:#475569; }
.cust-av-sm { width:22px; height:22px; background:#e0f2fe; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#0369a1; flex-shrink:0; }
.tech-badge { background:#ede9fe; color:#6d28d9; font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; }
.app-card-footer { display:flex; justify-content:space-between; align-items:center; margin-top:4px; padding-top:10px; border-top:1px solid #f1f5f9; }
.card-link { color:#3b82f6; font-size:12px; font-weight:500; text-decoration:none; }
.card-link:hover { text-decoration:underline; }
.card-edit-btn { background:none; border:1px solid #e2e8f0; padding:4px 10px; border-radius:6px; font-size:12px; cursor:pointer; color:#374151; }
.card-edit-btn:hover { border-color:#8392ab; }
.empty-grid { grid-column:1/-1; background:#fff; border:1px dashed #e2e8f0; border-radius:14px; padding:48px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; }
.empty-grid span { font-size:36px; }
.empty-grid p { color:#94a3b8; margin:0; }

/* Table */
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:auto; box-shadow:0 1px 4px rgba(0,0,0,.05); }
table { width:100%; border-collapse:collapse; min-width:800px; }
th { padding:11px 14px; font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; background:#fafafa; border-bottom:1px solid #e2e8f0; text-align:left; position:sticky; top:0; }
td { padding:11px 14px; font-size:13px; color:#374151; border-bottom:1px solid #f8fafc; }
.tr-row:hover td { background:#f8fafc; }
.num { color:#94a3b8; font-size:12px; }
.name-cell { display:flex; align-items:center; gap:10px; }
.app-av { width:32px; height:32px; border-radius:8px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.app-name-text { display:block; font-weight:600; color:#1e293b; }
.app-ver-text  { display:block; font-size:11px; color:#94a3b8; }
.cust-cell { display:flex; align-items:center; gap:8px; }
.ver-badge { background:#f1f5f9; color:#475569; font-family:monospace; font-size:11.5px; padding:2px 7px; border-radius:4px; font-weight:600; }
.status-pill { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.status-pill.sm { font-size:11px; }
.status-pill.active { background:#dcfce7; color:#15803d; }
.status-pill.inactive { background:#f1f5f9; color:#64748b; }
.status-pill.maintenance { background:#fef3c7; color:#92400e; }
.status-pill.deprecated  { background:#fee2e2; color:#dc2626; }
.ticket-link { color:#3b82f6; font-size:12.5px; font-weight:500; text-decoration:none; }
.ticket-link:hover { text-decoration:underline; }
.actions-cell { white-space:nowrap; }
.act-btn { border:1px solid #e2e8f0; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:12px; margin-right:4px; background:none; }
.act-btn.edit:hover { border-color:#f59e0b; background:#fef3c7; }
.act-btn.deact:hover { border-color:#ef4444; background:#fee2e2; color:#dc2626; }
.act-btn.act:hover   { border-color:#22c55e; background:#dcfce7; color:#15803d; }
.dash { color:#cbd5e1; }
.empty { text-align:center; padding:32px; color:#94a3b8; }
.pagination { display:flex; align-items:center; gap:6px; padding:14px 0; }
.pg-btn { padding:6px 12px; border:1px solid #e2e8f0; border-radius:6px; background:#fff; font-size:13px; cursor:pointer; }
.pg-btn.active { background:#171a35; color:#fff; border-color:#171a35; }
.pg-btn:disabled { opacity:.4; cursor:not-allowed; }
.pg-info { margin-left:auto; font-size:12px; color:#64748b; }

/* Form */
.form-grid { display:grid; grid-template-columns:1fr 280px; gap:18px; }
.form-main { display:flex; flex-direction:column; gap:14px; }
.form-section { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:22px; }
.sec-title { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:700; color:#1e293b; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid #f1f5f9; }
.sec-num { width:24px; height:24px; background:#171a35; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
.row-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:14px; }
.field { display:flex; flex-direction:column; }
.field.full { margin-bottom:14px; }
.field label { font-size:12.5px; font-weight:600; color:#374151; margin-bottom:6px; }
.req { color:#ef4444; }
.field input, .field select, .field textarea { padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13.5px; font-family:'Inter',sans-serif; resize:vertical; transition:border .2s; }
.field input:focus, .field select:focus, .field textarea:focus { outline:none; border-color:#8392ab; box-shadow:0 0 0 3px rgba(131,146,171,.12); }
.env-row { display:flex; gap:10px; align-items:flex-end; background:#f8fafc; border-radius:10px; padding:12px; margin-bottom:10px; border:1px solid #f1f5f9; }
.env-fields { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; flex:1; }
.remove-env { background:none; border:1px solid #fecaca; color:#ef4444; border-radius:6px; padding:6px 10px; cursor:pointer; font-size:13px; flex-shrink:0; }
.add-env-btn { background:#f8fafc; border:1px dashed #cbd5e1; color:#64748b; border-radius:8px; padding:10px 18px; cursor:pointer; font-size:13px; font-weight:500; width:100%; transition:all .15s; }
.add-env-btn:hover { border-color:#8392ab; color:#374151; background:#f1f5f9; }
.form-side { display:flex; flex-direction:column; gap:14px; }
.side-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:16px; }
.side-title { font-size:13px; font-weight:700; color:#1e293b; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #f1f5f9; }
.sum-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:12.5px; border-bottom:1px solid #f8fafc; }
.sum-row span:first-child { color:#64748b; }
.sum-row strong { color:#1e293b; font-weight:600; }
.info-card { background:#f8fafc; }
.tips { margin:0; padding-left:16px; display:flex; flex-direction:column; gap:8px; }
.tips li { font-size:12.5px; color:#475569; }
.error-banner { background:#fee2e2; border:1px solid #fecaca; color:#dc2626; padding:12px 16px; border-radius:8px; font-size:13px; margin-bottom:16px; }
.sticky-save { position:sticky; bottom:0; background:#fff; border-top:1px solid #e2e8f0; padding:14px 0; margin-top:18px; display:flex; justify-content:flex-end; align-items:center; gap:10px; }
.error-inline { flex:1; font-size:13px; color:#dc2626; }
@media(max-width:1000px) {
  .summary-row { grid-template-columns:repeat(3,1fr); }
  .form-grid { grid-template-columns:1fr; }
  .env-fields { grid-template-columns:1fr 1fr; }
  .row-3 { grid-template-columns:1fr 1fr; }
}
  `]
})
export class ApplicationsComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  customers: any[] = [];
  search = '';
  filterCustomer: any = '';
  filterStatus = '';
  viewMode: 'grid' | 'table' = 'grid';
  showForm = false;
  editing = false;
  editId = 0;
  saving = false;
  errorMsg = '';
  page = 1;
  pageSize = 12;

  form: any = this.emptyForm();

  constructor(private api: ApiService, private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.api.getCustomers().subscribe(c => this.customers = c);
    this.loadApps();
  }

  loadApps() {
    this.api.getApplications().subscribe((apps: any[]) => {
      this.all = apps;
      this.applyFilter();
    });
  }

  emptyForm() {
    return {
      name: '', customerId: '', status: 'active', version: '', technology: '',
      database: '', description: '', supportTeam: '', deploymentType: '',
      slaPriority: 'Standard', deploymentNotes: '',
      environments: [{ type: 'Production', url: '', server: '', version: '' }]
    };
  }

  applyFilter() {
    const q = this.search.toLowerCase();
    this.filtered = this.all.filter(a => {
      const ms = !q || a.name?.toLowerCase().includes(q) ||
        a.customerName?.toLowerCase().includes(q) ||
        a.technology?.toLowerCase().includes(q) ||
        a.version?.toLowerCase().includes(q);
      const mc = !this.filterCustomer || a.customerId == this.filterCustomer;
      const mst = !this.filterStatus || a.status === this.filterStatus;
      return ms && mc && mst;
    });
    this.page = 1;
  }

  clearFilters() { this.search=''; this.filterCustomer=''; this.filterStatus=''; this.applyFilter(); }

  count(status: string) { return this.all.filter(a => a.status === status).length; }
  get uniqueCustomers() { return new Set(this.all.map(a => a.customerId)).size; }
  get uniqueTech()      { return new Set(this.all.map(a => a.technology).filter(Boolean)).size; }
  get totalPages()      { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pages()           { return Array.from({length:this.totalPages},(_,i)=>i+1); }
  get paged()           { return this.filtered.slice((this.page-1)*this.pageSize, this.page*this.pageSize); }

  customerName(id: any) { return this.customers.find(c => c.id == id)?.name || ''; }

  appIcon(tech?: string): string {
    if (!tech) return '💻';
    const t = tech.toLowerCase();
    if (t.includes('angular') || t.includes('.net')) return '🔷';
    if (t.includes('react'))   return '⚛';
    if (t.includes('python'))  return '🐍';
    if (t.includes('java'))    return '☕';
    if (t.includes('vue'))     return '💚';
    if (t.includes('sap'))     return '🟡';
    if (t.includes('oracle'))  return '🔴';
    return '💻';
  }

  openNew() {
    this.form = this.emptyForm(); this.editing = false; this.editId = 0;
    this.errorMsg = ''; this.showForm = true;
  }

  openEdit(a: any) {
    this.form = { ...this.emptyForm(), ...a,
      environments: a.environments?.length ? a.environments :
        [{ type: 'Production', url: '', server: '', version: '' }] };
    this.editing = true; this.editId = a.id; this.errorMsg = ''; this.showForm = true;
  }

  addEnv()       { this.form.environments.push({ type:'UAT', url:'', server:'', version:'' }); }
  removeEnv(i: number) { this.form.environments.splice(i, 1); }

  cancel() { this.showForm = false; this.errorMsg = ''; }

  save() {
    if (!this.form.name?.trim() || !this.form.customerId) {
      this.errorMsg = 'Name and Customer are required.'; return;
    }
    this.saving = true; this.errorMsg = '';
    const payload = { name: this.form.name, customerId: +this.form.customerId,
      version: this.form.version, technology: this.form.technology };
    const obs = this.editing
      ? this.http.patch(`${environment.apiUrl}/applications/${this.editId}`, payload)
      : this.api.createApplication(payload);
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.loadApps(); },
      error: (e: any) => { this.saving = false; this.errorMsg = e?.error?.message || 'Save failed.'; }
    });
  }

  toggleStatus(a: any) {
    const newStatus = a.status === 'active' ? 'inactive' : 'active';
    this.http.patch(`${environment.apiUrl}/applications/${a.id}/status`, { status: newStatus })
      .subscribe(() => { a.status = newStatus; });
  }
}
