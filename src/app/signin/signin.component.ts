import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthorizationService } from '../authorization.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  public signinForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });
  constructor(private authService: AuthorizationService) { }
  public onSubmit(): void {
    this.authService.signIn(
      this.signinForm.get('username')?.value,
      this.signinForm.get('password')?.value
    ).subscribe();
  }
}
