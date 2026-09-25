import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>🎯 Ticket Assignment</h1>
      <p class="subtitle">Assign unassigned tickets to support engineers and track their workload</p>
    </div>
    <div class="header-right">
      <div class="unassigned-count" [class.red]="queue.length > 0">
        <span>{{ queue.length }}</span> Unassigned Tickets
      </div>
    </div>
  </div>

  <div class="main-grid">

    <!-- ── Left: Unassigned Queue ── -->
    <div class="queue-panel">
      <div class="panel-header">
        <h3>📥 Unassigned Queue</h3>
        <div class="queue-filters">
          <select [(ngModel)]="filterPriority" (change)="applyFilter()" class="mini-select">
            <option value="">All Priority</option>
            <option>Critical</option><option>High</option>
            <option>Medium</option><option>Low</option>
          </select>
          <input [(ngModel)]="searchQueue" (ngModelChange)="applyFilter()"
                 class="mini-search" placeholder="🔍 Search…" />
        </div>
      </div>
      <div class="queue-list">
        <div *ngFor="let t of filteredQueue" class="queue-card"
             [class.selected]="selected?.id === t.id"
             [class.critical]="t.priority==='Critical'"
             [class.high]="t.priority==='High'"
             (click)="select(t)">
          <div class="qc-top">
            <span class="tno">{{ t.ticketNo }}</span>
            <span class="badge" [ngClass]="'p-'+t.priority.toLowerCase()">{{ t.priority }}</span>
          </div>
          <div class="qc-subject">{{ t.subject }}</div>
          <div class="qc-meta">
            <span class="qc-cust">🏢 {{ t.customerName }}</span>
            <span *ngIf="t.applicationName" class="qc-app">· {{ t.applicationName }}</span>
          </div>
          <div class="qc-footer">
            <span class="qc-type">{{ t.type }}</span>
            <span class="qc-sla" [class.overdue]="isOverdue(t.slaDueAt)">
              ⏱ {{ t.slaDueAt ? (t.slaDueAt | date:'dd MMM HH:mm') : 'No SLA' }}
            </span>
            <span class="qc-age">{{ age(t.createdAt) }}</span>
          </div>
        </div>
        <div class="empty-queue" *ngIf="filteredQueue.length===0">
          <span>🎉</span>
          <p>{{ queue.length ? 'No matches' : 'All tickets are assigned!' }}</p>
        </div>
      </div>
    </div>

    <!-- ── Right: Assignment Panel ── -->
    <div class="assign-panel">

      <!-- Ticket detail card -->
      <div class="ticket-detail-card" *ngIf="selected; else noSelection">
        <div class="tdc-header">
          <span class="tno-lg">{{ selected.ticketNo }}</span>
          <span class="badge" [ngClass]="'p-'+selected.priority.toLowerCase()">{{ selected.priority }}</span>
          <span class="type-badge">{{ selected.type }}</span>
        </div>
        <div class="tdc-subject">{{ selected.subject }}</div>
        <div class="tdc-meta-grid">
          <div class="tdc-meta-item"><span>Customer</span><strong>{{ selected.customerName }}</strong></div>
          <div class="tdc-meta-item"><span>Application</span><strong>{{ selected.applicationName || '—' }}</strong></div>
          <div class="tdc-meta-item"><span>Status</span><strong>{{ selected.status }}</strong></div>
          <div class="tdc-meta-item" [class.overdue]="isOverdue(selected.slaDueAt)">
            <span>SLA Due</span><strong>{{ selected.slaDueAt ? (selected.slaDueAt | date:'dd MMM yyyy HH:mm') : '—' }}</strong>
          </div>
          <div class="tdc-meta-item"><span>Raised</span><strong>{{ selected.createdAt | date:'dd MMM yyyy' }}</strong></div>
        </div>

        <!-- Engineer source tabs -->
        <div class="eng-tabs">
          <button class="eng-tab" [class.active]="engineerTab==='system'" (click)="engineerTab='system'">
            🖥 System Users
          </button>
          <button class="eng-tab" [class.active]="engineerTab==='hrms'" (click)="engineerTab='hrms'; loadHrms()">
            👔 HRMS Employees
          </button>
        </div>

        <div class="assign-form">
          <!-- System users tab -->
          <div *ngIf="engineerTab==='system'">
            <label class="assign-label">Assign to Engineer</label>
            <div class="engineer-list">
              <div *ngFor="let e of engineers" class="engineer-row"
                   [class.selected]="selectedEngineer?.id === e.id"
                   (click)="selectEngineer(e)">
                <div class="eng-av">{{ e.name[0] }}</div>
                <div class="eng-info">
                  <div class="eng-name">{{ e.name }}</div>
                  <div class="eng-role">{{ e.role }}</div>
                </div>
                <div class="eng-workload">
                  <div class="wl-bar-wrap">
                    <div class="wl-bar" [style.width]="workloadPct(e)+'%'"
                         [style.background]="workloadColor(e)"></div>
                  </div>
                  <div class="wl-counts">
                    <span class="wl-num">{{ e.openCount }} open</span>
                    <span *ngIf="e.criticalCount>0" class="wl-crit">🔴{{e.criticalCount}}</span>
                  </div>
                </div>
              </div>
              <div class="no-eng" *ngIf="engineers.length===0">No engineers in system</div>
            </div>
          </div>

          <!-- HRMS employees tab -->
          <div *ngIf="engineerTab==='hrms'">
            <div class="hrms-header-row">
              <label class="assign-label">Select from HRMS Employees</label>
              <div class="hrms-actions">
                <button class="sync-btn" (click)="syncHrms()" [disabled]="syncing">
                  <span *ngIf="syncing" class="spinner-sm"></span>
                  {{ syncing ? 'Syncing…' : '🔄 Sync to System' }}
                </button>
              </div>
            </div>
            <div class="sync-result" *ngIf="syncResult">{{ syncResult }}</div>

            <div class="hrms-loading" *ngIf="hrmsLoading">Loading HRMS employees…</div>
            <div class="hrms-error" *ngIf="hrmsError">{{ hrmsError }}</div>

            <div class="hrms-emp-list" *ngIf="!hrmsLoading">
              <div *ngFor="let emp of hrmsEmployees" class="hrms-emp-card"
                   [class.selected]="selectedHrmsEmp?.id === emp.id"
                   (click)="selectHrmsEmp(emp)">
                <div class="hrms-av">{{ emp.fullName[0] }}</div>
                <div class="hrms-emp-info">
                  <div class="hrms-emp-name">
                    {{ emp.fullName }}
                    <span class="emp-code">{{ emp.employeeCode }}</span>
                  </div>
                  <div class="hrms-emp-meta">
                    <span>{{ emp.designation || '—' }}</span>
                    <span class="sep">·</span>
                    <span>{{ emp.department || '—' }}</span>
                    <span class="sep">·</span>
                    <span>{{ emp.workLocation || '—' }}</span>
                  </div>
                  <div class="hrms-emp-contact">
                    <span>📧 {{ emp.email }}</span>
                    <span *ngIf="emp.phone" class="sep">·</span>
                    <span *ngIf="emp.phone">📞 {{ emp.phone }}</span>
                  </div>
                  <div class="hrms-emp-badges">
                    <span class="emp-status" [class.active]="emp.status==='Active'">{{ emp.status }}</span>
                    <span class="emp-type">{{ emp.employmentType }}</span>
                    <span class="joining">Joined: {{ emp.joiningDate | date:'dd MMM yyyy' }}</span>
                  </div>
                </div>
              </div>
              <div class="no-eng" *ngIf="hrmsEmployees.length===0 && !hrmsLoading && !hrmsError">
                No active employees found in HRMS
              </div>
            </div>

            <!-- Selected HRMS employee preview -->
            <div class="hrms-sel-preview" *ngIf="selectedHrmsEmp">
              <div class="hsp-title">Selected:</div>
              <div class="hsp-body">
                <strong>{{ selectedHrmsEmp.fullName }}</strong> ({{ selectedHrmsEmp.employeeCode }})
                — {{ selectedHrmsEmp.designation }}
              </div>
              <div class="hsp-note">
                <span *ngIf="hrmsEmpInSystem(selectedHrmsEmp)">✅ Already in system — will assign directly</span>
                <span *ngIf="!hrmsEmpInSystem(selectedHrmsEmp)">⚠ Not in system yet — click "Sync to System" first, then assign</span>
              </div>
            </div>
          </div>

          <!-- Assignment note + options (shared) -->
          <div class="assign-note-wrap">
            <label class="assign-label">Assignment Note (optional)</label>
            <textarea [(ngModel)]="assignNote" rows="2"
                      placeholder="e.g. Please check the DB logs first…" class="assign-note"></textarea>
          </div>

          <div class="assign-email-opts">
            <label class="checkbox-row">
              <input type="checkbox" [(ngModel)]="notifyEngineer" />
              <span>📧 Email assigned engineer</span>
            </label>
            <label class="checkbox-row">
              <input type="checkbox" [(ngModel)]="notifyCustomer" />
              <span>📧 Notify customer</span>
            </label>
          </div>

          <button class="btn-assign" [disabled]="!assignTarget || assigning" (click)="doAssign()">
            <span *ngIf="assigning" class="spinner"></span>
            {{ assigning ? 'Assigning…' : '✅ Assign Ticket' }}
          </button>

          <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
          <div class="error-msg"   *ngIf="errorMsg">{{ errorMsg }}</div>
        </div>
      </div>

      <ng-template #noSelection>
        <div class="no-selection">
          <span>👈</span>
          <p>Select a ticket from the queue to assign it</p>
        </div>
      </ng-template>

      <!-- Engineer Workload Summary -->
      <div class="workload-card">
        <div class="card-header-row">
          <h3>👥 Engineer Workload</h3>
          <button class="refresh-btn" (click)="load()">↻ Refresh</button>
        </div>
        <div class="workload-table">
          <div class="wt-header">
            <span>Engineer</span><span>Role</span><span>Open</span><span>Critical</span><span>High</span><span>Load</span>
          </div>
          <div *ngFor="let e of engineers" class="wt-row" [class.overloaded]="e.openCount>10">
            <div class="wt-name">
              <div class="eng-av sm">{{ e.name[0] }}</div>
              {{ e.name }}
            </div>
            <span class="role-tag">{{ e.role }}</span>
            <span class="cnt">{{ e.openCount }}</span>
            <span class="cnt crit" [class.has-crit]="e.criticalCount>0">{{ e.criticalCount }}</span>
            <span class="cnt">{{ e.highCount }}</span>
            <div class="wl-cell">
              <div class="wl-bar-wrap sm">
                <div class="wl-bar" [style.width]="workloadPct(e)+'%'"
                     [style.background]="workloadColor(e)"></div>
              </div>
              <span class="wl-pct">{{ workloadPct(e) }}%</span>
            </div>
          </div>
          <div class="wt-empty" *ngIf="engineers.length===0">No engineers found</div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
.page { padding:20px 28px; max-width:1400px; margin:0 auto; }
.page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
h1 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 4px; }
.subtitle { margin:0; color:#64748b; font-size:13px; }
.unassigned-count { background:#fff; border:2px solid #e2e8f0; border-radius:10px;
  padding:10px 18px; font-size:14px; font-weight:600; color:#475569; }
.unassigned-count.red { border-color:#fecaca; background:#fff5f5; color:#dc2626; }
.unassigned-count span { font-size:22px; font-weight:700; display:block; }

.main-grid { display:grid; grid-template-columns:420px 1fr; gap:18px; align-items:start; }

/* Queue */
.queue-panel { background:#fff; border-radius:14px; border:1px solid #e2e8f0;
  overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.05); display:flex; flex-direction:column; max-height:85vh; }
.panel-header { padding:14px 16px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }
.panel-header h3 { font-size:14px; font-weight:700; color:#1e293b; margin:0; }
.queue-filters { display:flex; gap:6px; }
.mini-select,.mini-search { padding:6px 10px; border:1px solid #e2e8f0; border-radius:6px; font-size:12px; }
.queue-list { overflow-y:auto; flex:1; padding:10px; display:flex; flex-direction:column; gap:8px; }
.queue-list::-webkit-scrollbar { width:4px; }
.queue-list::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:2px; }
.queue-card { border:1.5px solid #e2e8f0; border-radius:10px; padding:12px; cursor:pointer; transition:all .15s; }
.queue-card:hover { border-color:#8392ab; }
.queue-card.selected { border-color:#171a35; background:#f8fafc; }
.queue-card.critical { border-left:4px solid #ef4444; }
.queue-card.high { border-left:4px solid #f59e0b; }
.qc-top { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.tno { font-family:monospace; font-size:11px; color:#3b82f6; font-weight:700; background:#eff6ff; padding:2px 7px; border-radius:4px; }
.badge { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
.p-critical { background:#fee2e2; color:#dc2626; } .p-high { background:#fef3c7; color:#d97706; }
.p-medium { background:#e0f2fe; color:#0369a1; } .p-low { background:#f1f5f9; color:#64748b; }
.qc-subject { font-size:13px; font-weight:600; color:#1e293b; margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.qc-meta { font-size:11.5px; color:#64748b; margin-bottom:6px; }
.qc-footer { display:flex; align-items:center; gap:8px; font-size:11px; color:#94a3b8; }
.qc-sla { color:#64748b; } .qc-sla.overdue { color:#dc2626; font-weight:600; }
.qc-type { background:#f1f5f9; color:#475569; padding:1px 7px; border-radius:10px; }
.qc-age { margin-left:auto; }
.empty-queue { padding:32px; text-align:center; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:8px; }
.empty-queue span { font-size:32px; }

/* Assign panel */
.assign-panel { display:flex; flex-direction:column; gap:14px; }
.ticket-detail-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:20px; box-shadow:0 1px 4px rgba(0,0,0,.05); }
.tdc-header { display:flex; align-items:center; gap:8px; margin-bottom:10px; flex-wrap:wrap; }
.tno-lg { font-family:monospace; font-size:13px; color:#3b82f6; font-weight:700; background:#eff6ff; padding:3px 10px; border-radius:6px; }
.type-badge { background:#f1f5f9; color:#475569; font-size:11px; padding:2px 8px; border-radius:20px; }
.tdc-subject { font-size:16px; font-weight:700; color:#1e293b; margin-bottom:14px; }
.tdc-meta-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; padding:14px; background:#f8fafc; border-radius:10px; }
.tdc-meta-item span { display:block; font-size:11px; color:#94a3b8; font-weight:500; margin-bottom:2px; }
.tdc-meta-item strong { font-size:13px; color:#1e293b; }
.tdc-meta-item.overdue strong { color:#dc2626; }

/* Engineer tabs */
.eng-tabs { display:flex; gap:0; margin-bottom:14px; border:1.5px solid #e2e8f0; border-radius:8px; overflow:hidden; }
.eng-tab { flex:1; padding:9px; border:none; background:#f8fafc; font-size:13px; font-weight:600; color:#64748b; cursor:pointer; transition:all .15s; }
.eng-tab.active { background:#171a35; color:#fff; }

/* Engineer list */
.assign-label { font-size:13px; font-weight:700; color:#1e293b; display:block; margin-bottom:10px; }
.engineer-list { display:flex; flex-direction:column; gap:8px; margin-bottom:14px; max-height:220px; overflow-y:auto; }
.engineer-row { display:flex; align-items:center; gap:10px; padding:10px 14px; border:1.5px solid #e2e8f0;
  border-radius:10px; cursor:pointer; transition:all .15s; }
.engineer-row:hover { border-color:#8392ab; }
.engineer-row.selected { border-color:#171a35; background:#f8fafc; }
.eng-av { width:34px; height:34px; background:linear-gradient(135deg,#8392ab,#ee8299); border-radius:50%;
  display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff; flex-shrink:0; }
.eng-av.sm { width:26px; height:26px; font-size:11px; }
.eng-info { flex:1; }
.eng-name { font-size:13.5px; font-weight:600; color:#1e293b; }
.eng-role { font-size:11px; color:#64748b; }
.eng-workload { display:flex; flex-direction:column; align-items:flex-end; gap:4px; min-width:90px; }
.wl-bar-wrap { width:80px; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden; }
.wl-bar-wrap.sm { width:60px; }
.wl-bar { height:100%; border-radius:3px; transition:width .4s; }
.wl-counts { font-size:11px; color:#64748b; }
.wl-num { font-weight:700; color:#374151; }
.wl-crit { color:#dc2626; font-size:10.5px; margin-left:4px; }
.no-eng { text-align:center; padding:20px; color:#94a3b8; font-size:13px; }

/* HRMS employees */
.hrms-header-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.hrms-actions { display:flex; gap:8px; }
.sync-btn { background:#0f766e; color:#fff; border:none; padding:7px 14px; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; }
.sync-btn:hover:not(:disabled) { background:#0d9488; }
.sync-btn:disabled { opacity:.6; cursor:not-allowed; }
.sync-result { background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; border-radius:8px; padding:8px 12px; font-size:12px; margin-bottom:10px; }
.hrms-loading { text-align:center; padding:20px; color:#64748b; font-size:13px; }
.hrms-error { background:#fff5f5; border:1px solid #fecaca; color:#dc2626; border-radius:8px; padding:10px; font-size:13px; }
.hrms-emp-list { display:flex; flex-direction:column; gap:8px; margin-bottom:14px; max-height:260px; overflow-y:auto; }
.hrms-emp-card { border:1.5px solid #e2e8f0; border-radius:10px; padding:12px; cursor:pointer; display:flex; gap:12px; align-items:flex-start; transition:all .15s; }
.hrms-emp-card:hover { border-color:#0d9488; }
.hrms-emp-card.selected { border-color:#0f766e; background:#f0fdf4; }
.hrms-av { width:38px; height:38px; background:linear-gradient(135deg,#0f766e,#0ea5e9); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color:#fff; flex-shrink:0; }
.hrms-emp-info { flex:1; }
.hrms-emp-name { font-size:13.5px; font-weight:700; color:#1e293b; margin-bottom:3px; }
.emp-code { font-family:monospace; font-size:11px; background:#f0fdf4; color:#0f766e; padding:1px 7px; border-radius:4px; font-weight:700; margin-left:6px; }
.hrms-emp-meta { font-size:12px; color:#475569; margin-bottom:4px; }
.hrms-emp-contact { font-size:11.5px; color:#64748b; margin-bottom:5px; }
.hrms-emp-badges { display:flex; gap:6px; flex-wrap:wrap; }
.emp-status { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; background:#fee2e2; color:#dc2626; }
.emp-status.active { background:#dcfce7; color:#15803d; }
.emp-type { padding:2px 8px; border-radius:20px; font-size:11px; background:#f1f5f9; color:#475569; }
.joining { font-size:11px; color:#94a3b8; }
.sep { color:#e2e8f0; margin:0 2px; }
.hrms-sel-preview { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 14px; margin-bottom:12px; }
.hsp-title { font-size:11px; color:#64748b; margin-bottom:4px; font-weight:600; }
.hsp-body { font-size:13px; color:#1e293b; margin-bottom:4px; }
.hsp-note { font-size:12px; color:#0f766e; }

/* Note + options */
.assign-note-wrap { margin-bottom:12px; }
.assign-note { width:100%; padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; resize:vertical; }
.assign-note:focus { outline:none; border-color:#8392ab; }
.assign-email-opts { display:flex; gap:16px; margin-bottom:16px; padding:10px 14px; background:#f8fafc; border-radius:8px; border:1px solid #f1f5f9; }
.checkbox-row { display:flex; align-items:center; gap:7px; font-size:13px; color:#374151; cursor:pointer; }
.checkbox-row input { width:15px; height:15px; accent-color:#171a35; }

.btn-assign { width:100%; padding:13px; background:#171a35; color:#fff; border:none;
  border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; display:flex;
  align-items:center; justify-content:center; gap:8px; transition:background .15s; }
.btn-assign:hover:not(:disabled) { background:#12335d; }
.btn-assign:disabled { opacity:.6; cursor:not-allowed; }
.spinner { width:16px; height:16px; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; }
.spinner-sm { width:12px; height:12px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; display:inline-block; }
@keyframes spin { to{transform:rotate(360deg)} }
.success-msg { margin-top:10px; padding:10px 14px; background:#dcfce7; border:1px solid #bbf7d0; color:#15803d; border-radius:8px; font-size:13px; text-align:center; }
.error-msg { margin-top:10px; padding:10px 14px; background:#fee2e2; border:1px solid #fecaca; color:#dc2626; border-radius:8px; font-size:13px; }

.no-selection { background:#fff; border:1px dashed #e2e8f0; border-radius:14px; padding:48px; text-align:center; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:8px; }
.no-selection span { font-size:36px; }

/* Workload */
.workload-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; }
.card-header-row { display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid #f1f5f9; }
.card-header-row h3 { font-size:14px; font-weight:700; color:#1e293b; margin:0; }
.refresh-btn { background:none; border:1px solid #e2e8f0; padding:5px 12px; border-radius:6px; font-size:12px; cursor:pointer; }
.refresh-btn:hover { background:#f8fafc; }
.workload-table { padding:0 0 4px; }
.wt-header { display:grid; grid-template-columns:1fr 110px 50px 60px 50px 100px; gap:8px; padding:8px 16px; font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; background:#fafafa; border-bottom:1px solid #f1f5f9; }
.wt-row { display:grid; grid-template-columns:1fr 110px 50px 60px 50px 100px; gap:8px; padding:10px 16px; font-size:13px; border-bottom:1px solid #f8fafc; align-items:center; }
.wt-row:hover { background:#f8fafc; }
.wt-row.overloaded { background:#fff5f5; }
.wt-name { display:flex; align-items:center; gap:8px; font-weight:500; color:#1e293b; }
.role-tag { font-size:11px; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:10px; white-space:nowrap; }
.cnt { font-weight:600; color:#374151; text-align:center; }
.cnt.crit { color:#94a3b8; }
.cnt.crit.has-crit { color:#dc2626; }
.wl-cell { display:flex; align-items:center; gap:6px; }
.wl-pct { font-size:11px; color:#64748b; white-space:nowrap; }
.wt-empty { text-align:center; padding:24px; color:#94a3b8; }
.overdue { color:#dc2626 !important; }
  `]
})
export class AssignmentComponent implements OnInit {
  queue: any[] = [];
  filteredQueue: any[] = [];
  engineers: any[] = [];
  hrmsEmployees: any[] = [];
  selected: any = null;
  selectedEngineer: any = null;
  selectedHrmsEmp: any = null;
  engineerTab: 'system' | 'hrms' = 'system';
  filterPriority = '';
  searchQueue = '';
  assignNote = '';
  notifyEngineer = true;
  notifyCustomer = false;
  assigning = false;
  syncing = false;
  hrmsLoading = false;
  hrmsError = '';
  successMsg = '';
  errorMsg = '';
  syncResult = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getUnassignedQueue().subscribe(q => { this.queue = q; this.applyFilter(); });
    this.api.getEngineerWorkload().subscribe(e => this.engineers = e);
  }

  loadHrms() {
    if (this.hrmsEmployees.length) return; // already loaded
    this.hrmsLoading = true; this.hrmsError = '';
    this.api.getHrmsEmployees().subscribe({
      next: emp => { this.hrmsEmployees = emp; this.hrmsLoading = false; },
      error: (e: any) => { this.hrmsError = e?.error?.message || 'Failed to load HRMS employees'; this.hrmsLoading = false; }
    });
  }

  syncHrms() {
    this.syncing = true; this.syncResult = '';
    this.api.syncHrmsEmployees().subscribe({
      next: (r: any) => {
        this.syncing = false;
        this.syncResult = `✅ Synced ${r.synced} new, updated ${r.updated} existing employees`;
        this.hrmsEmployees = []; // reset to reload
        this.loadHrms();
        this.api.getEngineerWorkload().subscribe(e => this.engineers = e);
      },
      error: (e: any) => { this.syncing = false; this.syncResult = '❌ Sync failed: ' + (e?.error?.message || 'Unknown error'); }
    });
  }

  applyFilter() {
    const q = this.searchQueue.toLowerCase();
    this.filteredQueue = this.queue.filter(t =>
      (!this.filterPriority || t.priority === this.filterPriority) &&
      (!q || t.subject?.toLowerCase().includes(q) ||
             t.ticketNo?.toLowerCase().includes(q) ||
             t.customerName?.toLowerCase().includes(q)));
  }

  select(t: any) {
    this.selected = t; this.selectedEngineer = null; this.selectedHrmsEmp = null;
    this.successMsg = ''; this.errorMsg = '';
  }

  selectEngineer(e: any)   { this.selectedEngineer = e; this.selectedHrmsEmp = null; }
  selectHrmsEmp(emp: any)  { this.selectedHrmsEmp = emp; this.selectedEngineer = null; }

  hrmsEmpInSystem(emp: any) { return this.engineers.some(e => e.email === emp.email || e.name === emp.fullName); }

  get assignTarget(): any {
    if (this.engineerTab === 'system') return this.selectedEngineer;
    if (this.engineerTab === 'hrms' && this.selectedHrmsEmp) {
      // Find matching system user by email
      return this.engineers.find(e => e.email === this.selectedHrmsEmp.email || e.name === this.selectedHrmsEmp.fullName) || null;
    }
    return null;
  }

  doAssign() {
    const target = this.assignTarget;
    if (!this.selected || !target) return;
    this.assigning = true; this.successMsg = ''; this.errorMsg = '';
    this.api.assignTicket(this.selected.id, { assigneeId: target.id, note: this.assignNote || null })
      .subscribe({
        next: () => {
          const name = this.selectedHrmsEmp?.fullName || this.selectedEngineer?.name;
          this.successMsg = `✅ ${this.selected.ticketNo} assigned to ${name}. Email notification sent.`;
          this.queue = this.queue.filter(t => t.id !== this.selected.id);
          this.applyFilter();
          this.selected = null; this.selectedEngineer = null; this.selectedHrmsEmp = null; this.assignNote = '';
          this.assigning = false;
          this.api.getEngineerWorkload().subscribe(e => this.engineers = e);
        },
        error: () => { this.errorMsg = 'Assignment failed. Please try again.'; this.assigning = false; }
      });
  }

  isOverdue(d?: string) { return d && new Date(d) < new Date(); }
  age(d?: string) {
    if (!d) return '';
    const hrs = Math.round((Date.now() - new Date(d).getTime()) / 3600000);
    return hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs/24)}d ago`;
  }
  workloadPct(e: any)   { return Math.min(100, Math.round((e.openCount / 15) * 100)); }
  workloadColor(e: any) {
    const p = this.workloadPct(e);
    return p >= 80 ? '#ef4444' : p >= 50 ? '#f59e0b' : '#22c55e';
  }
}
