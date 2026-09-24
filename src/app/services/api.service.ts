import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  TicketListItem, TicketDetail, Customer, AppModel,
  UserModel, DashboardStats
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Auth ─────────────────────────────────────────────────────────────────
  login(body: any)   { return this.http.post<any>(`${this.base}/auth/login`, body); }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboard()     { return this.http.get<DashboardStats>(`${this.base}/tickets/dashboard`); }

  // ── Tickets ───────────────────────────────────────────────────────────────
  getTickets(filters: any = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<TicketListItem[]>(`${this.base}/tickets`, { params });
  }

  getTicket(id: number)         { return this.http.get<TicketDetail>(`${this.base}/tickets/${id}`); }
  createTicket(body: any)       { return this.http.post<TicketDetail>(`${this.base}/tickets`, body); }
  transitionTicket(id: number, body: any) {
    return this.http.post<TicketDetail>(`${this.base}/tickets/${id}/transition`, body);
  }
  assignTicket(id: number, body: any) {
    return this.http.post<TicketDetail>(`${this.base}/tickets/${id}/assign`, body);
  }
  addComment(id: number, body: any) {
    return this.http.post<any>(`${this.base}/tickets/${id}/comments`, body);
  }
  addTimeEntry(id: number, body: any) {
    return this.http.post<any>(`${this.base}/tickets/${id}/time-entries`, body);
  }
  addTestResult(id: number, body: any) {
    return this.http.post<any>(`${this.base}/tickets/${id}/test-results`, body);
  }

  // ── Customers ─────────────────────────────────────────────────────────────
  getCustomers()              { return this.http.get<Customer[]>(`${this.base}/customers`); }
  createCustomer(body: any)   { return this.http.post<Customer>(`${this.base}/customers`, body); }

  // ── Applications ──────────────────────────────────────────────────────────
  getApplications(customerId?: number) {
    const params = customerId ? { params: new HttpParams().set('customerId', customerId) } : {};
    return this.http.get<AppModel[]>(`${this.base}/applications`, params);
  }
  createApplication(body: any) { return this.http.post<AppModel>(`${this.base}/applications`, body); }

  // ── Users ─────────────────────────────────────────────────────────────────
  getUsers()               { return this.http.get<UserModel[]>(`${this.base}/users`); }
  createUser(body: any) { return this.http.post<UserModel>(`${this.base}/users`, body); }

  // ── Assignment ────────────────────────────────────────────────────────────
  getUnassignedQueue()  { return this.http.get<any[]>(`${this.base}/assignments/queue`); }
  getEngineerWorkload() { return this.http.get<any[]>(`${this.base}/assignments/workload`); }

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications(filters: any = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, String(v)); });
    return this.http.get<any[]>(`${this.base}/notifications`, { params });
  }
  getNotificationStats() { return this.http.get<any>(`${this.base}/notifications/stats`); }
}
