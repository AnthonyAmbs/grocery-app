import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;
  private renewToken: string | null = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private apiUrl = 'http://localhost:5000/auth';

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        this.accessToken = res.accessToken;
        this.renewToken = res.renewToken;
        if (this.isBrowser) {
          if (this.accessToken) localStorage.setItem('accessToken', this.accessToken);
          if (this.renewToken) localStorage.setItem('renewToken', this.renewToken);
        }
      })
    );
  }

  register(username: string, email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/register`, { username, email, password });
  }

  renewTokens() {
    const renewTokenFromStorage = this.isBrowser ? localStorage.getItem('renewToken') : null;
    return this.http.post<any>(`${this.apiUrl}/renew`, {
      renewToken: this.renewToken || renewTokenFromStorage
    }).pipe(
      tap(res => {
        this.accessToken = res.accessToken;
        this.renewToken = res.renewToken;
        if (this.isBrowser) {
          if (this.accessToken) localStorage.setItem('accessToken', this.accessToken);
          if (this.renewToken) localStorage.setItem('renewToken', this.renewToken);
        }
      })
    );
  }


  getAccessToken() {
    return this.accessToken || (this.isBrowser ? localStorage.getItem('accessToken') : null);
  }

  logout() {
    this.accessToken = null;
    this.renewToken = null;
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('renewToken');
    }
  }
}
