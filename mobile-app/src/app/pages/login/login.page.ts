import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = "";
  password: string = "";

  constructor(public loginService: LoginService) { }

  async ngOnInit() {
    await this.loginService.checkToken();
  }

  login() {
    this.loginService.login(this.email, this.password);
  }

  googleLogin() {
    this.loginService.googleLogin();
  }

}
