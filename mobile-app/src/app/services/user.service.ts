import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLoading: boolean = false;
  currentUser: any;

  constructor(private dataStorage: DataStorageService, private router: Router, private alertController: AlertController) { }

  async getUser(id: any = null): Promise<void> {
    this.isLoading = true;
    let userId = id || this.getUserFromCache();
    if (userId == null) {
      await this.router.navigate(['/login']);
      window.location.reload();
    } else userId = userId._id;
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/user/" + userId)
        .catch(this.dataStorage.error)
        .then((response) => {
          this.currentUser = response.data;
          this.isLoading = false;
          resolve();
        });
    });
  }

  update(user: any) {
    this.isLoading = true;
    this.dataStorage.sendRequest("PATCH", "/user/" + user.id, { user })
      .catch(this.dataStorage.error)
      .then((response) => {
        this.isLoading = false;
        if (response.data.modifiedCount != undefined && response.data.modifiedCount != 0) {
          this.alertController.create({
            header: "Utente modificato",
            message: "L'utente è stato modificato con successo",
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  window.location.href = "/users";
                }
              }
            ]
          }).then(alert => alert.present());
        }
      })
  }

  generateImageProfile() {
    this.isLoading = true;
    this.dataStorage.sendRequest("POST", "/user/generateImageProfile", { user: this.currentUser })
      .catch(this.dataStorage.error)
      .then((response) => {
        this.isLoading = false;
        if (response != undefined) {
          this.alertController.create({
            header: "Immagine profilo generata",
            message: "L'immagine profilo è stata generata con successo",
            buttons: ["OK"]
          }).then(alert => alert.present());
        }
      });
  }

  uploadImageProfile(file: any) {
    this.isLoading = true;
    this.dataStorage.sendRequest("POST", "/user/uploadImageProfile", { imgBase64: file, userId: this.currentUser._id })
      .catch(this.dataStorage.error)
      .then((response: any) => {
        this.isLoading = false;
        if (response != undefined) {
          this.alertController.create({
            header: "Immagine profilo caricata",
            message: "L'immagine profilo è stata caricata con successo",
            buttons: ["OK"]
          }).then(alert => alert.present());
          this.currentUser = response.data;
        }
      });
  }

  getUserFromCache() {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      return parsedCache.currentUser;
    }
    return null;
  }

}
