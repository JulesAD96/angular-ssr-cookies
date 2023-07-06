import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthorizationService } from './authorization.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
    constructor(private authService: AuthorizationService, private router: Router) {}
    public canActivate(): Observable<boolean> {
        return this.authService.isAuthenticated().pipe(
            map((isAuth) => {
                if (!isAuth) {
                    this.authService.setRedirectUrl(this.router.url);
                    this.router.navigate(['signin']);
                }
                return isAuth;
            })
        );
    }
}
