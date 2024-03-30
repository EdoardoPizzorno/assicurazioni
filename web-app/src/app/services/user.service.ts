import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { ParserService } from './parser.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: any;
  selectedUser: any;

  constructor(private dataStorage: DataStorageService, private parser: ParserService) { }

  getUsers() {
    this.dataStorage.sendRequest("GET", "/users")
      .catch(this.dataStorage.error)
      .then((response) => {
        this.users = response.data;
      })
  }

  getUser(id: any) {
    this.dataStorage.sendRequest("GET", "/user/" + id)
      .catch(this.dataStorage.error)
      .then((response) => {
        this.selectedUser = response.data;

        this.selectedUser["createdAt"] = this.parser.parseDate(this.selectedUser["createdAt"])
        console.log(this.selectedUser)
      })
  }

  addUser(user: any) {
    this.dataStorage.sendRequest("POST", "/user", { user })
      .catch(this.dataStorage.error)
      .then((response) => {
        alert("Utente inserito correttamente")
        window.location.href = "/users"
      })
  }

}
