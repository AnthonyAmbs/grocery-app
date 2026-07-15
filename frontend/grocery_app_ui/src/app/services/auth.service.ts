import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: any = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private apiUrl = `${environment.apiBaseUrl}/auth`;

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }, { withCredentials: true }).pipe(
      tap(res => {
        this.currentUser = res.user;
        if (this.isBrowser) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  register(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/register`, { username, password }).pipe(
      tap(res => {
      this.currentUser = res.user;
      if (this.isBrowser) {
        localStorage.setItem('user', JSON.stringify(res.user))
      }
      })
    );
  } 

  updateUser(data: any) {
    return this.http.put('/auth/update', data);
  }

  getCurrentUser() {
    return this.currentUser || (this.isBrowser ? JSON.parse(localStorage.getItem('user') || 'null') : null);
  }

  checkAuth() {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(res => {
        this.currentUser = res.user;
        if (this.isBrowser) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        return true;
      }),
      catchError(() => {
        this.currentUser = null;
        if (this.isBrowser) {
          localStorage.removeItem('user');
        }
        return of(false);
      })
    );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true}).pipe(
      tap(() => {
        this.currentUser = null;
        if (this.isBrowser) {
          localStorage.removeItem('user');
        }
      })
    );
  }
}
