import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private dataStorage: DataStorageService) { }

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
