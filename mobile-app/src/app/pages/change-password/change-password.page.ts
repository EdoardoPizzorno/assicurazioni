import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage {

  oldPassword: string = "";
  newPassword: string = "";
  confirmPassword: string = "";

  constructor(private loginService: LoginService, private alertController: AlertController, private router: Router) { }

  changePassword() {
    if (this.oldPassword && this.newPassword && this.confirmPassword) {
      if (this.newPassword == this.confirmPassword) {
        this.loginService.changePassword(this.oldPassword, this.newPassword, this.confirmPassword).catch((error: any) => {
          if (error.response.status == 401) {
            this.alertController.create({
              header: 'Errore',
              message: 'Password errata',
              buttons: ['OK']
            }).then((alert) => {
              alert.present();
            });
          }
        }).then((response: any) => {
          if (response.status == 200) {
            this.alertController.create({
              header: 'Ottimo',
              message: 'Password cambiata con successo',
              buttons: ['OK']
            }).then(async (alert) => {
              await alert.present();
              await this.router.navigateByUrl('/home');
              window.location.reload();
            });
          }
        });

      } else {
        this.alertController.create({
          header: 'Errore',
          message: 'Le password non corrispondono',
          buttons: ['OK']
        }).then((alert) => {
          alert.present();
        });
      }
    } else {
      this.alertController.create({
        header: 'Errore',
        message: 'Compila tutti i campi',
        buttons: ['OK']
      }).then((alert) => {
        alert.present();
      });
    }
  }

}
