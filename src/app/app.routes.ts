import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  {
    path: '', canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'tickets',      loadComponent: () => import('./pages/tickets/ticket-list.component').then(m => m.TicketListComponent) },
      { path: 'tickets/new',  loadComponent: () => import('./pages/tickets/ticket-create.component').then(m => m.TicketCreateComponent) },
      { path: 'tickets/:id',  loadComponent: () => import('./pages/tickets/ticket-detail.component').then(m => m.TicketDetailComponent) },
      { path: 'workbench',    loadComponent: () => import('./pages/workbench/workbench.component').then(m => m.WorkbenchComponent) },
      { path: 'qa-queue',     loadComponent: () => import('./pages/qa-queue/qa-queue.component').then(m => m.QaQueueComponent) },
      { path: 'customers',    loadComponent: () => import('./pages/customers/customers.component').then(m => m.CustomersComponent) },
      { path: 'applications', loadComponent: () => import('./pages/applications/applications.component').then(m => m.ApplicationsComponent) },
      { path: 'contracts',    loadComponent: () => import('./pages/contracts/contracts.component').then(m => m.ContractsComponent) },
      { path: 'reports',      loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'users',        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
