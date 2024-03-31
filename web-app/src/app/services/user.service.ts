import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { ParserService } from './parser.service';
import Swal from 'sweetalert2';

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
        Swal.fire({
          icon: 'success',
          title: 'Utente inserito correttamente'
        }).then(() => window.location.href = "/users");
      })
  }

  searchUser(searchText: string) {
    if (searchText != "" && searchText != null) {
      this.dataStorage.sendRequest("GET", "/users/search/" + searchText)
        .catch(this.dataStorage.error)
        .then((response) => {
          this.users = response.data;
        })
    }
    else this.getUsers();
  }

}
