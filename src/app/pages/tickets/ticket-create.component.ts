import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Customer, AppModel, PRIORITIES, TYPES } from '../../models/models';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <h1>Create Ticket</h1>
  </div>
  <div class="form-card">
    <form (ngSubmit)="submit()" class="form">
      <div class="form-row">
        <div class="field">
          <label>Customer *</label>
          <select [(ngModel)]="form.customerId" name="customerId" required (change)="loadApps()">
            <option value="">Select customer</option>
            <option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="field">
          <label>Application</label>
          <select [(ngModel)]="form.applicationId" name="applicationId">
            <option value="">None</option>
            <option *ngFor="let a of apps" [value]="a.id">{{ a.name }}</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Subject *</label>
        <input [(ngModel)]="form.subject" name="subject" required placeholder="Brief description of the issue" />
      </div>
      <div class="form-row">
        <div class="field">
          <label>Type *</label>
          <select [(ngModel)]="form.type" name="type" required>
            <option *ngFor="let t of types" [value]="t">{{ t }}</option>
          </select>
        </div>
        <div class="field">
          <label>Priority *</label>
          <select [(ngModel)]="form.priority" name="priority" required>
            <option *ngFor="let p of priorities" [value]="p">{{ p }}</option>
          </select>
        </div>
        <div class="field">
          <label>Category</label>
          <input [(ngModel)]="form.category" name="category" placeholder="e.g. Authentication" />
        </div>
      </div>
      <div class="field">
        <label>Description *</label>
        <textarea [(ngModel)]="form.description" name="description" rows="4" required
                  placeholder="Detailed description of the issue…"></textarea>
      </div>
      <div class="field">
        <label>Reproduction Steps</label>
        <textarea [(ngModel)]="form.reproductionSteps" name="reproductionSteps" rows="3"
                  placeholder="1. Go to…&#10;2. Click on…&#10;3. See error"></textarea>
      </div>
      <div class="form-row">
        <div class="field">
          <label>Expected Result</label>
          <textarea [(ngModel)]="form.expectedResult" name="expectedResult" rows="2"></textarea>
        </div>
        <div class="field">
          <label>Actual Result</label>
          <textarea [(ngModel)]="form.actualResult" name="actualResult" rows="2"></textarea>
        </div>
      </div>
      <div class="error-msg" *ngIf="error">{{ error }}</div>
      <div class="form-actions">
        <button type="button" class="btn-ghost" (click)="cancel()">Cancel</button>
        <button type="submit" class="btn-primary" [disabled]="loading">
          {{ loading ? 'Creating…' : 'Create Ticket' }}
        </button>
      </div>
    </form>
  </div>
</div>
  `,
  styles: [`
.page { padding:28px 32px; max-width:900px; margin:0 auto; }
.page-header { margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0; }
.form-card { background:#fff; border-radius:12px; border:1px solid #e2e8f0; padding:28px; }
.form-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; }
.field { display:flex; flex-direction:column; margin-bottom:16px; }
.field label { font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
.field input, .field select, .field textarea {
  padding:9px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; resize:vertical; }
.field input:focus, .field select:focus, .field textarea:focus {
  outline:none; border-color:#3b82f6; }
.form-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:8px; }
.btn-primary { background:#3b82f6; color:#fff; padding:10px 24px; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
.btn-primary:hover:not(:disabled) { background:#2563eb; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost { background:transparent; border:1px solid #e2e8f0; color:#374151; padding:10px 20px; border-radius:8px; font-size:14px; cursor:pointer; }
.error-msg { color:#ef4444; font-size:13px; margin-bottom:12px; }
  `]
})
export class TicketCreateComponent implements OnInit {
  customers: Customer[] = [];
  apps: AppModel[] = [];
  priorities = PRIORITIES;
  types = TYPES;
  loading = false;
  error = '';

  form: any = {
    customerId: '', applicationId: '', type: 'Bug', priority: 'Medium',
    category: '', subject: '', description: '',
    reproductionSteps: '', expectedResult: '', actualResult: ''
  };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getCustomers().subscribe(c => this.customers = c);
  }

  loadApps() {
    if (this.form.customerId) {
      this.api.getApplications(+this.form.customerId).subscribe(a => this.apps = a);
    }
  }

  submit() {
    this.loading = true; this.error = '';
    const payload = {
      ...this.form,
      customerId:    +this.form.customerId,
      applicationId: this.form.applicationId ? +this.form.applicationId : null,
    };
    this.api.createTicket(payload).subscribe({
      next: t => this.router.navigate(['/tickets', t.id]),
      error: () => { this.error = 'Failed to create ticket'; this.loading = false; }
    });
  }

  cancel() { this.router.navigate(['/tickets']); }
}
