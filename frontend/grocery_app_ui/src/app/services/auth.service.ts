import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;
  private renewToken: string | null = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<any>('/auth/login', { username, password }).pipe(
      tap(res => {
        this.accessToken = res.accessToken;
        this.renewToken = res.renewToken;
        if (this.accessToken) localStorage.setItem('accessToken', this.accessToken);
        if (this.renewToken) localStorage.setItem('renewToken', this.renewToken);
      })
    );
  }

  renewTokens() {
    return this.http.post<any>('/auth/renew', {
      renewToken: this.renewToken || localStorage.getItem('renewToken')
    }).pipe(
      tap(res => {
        this.accessToken = res.accessToken;
        this.renewToken = res.renewToken;
        if (this.accessToken) localStorage.setItem('accessToken', this.accessToken);
        if (this.renewToken) localStorage.setItem('renewToken', this.renewToken);
      })
    );
  }

  getAccessToken() {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  logout() {
    this.accessToken = null;
    this.renewToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('renewToken');
  }
}
