import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'tickets_user';
  private user$ = new BehaviorSubject<LoginResponse | null>(this.stored());

  currentUser$ = this.user$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, req).pipe(
      tap(res => {
        localStorage.setItem(this.KEY, JSON.stringify(res));
        this.user$.next(res);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.KEY);
    this.user$.next(null);
    this.router.navigate(['/login']);
  }

  get token()       { return this.stored()?.token; }
  get currentUser() { return this.stored(); }
  get role()        { return this.stored()?.role ?? ''; }
  get isLoggedIn()  { return !!this.stored(); }

  private stored(): LoginResponse | null {
    const v = localStorage.getItem(this.KEY);
    return v ? JSON.parse(v) : null;
  }
}
