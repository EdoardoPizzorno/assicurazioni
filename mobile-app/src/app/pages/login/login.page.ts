import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  alertButtons: any = ['OK'];

  email: string = "";
  password: string = "";

  constructor(public loginService: LoginService) { }

  async ngOnInit() {
    await this.loginService.checkToken();
  }

  login() {
    this.loginService.login(this.email, this.password);
  }

  togglePasswordVisibility() {
    let passwordInput: HTMLElement = document.getElementById('password')!;
    if (passwordInput.getAttribute('type') === 'password') {
      passwordInput.setAttribute('type', 'text');
    } else {
      passwordInput.setAttribute('type', 'password');
    }
  }

}
