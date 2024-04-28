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

  constructor(public loginService: LoginService) { }

  async ngOnInit() {
    await this.loginService.checkToken();
  }

  login() {
    this.loginService.login(this.email, this.password);
  }

}
