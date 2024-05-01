import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {

  oldPassword: string = "";
  newPassword: string = "";
  confirmPassword: string = "";

  constructor(private loginService: LoginService, private router: Router) { }

  changePassword() {
    if (this.oldPassword && this.newPassword && this.confirmPassword) {
      if (this.newPassword == this.confirmPassword) {
        this.loginService.changePassword(this.oldPassword, this.newPassword, this.confirmPassword).catch((error: any) => {
          if (error.response.status == 401) {
            Swal.fire({
              title: 'Errore',
              text: 'Password errata',
              icon: 'error',
              confirmButtonText: 'OK'
            })
          }
        }).then((response: any) => {
          if (response.status == 200) {
            Swal.fire({
              title: 'Ottimo',
              text: 'Password cambiata con successo',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              this.router.navigateByUrl('/login');
            });
          }
        });
      }
    } else {
      Swal.fire({
        title: 'Errore',
        text: 'Compila tutti i campi',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  }
}
