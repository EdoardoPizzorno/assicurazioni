import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private dataStorage: DataStorageService, private router: Router, private alertController: AlertController) { }

  login(email: string, password: string) {
    this.dataStorage.sendRequest('POST', '/login', { email, password })
      .then((response: any) => {
        if (response.status == 200) {
          this.redirectToDashboard(response);
        }
      })
      .catch((error: any) => {
        if (error.response.status == 401) {
          this.alertController.create({
            header: 'Errore',
            message: 'Credenziali non valide',
            buttons: ['OK']
          }).then((alert: any) => {
            alert.present();
          });
        }
      });
  }

  async checkToken() {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      if (parsedCache.token === "undefined") {
        localStorage.removeItem("ASSICURAZIONI");
      }
    }
  }

  redirectToDashboard(response: any) {
    let currentUser: any = {
      _id: response.data._id,
      user_picture: response.data.user_picture,
      username: response.data.username
    }
    localStorage.setItem("ASSICURAZIONI", JSON.stringify({ token: response.headers.authorization, currentUser: currentUser }));
    this.router.navigateByUrl('/home');
  }

}
