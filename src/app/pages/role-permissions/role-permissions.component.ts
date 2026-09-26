import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

const ROLES = [
  { key: 'SupportManager',   label: 'Support Manager',   color: '#7c3aed', bg: '#ede9fe' },
  { key: 'SupportExecutive', label: 'Support Executive',  color: '#0369a1', bg: '#e0f2fe' },
  { key: 'CustomerAdmin',    label: 'Customer Admin',     color: '#065f46', bg: '#d1fae5' },
  { key: 'CustomerUser',     label: 'Customer User',      color: '#92400e', bg: '#fef3c7' },
];

const PAGES = [
  { key:'dashboard',        label:'Dashboard',           icon:'📊', section:'Overview' },
  { key:'tickets',          label:'All Tickets',         icon:'🎫', section:'Tickets' },
  { key:'ticket_create',    label:'Create Ticket',       icon:'➕', section:'Tickets' },
  { key:'ticket_detail',    label:'Ticket Detail',       icon:'🔍', section:'Tickets' },
  { key:'workbench',        label:'My Workbench',        icon:'🛠', section:'Tickets' },
  { key:'qa_queue',         label:'QA Queue',            icon:'🔬', section:'Tickets' },
  { key:'assignment',       label:'Assignment',          icon:'🎯', section:'Management' },
  { key:'customers',        label:'Customers',           icon:'🏢', section:'Management' },
  { key:'applications',     label:'Applications',        icon:'💻', section:'Management' },
  { key:'contracts',        label:'Contracts & SLA',     icon:'📋', section:'Management' },
  { key:'reports',          label:'Reports & Analytics', icon:'📈', section:'Management' },
  { key:'notifications',    label:'Notifications',       icon:'🔔', section:'Management' },
  { key:'users',            label:'Users',               icon:'👥', section:'Administration' },
  { key:'role_permissions', label:'Role Permissions',    icon:'🔐', section:'Administration' },
];

const SECTIONS = [...new Set(PAGES.map(p => p.section))];

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>🔐 Role Permissions</h1>
      <p class="subtitle">Configure what each role can access, create, edit and delete</p>
    </div>
    <div class="header-right">
      <div class="role-tabs">
        <button *ngFor="let r of roles" class="role-tab"
                [class.active]="selectedRole===r.key"
                [style.border-color]="selectedRole===r.key ? r.color : ''"
                [style.color]="selectedRole===r.key ? r.color : ''"
                [style.background]="selectedRole===r.key ? r.bg : ''"
                (click)="selectRole(r.key)">
          {{ r.label }}
        </button>
      </div>
    </div>
  </div>

  <!-- Info banner -->
  <div class="info-banner">
    <span>🛡</span>
    <span><strong>Admin</strong> always has full access to everything and cannot be restricted.
    Configure permissions below for <strong>{{ currentRoleLabel }}</strong>.</span>
  </div>

  <!-- Success / Error -->
  <div class="success-bar" *ngIf="successMsg">✅ {{ successMsg }}</div>
  <div class="error-bar"   *ngIf="errorMsg">❌ {{ errorMsg }}</div>

  <!-- Table card -->
  <div class="table-card">
    <!-- Search + bulk controls -->
    <div class="table-toolbar">
      <input class="search-input" [(ngModel)]="search" placeholder="🔍 Search page / module…" />
      <div class="bulk-btns">
        <button class="bulk-btn green" (click)="setAll('full')">✅ Full Access All</button>
        <button class="bulk-btn blue"  (click)="setAll('view')">👁 View Only All</button>
        <button class="bulk-btn red"   (click)="setAll('none')">🚫 No Access All</button>
      </div>
    </div>

    <!-- Table header -->
    <div class="perm-header">
      <div class="col-check">
        <input type="checkbox" [checked]="allFullAccess()" (change)="toggleAll($event)"
               title="Toggle all full access" />
      </div>
      <div class="col-page">Page / Module</div>
      <div class="col-perm center">
        <div>Access</div><div class="sub">(can view)</div>
      </div>
      <div class="col-perm center">
        <div>Create</div><div class="sub">(+ button)</div>
      </div>
      <div class="col-perm center">
        <div>Edit</div><div class="sub">(edit button)</div>
      </div>
      <div class="col-perm center">
        <div>Delete</div><div class="sub">(delete button)</div>
      </div>
      <div class="col-quick center">Quick Set</div>
    </div>

    <!-- Section groups -->
    <ng-container *ngFor="let section of sections">
      <ng-container *ngIf="filteredPages(section).length">
        <!-- Section header -->
        <div class="section-row">{{ section }}</div>
        <!-- Page rows -->
        <div *ngFor="let p of filteredPages(section)" class="perm-row"
             [class.dimmed]="!perm(p.key).canAccess">
          <!-- Row checkbox = full access toggle -->
          <div class="col-check">
            <input type="checkbox"
                   [checked]="isFullAccess(p.key)"
                   (change)="toggleRowFull(p.key, $event)" />
          </div>
          <!-- Page info -->
          <div class="col-page">
            <div class="page-icon-wrap">{{ p.icon }}</div>
            <div>
              <div class="page-label">{{ p.label }}</div>
              <div class="page-section-tag">{{ p.section }}</div>
            </div>
          </div>
          <!-- Access -->
          <div class="col-perm center">
            <input type="checkbox" class="cb access"
                   [(ngModel)]="perm(p.key).canAccess"
                   (change)="onAccessChange(p.key)" />
          </div>
          <!-- Create -->
          <div class="col-perm center">
            <input type="checkbox" class="cb create"
                   [(ngModel)]="perm(p.key).canCreate"
                   [disabled]="!perm(p.key).canAccess"
                   (change)="onActionChange(p.key)" />
          </div>
          <!-- Edit -->
          <div class="col-perm center">
            <input type="checkbox" class="cb edit"
                   [(ngModel)]="perm(p.key).canEdit"
                   [disabled]="!perm(p.key).canAccess"
                   (change)="onActionChange(p.key)" />
          </div>
          <!-- Delete -->
          <div class="col-perm center">
            <input type="checkbox" class="cb delete"
                   [(ngModel)]="perm(p.key).canDelete"
                   [disabled]="!perm(p.key).canAccess"
                   (change)="onActionChange(p.key)" />
          </div>
          <!-- Quick set -->
          <div class="col-quick">
            <div class="quick-btns">
              <button class="qb all"  (click)="setRow(p.key,'full')"
                      [class.active]="isFullAccess(p.key)">All</button>
              <button class="qb view" (click)="setRow(p.key,'view')"
                      [class.active]="isViewOnly(p.key)">View</button>
              <button class="qb none" (click)="setRow(p.key,'none')"
                      [class.active]="isNoAccess(p.key)">None</button>
            </div>
          </div>
        </div>
      </ng-container>
    </ng-container>

    <!-- Footer summary + save -->
    <div class="table-footer">
      <span class="summary">
        Summary: <strong>{{ accessCount() }}</strong> of <strong>{{ pages.length }}</strong> pages accessible
      </span>
      <button class="btn-save" (click)="save()" [disabled]="saving">
        <span *ngIf="saving" class="spinner"></span>
        {{ saving ? 'Saving…' : '💾 Save Permissions' }}
      </button>
    </div>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:1300px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; flex-wrap:wrap; gap:12px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { font-size:13px; color:#64748b; margin:0; }
.header-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.role-tabs { display:flex; gap:6px; flex-wrap:wrap; }
.role-tab { padding:8px 16px; border:2px solid #e2e8f0; border-radius:20px; background:#fff;
  font-size:13px; font-weight:600; color:#64748b; cursor:pointer; transition:all .15s; }
.role-tab:hover { border-color:#8392ab; }
.role-tab.active { font-weight:700; }

.info-banner { display:flex; align-items:center; gap:10px; background:#eff6ff; border:1px solid #bfdbfe;
  border-radius:8px; padding:12px 16px; font-size:13px; color:#1d4ed8; margin-bottom:14px; }

.success-bar { background:#dcfce7; border:1px solid #bbf7d0; color:#15803d; border-radius:8px;
  padding:10px 16px; font-size:13px; margin-bottom:12px; }
.error-bar { background:#fee2e2; border:1px solid #fecaca; color:#dc2626; border-radius:8px;
  padding:10px 16px; font-size:13px; margin-bottom:12px; }

.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0;
  box-shadow:0 1px 4px rgba(0,0,0,.05); overflow:hidden; }

.table-toolbar { display:flex; justify-content:space-between; align-items:center;
  padding:14px 20px; border-bottom:1px solid #f1f5f9; gap:12px; flex-wrap:wrap; }
.search-input { padding:9px 14px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px;
  width:260px; outline:none; }
.search-input:focus { border-color:#8392ab; }
.bulk-btns { display:flex; gap:8px; }
.bulk-btn { border:none; border-radius:6px; padding:7px 14px; font-size:12px; font-weight:600; cursor:pointer; }
.bulk-btn.green { background:#dcfce7; color:#15803d; }
.bulk-btn.blue  { background:#dbeafe; color:#1d4ed8; }
.bulk-btn.red   { background:#fee2e2; color:#dc2626; }
.bulk-btn:hover { filter:brightness(.95); }

/* Grid columns: checkbox | page | access | create | edit | delete | quick */
.perm-header, .perm-row {
  display:grid;
  grid-template-columns: 52px 1fr 100px 100px 100px 100px 180px;
  align-items:center; gap:0;
}
.perm-header { background:#f8fafc; border-bottom:2px solid #e2e8f0;
  padding:10px 20px; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.5px; }
.sub { font-size:10px; color:#94a3b8; font-weight:400; text-transform:none; letter-spacing:0; margin-top:2px; }
.col-check { display:flex; justify-content:center; }
.col-check input { width:17px; height:17px; accent-color:#171a35; cursor:pointer; }
.col-page { display:flex; align-items:center; gap:12px; padding:12px 16px 12px 0; }
.col-perm { padding:12px 0; }
.col-quick { padding:12px 0 12px 8px; }
.center { text-align:center; }

.section-row { background:#f1f5f9; padding:8px 20px; font-size:11px; font-weight:700;
  color:#64748b; text-transform:uppercase; letter-spacing:.8px; border-bottom:1px solid #e2e8f0; }

.perm-row { padding:0 20px; border-bottom:1px solid #f8fafc; transition:background .1s; }
.perm-row:hover { background:#fafafa; }
.perm-row.dimmed { opacity:.55; }

.page-icon-wrap { width:38px; height:38px; background:#f1f5f9; border-radius:8px;
  display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.page-label { font-size:13.5px; font-weight:600; color:#1e293b; margin-bottom:2px; }
.page-section-tag { font-size:11px; color:#94a3b8; }

.cb { width:17px; height:17px; cursor:pointer; }
.cb.access { accent-color:#171a35; }
.cb.create { accent-color:#16a34a; }
.cb.edit   { accent-color:#d97706; }
.cb.delete { accent-color:#dc2626; }
.cb:disabled { cursor:not-allowed; opacity:.4; }

.quick-btns { display:flex; gap:5px; justify-content:center; }
.qb { border:none; border-radius:12px; padding:4px 12px; font-size:11px; font-weight:600; cursor:pointer; transition:all .15s; }
.qb.all  { background:#f0fdf4; color:#15803d; }
.qb.view { background:#eff6ff; color:#1d4ed8; }
.qb.none { background:#f8fafc; color:#64748b; }
.qb.all.active  { background:#dcfce7; color:#15803d; }
.qb.view.active { background:#dbeafe; color:#1d4ed8; }
.qb.none.active { background:#e2e8f0; color:#374151; }
.qb:hover { filter:brightness(.95); }

.table-footer { display:flex; justify-content:space-between; align-items:center;
  padding:14px 20px; background:#f8fafc; border-top:2px solid #e2e8f0; }
.summary { font-size:13px; color:#374151; }
.btn-save { background:#171a35; color:#fff; border:none; padding:11px 24px; border-radius:8px;
  font-size:13.5px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; }
.btn-save:hover:not(:disabled) { background:#12335d; }
.btn-save:disabled { opacity:.6; cursor:not-allowed; }
.spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class RolePermissionsComponent implements OnInit {
  roles = ROLES;
  pages = PAGES;
  sections = SECTIONS;
  selectedRole = 'SupportManager';
  perms: Record<string, { canAccess:boolean; canCreate:boolean; canEdit:boolean; canDelete:boolean }> = {};
  search = '';
  saving = false;
  successMsg = '';
  errorMsg = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.selectRole('SupportManager'); }

  selectRole(role: string) {
    this.selectedRole = role;
    this.successMsg = ''; this.errorMsg = '';
    // Init with all false
    this.perms = {};
    this.pages.forEach(p => this.perms[p.key] = { canAccess:false, canCreate:false, canEdit:false, canDelete:false });
    this.api.getRolePermissions(role).subscribe({
      next: (data: any[]) => {
        data.forEach((d: any) => {
          if (this.perms[d.pageKey]) {
            this.perms[d.pageKey] = { canAccess: d.canAccess, canCreate: d.canCreate, canEdit: d.canEdit, canDelete: d.canDelete };
          }
        });
      },
      error: () => this.errorMsg = 'Failed to load permissions'
    });
  }

  get currentRoleLabel() { return this.roles.find(r => r.key === this.selectedRole)?.label ?? ''; }

  perm(key: string) { return this.perms[key] ?? { canAccess:false, canCreate:false, canEdit:false, canDelete:false }; }

  filteredPages(section: string) {
    const q = this.search.toLowerCase();
    return this.pages.filter(p => p.section === section &&
      (!q || p.label.toLowerCase().includes(q) || p.key.includes(q)));
  }

  onAccessChange(key: string) {
    if (!this.perms[key].canAccess) {
      this.perms[key].canCreate = false;
      this.perms[key].canEdit   = false;
      this.perms[key].canDelete = false;
    }
  }

  onActionChange(key: string) {
    // If any action is ticked, ensure access is on
    const p = this.perms[key];
    if (p.canCreate || p.canEdit || p.canDelete) p.canAccess = true;
  }

  setRow(key: string, mode: 'full'|'view'|'none') {
    const p = this.perms[key];
    if (mode === 'full')  { p.canAccess=true;  p.canCreate=true;  p.canEdit=true;  p.canDelete=true; }
    if (mode === 'view')  { p.canAccess=true;  p.canCreate=false; p.canEdit=false; p.canDelete=false; }
    if (mode === 'none')  { p.canAccess=false; p.canCreate=false; p.canEdit=false; p.canDelete=false; }
  }

  setAll(mode: 'full'|'view'|'none') { this.pages.forEach(p => this.setRow(p.key, mode)); }

  toggleRowFull(key: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.setRow(key, checked ? 'full' : 'none');
  }

  toggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.setAll(checked ? 'full' : 'none');
  }

  isFullAccess(key: string) { const p = this.perm(key); return p.canAccess && p.canCreate && p.canEdit && p.canDelete; }
  isViewOnly(key: string)   { const p = this.perm(key); return p.canAccess && !p.canCreate && !p.canEdit && !p.canDelete; }
  isNoAccess(key: string)   { const p = this.perm(key); return !p.canAccess && !p.canCreate && !p.canEdit && !p.canDelete; }
  allFullAccess()           { return this.pages.every(p => this.isFullAccess(p.key)); }
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
