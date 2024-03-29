import { Component } from '@angular/core';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = "";
  password: string = "";

  constructor(private loginService: LoginService) { }

  login() {
    this.loginService.checkLogin(this.email, this.password);
  }

}
