import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TicketListItem } from '../../models/models';

@Component({
  selector: 'app-qa-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>🔬 QA Testing Queue</h1>
      <p class="subtitle">Review and validate fixes before release</p>
    </div>
    <div class="header-stats">
      <div class="hstat"><span class="hstat-val">{{ qaTickets.length }}</span><span class="hstat-lbl">Awaiting QA</span></div>
      <div class="hstat testing"><span class="hstat-val">{{ testing.length }}</span><span class="hstat-lbl">In Testing</span></div>
    </div>
  </div>

  <div class="qa-grid">
    <div *ngFor="let t of qaTickets" class="qa-card" [class.testing-card]="t.status==='Testing'">
      <div class="qa-card-header">
        <span class="tno">{{ t.ticketNo }}</span>
        <span class="badge" [ngClass]="'p-'+t.priority.toLowerCase()">{{ t.priority }}</span>
        <span class="status-pill" [ngClass]="t.status==='Testing'?'s-testing':'s-qa'">{{ t.status }}</span>
      </div>
      <div class="qa-subj">{{ t.subject }}</div>
      <div class="qa-meta-row">
        <span class="qa-cust">🏢 {{ t.customerName }}</span>
        <span *ngIf="t.applicationName" class="qa-app">💻 {{ t.applicationName }}</span>
      </div>
      <div class="qa-sla" [class.overdue]="isOverdue(t.slaDueAt)">
        ⏱ SLA: {{ t.slaDueAt ? (t.slaDueAt | date:'dd MMM HH:mm') : '—' }}
      </div>
      <div class="qa-actions" *ngIf="activeQa === t.id; else collapsedTpl">
        <div class="qa-form">
          <div class="field">
            <label>Environment</label>
            <select [(ngModel)]="qaForm.environment">
              <option value="">Select</option>
              <option>Production</option><option>UAT</option><option>Staging</option>
            </select>
          </div>
          <div class="field">
            <label>Notes</label>
            <textarea [(ngModel)]="qaForm.notes" rows="2" placeholder="What was tested…"></textarea>
          </div>
          <div class="qa-result-btns">
            <button class="result-btn pass" (click)="submitResult(t.id,'Pass')">✅ Pass</button>
            <button class="result-btn fail" (click)="submitResult(t.id,'Fail')">❌ Fail</button>
            <button class="result-btn blocked" (click)="submitResult(t.id,'Blocked')">🚫 Blocked</button>
            <button class="result-btn cancel" (click)="activeQa=null">✕ Cancel</button>
          </div>
        </div>
      </div>
      <ng-template #collapsedTpl>
        <div class="qa-actions">
          <a [routerLink]="['/tickets',t.id]" class="start-btn">👁 View Details</a>
          <button class="start-btn test" (click)="startQa(t.id)">🔬 Start Testing</button>
        </div>
      </ng-template>
    </div>
    <div class="empty-qa" *ngIf="qaTickets.length===0">
      <span class="empty-icon">🔬</span>
      <p>No tickets awaiting QA at the moment.</p>
    </div>
  </div>

  <div class="table-card">
    <div class="table-header"><h3>Recent Test Results</h3></div>
    <table>
      <thead>
        <tr><th>Ticket #</th><th>Subject</th><th>Customer</th><th>Priority</th>
          <th>Result</th><th>Tester</th><th>Tested At</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let r of recentResults">
          <td><span class="tno">{{ r.ticketNo }}</span></td>
          <td class="subj">{{ r.subject }}</td>
          <td>{{ r.customer }}</td>
          <td><span class="badge" [ngClass]="'p-'+r.priority.toLowerCase()">{{ r.priority }}</span></td>
          <td><span class="result-badge" [ngClass]="'r-'+r.result.toLowerCase()">
            {{ r.result==='Pass'?'✅':r.result==='Fail'?'❌':'🚫' }} {{ r.result }}</span></td>
          <td>{{ r.tester }}</td>
          <td class="date">{{ r.testedAt | date:'dd MMM HH:mm' }}</td>
        </tr>
        <tr *ngIf="recentResults.length===0">
          <td colspan="7" class="empty">No test results yet.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:1400px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { margin:0; color:#64748b; font-size:13px; }
.header-stats { display:flex; gap:12px; }
.hstat { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 18px; text-align:center; }
.hstat.testing { border-color:#a855f7; background:#faf5ff; }
.hstat-val { display:block; font-size:22px; font-weight:700; color:#1e293b; }
.hstat-lbl { display:block; font-size:12px; color:#64748b; }
.qa-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; margin-bottom:18px; }
.qa-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:16px;
  box-shadow:0 1px 4px rgba(0,0,0,.05); display:flex; flex-direction:column; gap:10px; }
.qa-card.testing-card { border-left:4px solid #a855f7; }
.qa-card-header { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.tno { font-family:monospace; font-size:11.5px; color:#3b82f6; font-weight:700; background:#eff6ff; padding:2px 8px; border-radius:4px; }
.badge { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
.p-critical { background:#fee2e2; color:#dc2626; } .p-high { background:#fef3c7; color:#d97706; }
.p-medium { background:#e0f2fe; color:#0369a1; }   .p-low { background:#f1f5f9; color:#64748b; }
.status-pill { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
.s-qa { background:#ede9fe; color:#6d28d9; }  .s-testing { background:#d1fae5; color:#065f46; }
.qa-subj { font-size:14px; font-weight:600; color:#1e293b; }
.qa-meta-row { display:flex; gap:10px; }
.qa-cust,.qa-app { font-size:12px; color:#64748b; }
.qa-sla { font-size:12px; color:#64748b; } .qa-sla.overdue { color:#dc2626; font-weight:600; }
.qa-actions { display:flex; gap:8px; flex-wrap:wrap; }
.start-btn { padding:8px 14px; border-radius:8px; font-size:12.5px; cursor:pointer;
  border:1px solid #e2e8f0; background:#fafafa; color:#374151; font-weight:500; text-decoration:none; display:inline-flex; align-items:center; }
.start-btn:hover { border-color:#8392ab; }
.start-btn.test { background:#ede9fe; border-color:#a855f7; color:#6d28d9; }
.qa-form { width:100%; display:flex; flex-direction:column; gap:8px; }
.field { display:flex; flex-direction:column; }
.field label { font-size:11px; font-weight:600; color:#374151; margin-bottom:4px; }
.field select,.field textarea { padding:7px 10px; border:1px solid #e2e8f0; border-radius:6px; font-size:12.5px; resize:vertical; }
.qa-result-btns { display:flex; gap:6px; flex-wrap:wrap; }
.result-btn { padding:7px 13px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; border:none; }
.result-btn.pass    { background:#dcfce7; color:#15803d; }
.result-btn.fail    { background:#fee2e2; color:#dc2626; }
.result-btn.blocked { background:#fef3c7; color:#92400e; }
.result-btn.cancel  { background:#f1f5f9; color:#64748b; }
.empty-qa { grid-column:1/-1; text-align:center; background:#fff; border-radius:14px;
  border:1px dashed #e2e8f0; padding:48px; }
.empty-icon { font-size:40px; display:block; margin-bottom:8px; }
.empty-qa p { color:#94a3b8; margin:0; }
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; }
.table-header { padding:16px 18px; border-bottom:1px solid #f1f5f9; }
.table-header h3 { font-size:14px; font-weight:700; color:#1e293b; margin:0; }
table { width:100%; border-collapse:collapse; }
th { padding:10px 14px; font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; background:#fafafa; border-bottom:1px solid #e2e8f0; text-align:left; }
td { padding:11px 14px; font-size:13px; border-bottom:1px solid #f8fafc; color:#374151; }
.subj { max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.result-badge { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
.r-pass { background:#dcfce7; color:#15803d; } .r-fail { background:#fee2e2; color:#dc2626; }
.r-blocked { background:#fef3c7; color:#92400e; }
.date { font-size:12px; color:#94a3b8; }
.empty { text-align:center; padding:24px; color:#94a3b8; }
  `]
})
export class QaQueueComponent implements OnInit {
  qaTickets: TicketListItem[] = [];
  activeQa: number | null = null;
  qaForm = { environment: '', notes: '' };
  recentResults: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getTickets({ status: 'Ready for QA' }).subscribe(t => {
      this.api.getTickets({ status: 'Testing' }).subscribe(t2 => {
        this.qaTickets = [...t, ...t2];
      });
    });
  }

  get testing() { return this.qaTickets.filter(t => t.status === 'Testing'); }
  startQa(id: number) { this.activeQa = id; this.qaForm = { environment: '', notes: '' }; }

  submitResult(ticketId: number, result: string) {
    this.api.addTestResult(ticketId, { result, environment: this.qaForm.environment, notes: this.qaForm.notes })
      .subscribe(() => {
        const t = this.qaTickets.find(x => x.id === ticketId);
        if (t) this.recentResults.unshift({ ticketNo: t.ticketNo, subject: t.subject,
          customer: t.customerName, priority: t.priority, result, tester: 'Me', testedAt: new Date() });
        this.qaTickets = this.qaTickets.filter(x => x.id !== ticketId);
        this.activeQa = null;
      });
  }

  isOverdue(d?: string) { return d && new Date(d) < new Date(); }
}
