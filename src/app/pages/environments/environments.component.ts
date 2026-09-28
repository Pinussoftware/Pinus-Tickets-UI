import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-environments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>🌐 Environment Master</h1>
      <p class="subtitle">Define deployment environments used across all applications</p>
    </div>
    <button class="btn-primary" (click)="openNew()">+ Add Environment</button>
  </div>

  <!-- Stats -->
  <div class="stats-row">
    <div class="stat-card"><span class="si">🌐</span><div><div class="sv">{{ all.length }}</div><div class="sl">Total</div></div></div>
    <div class="stat-card"><span class="si">✅</span><div><div class="sv">{{ activeCount }}</div><div class="sl">Active</div></div></div>
    <div class="stat-card"><span class="si">🔴</span><div><div class="sv">{{ inactiveCount }}</div><div class="sl">Inactive</div></div></div>
  </div>

  <!-- Form -->
  <div class="form-card" *ngIf="showForm">
    <div class="form-header">
      <h3>{{ editing ? '✏ Edit Environment' : '➕ Add Environment' }}</h3>
      <button class="close-btn" (click)="cancel()">✕</button>
    </div>
    <div class="form-grid">
      <div class="field">
        <label>Name <span class="req">*</span></label>
        <input [(ngModel)]="form.name" placeholder="e.g. Production, UAT, Staging" />
      </div>
      <div class="field">
        <label>Icon (emoji)</label>
        <input [(ngModel)]="form.icon" placeholder="e.g. 🟢" maxlength="4" />
      </div>
      <div class="field full">
        <label>Description</label>
        <input [(ngModel)]="form.description" placeholder="Brief description of this environment" />
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
        {{ saving ? 'Saving…' : (editing ? 'Update' : 'Add Environment') }}
      </button>
    </div>
  </div>

  <!-- Filter -->
  <div class="filter-bar">
    <input class="search-input" [(ngModel)]="search" (ngModelChange)="applyFilter()" placeholder="🔍 Search…" />
    <label class="show-inactive">
      <input type="checkbox" [(ngModel)]="showInactive" (change)="applyFilter()" /> Show inactive
    </label>
    <span class="count-lbl">{{ filtered.length }} environments</span>
  </div>

  <!-- Table -->
  <div class="table-card">
    <table>
      <thead>
        <tr><th>Icon</th><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let e of filtered" [class.inactive-row]="!e.isActive">
          <td class="icon-col">{{ e.icon }}</td>
          <td><strong>{{ e.name }}</strong></td>
          <td class="desc-col">{{ e.description || '—' }}</td>
          <td><span class="status-pill" [class.active]="e.isActive" [class.inactive]="!e.isActive">
            {{ e.isActive ? 'Active' : 'Inactive' }}</span></td>
          <td class="actions-col">
            <button class="act-btn" (click)="openEdit(e)" title="Edit">✏</button>
            <button class="act-btn" (click)="toggleStatus(e)"
                    [title]="e.isActive ? 'Deactivate' : 'Activate'">
              {{ e.isActive ? '🔴' : '✅' }}
            </button>
            <button class="act-btn del" (click)="remove(e)" title="Delete">🗑</button>
          </td>
        </tr>
        <tr *ngIf="filtered.length === 0">
          <td colspan="5" class="empty-row">No environments found</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:900px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { margin:0; color:#64748b; font-size:13px; }
.btn-primary { background:#171a35; color:#fff; padding:10px 20px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
.btn-primary:hover:not(:disabled) { background:#12335d; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:#fff; border:1.5px solid #e2e8f0; color:#374151; padding:9px 16px; border-radius:8px; font-size:13px; cursor:pointer; }
.stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:18px; }
.stat-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; display:flex; align-items:center; gap:12px; }
.si { font-size:26px; } .sv { font-size:24px; font-weight:800; color:#1e293b; } .sl { font-size:12px; color:#64748b; margin-top:2px; }
.form-card { background:#fff; border:1.5px solid #e2e8f0; border-radius:14px; padding:22px; margin-bottom:18px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.form-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
.form-header h3 { margin:0; font-size:16px; color:#1e293b; }
.close-btn { background:none; border:none; font-size:18px; cursor:pointer; color:#94a3b8; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
.field { display:flex; flex-direction:column; gap:5px; }
.field.full { grid-column:1/-1; }
.field label { font-size:12px; font-weight:600; color:#374151; }
.req { color:#ef4444; }
.field input,.field select { padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; }
.field input:focus,.field select:focus { outline:none; border-color:#8392ab; }
.form-actions { display:flex; justify-content:flex-end; gap:8px; }
.error-msg { color:#ef4444; font-size:13px; margin-bottom:10px; background:#fff5f5; border:1px solid #fecaca; padding:8px 12px; border-radius:6px; }
.filter-bar { display:flex; gap:10px; margin-bottom:14px; align-items:center; flex-wrap:wrap; }
.search-input { padding:8px 14px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; min-width:200px; }
.show-inactive { display:flex; align-items:center; gap:6px; font-size:13px; color:#64748b; cursor:pointer; }
.count-lbl { margin-left:auto; font-size:12px; color:#94a3b8; }
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; background:#fafafa; border-bottom:1px solid #f1f5f9; }
td { padding:12px 14px; border-bottom:1px solid #f8fafc; color:#374151; vertical-align:middle; }
tr:hover td { background:#f8fafc; }
.inactive-row td { opacity:.55; }
.icon-col { font-size:22px; width:55px; text-align:center; }
.desc-col { color:#64748b; font-size:12.5px; }
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
export class EnvironmentsComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  search = '';
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
    this.api.getEnvironments(true).subscribe({ next: d => { this.all = d; this.applyFilter(); }, error: () => {} });
  }

  emptyForm() { return { name: '', description: '', icon: '', isActive: true }; }

  applyFilter() {
    const q = this.search.toLowerCase();
    this.filtered = this.all.filter(e =>
      (!q || e.name.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q)) &&
      (this.showInactive || e.isActive)
    );
  }

  get activeCount()   { return this.all.filter(e => e.isActive).length; }
  get inactiveCount() { return this.all.filter(e => !e.isActive).length; }

  openNew()  { this.form = this.emptyForm(); this.editing = false; this.error = ''; this.showForm = true; }
  cancel()   { this.showForm = false; this.error = ''; }

  openEdit(e: any) {
    this.form = { name: e.name, description: e.description || '', icon: e.icon, isActive: e.isActive };
    this.editing = true; this.editId = e.id; this.error = ''; this.showForm = true;
  }

  save() {
    if (!this.form.name?.trim()) { this.error = 'Name is required.'; return; }
    this.saving = true; this.error = '';
    const obs = this.editing
      ? this.api.updateEnvironment(this.editId, this.form)
      : this.api.createEnvironment(this.form);
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (e: any) => { this.saving = false; this.error = e?.error?.message || 'Save failed.'; }
    });
  }

  toggleStatus(e: any) {
    this.api.updateEnvironment(e.id, { isActive: !e.isActive })
      .subscribe(() => { e.isActive = !e.isActive; this.applyFilter(); });
  }

  remove(e: any) {
    if (!confirm('Delete "' + e.name + '"?')) return;
    this.api.deleteEnvironment(e.id).subscribe(() => { this.all = this.all.filter(x => x.id !== e.id); this.applyFilter(); });
  }
}
