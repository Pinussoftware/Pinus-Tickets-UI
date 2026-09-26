import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DashboardStats } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Auth ──────────────────────────────────────────────────────────────────
  login(body: any) { return this.http.post<any>(`${this.base}/auth/login`, body); }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboard() { return this.http.get<DashboardStats>(`${this.base}/tickets/dashboard`); }

  // ── Tickets ───────────────────────────────────────────────────────────────
  getTickets(filters: any = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<any[]>(`${this.base}/tickets`, { params });
  }
  getTicket(id: number)               { return this.http.get<any>(`${this.base}/tickets/${id}`); }
  createTicket(body: any)             { return this.http.post<any>(`${this.base}/tickets`, body); }
  transitionTicket(id: number, body: any) { return this.http.post<any>(`${this.base}/tickets/${id}/transition`, body); }
  assignTicket(id: number, body: any)     { return this.http.post<any>(`${this.base}/tickets/${id}/assign`, body); }
  addComment(id: number, body: any)       { return this.http.post<any>(`${this.base}/tickets/${id}/comments`, body); }
  addTimeEntry(id: number, body: any)     { return this.http.post<any>(`${this.base}/tickets/${id}/time-entries`, body); }
  addTestResult(id: number, body: any)    { return this.http.post<any>(`${this.base}/tickets/${id}/test-results`, body); }

  // ── Customers ─────────────────────────────────────────────────────────────
  getCustomers()                           { return this.http.get<any[]>(`${this.base}/customers`); }
  createCustomer(body: any)               { return this.http.post<any>(`${this.base}/customers`, body); }
  updateCustomer(id: number, body: any)   { return this.http.patch<any>(`${this.base}/customers/${id}`, body); }
  deleteCustomer(id: number)              { return this.http.delete(`${this.base}/customers/${id}`); }

  // ── ERP Sync ───────────────────────────────────────────────────────────────
  getErpClients()                         { return this.http.get<any[]>(`${this.base}/erp/clients`); }
  syncErpClients(codes?: string[])        { return this.http.post<any>(`${this.base}/erp/sync`, { clientCodes: codes ?? null }); }

  // ── Role Permissions ──────────────────────────────────────────────────────
  getRolePermissions(role: string)        { return this.http.get<any[]>(`${this.base}/role-permissions/${role}`); }
  saveRolePermissions(role: string, perms: any[]) { return this.http.post<any>(`${this.base}/role-permissions/${role}`, perms); }

  // ── Applications ──────────────────────────────────────────────────────────
  getApplications(customerId?: number) {
    const params = customerId ? { params: new HttpParams().set('customerId', customerId) } : {};
    return this.http.get<any[]>(`${this.base}/applications`, params);
  }
  createApplication(body: any)             { return this.http.post<any>(`${this.base}/applications`, body); }
  updateApplication(id: number, body: any) { return this.http.patch<any>(`${this.base}/applications/${id}`, body); }
  setApplicationStatus(id: number, body: any) { return this.http.patch<any>(`${this.base}/applications/${id}/status`, body); }

  // ── Contracts ─────────────────────────────────────────────────────────────
  getContracts(customerId?: number) {
    const params = customerId ? { params: new HttpParams().set('customerId', customerId) } : {};
    return this.http.get<any[]>(`${this.base}/contracts`, params);
  }
  createContract(body: any)               { return this.http.post<any>(`${this.base}/contracts`, body); }
  updateContract(id: number, body: any)   { return this.http.patch<any>(`${this.base}/contracts/${id}`, body); }
  deleteContract(id: number)              { return this.http.delete<any>(`${this.base}/contracts/${id}`); }

  // ── Users ─────────────────────────────────────────────────────────────────
  getUsers()                              { return this.http.get<any[]>(`${this.base}/users`); }
  createUser(body: any)                   { return this.http.post<any>(`${this.base}/users`, body); }
  updateUser(id: number, body: any)       { return this.http.patch<any>(`${this.base}/users/${id}`, body); }
  deactivateUser(id: number)             { return this.http.delete<any>(`${this.base}/users/${id}`); }

  // ── Assignment ────────────────────────────────────────────────────────────
  getUnassignedQueue()  { return this.http.get<any[]>(`${this.base}/assignments/queue`); }
  getEngineerWorkload() { return this.http.get<any[]>(`${this.base}/assignments/workload`); }

  // ── HRMS Integration ──────────────────────────────────────────────────────
  getHrmsEmployees()    { return this.http.get<any[]>(`${this.base}/hrms/employees`); }
  syncHrmsEmployees()   { return this.http.post<any>(`${this.base}/hrms/sync`, {}); }

  // ── Attachments ───────────────────────────────────────────────────────────
  uploadAttachment(ticketId: number, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<any>(`${this.base}/tickets/${ticketId}/attachments`, fd);
  }
  getAttachments(ticketId: number) { return this.http.get<any[]>(`${this.base}/tickets/${ticketId}/attachments`); }
  deleteAttachment(ticketId: number, id: number) { return this.http.delete(`${this.base}/tickets/${ticketId}/attachments/${id}`); }
  getNotifications(filters: any = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, String(v)); });
    return this.http.get<any[]>(`${this.base}/notifications`, { params });
  }
  getNotificationStats() { return this.http.get<any>(`${this.base}/notifications/stats`); }
}
