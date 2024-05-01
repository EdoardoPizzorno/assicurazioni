import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {

  email: string = "";

  constructor(private loginService: LoginService, private alertController: AlertController, private router: Router) { }

  sendMail() {
    if (this.email) {
      this.loginService.sendMail(this.email)
        .catch((error: any) => {
          if (error.response.status == 404) {
            this.alertController.create({
              header: 'Email non trovata',
              message: 'Controlla di aver inserito correttamente l\'email!',
              buttons: ['OK']
            }).then((alert) => {
              alert.present();
            });
          }
        })
        .then((response: any) => {
          if (response.status == 200) {
            this.alertController.create({
              header: 'Email inviata correttamente',
              message: 'Controlla la tua casella di posta per resettare la password!',
              buttons: ['OK']
            }).then(async (alert) => {
              alert.present();
              this.email = "";
            });
            this.email = "";
            this.router.navigateByUrl('/login');
          }
        })


    }
  }
}
