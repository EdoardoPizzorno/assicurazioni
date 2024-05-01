import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { UtilsService } from './utils/utils.service';
import { UserService } from './user.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PeriziaService {

  isLoading: boolean = false;

  selectedPeriziaId: any;
  perizie: any[] = [];
  newPerizia: any = {
    description: "",
    photos: []
  }

  constructor(private dataStorage: DataStorageService, private utils: UtilsService, private userService: UserService, private router: Router, private alertController: AlertController) { }

  getPerizie(): Promise<void> {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/perizie?operator=" + this.userService.currentUser.username + "&" + window.location.search)
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(async (response) => {
          this.perizie = response.data;
          this.isLoading = false;
          resolve();
        });
    });
  }

  add(): Promise<void> {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("POST", "/images", { imagesBase64: this.newPerizia.photos })
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(async (response) => {
          await this.fillPeriziaFields(response.data);
          console.log(this.newPerizia)
          this.dataStorage.sendRequest("POST", "/perizia", { perizia: this.newPerizia })
            .catch(error => {
              this.dataStorage.error(error);
              reject(error);
            })
            .then(async (response) => {
              await this.getPerizie();
              this.isLoading = false;
              this.alertController.create({
                header: "Perizia aggiunta",
                message: "La perizia è stata aggiunta con successo",
                buttons: ["OK"]
              }).then(alert => {
                alert.present();
                this.newPerizia = {
                  description: "",
                  photos: []
                }
              });
              resolve();
            });
        });
    });
  }

  update(perizia: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("PATCH", "/perizia/" + perizia._id, { perizia })
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(async (response) => {
          await this.getPerizie();
          this.alertController.create({
            header: "Perizia modificata",
            message: "La perizia è stata modificata con successo",
            buttons: ["OK"]
          }).then(alert => {
            alert.present();
          });
          resolve();
        });
    });
  }

  delete(_id: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("DELETE", "/perizia/" + _id)
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(async (response) => {
          await this.getPerizie();
          this.alertController.create({
            header: "Perizia eliminata",
            message: "La perizia è stata eliminata con successo",
            buttons: ["OK"]
          }).then(async (alert) => {
            await alert.present();
            await this.getPerizie();
            this.router.navigateByUrl("/home");
          });
          resolve();
        });
    });
  }

  openInfo(perizia: any) {
    let imagesHtml = this.utils.generatePhotosHtml(perizia.photos);

    // Swal.fire({
    //   title: perizia.description,
    //   html: `
    //   <b>Data:</b> ${perizia.date} alle ${perizia.time}<br>
    //   <b>Descrizione:</b> ${perizia.description}<br>
    //   <b>Creata da:</b> <span class="${this.utils.checkOperatorDeleted(perizia.operator.username)}"> ${perizia.operator.username} </span> <br>
    //   <div class="row container">
    //     ${imagesHtml}
    //   </div>
    //   `,
    //   width: "60%"
    // });

  }

  async editModal(perizia: any) {
    let imagesHtml = this.utils.generatePhotosHtmlForEdit(perizia.photos);

    this.alertController.create({
      header: "Modifica perizia",
      inputs: [
        {
          id: "description",
          type: "text",
          placeholder: "Descrizione",
          value: perizia.description
        },
        {
          id: "date",
          type: "date",
          value: perizia.date
        },
        {
          id: "time",
          type: "time",
          value: perizia.time
        }
      ],
      buttons: [
        {
          text: "Salva",
          handler: async () => {
            let fields: any = {
              description: (<HTMLInputElement>document.getElementById("description")).value,
              date: (<HTMLInputElement>document.getElementById("date")).value,
              time: (<HTMLInputElement>document.getElementById("time")).value,
              comments: (document.getElementsByClassName("comment"))
            }
            this.utils.substituteFields(perizia, fields);
            await this.update(perizia);
          }
        },
        {
          text: "Annulla",
          role: "cancel"
        }
      ],
      backdropDismiss: false,
      cssClass: "edit-perizia-alert"
    }).then(alert => {
      alert.present();
    });
  }

  async fillPeriziaFields(secure_urls: any) {
    for (let i = 0; i < this.newPerizia.photos.length; i++) {
      this.newPerizia.photos[i].photographer = this.userService.currentUser.username;
      this.newPerizia.photos[i].url = secure_urls[i];
      delete this.newPerizia.photos[i].filepath;
    }
    this.newPerizia.operator = {
      _id: this.userService.currentUser._id,
      username: this.userService.currentUser.username
    }
    this.newPerizia.coords = await this.getCoords();
    const date = new Date();
    let parsedDate = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate().toString().padStart(2, '0');
    this.newPerizia.date = parsedDate
    this.newPerizia.time = date.toLocaleTimeString();
    this.newPerizia.icon = "";
    console.log(this.newPerizia)
  }

  async getCoords() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
      }, (error) => {
        reject(error);
      });
    });
  }

}
