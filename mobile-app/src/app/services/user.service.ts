import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UtilsService } from './utils/utils.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLoading: boolean = false;
  currentUser: any;

  constructor(private dataStorage: DataStorageService, private utils: UtilsService, private router: Router) { }

  async getUser(id: any = null): Promise<void> {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/user/" + (id || this.utils.getIdFromCache()))
        .catch(this.dataStorage.error)
        .then((response) => {
          this.currentUser = response.data;
          console.log(this.currentUser)
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
          Swal.fire({
            icon: 'success',
            title: 'Utente modificato correttamente',
          }).then(() => {
            window.location.href = "/users";
          });
        }
      })
  }

  delete(id: any) {
    Swal.fire({
      title: 'Sei sicuro di voler eliminare l\'utente?',
      showCancelButton: true,
      confirmButtonText: `Conferma`,
      confirmButtonColor: '#d33',
      cancelButtonText: `Cancella`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataStorage.sendRequest("DELETE", "/user/" + id)
          .catch(this.dataStorage.error)
          .then((response) => {
            if (response != undefined) {
              Swal.fire({
                icon: 'success',
                title: 'Utente eliminato correttamente',
              }).then(() => {
                window.location.href = "/users";
              });
            }
          })
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
          Swal.fire({
            icon: 'success',
            title: 'Immagine profilo generata correttamente',
          }).then(() => {
            window.location.reload();
          });
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
          Swal.fire({
            icon: 'success',
            title: 'Immagine profilo caricata correttamente',
          }).then(() => {
            window.location.reload();
          });
        }
      });
  }

}
