import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

const ICONS: Record<string, string> = {
  'Technology': '⚙️', 'Database': '🗄'
};

@Component({
  selector: 'app-technologies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>⚙️ Technology Master</h1>
      <p class="subtitle">Manage technologies and databases available in the system</p>
    </div>
    <button class="btn-primary" (click)="openNew()">+ Add Technology</button>
  </div>

  <!-- Stats -->
  <div class="stats-row">
    <div class="stat-card"><span class="si">⚙️</span><div><div class="sv">{{ techCount }}</div><div class="sl">Technologies</div></div></div>
    <div class="stat-card"><span class="si">🗄</span><div><div class="sv">{{ dbCount }}</div><div class="sl">Databases</div></div></div>
    <div class="stat-card"><span class="si">✅</span><div><div class="sv">{{ activeCount }}</div><div class="sl">Active</div></div></div>
    <div class="stat-card"><span class="si">🔴</span><div><div class="sv">{{ inactiveCount }}</div><div class="sl">Inactive</div></div></div>
  </div>

  <!-- Add / Edit Form -->
  <div class="form-card" *ngIf="showForm">
    <div class="form-header">
      <h3>{{ editing ? '✏ Edit Technology' : '➕ Add Technology' }}</h3>
      <button class="close-btn" (click)="cancel()">✕</button>
    </div>
    <div class="form-grid">
      <div class="field">
        <label>Name <span class="req">*</span></label>
        <input [(ngModel)]="form.name" placeholder="e.g. Angular, PostgreSQL" />
      </div>
      <div class="field">
        <label>Category <span class="req">*</span></label>
        <select [(ngModel)]="form.category">
          <option value="Technology">Technology Stack</option>
          <option value="Database">Database</option>
        </select>
      </div>
      <div class="field">
        <label>Icon (emoji)</label>
        <input [(ngModel)]="form.icon" placeholder="e.g. 🔷" maxlength="4" />
      </div>
      <div class="field" *ngIf="editing">
        <label>Status</label>
        <select [(ngModel)]="form.isActive">
          <option [ngValue]="true">Active</option>
          <option [ngValue]="false">Inactive</option>
        </select>
      </div>
    </div>
    <div class="error-msg" *ngIf="error">{{ error }}</div>
    <div class="form-actions">
      <button class="btn-ghost" (click)="cancel()">Cancel</button>
      <button class="btn-primary" (click)="save()" [disabled]="saving">
        {{ saving ? 'Saving…' : (editing ? 'Update' : 'Add Technology') }}
      </button>
    </div>
  </div>

  <!-- Filter + Search -->
  <div class="filter-bar">
    <input class="search-input" [(ngModel)]="search" (ngModelChange)="applyFilter()"
           placeholder="🔍 Search…" />
    <div class="cat-tabs">
      <button class="cat-tab" [class.active]="catFilter===''" (click)="catFilter=''; applyFilter()">All</button>
      <button class="cat-tab" [class.active]="catFilter==='Technology'" (click)="catFilter='Technology'; applyFilter()">⚙️ Technology</button>
      <button class="cat-tab" [class.active]="catFilter==='Database'" (click)="catFilter='Database'; applyFilter()">🗄 Database</button>
    </div>
    <label class="show-inactive">
      <input type="checkbox" [(ngModel)]="showInactive" (change)="applyFilter()" /> Show inactive
    </label>
    <span class="count-lbl">{{ filtered.length }} items</span>
  </div>

  <!-- Table -->
  <div class="table-card">
    <table>
      <thead>
        <tr><th>Icon</th><th>Name</th><th>Category</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <!-- Technology group -->
        <tr class="group-header" *ngIf="techFiltered.length">
          <td colspan="5">⚙️ TECHNOLOGY STACK ({{ techFiltered.length }})</td>
        </tr>
        <tr *ngFor="let t of techFiltered" [class.inactive-row]="!t.isActive">
          <td class="icon-col">{{ t.icon }}</td>
          <td><strong>{{ t.name }}</strong></td>
          <td><span class="cat-badge tech">Technology</span></td>
          <td><span class="status-pill" [class.active]="t.isActive" [class.inactive]="!t.isActive">
            {{ t.isActive ? 'Active' : 'Inactive' }}</span></td>
          <td class="actions-col">
            <button class="act-btn" (click)="openEdit(t)" title="Edit">✏</button>
            <button class="act-btn toggle" (click)="toggleStatus(t)"
                    [title]="t.isActive ? 'Deactivate' : 'Activate'">
              {{ t.isActive ? '🔴' : '✅' }}
            </button>
            <button class="act-btn del" (click)="remove(t)" title="Delete">🗑</button>
          </td>
        </tr>
        <!-- Database group -->
        <tr class="group-header" *ngIf="dbFiltered.length">
          <td colspan="5">🗄 DATABASES ({{ dbFiltered.length }})</td>
        </tr>
        <tr *ngFor="let t of dbFiltered" [class.inactive-row]="!t.isActive">
          <td class="icon-col">{{ t.icon }}</td>
          <td><strong>{{ t.name }}</strong></td>
          <td><span class="cat-badge db">Database</span></td>
          <td><span class="status-pill" [class.active]="t.isActive" [class.inactive]="!t.isActive">
            {{ t.isActive ? 'Active' : 'Inactive' }}</span></td>
          <td class="actions-col">
            <button class="act-btn" (click)="openEdit(t)" title="Edit">✏</button>
            <button class="act-btn toggle" (click)="toggleStatus(t)"
                    [title]="t.isActive ? 'Deactivate' : 'Activate'">
              {{ t.isActive ? '🔴' : '✅' }}
            </button>
            <button class="act-btn del" (click)="remove(t)" title="Delete">🗑</button>
          </td>
        </tr>
        <tr *ngIf="filtered.length === 0">
          <td colspan="5" class="empty-row">No technologies found</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:1100px; margin:0 auto; }
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
.form-card { background:#fff; border:1.5px solid #e2e8f0; border-radius:14px; padding:22px; margin-bottom:18px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.form-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
.form-header h3 { margin:0; font-size:16px; color:#1e293b; }
.close-btn { background:none; border:none; font-size:18px; cursor:pointer; color:#94a3b8; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
.field { display:flex; flex-direction:column; gap:5px; }
.field label { font-size:12px; font-weight:600; color:#374151; }
.req { color:#ef4444; }
.field input,.field select { padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; }
.field input:focus,.field select:focus { outline:none; border-color:#8392ab; }
.form-actions { display:flex; justify-content:flex-end; gap:8px; }
.error-msg { color:#ef4444; font-size:13px; margin-bottom:10px; background:#fff5f5; border:1px solid #fecaca; padding:8px 12px; border-radius:6px; }
.filter-bar { display:flex; gap:10px; margin-bottom:14px; align-items:center; flex-wrap:wrap; }
.search-input { padding:8px 14px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; min-width:200px; }
.cat-tabs { display:flex; gap:4px; }
.cat-tab { padding:7px 14px; border:1.5px solid #e2e8f0; border-radius:20px; background:#fff; font-size:12.5px; font-weight:600; color:#64748b; cursor:pointer; }
.cat-tab.active { background:#171a35; color:#fff; border-color:#171a35; }
.show-inactive { display:flex; align-items:center; gap:6px; font-size:13px; color:#64748b; cursor:pointer; }
.count-lbl { margin-left:auto; font-size:12px; color:#94a3b8; }
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; background:#fafafa; border-bottom:1px solid #f1f5f9; }
td { padding:11px 14px; border-bottom:1px solid #f8fafc; color:#374151; vertical-align:middle; }
.group-header td { background:#f1f5f9; font-size:11px; font-weight:700; color:#64748b; letter-spacing:.8px; padding:7px 14px; border-top:1px solid #e2e8f0; }
tr:hover td { background:#f8fafc; }
.group-header:hover td { background:#f1f5f9; }
.inactive-row td { opacity:.55; }
.icon-col { font-size:20px; width:50px; text-align:center; }
.cat-badge { padding:2px 10px; border-radius:12px; font-size:11px; font-weight:600; }
.cat-badge.tech { background:#ede9fe; color:#7c3aed; }
.cat-badge.db   { background:#dbeafe; color:#1d4ed8; }
.status-pill { padding:2px 9px; border-radius:20px; font-size:11px; font-weight:600; }
.status-pill.active { background:#dcfce7; color:#15803d; }
.status-pill.inactive { background:#fee2e2; color:#dc2626; }
.actions-col { white-space:nowrap; }
.act-btn { padding:5px 8px; border:1.5px solid #e2e8f0; background:#fff; border-radius:6px; cursor:pointer; font-size:13px; margin-right:4px; }
.act-btn:hover { background:#f8fafc; }
.act-btn.del:hover { border-color:#ef4444; background:#fee2e2; }
.empty-row { text-align:center; padding:36px; color:#94a3b8; }
  `]
})
export class TechnologiesComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  techFiltered: any[] = [];
  dbFiltered: any[] = [];
  search = '';
  catFilter = '';
  showInactive = false;
  showForm = false;
  editing = false;
  editId = 0;
  saving = false;
  error = '';
  form: any = this.emptyForm();

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.getTechnologies(true).subscribe({ next: d => { this.all = d; this.applyFilter(); }, error: () => {} });
  }

  emptyForm() { return { name: '', category: 'Technology', icon: '', isActive: true }; }

  applyFilter() {
    const q = this.search.toLowerCase();
    let list = this.all.filter(t =>
      (!q || t.name.toLowerCase().includes(q)) &&
      (!this.catFilter || t.category === this.catFilter) &&
      (this.showInactive || t.isActive)
    );
    this.filtered = list;
    this.techFiltered = list.filter(t => t.category === 'Technology');
    this.dbFiltered   = list.filter(t => t.category === 'Database');
  }

  get techCount()     { return this.all.filter(t => t.category === 'Technology' && t.isActive).length; }
  get dbCount()       { return this.all.filter(t => t.category === 'Database' && t.isActive).length; }
  get activeCount()   { return this.all.filter(t => t.isActive).length; }
  get inactiveCount() { return this.all.filter(t => !t.isActive).length; }

  openNew()  { this.form = this.emptyForm(); this.editing = false; this.error = ''; this.showForm = true; }
  cancel()   { this.showForm = false; this.error = ''; }

  openEdit(t: any) {
    this.form = { name: t.name, category: t.category, icon: t.icon, isActive: t.isActive };
    this.editing = true; this.editId = t.id; this.error = ''; this.showForm = true;
  }

  save() {
    if (!this.form.name?.trim()) { this.error = 'Name is required.'; return; }
    this.saving = true; this.error = '';
    const obs = this.editing
      ? this.api.updateTechnology(this.editId, this.form)
      : this.api.createTechnology(this.form);
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (e: any) => { this.saving = false; this.error = e?.error?.message || 'Save failed.'; }
    });
  }

  toggleStatus(t: any) {
    this.api.updateTechnology(t.id, { isActive: !t.isActive })
      .subscribe(() => { t.isActive = !t.isActive; this.applyFilter(); });
  }

  remove(t: any) {
    if (!confirm('Delete "' + t.name + '"?')) return;
    this.api.deleteTechnology(t.id).subscribe(() => { this.all = this.all.filter(x => x.id !== t.id); this.applyFilter(); });
  }
}
