import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { ParserService } from './parser.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: any;
  selectedUser: any;
  roles: any[] = [];

  constructor(private dataStorage: DataStorageService, private parser: ParserService, private router: Router) { }

  async getUsers(): Promise<any> {
    return this.dataStorage.sendRequest("GET", this.router.url)
      .catch(this.dataStorage.error)
      .then(async (response) => {
        this.users = response.data;
        await this.getRoles();
      });
  }

  async getUser(id: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/user/" + id)
        .catch(this.dataStorage.error)
        .then((response) => {
          this.selectedUser = response.data;
          resolve();
        });
    });
  }

  addUser(user: any) {
    this.dataStorage.sendRequest("POST", "/user", { user })
      .catch(this.dataStorage.error)
      .then((response) => {
        if (response != undefined) {
          Swal.fire({
            icon: 'success',
            title: 'Utente inserito correttamente',
          }).then(() => {
            window.location.href = "/users";
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Errore',
            text: 'Errore durante l\'inserimento dell\'utente'
          });
        }
      })
  }

  deleteUser(id: any) {
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
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Errore durante l\'eliminazione dell\'utente'
              });
            }
          })
      }
    })
  }

  getRoles(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/roles")
        .catch(this.dataStorage.error)
        .then((response) => {
          this.roles = response.data;
          resolve();
        });
    });
  }

}
