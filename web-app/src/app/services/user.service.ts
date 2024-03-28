import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: any;

  constructor(private dataStorage: DataStorageService) { }

  getUsers() {
    this.dataStorage.sendRequest("GET", "/users")
      .catch(this.dataStorage.error)
      .then((response) => {
        this.users = response.data;
      })
  }

  addUser(user: any) {
    this.dataStorage.sendRequest("POST", "/user", { user })
      .catch(this.dataStorage.error)
      .then((response) => {
        console.log(response)
        alert("Utente inserito correttamente")
        window.location.href = "/users"
      })
  }

}
