import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthorizationService } from '../authorization.service';

@Component({
    selector: 'app-protected',
    templateUrl: './protected.component.html',
    styleUrls: ['./protected.component.css'],
})
export class ProtectedComponent {
    constructor(private http: HttpClient, private authService: AuthorizationService) {}

    public mySecret: Observable<string> = this.http
        .get<any>('/secretData')
        .pipe(map((resp) => resp.secret));

    public signOut(): void {
        this.authService.signOut().subscribe();
    }
}
