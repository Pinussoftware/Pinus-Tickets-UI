import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Reports & Analytics</h1>
      <p class="subtitle">Last updated: {{ now | date:'dd MMM yyyy HH:mm' }}</p>
    </div>
    <div class="header-right">
      <select [(ngModel)]="period" class="period-select">
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
      <button class="btn-export">⬇ Export CSV</button>
    </div>
  </div>

  <!-- Summary KPIs -->
  <div class="kpi-row">
    <div class="kpi-box" *ngFor="let k of kpis">
      <div class="kpi-icon">{{ k.icon }}</div>
      <div class="kpi-val">{{ k.val }}</div>
      <div class="kpi-lbl">{{ k.label }}</div>
      <div class="kpi-change" [class.positive]="k.positive">{{ k.change }}</div>
    </div>
  </div>

  <!-- Charts row 1 -->
  <div class="charts-row">
    <!-- Ticket Volume by Status -->
    <div class="chart-card wide">
      <div class="chart-title">Ticket Volume by Status</div>
      <div class="bar-chart">
        <div *ngFor="let s of statusData" class="bar-group">
          <div class="bar-wrap">
            <div class="bar-fill" [style.height]="s.pct+'%'" [style.background]="s.color">
              <span class="bar-val">{{ s.count }}</span>
            </div>
          </div>
          <div class="bar-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Priority Distribution -->
    <div class="chart-card">
      <div class="chart-title">Priority Distribution</div>
      <div class="donut-chart">
        <svg viewBox="0 0 120 120" class="donut-svg">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" stroke-width="18"/>
          <circle *ngFor="let s of donutSegments" cx="60" cy="60" r="50" fill="none"
            [attr.stroke]="s.color" stroke-width="18"
            [attr.stroke-dasharray]="s.dash"
            [attr.stroke-dashoffset]="s.offset"
            transform="rotate(-90 60 60)"/>
          <text x="60" y="64" text-anchor="middle" font-size="16" font-weight="700" fill="#1e293b">{{ totalTickets }}</text>
          <text x="60" y="76" text-anchor="middle" font-size="8" fill="#64748b">Total</text>
        </svg>
        <div class="donut-legend">
          <div *ngFor="let p of priorityData" class="legend-item">
            <span class="legend-dot" [style.background]="p.color"></span>
            <span class="legend-label">{{ p.label }}</span>
            <span class="legend-val">{{ p.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts row 2 -->
  <div class="charts-row">
    <!-- SLA Compliance -->
    <div class="chart-card">
      <div class="chart-title">SLA Compliance</div>
      <div class="compliance-display">
        <div class="compliance-circle">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" stroke-width="14"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#22c55e" stroke-width="14"
              [attr.stroke-dasharray]="(314 * slaRate / 100) + ' 314'"
              stroke-dashoffset="78.5" transform="rotate(-90 60 60)"/>
            <text x="60" y="64" text-anchor="middle" font-size="18" font-weight="700" fill="#1e293b">{{ slaRate }}%</text>
            <text x="60" y="76" text-anchor="middle" font-size="8" fill="#64748b">SLA Met</text>
          </svg>
        </div>
        <div class="compliance-stats">
          <div class="cs-row"><span class="cs-dot green"></span><span>Met SLA</span><strong>{{ slaMet }}</strong></div>
          <div class="cs-row"><span class="cs-dot red"></span><span>Breached</span><strong>{{ slaBreached }}</strong></div>
          <div class="cs-row"><span class="cs-dot yellow"></span><span>At Risk</span><strong>{{ slaAtRisk }}</strong></div>
        </div>
      </div>
    </div>

    <!-- Resolution Time -->
    <div class="chart-card">
      <div class="chart-title">Avg. Resolution Time (hours)</div>
      <div class="hbar-chart">
        <div *ngFor="let r of resolutionData" class="hbar-row">
          <span class="hbar-label">{{ r.label }}</span>
          <div class="hbar-track">
            <div class="hbar-fill" [style.width]="r.pct+'%'" [style.background]="r.color">
              <span class="hbar-val">{{ r.val }}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Assignees -->
    <div class="chart-card">
      <div class="chart-title">Top Assignees by Ticket Volume</div>
      <div class="assignee-list">
        <div *ngFor="let a of assigneeData; let i=index" class="assignee-row">
          <span class="rank">{{ i+1 }}</span>
          <div class="a-avatar">{{ a.name[0] }}</div>
          <div class="a-info">
            <span class="a-name">{{ a.name }}</span>
            <div class="a-bar-track"><div class="a-bar" [style.width]="a.pct+'%'"></div></div>
          </div>
          <span class="a-count">{{ a.count }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent activity table -->
  <div class="table-card">
    <div class="table-header">
      <h3>Ticket Activity Summary</h3>
    </div>
    <table>
      <thead>
        <tr><th>Metric</th><th>This Period</th><th>Previous Period</th><th>Change</th><th>Trend</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let m of metrics">
          <td class="metric-name">{{ m.name }}</td>
          <td class="metric-val">{{ m.current }}</td>
          <td class="metric-prev">{{ m.previous }}</td>
          <td [class.positive]="m.up" [class.negative]="!m.up">{{ m.change }}</td>
          <td><span class="trend-arrow" [class.up]="m.up">{{ m.up ? '↑' : '↓' }}</span></td>
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
.header-right { display:flex; gap:10px; align-items:center; }
.period-select { padding:9px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; }
.btn-export { background:#fff; border:1px solid #e2e8f0; padding:9px 16px;
  border-radius:8px; font-size:13px; cursor:pointer; font-weight:500; }
.btn-export:hover { background:#f8fafc; }
.kpi-row { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:18px; }
.kpi-box { background:#fff; border-radius:14px; padding:16px; border:1px solid #e2e8f0;
  box-shadow:0 1px 4px rgba(0,0,0,.05); }
.kpi-icon { font-size:24px; margin-bottom:6px; }
.kpi-val { font-size:26px; font-weight:700; color:#1e293b; }
.kpi-lbl { font-size:12px; color:#64748b; margin-top:2px; }
.kpi-change { font-size:11px; margin-top:6px; color:#ef4444; font-weight:500; }
.kpi-change.positive { color:#22c55e; }
.charts-row { display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:14px; }
.charts-row:last-of-type { grid-template-columns:1fr 1fr 1fr; }
.chart-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0;
  padding:18px; box-shadow:0 1px 4px rgba(0,0,0,.05); }
.chart-title { font-size:14px; font-weight:700; color:#1e293b; margin-bottom:16px;
  padding-bottom:10px; border-bottom:1px solid #f1f5f9; }

/* Bar chart */
.bar-chart { display:flex; align-items:flex-end; gap:10px; height:160px; }
.bar-group { display:flex; flex-direction:column; align-items:center; flex:1; height:100%; }
.bar-wrap { flex:1; display:flex; align-items:flex-end; width:100%; }
.bar-fill { width:100%; border-radius:6px 6px 0 0; min-height:4px; position:relative;
  display:flex; align-items:flex-start; justify-content:center; transition:height .5s; }
.bar-val { font-size:11px; font-weight:700; color:#fff; margin-top:4px; }
.bar-label { font-size:10px; color:#64748b; margin-top:6px; text-align:center; word-break:break-word; }

/* Donut */
.donut-chart { display:flex; align-items:center; gap:16px; }
.donut-svg { width:130px; height:130px; flex-shrink:0; }
.donut-legend { flex:1; display:flex; flex-direction:column; gap:8px; }
.legend-item { display:flex; align-items:center; gap:8px; font-size:12.5px; }
.legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.legend-label { flex:1; color:#374151; }
.legend-val { font-weight:700; color:#1e293b; }

/* Compliance */
.compliance-display { display:flex; align-items:center; gap:16px; }
.compliance-circle svg { width:130px; height:130px; }
.compliance-stats { flex:1; display:flex; flex-direction:column; gap:10px; }
.cs-row { display:flex; align-items:center; gap:8px; font-size:13px; }
.cs-row span:not(.cs-dot) { flex:1; color:#374151; }
.cs-row strong { color:#1e293b; font-weight:700; }
.cs-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.cs-dot.green  { background:#22c55e; }
.cs-dot.red    { background:#ef4444; }
.cs-dot.yellow { background:#f59e0b; }

/* Hbar */
.hbar-chart { display:flex; flex-direction:column; gap:12px; }
.hbar-row { display:flex; align-items:center; gap:10px; }
.hbar-label { width:70px; font-size:12px; color:#374151; text-align:right; flex-shrink:0; }
.hbar-track { flex:1; height:24px; background:#f1f5f9; border-radius:6px; overflow:hidden; }
.hbar-fill { height:100%; border-radius:6px; display:flex; align-items:center;
  padding-left:8px; transition:width .5s; }
.hbar-val { font-size:11px; font-weight:700; color:#fff; }

/* Assignees */
.assignee-list { display:flex; flex-direction:column; gap:10px; }
.assignee-row { display:flex; align-items:center; gap:10px; }
.rank { font-size:12px; color:#94a3b8; width:16px; text-align:center; }
.a-avatar { width:30px; height:30px; background:linear-gradient(135deg,#8392ab,#ee8299);
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700; color:#fff; flex-shrink:0; }
.a-info { flex:1; }
.a-name { font-size:12.5px; font-weight:500; color:#1e293b; display:block; margin-bottom:3px; }
.a-bar-track { height:5px; background:#f1f5f9; border-radius:3px; overflow:hidden; }
.a-bar { height:100%; background:linear-gradient(90deg,#8392ab,#ee8299); border-radius:3px; }
.a-count { font-size:13px; font-weight:700; color:#1e293b; }

/* Table */
.table-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0;
  overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.05); }
.table-header { padding:16px 18px; border-bottom:1px solid #f1f5f9; }
.table-header h3 { font-size:14px; font-weight:700; color:#1e293b; margin:0; }
table { width:100%; border-collapse:collapse; }
th { padding:10px 14px; font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.5px; background:#fafafa;
  border-bottom:1px solid #e2e8f0; text-align:left; }
td { padding:11px 14px; font-size:13px; border-bottom:1px solid #f8fafc; }
.metric-name { font-weight:500; color:#1e293b; }
.metric-val  { font-weight:700; color:#1e293b; }
.metric-prev { color:#64748b; }
.positive { color:#22c55e; font-weight:600; }
.negative { color:#ef4444; font-weight:600; }
.trend-arrow { font-size:16px; font-weight:700; color:#94a3b8; }
.trend-arrow.up { color:#22c55e; }
@media(max-width:1100px) {
  .kpi-row { grid-template-columns:repeat(3,1fr); }
  .charts-row { grid-template-columns:1fr; }
  .charts-row:last-of-type { grid-template-columns:1fr 1fr; }
}
  `]
})
export class ReportsComponent implements OnInit {
  period = '30';
  now = new Date();
  totalTickets = 0;
  slaMet = 0; slaBreached = 0; slaAtRisk = 0; slaRate = 0;

  kpis = [
    { icon:'🎫', val:'0', label:'Tickets Created', change:'— no data yet', positive:true },
    { icon:'✅', val:'0', label:'Tickets Resolved', change:'—', positive:true },
    { icon:'⏱', val:'0h', label:'Avg Resolution', change:'—', positive:true },
    { icon:'📊', val:'0%', label:'SLA Compliance', change:'—', positive:true },
    { icon:'🔄', val:'0', label:'Reopened Tickets', change:'—', positive:false },
  ];

  statusData = [
    { label:'New',        count:0, pct:10, color:'#94a3b8' },
    { label:'In Progress',count:0, pct:30, color:'#3b82f6' },
    { label:'Waiting',    count:0, pct:15, color:'#f59e0b' },
    { label:'QA',         count:0, pct:20, color:'#a855f7' },
    { label:'Resolved',   count:0, pct:60, color:'#22c55e' },
    { label:'Closed',     count:0, pct:50, color:'#64748b' },
  ];

  priorityData = [
    { label:'Critical', count:0, color:'#ef4444' },
    { label:'High',     count:0, color:'#f59e0b' },
    { label:'Medium',   count:0, color:'#3b82f6' },
    { label:'Low',      count:0, color:'#94a3b8' },
  ];

  donutSegments: any[] = [];

  resolutionData = [
    { label:'Critical', val:3.2,  pct:32, color:'#ef4444' },
    { label:'High',     val:6.8,  pct:68, color:'#f59e0b' },
    { label:'Medium',   val:14.5, pct:72, color:'#3b82f6' },
    { label:'Low',      val:28.0, pct:56, color:'#94a3b8' },
  ];

  assigneeData = [
    { name:'Admin', count:0, pct:80 },
  ];

  metrics = [
    { name:'Total Tickets Created', current:'0', previous:'0', change:'+0%', up:true },
    { name:'Tickets Resolved',      current:'0', previous:'0', change:'+0%', up:true },
    { name:'Avg Resolution Time',   current:'0h', previous:'0h', change:'0%', up:true },
    { name:'SLA Breaches',          current:'0', previous:'0', change:'0%', up:false },
    { name:'Customer Satisfaction', current:'N/A', previous:'N/A', change:'—', up:true },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe(s => {
      this.totalTickets = s.openTickets;
      this.slaMet = Math.max(0, s.openTickets - s.overdueTickets);
      this.slaBreached = s.overdueTickets;
      this.slaAtRisk = s.slaAtRisk;
      this.slaRate = this.totalTickets > 0 ? Math.round(this.slaMet / this.totalTickets * 100) : 100;

      this.kpis[0].val = String(s.openTickets);
      this.kpis[2].val = s.avgResolutionHours.toFixed(1) + 'h';
      this.kpis[3].val = this.slaRate + '%';

      this.statusData[0].count = s.unassignedTickets;
      this.statusData[1].count = Math.max(0, s.openTickets - s.slaAtRisk - s.overdueTickets);
      this.statusData[4].count = 0;

      this.buildDonut();
    });
    this.api.getTickets({}).subscribe(tickets => {
      const crit = tickets.filter(t => t.priority==='Critical').length;
      const high = tickets.filter(t => t.priority==='High').length;
      const med  = tickets.filter(t => t.priority==='Medium').length;
      const low  = tickets.filter(t => t.priority==='Low').length;
      this.priorityData[0].count = crit;
      this.priorityData[1].count = high;
      this.priorityData[2].count = med;
      this.priorityData[3].count = low;
      this.totalTickets = tickets.length || 1;
      this.buildDonut();
    });
  }

  buildDonut() {
    const total = this.priorityData.reduce((a,p) => a+p.count, 0) || 1;
    const circ = 314;
    let offset = 0;
    this.donutSegments = this.priorityData.map(p => {
      const dash = (p.count / total) * circ;
      const seg = { color:p.color, dash:`${dash} ${circ}`, offset: -offset };
      offset += dash;
      return seg;
    });
  }
}
