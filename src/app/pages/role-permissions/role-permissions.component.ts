import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

const ROLES = [
  { key: 'SupportManager',   label: 'Support Manager'   },
  { key: 'SupportExecutive', label: 'Support Executive'  },
  { key: 'CustomerAdmin',    label: 'Customer Admin'     },
  { key: 'CustomerUser',     label: 'Customer User'      },
];

const PAGES = [
  { key:'dashboard',        label:'Dashboard',           icon:'📊', section:'OVERVIEW' },
  { key:'tickets',          label:'All Tickets',         icon:'🎫', section:'TICKETS' },
  { key:'ticket_create',    label:'Create Ticket',       icon:'➕', section:'TICKETS' },
  { key:'ticket_detail',    label:'Ticket Detail',       icon:'🔍', section:'TICKETS' },
  { key:'workbench',        label:'My Workbench',        icon:'🛠', section:'TICKETS' },
  { key:'qa_queue',         label:'QA Queue',            icon:'🔬', section:'TICKETS' },
  { key:'assignment',       label:'Assignment',          icon:'🎯', section:'MANAGEMENT' },
  { key:'customers',        label:'Customers',           icon:'🏢', section:'MANAGEMENT' },
  { key:'applications',     label:'Applications',        icon:'💻', section:'MANAGEMENT' },
  { key:'contracts',        label:'Contracts & SLA',     icon:'📋', section:'MANAGEMENT' },
  { key:'reports',          label:'Reports & Analytics', icon:'📈', section:'MANAGEMENT' },
  { key:'notifications',    label:'Notifications',       icon:'🔔', section:'MANAGEMENT' },
  { key:'users',            label:'Users',               icon:'👥', section:'ADMINISTRATION' },
  { key:'role_permissions', label:'Role Permissions',    icon:'🔐', section:'ADMINISTRATION' },
];

const SECTIONS = [...new Set(PAGES.map(p => p.section))];

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">

  <!-- Header -->
  <div class="page-header">
    <div class="title-group">
      <h1>Role Permissions</h1>
      <p class="subtitle">Configure access for each role across all system modules</p>
    </div>
    <div class="header-actions">
      <span class="role-label">Configure access for:</span>
      <select class="role-select" [(ngModel)]="selectedRole" (change)="loadPerms()">
        <option *ngFor="let r of roles" [value]="r.key">{{ r.label }}</option>
      </select>
      <button class="btn-save" (click)="save()" [disabled]="saving">
        <span *ngIf="saving" class="spinner"></span>
        {{ saving ? 'Saving...' : '💾 Save Permissions' }}
      </button>
    </div>
  </div>

  <!-- Info banner -->
  <div class="info-banner">
    ℹ️ <strong>Admin role</strong> always has full access to everything and cannot be restricted.
    Configure permissions below for <strong>{{ currentRoleLabel }}</strong>.
  </div>

  <!-- Success / Error -->
  <div class="success-bar" *ngIf="successMsg">✅ {{ successMsg }}</div>
  <div class="error-bar"   *ngIf="errorMsg">❌ {{ errorMsg }}</div>

  <!-- Table card -->
  <div class="table-card">
    <table class="perm-table">
      <thead>
        <tr>
          <th class="th-check">
            <input type="checkbox" [checked]="allChecked()" (change)="toggleAll($event)" />
          </th>
          <th class="th-page">Page / Module</th>
          <th class="th-perm">Access<br><span class="sub">(can view)</span></th>
          <th class="th-perm">Create<br><span class="sub">(+ button)</span></th>
          <th class="th-perm">Edit<br><span class="sub">(edit button)</span></th>
          <th class="th-perm">Delete<br><span class="sub">(delete button)</span></th>
          <th class="th-quick">Quick Set</th>
        </tr>
      </thead>
      <tbody>
        <ng-container *ngFor="let section of sections">
          <tr class="section-row"><td colspan="7">{{ section }}</td></tr>
          <tr *ngFor="let p of pagesBySection(section)"
              class="perm-row" [class.no-access]="!perm(p.key).canAccess">
            <td class="td-check">
              <input type="checkbox"
                     [checked]="hasAnyAccess(p.key)"
                     (change)="toggleRowAny(p.key, $event)" />
            </td>
            <td class="td-page" [class.muted]="!perm(p.key).canAccess">
              <span class="page-icon">{{ p.icon }}</span>
              <strong>{{ p.label }}</strong>
            </td>
            <td class="td-cb">
              <input type="checkbox" class="cb access"
                     [(ngModel)]="perm(p.key).canAccess"
                     (change)="onAccessChange(p.key)" />
            </td>
            <td class="td-cb">
              <input type="checkbox" class="cb create"
                     [(ngModel)]="perm(p.key).canCreate"
                     [disabled]="!perm(p.key).canAccess"
                     (change)="onActionChange(p.key)" />
            </td>
            <td class="td-cb">
              <input type="checkbox" class="cb edit"
                     [(ngModel)]="perm(p.key).canEdit"
                     [disabled]="!perm(p.key).canAccess"
                     (change)="onActionChange(p.key)" />
            </td>
            <td class="td-cb">
              <input type="checkbox" class="cb delete"
                     [(ngModel)]="perm(p.key).canDelete"
                     [disabled]="!perm(p.key).canAccess"
                     (change)="onActionChange(p.key)" />
            </td>
            <td class="td-quick">
              <button class="qb all"  (click)="setRow(p.key,'full')" [class.active]="isFullAccess(p.key)">All</button>
              <button class="qb view" (click)="setRow(p.key,'view')" [class.active]="isViewOnly(p.key)">View</button>
              <button class="qb none" (click)="setRow(p.key,'none')" [class.active]="isNoAccess(p.key)">None</button>
            </td>
          </tr>
        </ng-container>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" class="footer-summary">
            Summary: <strong>{{ accessCount() }}</strong> of <strong>{{ pages.length }}</strong> pages accessible
          </td>
          <td colspan="5" class="footer-bulk">
            <button class="bulk-btn all"  (click)="setAll('full')">✅ Full Access All</button>
            <button class="bulk-btn view" (click)="setAll('view')">👁 View Only All</button>
            <button class="bulk-btn none" (click)="setAll('none')">🚫 No Access All</button>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div class="bottom-bar">
    <button class="btn-save" (click)="save()" [disabled]="saving">
      <span *ngIf="saving" class="spinner"></span>
      {{ saving ? 'Saving...' : '💾 Save Permissions' }}
    </button>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:1300px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:12px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 2px; }
.subtitle { font-size:13px; color:#64748b; margin:0; }
.header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.role-label { font-size:13px; color:#64748b; }
.role-select { padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; color:#1e293b; background:#fff; outline:none; cursor:pointer; min-width:180px; }
.role-select:focus { border-color:#8392ab; }
.btn-save { background:#171a35; color:#fff; border:none; padding:10px 22px; border-radius:8px; font-size:13.5px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:7px; }
.btn-save:hover:not(:disabled) { background:#12335d; }
.btn-save:disabled { opacity:.6; cursor:not-allowed; }
.spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.info-banner { background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:11px 16px; font-size:13px; color:#1d4ed8; margin-bottom:14px; }
.success-bar { background:#dcfce7; border:1px solid #bbf7d0; color:#15803d; border-radius:8px; padding:10px 16px; font-size:13px; margin-bottom:12px; }
.error-bar { background:#fee2e2; border:1px solid #fecaca; color:#dc2626; border-radius:8px; padding:10px 16px; font-size:13px; margin-bottom:12px; }
.table-card { background:#fff; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 1px 4px rgba(0,0,0,.05); overflow:hidden; }
.perm-table { width:100%; border-collapse:collapse; }
thead tr { background:#f8f9fa; border-bottom:2px solid #e2e8f0; }
thead th { padding:12px 10px; font-size:12px; font-weight:700; color:#374151; text-align:center; white-space:nowrap; }
.th-check { width:52px; }
.th-page  { text-align:left !important; padding-left:14px !important; min-width:220px; }
.th-perm  { width:100px; }
.th-quick { width:200px; }
.sub { font-size:10px; color:#94a3b8; font-weight:400; display:block; margin-top:2px; }
.section-row td { background:#f1f5f9; padding:7px 14px; font-size:11px; font-weight:700; color:#64748b; letter-spacing:.9px; text-transform:uppercase; border-top:1px solid #e2e8f0; }
.perm-row { border-bottom:1px solid #f1f5f9; transition:background .1s; }
.perm-row:hover { background:#fafafa; }
.perm-row.no-access { opacity:.55; }
.td-check { text-align:center; padding:10px; width:52px; }
.td-check input { width:17px; height:17px; accent-color:#3b82f6; cursor:pointer; }
.td-page { padding:12px 14px; display:flex; align-items:center; gap:12px; }
.td-page.muted strong { color:#94a3b8; }
.page-icon { font-size:18px; width:34px; height:34px; background:#f1f5f9; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.td-page strong { font-size:13.5px; color:#1e293b; }
.td-cb { text-align:center; padding:10px; width:100px; }
.cb { width:17px; height:17px; cursor:pointer; }
.cb.access { accent-color:#171a35; }
.cb.create { accent-color:#16a34a; }
.cb.edit   { accent-color:#d97706; }
.cb.delete { accent-color:#dc2626; }
.cb:disabled { cursor:not-allowed; opacity:.35; }
.td-quick { text-align:center; padding:8px; width:200px; }
.qb { border:none; border-radius:14px; padding:4px 14px; font-size:11.5px; font-weight:600; cursor:pointer; margin:0 2px; transition:all .12s; }
.qb.all  { background:#e8f8ef; color:#1a7a45; }
.qb.view { background:#fde8e8; color:#c0392b; }
.qb.none { background:#f1f3f5; color:#6b7280; }
.qb.all.active  { background:#bbf7d0; color:#14532d; font-weight:700; }
.qb.view.active { background:#fecaca; color:#991b1b; font-weight:700; }
.qb.none.active { background:#e2e8f0; color:#374151; font-weight:700; }
.qb:hover { filter:brightness(.93); }
tfoot tr { background:#f8f9fa; border-top:2px solid #e2e8f0; }
.footer-summary { padding:12px 14px; font-size:13px; color:#374151; }
.footer-bulk { padding:12px 14px; text-align:right; }
.bulk-btn { border:none; border-radius:6px; padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; margin-left:6px; }
.bulk-btn.all  { background:#dcfce7; color:#15803d; }
.bulk-btn.view { background:#dbeafe; color:#1d4ed8; }
.bulk-btn.none { background:#fee2e2; color:#dc2626; }
.bulk-btn:hover { filter:brightness(.95); }
.bottom-bar { margin-top:16px; display:flex; justify-content:flex-end; }
  `]
})
export class RolePermissionsComponent implements OnInit {
  roles = ROLES;
  pages = PAGES;
  sections = SECTIONS;
  selectedRole = 'SupportManager';
  perms: Record<string, { canAccess:boolean; canCreate:boolean; canEdit:boolean; canDelete:boolean }> = {};
  saving = false;
  successMsg = '';
  errorMsg = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadPerms(); }

  loadPerms() {
    this.successMsg = ''; this.errorMsg = '';
    this.perms = {};
    this.pages.forEach(p => this.perms[p.key] = { canAccess:false, canCreate:false, canEdit:false, canDelete:false });
    this.api.getRolePermissions(this.selectedRole).subscribe({
      next: (data: any[]) => {
        data.forEach((d: any) => {
          if (this.perms[d.pageKey] !== undefined) {
            this.perms[d.pageKey] = { canAccess: d.canAccess, canCreate: d.canCreate, canEdit: d.canEdit, canDelete: d.canDelete };
          }
        });
      },
      error: () => this.errorMsg = 'Failed to load permissions'
    });
  }

  get currentRoleLabel() { return this.roles.find(r => r.key === this.selectedRole)?.label ?? ''; }
  perm(key: string) { return this.perms[key] ?? { canAccess:false, canCreate:false, canEdit:false, canDelete:false }; }
  pagesBySection(s: string) { return this.pages.filter(p => p.section === s); }

  hasAnyAccess(key: string) {
    const p = this.perm(key);
    return p.canAccess || p.canCreate || p.canEdit || p.canDelete;
  }

  onAccessChange(key: string) {
    if (!this.perms[key].canAccess) {
      this.perms[key].canCreate = false;
      this.perms[key].canEdit   = false;
      this.perms[key].canDelete = false;
    }
  }

  onActionChange(key: string) {
    const p = this.perms[key];
    if (p.canCreate || p.canEdit || p.canDelete) p.canAccess = true;
  }

  toggleRowAny(key: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.setRow(key, checked ? 'view' : 'none');
  }

  setRow(key: string, mode: 'full'|'view'|'none') {
    const p = this.perms[key]; if (!p) return;
    if (mode === 'full') { p.canAccess=true;  p.canCreate=true;  p.canEdit=true;  p.canDelete=true; }
    if (mode === 'view') { p.canAccess=true;  p.canCreate=false; p.canEdit=false; p.canDelete=false; }
    if (mode === 'none') { p.canAccess=false; p.canCreate=false; p.canEdit=false; p.canDelete=false; }
  }

  setAll(mode: 'full'|'view'|'none') { this.pages.forEach(p => this.setRow(p.key, mode)); }

  toggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.setAll(checked ? 'full' : 'none');
  }

  isFullAccess(key: string) { const p = this.perm(key); return p.canAccess && p.canCreate && p.canEdit && p.canDelete; }
  isViewOnly(key: string)   { const p = this.perm(key); return p.canAccess && !p.canCreate && !p.canEdit && !p.canDelete; }
  isNoAccess(key: string)   { return !this.hasAnyAccess(key); }
  allChecked()              { return this.pages.every(p => this.isFullAccess(p.key)); }
  accessCount()             { return this.pages.filter(p => this.perm(p.key).canAccess).length; }

  save() {
    this.saving = true; this.successMsg = ''; this.errorMsg = '';
    const payload = this.pages.map(p => ({
      pageKey: p.key, pageLabel: p.label, pageIcon: p.icon, pageSection: p.section,
      ...this.perm(p.key)
    }));
    this.api.saveRolePermissions(this.selectedRole, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'Permissions saved for ' + this.currentRoleLabel + '. Changes take effect on next login.';
        setTimeout(() => this.successMsg = '', 5000);
      },
      error: (e: any) => { this.saving = false; this.errorMsg = e?.error?.message || 'Save failed'; }
    });
  }
}
