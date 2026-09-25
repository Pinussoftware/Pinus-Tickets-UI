import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Customer, AppModel, PRIORITIES, TYPES } from '../../models/models';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <a routerLink="/tickets" class="back">← Back to Tickets</a>
      <h1>Create New Ticket</h1>
    </div>
    <div class="header-actions">
      <button class="btn-ghost" (click)="cancel()">Cancel</button>
      <button class="btn-primary" (click)="submit()" [disabled]="loading">
        <span *ngIf="loading" class="spinner"></span>
        {{ loading ? 'Creating…' : 'Create Ticket' }}
      </button>
    </div>
  </div>

  <div class="form-grid">
    <!-- Left main form -->
    <div class="form-main">

      <!-- Requester Section -->
      <div class="form-section">
        <div class="section-title">
          <span class="section-num">1</span> Requester & Scope
        </div>
        <div class="row-3">
          <div class="field">
            <label>Customer <span class="req">*</span></label>
            <select [(ngModel)]="form.customerId" name="customerId" required (change)="loadApps(); error=''"
                    [class.field-error]="error && !form.customerId">
              <option value="">— Select customer —</option>
              <option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</option>
            </select>
            <span class="field-err-msg" *ngIf="error && !form.customerId">{{ error }}</span>
          </div>
          <div class="field">
            <label>Application</label>
            <select [(ngModel)]="form.applicationId" name="applicationId" [disabled]="!form.customerId">
              <option value="">— None —</option>
              <option *ngFor="let a of apps" [value]="a.id">{{ a.name }}</option>
            </select>
          </div>
          <div class="field">
            <label>Environment</label>
            <select [(ngModel)]="form.environment" name="environment">
              <option value="">— Select —</option>
              <option>Production</option>
              <option>UAT</option>
              <option>Staging</option>
              <option>Development</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Classification -->
      <div class="form-section">
        <div class="section-title">
          <span class="section-num">2</span> Classification
        </div>
        <div class="row-4">
          <div class="field">
            <label>Type <span class="req">*</span></label>
            <select [(ngModel)]="form.type" name="type" required>
              <option *ngFor="let t of types" [value]="t">{{ t }}</option>
            </select>
          </div>
          <div class="field">
            <label>Priority <span class="req">*</span></label>
            <select [(ngModel)]="form.priority" name="priority" required>
              <option *ngFor="let p of priorities" [value]="p">
                {{ p === 'Critical' ? '🔴' : p === 'High' ? '🟠' : p === 'Medium' ? '🟡' : '⚪' }} {{ p }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Impact</label>
            <select [(ngModel)]="form.impact" name="impact">
              <option value="">— Select —</option>
              <option>Enterprise</option>
              <option>Department</option>
              <option>User</option>
            </select>
          </div>
          <div class="field">
            <label>Category</label>
            <input [(ngModel)]="form.category" name="category" placeholder="e.g. Authentication" />
          </div>
        </div>

        <!-- SLA preview -->
        <div class="sla-preview" *ngIf="form.priority">
          <span class="sla-icon">⏱</span>
          SLA Target:
          <strong>{{ slaLabel(form.priority) }}</strong> from ticket creation
        </div>
      </div>

      <!-- Subject & Description -->
      <div class="form-section">
        <div class="section-title">
          <span class="section-num">3</span> Issue Details
        </div>
        <div class="field">
          <label>Subject <span class="req">*</span></label>
          <input [(ngModel)]="form.subject" name="subject" required
                 placeholder="Brief, clear description of the issue" class="subj-input" />
        </div>
        <div class="field">
          <label>Description <span class="req">*</span></label>
          <textarea [(ngModel)]="form.description" name="description" required rows="5"
                    placeholder="Provide a detailed description of the issue…"></textarea>
        </div>
        <div class="row-2">
          <div class="field">
            <label>Reproduction Steps</label>
            <textarea [(ngModel)]="form.reproductionSteps" name="reproductionSteps" rows="4"
                      placeholder="1. Navigate to…&#10;2. Click on…&#10;3. Observe error"></textarea>
          </div>
          <div class="field-col">
            <div class="field">
              <label>Expected Result</label>
              <textarea [(ngModel)]="form.expectedResult" name="expectedResult" rows="2"
                        placeholder="What should have happened?"></textarea>
            </div>
            <div class="field">
              <label>Actual Result</label>
              <textarea [(ngModel)]="form.actualResult" name="actualResult" rows="2"
                        placeholder="What actually happened?"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 4: Attachments -->
      <div class="form-section">
        <div class="section-title">
          <span class="section-num">4</span> Attachments
          <span class="attach-hint">Paste screenshot (Ctrl+V) or drag & drop files here</span>
        </div>

        <!-- Drop zone -->
        <div class="drop-zone"
             [class.drag-over]="dragOver"
             (dragover)="$event.preventDefault(); dragOver=true"
             (dragleave)="dragOver=false"
             (drop)="onDrop($event)"
             (paste)="onPaste($event)"
             tabindex="0"
             (keydown.enter)="fileInput.click()">
          <div class="dz-inner">
            <span class="dz-icon">📎</span>
            <span class="dz-text">Drag & drop files or <a (click)="fileInput.click()" class="dz-link">browse</a></span>
            <span class="dz-sub">Paste a screenshot anywhere on the page with Ctrl+V · Max 20MB per file</span>
          </div>
          <input #fileInput type="file" multiple hidden
                 accept="image/*,.pdf,.docx,.xlsx,.zip,.txt,.log"
                 (change)="onFileSelect($event)" />
        </div>

        <!-- Pending attachments list -->
        <div class="attach-list" *ngIf="pendingFiles.length">
          <div *ngFor="let f of pendingFiles; let i=index" class="attach-row">
            <img *ngIf="f.preview" [src]="f.preview" class="attach-thumb" />
            <span *ngIf="!f.preview" class="attach-icon-file">📄</span>
            <div class="attach-meta">
              <div class="attach-name">{{ f.file.name }}</div>
              <div class="attach-size">{{ formatSize(f.file.size) }}</div>
            </div>
            <div class="attach-status">
              <span *ngIf="f.status==='pending'"  class="st-pending">⏳ Pending</span>
              <span *ngIf="f.status==='uploading'" class="st-uploading">⬆ Uploading…</span>
              <span *ngIf="f.status==='done'"     class="st-done">✅ Uploaded</span>
              <span *ngIf="f.status==='error'"    class="st-error">❌ Failed</span>
            </div>
            <button class="remove-att" (click)="removeFile(i)" *ngIf="f.status!=='done'">✕</button>
          </div>
        </div>
      </div>

    </div>

    <!-- Right sidebar -->
    <div class="form-side">
      <div class="side-card">
        <div class="side-title">📋 Summary</div>
        <div class="summary-row">
          <span>Customer</span>
          <strong>{{ selectedCustomerName || '—' }}</strong>
        </div>
        <div class="summary-row">
          <span>Type</span>
          <strong>{{ form.type }}</strong>
        </div>
        <div class="summary-row">
          <span>Priority</span>
          <span class="badge" [ngClass]="form.priority ? 'p-'+form.priority.toLowerCase() : ''">
            {{ form.priority || '—' }}
          </span>
        </div>
        <div class="summary-row">
          <span>Environment</span>
          <strong>{{ form.environment || '—' }}</strong>
        </div>
        <div class="summary-row">
          <span>SLA Due</span>
          <strong class="sla-val">{{ form.priority ? slaLabel(form.priority) : '—' }}</strong>
        </div>
      </div>

      <div class="side-card">
        <div class="side-title">⚠ Priority Guide</div>
        <div class="guide-item critical"><span class="g-dot"></span><div><strong>Critical</strong> — Production down, data loss</div></div>
        <div class="guide-item high"><span class="g-dot"></span><div><strong>High</strong> — Major function broken</div></div>
        <div class="guide-item medium"><span class="g-dot"></span><div><strong>Medium</strong> — Partial impact</div></div>
        <div class="guide-item low"><span class="g-dot"></span><div><strong>Low</strong> — Minor / cosmetic issue</div></div>
      </div>

      <div class="error-card" *ngIf="error">⚠ {{ error }}</div>
    </div>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:1300px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
.back { display:block; font-size:12px; color:#3b82f6; text-decoration:none; margin-bottom:4px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0; }
.header-actions { display:flex; gap:10px; align-items:center; }
.btn-primary { background:#171a35; color:#fff; padding:10px 22px; border:none;
  border-radius:8px; font-size:13.5px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; }
.btn-primary:hover:not(:disabled) { background:#12335d; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:#fff; border:1px solid #e2e8f0; color:#374151;
  padding:10px 18px; border-radius:8px; font-size:13.5px; cursor:pointer; }
.spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.form-grid { display:grid; grid-template-columns:1fr 280px; gap:18px; }
.form-main { display:flex; flex-direction:column; gap:14px; }
.form-section { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:20px; }
.section-title { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:700;
  color:#1e293b; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #f1f5f9; }
.section-num { width:24px; height:24px; background:#171a35; color:#fff; border-radius:50%;
  display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
.row-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.row-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.row-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.field-col { display:flex; flex-direction:column; gap:14px; }
.field { display:flex; flex-direction:column; }
.field label { font-size:12.5px; font-weight:600; color:#374151; margin-bottom:6px; }
.req { color:#ef4444; }
.field input, .field select, .field textarea {
  padding:9px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13.5px;
  font-family:inherit; color:#1e293b; background:#fff; resize:vertical; transition:border .2s; }
.field input:focus, .field select:focus, .field textarea:focus {
  outline:none; border-color:#8392ab; box-shadow:0 0 0 3px rgba(131,146,171,.12); }
.field-error { border-color:#ef4444 !important; }
.field-err-msg { color:#ef4444; font-size:11.5px; margin-top:4px; }
.subj-input { font-size:15px !important; font-weight:500 !important; }
.sla-preview { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px;
  padding:10px 14px; font-size:13px; color:#15803d; display:flex; align-items:center; gap:8px; margin-top:14px; }
.sla-icon { font-size:16px; }
.form-side { display:flex; flex-direction:column; gap:14px; }
.side-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:16px; }
.side-title { font-size:13px; font-weight:700; color:#1e293b; margin-bottom:12px;
  padding-bottom:10px; border-bottom:1px solid #f1f5f9; }
.summary-row { display:flex; justify-content:space-between; align-items:center;
  padding:6px 0; font-size:12.5px; border-bottom:1px solid #f8fafc; }
.summary-row span:first-child { color:#64748b; }
.summary-row strong { color:#1e293b; font-weight:600; }
.sla-val { color:#0369a1; }
.badge { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
.p-critical { background:#fee2e2; color:#dc2626; }
.p-high { background:#fef3c7; color:#d97706; }
.p-medium { background:#e0f2fe; color:#0369a1; }
.p-low { background:#f1f5f9; color:#64748b; }
.guide-item { display:flex; align-items:flex-start; gap:10px; padding:7px 0;
  font-size:12px; border-bottom:1px solid #f8fafc; }
.guide-item:last-child { border:none; }
.guide-item strong { display:block; font-weight:600; color:#1e293b; }
.g-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:2px; }
.guide-item.critical .g-dot { background:#ef4444; }
.guide-item.high .g-dot     { background:#f59e0b; }
.guide-item.medium .g-dot   { background:#3b82f6; }
.guide-item.low .g-dot      { background:#94a3b8; }
.error-card { background:#fee2e2; border:1px solid #fecaca; color:#dc2626;
  padding:12px; border-radius:8px; font-size:13px; }

/* Attachment section */
.attach-hint { font-size:11px; color:#94a3b8; font-weight:400; margin-left:8px; }
.drop-zone { border:2px dashed #e2e8f0; border-radius:10px; padding:28px 20px;
  text-align:center; cursor:pointer; transition:all .2s; background:#fafafa; }
.drop-zone:hover, .drop-zone.drag-over { border-color:#3b82f6; background:#eff6ff; }
.dz-inner { display:flex; flex-direction:column; align-items:center; gap:6px; pointer-events:none; }
.dz-icon { font-size:28px; }
.dz-text { font-size:14px; color:#374151; }
.dz-link { color:#3b82f6; cursor:pointer; text-decoration:underline; pointer-events:all; }
.dz-sub { font-size:11.5px; color:#94a3b8; }
.attach-list { margin-top:12px; display:flex; flex-direction:column; gap:8px; }
.attach-row { display:flex; align-items:center; gap:10px; padding:10px 12px;
  border:1px solid #e2e8f0; border-radius:8px; background:#fff; }
.attach-thumb { width:48px; height:36px; object-fit:cover; border-radius:4px; border:1px solid #e2e8f0; }
.attach-icon-file { font-size:28px; flex-shrink:0; }
.attach-meta { flex:1; min-width:0; }
.attach-name { font-size:13px; font-weight:500; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.attach-size { font-size:11px; color:#94a3b8; }
.attach-status { font-size:12px; white-space:nowrap; }
.st-pending   { color:#f59e0b; } .st-uploading { color:#3b82f6; }
.st-done      { color:#16a34a; } .st-error     { color:#dc2626; }
.remove-att { background:none; border:none; color:#94a3b8; font-size:16px; cursor:pointer; padding:2px 6px; border-radius:4px; }
.remove-att:hover { background:#fee2e2; color:#dc2626; }
@media(max-width:900px) {
  .form-grid { grid-template-columns:1fr; }
  .row-3,.row-4 { grid-template-columns:1fr 1fr; }
}
  `]
})
export class TicketCreateComponent implements OnInit {
  customers: any[] = [];
  apps: any[] = [];
  priorities = PRIORITIES;
  types = TYPES;
  loading = false;
  error = '';
  dragOver = false;
  pendingFiles: { file: File; preview: string | null; status: 'pending'|'uploading'|'done'|'error' }[] = [];

  form: any = { customerId:'', applicationId:'', environment:'', type:'Bug',
    priority:'Medium', impact:'', category:'', subject:'', description:'',
    reproductionSteps:'', expectedResult:'', actualResult:'' };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getCustomers().subscribe(c => this.customers = c);
    // Global paste listener for screenshots
    document.addEventListener('paste', this.handleGlobalPaste);
  }

  ngOnDestroy() {
    document.removeEventListener('paste', this.handleGlobalPaste);
  }

  private handleGlobalPaste = (e: ClipboardEvent) => { this.onPaste(e); };

  onPaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const named = new File([file], `screenshot-${Date.now()}.png`, { type: file.type });
          this.addFile(named);
        }
      }
    }
  }

  onDrop(e: DragEvent) {
    e.preventDefault(); this.dragOver = false;
    Array.from(e.dataTransfer?.files ?? []).forEach(f => this.addFile(f));
  }

  onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    Array.from(input.files ?? []).forEach(f => this.addFile(f));
    input.value = '';
  }

  addFile(file: File) {
    const entry: any = { file, preview: null, status: 'pending' };
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => entry.preview = ev.target?.result as string;
      reader.readAsDataURL(file);
    }
    this.pendingFiles.push(entry);
  }

  removeFile(i: number) { this.pendingFiles.splice(i, 1); }

  formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1024/1024).toFixed(1) + ' MB';
  }

  loadApps() {
    this.form.applicationId = '';
    if (this.form.customerId)
      this.api.getApplications(+this.form.customerId).subscribe(a => this.apps = a);
  }

  get selectedCustomerName() {
    return this.customers.find(c => c.id == this.form.customerId)?.name || '';
  }

  slaLabel(p: string) {
    return p==='Critical' ? '2 hours' : p==='High' ? '4 hours' : p==='Medium' ? '8 hours' : '24 hours';
  }

  submit() {
    if (!this.form.customerId || !this.form.subject?.trim() || !this.form.description?.trim()) {
      this.error = !this.form.customerId
        ? 'Please select a Customer.'
        : !this.form.subject?.trim() ? 'Subject is required.' : 'Description is required.';
      return;
    }
    this.loading = true; this.error = '';
    const payload = { ...this.form, customerId:+this.form.customerId,
      applicationId: this.form.applicationId ? +this.form.applicationId : null };
    this.api.createTicket(payload).subscribe({
      next: t => {
        // Upload attachments sequentially then navigate
        const pending = this.pendingFiles.filter(f => f.status === 'pending');
        if (!pending.length) { this.router.navigate(['/tickets', t.id]); return; }
        let done = 0;
        pending.forEach(entry => {
          entry.status = 'uploading';
          this.api.uploadAttachment(t.id, entry.file).subscribe({
            next: () => { entry.status = 'done'; if (++done === pending.length) this.router.navigate(['/tickets', t.id]); },
            error: () => { entry.status = 'error'; if (++done === pending.length) this.router.navigate(['/tickets', t.id]); }
          });
        });
      },
      error: () => { this.error = 'Failed to create ticket. Try again.'; this.loading = false; }
    });
  }
  cancel() { this.router.navigate(['/tickets']); }
}
