import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {

  email: string = "";

  constructor(private loginService: LoginService, private router: Router) { }

  sendMail() {
    if (this.email) {
      this.loginService.sendMail(this.email)
        .then((response: any) => {
          if (response.status == 200) {
            Swal.fire({
              icon: 'success',
              title: 'Email inviata correttamente',
              text: 'Controlla la tua casella di posta per resettare la password!'
            }).then(() => {
              this.email = "";
              this.router.navigateByUrl('/login');
            });
          }
        })
        .catch((error: any) => {
          if (error.response.status == 401) {
            Swal.fire({
              icon: 'error',
              title: 'Email non trovata',
              text: 'Controlla di aver inserito correttamente l\'email!'
            });
          }
        });
    }
  }

}
