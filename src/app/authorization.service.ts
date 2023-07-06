import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { REQUEST } from '@nguniversal/express-engine/tokens';
@Injectable({
    providedIn: 'root',
})
export class AuthorizationService {
    private redirectUrl: string = '/';
    constructor(
        private router: Router,
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: any,
        @Optional() @Inject(REQUEST) private request: any
    ) {}
    public setRedirectUrl(url: string) {
        this.redirectUrl = url;
    }
    public signIn(username: string, password: string): Observable<any> {
        return this.http.post<any>('/auth/signIn', { username: username, password: password }).pipe(
            tap((_) => {
                this.router.navigate([this.redirectUrl]);
            })
        );
    }
    public isAuthenticated(): Observable<boolean> {
        if (isPlatformServer(this.platformId)) {
            return of(this.request.cookies.authentication);
        }
        return this.http.get<any>('/auth/isLogged').pipe(map((response) => response.authenticated));
    }
    public signOut(): Observable<boolean> {
        return this.http.get<any>('/auth/signOut').pipe(
            map((response) => response.status === 'signed out'),
            tap((_) => this.router.navigate(['signin']))
        );
    }
}
