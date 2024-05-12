import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UtilsService } from './utils/utils.service';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLoading: boolean = false;
  users: any;
  selectedUser: any;
  newUser: any = {
    avatar: "https://www.civictheatre.ie/wp-content/uploads/2016/05/blank-profile-picture-973460_960_720.png",
    name: "",
    surname: "",
    email: "",
    username: "",
    role: {},
    city: "",
    gender: "m",
    age: 18,
    createdAt: {}
  };

  constructor(private dataStorage: DataStorageService, private roleService: RoleService, private utils: UtilsService, private router: Router) { }

  async getUsers(): Promise<any> {
    this.isLoading = true;
    this.dataStorage.sendRequest("GET", "/users" + window.location.search)
      .catch(this.dataStorage.error)
      .then(async (response) => {
        this.users = response.data;
        this.isLoading = false;
        if (!this.roleService.roles)
          await this.roleService.getRoles();
      });
  }

  async getUser(id: any): Promise<void> {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/user/" + id)
        .catch(this.dataStorage.error)
        .then((response) => {
          this.selectedUser = response.data;
          this.utils.setUserInCache(this.selectedUser);
          this.isLoading = false;
          resolve();
        });
    });
  }

  add(user: any) {
    this.isLoading = true;
    user.createdAt = this.utils.parseDate();
    this.dataStorage.sendRequest("POST", "/user", { user })
      .catch(this.dataStorage.error)
      .then((response) => {
        this.isLoading = false;
        if (response != undefined) {
          Swal.fire({
            icon: 'success',
            title: 'Utente inserito correttamente',
          }).then(() => {
            window.location.href = "/users";
          });
        }
      })
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
    this.dataStorage.sendRequest("POST", "/user/generateImageProfile", { user: this.selectedUser })
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
    this.dataStorage.sendRequest("POST", "/user/uploadImageProfile", { imgBase64: file, userId: this.selectedUser._id })
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
