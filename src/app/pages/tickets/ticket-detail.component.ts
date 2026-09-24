import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TicketDetail, UserModel } from '../../models/models';

const TRANSITIONS: Record<string,string[]> = {
  'New':                  ['Under Review','Closed'],
  'Under Review':         ['Assigned','Closed'],
  'Assigned':             ['In Progress','Under Review'],
  'In Progress':          ['Waiting for Customer','Ready for QA','Resolved'],
  'Waiting for Customer': ['In Progress','Closed'],
  'Ready for QA':         ['Testing'],
  'Testing':              ['Resolved','In Progress'],
  'Resolved':             ['Closed','Reopened'],
  'Closed':               ['Reopened'],
  'Reopened':             ['In Progress','Assigned'],
};

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="page" *ngIf="ticket">
  <!-- Header -->
  <div class="ticket-header">
    <div class="header-left">
      <a routerLink="/tickets" class="back-link">← All Tickets</a>
      <h1>{{ ticket.ticketNo }}: {{ ticket.subject }}</h1>
      <div class="header-badges">
        <span class="badge badge-status">{{ ticket.status }}</span>
        <span class="badge" [ngClass]="'p-'+ticket.priority.toLowerCase()">{{ ticket.priority }}</span>
        <span class="badge badge-type">{{ ticket.type }}</span>
      </div>
    </div>
    <div class="header-actions" *ngIf="allowedNext.length > 0">
      <select [(ngModel)]="nextStatus" class="status-select">
        <option value="">Change Status…</option>
        <option *ngFor="let s of allowedNext" [value]="s">→ {{ s }}</option>
      </select>
      <button class="btn-primary" (click)="transition()" [disabled]="!nextStatus">Apply</button>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs">
    <button *ngFor="let t of tabs" [class.active]="activeTab===t" (click)="activeTab=t" class="tab-btn">{{ t }}</button>
  </div>

  <!-- Overview Tab -->
  <div *ngIf="activeTab==='Overview'" class="tab-content">
    <div class="two-col">
      <div class="main-col">
        <div class="section">
          <h3>Description</h3>
          <p class="pre-wrap">{{ ticket.description }}</p>
        </div>
        <div class="section" *ngIf="ticket.reproductionSteps">
          <h3>Reproduction Steps</h3>
          <p class="pre-wrap">{{ ticket.reproductionSteps }}</p>
        </div>
        <div class="form-row" *ngIf="ticket.expectedResult || ticket.actualResult">
          <div class="section">
            <h3>Expected Result</h3>
            <p class="pre-wrap">{{ ticket.expectedResult || '—' }}</p>
          </div>
          <div class="section">
            <h3>Actual Result</h3>
            <p class="pre-wrap">{{ ticket.actualResult || '—' }}</p>
          </div>
        </div>
      </div>
      <div class="side-col">
        <div class="meta-card">
          <div class="meta-row"><span>Customer</span><strong>{{ ticket.customerName }}</strong></div>
          <div class="meta-row"><span>Application</span><strong>{{ ticket.applicationName || '—' }}</strong></div>
          <div class="meta-row"><span>Assignee</span><strong>{{ ticket.assigneeName || 'Unassigned' }}</strong></div>
          <div class="meta-row"><span>Created by</span><strong>{{ ticket.creatorName }}</strong></div>
          <div class="meta-row"><span>SLA Due</span>
            <strong [class.overdue]="isOverdue(ticket.slaDueAt)">{{ ticket.slaDueAt | date:'dd MMM HH:mm' }}</strong>
          </div>
          <div class="meta-row"><span>Created</span><strong>{{ ticket.createdAt | date:'dd MMM yyyy' }}</strong></div>
        </div>
        <!-- Assign -->
        <div class="assign-box">
          <h4>Assign To</h4>
          <select [(ngModel)]="assigneeId" class="full-select">
            <option value="">Select user</option>
            <option *ngFor="let u of users" [value]="u.id">{{ u.name }} ({{ u.role }})</option>
          </select>
          <button class="btn-sm" (click)="assign()" [disabled]="!assigneeId">Assign</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Conversation Tab -->
  <div *ngIf="activeTab==='Conversation'" class="tab-content">
    <div class="comments">
      <div *ngFor="let c of ticket.comments" class="comment" [class.internal]="c.visibility==='internal'">
        <div class="comment-header">
          <strong>{{ c.authorName }}</strong>
          <span class="vis-badge" [class.int]="c.visibility==='internal'">{{ c.visibility }}</span>
          <span class="comment-date">{{ c.createdAt | date:'dd MMM HH:mm' }}</span>
        </div>
        <div class="comment-body">{{ c.body }}</div>
      </div>
      <div class="empty" *ngIf="ticket.comments.length===0">No comments yet.</div>
    </div>
    <div class="add-comment">
      <h4>Add Comment</h4>
      <select [(ngModel)]="commentVis" class="vis-select">
        <option value="customer">Customer Visible</option>
        <option value="internal">Internal Note</option>
      </select>
      <textarea [(ngModel)]="commentBody" rows="3" placeholder="Type your comment…"></textarea>
      <button class="btn-primary" (click)="addComment()" [disabled]="!commentBody">Post Comment</button>
    </div>
  </div>

  <!-- History Tab -->
  <div *ngIf="activeTab==='History'" class="tab-content">
    <div class="timeline">
      <div *ngFor="let h of ticket.history" class="timeline-item">
        <div class="tl-dot"></div>
        <div class="tl-body">
          <span class="tl-actor">{{ h.actorName }}</span>
          <span class="tl-action">{{ h.action }}</span>
          <span *ngIf="h.oldValue && h.newValue" class="tl-change">
            {{ h.oldValue }} → {{ h.newValue }}
          </span>
          <span *ngIf="h.note" class="tl-note">{{ h.note }}</span>
          <span class="tl-date">{{ h.createdAt | date:'dd MMM HH:mm' }}</span>
        </div>
      </div>
      <div class="empty" *ngIf="ticket.history.length===0">No history yet.</div>
    </div>
  </div>
</div>
<div class="loading" *ngIf="!ticket">Loading ticket…</div>
  `,
  styles: [`
.page { padding:24px 32px; max-width:1200px; margin:0 auto; }
.ticket-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
.header-left .back-link { color:#3b82f6; text-decoration:none; font-size:13px; display:block; margin-bottom:6px; }
h1 { font-size:20px; font-weight:700; color:#1e293b; margin:0 0 10px; }
.header-badges { display:flex; gap:8px; flex-wrap:wrap; }
.header-actions { display:flex; gap:8px; align-items:center; }
.status-select, .full-select, .vis-select { padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; }
.btn-primary { background:#3b82f6; color:#fff; padding:9px 16px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-sm { background:#3b82f6; color:#fff; padding:6px 14px; border:none; border-radius:6px; font-size:13px; cursor:pointer; margin-top:8px; width:100%; }
.badge { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.badge-status { background:#dbeafe; color:#1d4ed8; }
.badge-type   { background:#f0fdf4; color:#15803d; }
.p-critical   { background:#fee2e2; color:#dc2626; }
.p-high       { background:#fef3c7; color:#d97706; }
.p-medium     { background:#e0f2fe; color:#0369a1; }
.p-low        { background:#f1f5f9; color:#64748b; }
.tabs { display:flex; gap:0; border-bottom:2px solid #e2e8f0; margin-bottom:20px; }
.tab-btn { padding:10px 20px; background:none; border:none; border-bottom:2px solid transparent; font-size:14px; font-weight:500; color:#64748b; cursor:pointer; margin-bottom:-2px; }
.tab-btn.active { color:#3b82f6; border-bottom-color:#3b82f6; }
.tab-content { }
.two-col { display:grid; grid-template-columns:1fr 300px; gap:24px; }
.section { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:16px; }
.section h3 { font-size:14px; font-weight:600; color:#374151; margin:0 0 8px; }
.pre-wrap { white-space:pre-wrap; font-size:14px; color:#374151; margin:0; }
.meta-card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:16px; }
.meta-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f1f5f9; font-size:13px; }
.meta-row span { color:#64748b; }
.meta-row strong { color:#1e293b; }
.overdue { color:#dc2626 !important; }
.assign-box { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; }
.assign-box h4 { font-size:13px; font-weight:600; margin:0 0 8px; }
.full-select { width:100%; margin-bottom:8px; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.comments { margin-bottom:16px; }
.comment { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px; margin-bottom:10px; }
.comment.internal { background:#fef9f0; border-color:#fde68a; }
.comment-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:13px; }
.vis-badge { padding:2px 8px; border-radius:20px; font-size:11px; background:#dbeafe; color:#1d4ed8; }
.vis-badge.int { background:#fef3c7; color:#d97706; }
.comment-date { color:#94a3b8; margin-left:auto; }
.comment-body { font-size:14px; color:#374151; }
.add-comment { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; }
.add-comment h4 { margin:0 0 10px; font-size:14px; }
.add-comment textarea { width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; margin:8px 0; resize:vertical; }
.timeline { }
.timeline-item { display:flex; gap:12px; margin-bottom:12px; align-items:flex-start; }
.tl-dot { width:10px; height:10px; background:#3b82f6; border-radius:50%; margin-top:5px; flex-shrink:0; }
.tl-body { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; flex:1; font-size:13px; }
.tl-actor { font-weight:600; color:#1e293b; }
.tl-action { margin-left:6px; color:#64748b; }
.tl-change { margin-left:6px; background:#f1f5f9; padding:1px 6px; border-radius:4px; }
.tl-note { display:block; color:#374151; margin-top:4px; }
.tl-date { display:block; color:#94a3b8; font-size:12px; margin-top:4px; }
.empty { text-align:center; color:#94a3b8; padding:20px; }
.loading { padding:40px; text-align:center; color:#94a3b8; }
  `]
})
export class TicketDetailComponent implements OnInit {
  ticket?: TicketDetail;
  users: UserModel[] = [];
  tabs = ['Overview','Conversation','History'];
  activeTab = 'Overview';
  nextStatus = '';
  assigneeId: any = '';
  commentBody = '';
  commentVis  = 'customer';

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.loadTicket(id);
    this.api.getUsers().subscribe({ next: u => this.users = u, error: () => {} });
  }

  loadTicket(id: number) {
    this.api.getTicket(id).subscribe(t => { this.ticket = t; this.nextStatus = ''; });
  }

  get allowedNext(): string[] {
    if (!this.ticket) return [];
    return TRANSITIONS[this.ticket.status] ?? [];
  }

  transition() {
    if (!this.ticket || !this.nextStatus) return;
    this.api.transitionTicket(this.ticket.id, { newStatus: this.nextStatus }).subscribe(
      t => { this.ticket = t; this.nextStatus = ''; }
    );
  }

  assign() {
    if (!this.ticket || !this.assigneeId) return;
    this.api.assignTicket(this.ticket.id, { assigneeId: +this.assigneeId }).subscribe(
      t => { this.ticket = t; this.assigneeId = ''; }
    );
  }

  addComment() {
    if (!this.ticket || !this.commentBody) return;
    this.api.addComment(this.ticket.id, { body: this.commentBody, visibility: this.commentVis }).subscribe(
      () => { this.commentBody = ''; this.loadTicket(this.ticket!.id); }
    );
  }

  isOverdue(due?: string) { return due && new Date(due) < new Date(); }
}
