import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { UtilsService } from './utils/utils.service';
import Swal from 'sweetalert2';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PeriziaService {

  isLoading: boolean = false;

  perizie: any[] = [];
  newPerizia: any = {
    description: "",
    photos: []
  }

  constructor(private dataStorage: DataStorageService, private utils: UtilsService, private userService: UserService) { }

  getPerizie(): Promise<void> {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/perizie" + window.location.search)
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
              Swal.fire("Perizia aggiunta", "", "success").then(() => {
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
          Swal.fire("Perizia modificata", "", "success");
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
          Swal.fire("Perizia eliminata", "", "success").then(() => {
            window.location.href = window.location.pathname;
          });
          resolve();
        });
    });
  }

  openInfo(perizia: any) {
    let imagesHtml = this.utils.generatePhotosHtml(perizia.photos);

    Swal.fire({
      title: perizia.description,
      html: `
      <b>Data:</b> ${perizia.date} alle ${perizia.time}<br>
      <b>Descrizione:</b> ${perizia.description}<br>
      <b>Creata da:</b> <span class="${this.utils.checkOperatorDeleted(perizia.operator.username)}"> ${perizia.operator.username} </span> <br>
      <div class="row container">
        ${imagesHtml}
      </div>
      `,
      width: "60%"
    });

  }

  async editModal(perizia: any) {
    let imagesHtml = this.utils.generatePhotosHtmlForEdit(perizia.photos);

    Swal.fire({
      title: "Modifica perizia",
      html: `
      <form id="editForm" class="container">
        <div class="form-group">
          <label for="description">Descrizione</label>
          <input type="text" class="form-control" id="description" value="${perizia.description}">
        </div>
        <div class="form-group">
          <label for="date">Data</label>
          <input type="date" class="form-control" id="date" value="${perizia.date}">
        </div>
        <div class="form-group">
          <label for="time">Ora</label>
          <input type="time" class="form-control" id="time" value="${perizia.time}">
        </div>
        <div class="row">
          ${imagesHtml}
        </div>
      </form>
    `,
      showCancelButton: true,
      confirmButtonText: "Salva",
      cancelButtonText: "Annulla",
      width: "80%"
    }).then(async (result) => {
      if (result.isConfirmed) {
        let fields: any = {
          description: (<HTMLInputElement>document.getElementById("description")).value,
          date: (<HTMLInputElement>document.getElementById("date")).value,
          time: (<HTMLInputElement>document.getElementById("time")).value,
          comments: (document.getElementsByClassName("comment"))
        }
        this.utils.substituteFields(perizia, fields);
        await this.update(perizia);
      }
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
