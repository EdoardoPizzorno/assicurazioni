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

  async getUsers(): Promise<any> {
    return this.dataStorage.sendRequest("GET", "/users")
      .catch(this.dataStorage.error)
      .then((response) => {
        this.users = response.data;
      });
  }

  getUser(id: any) {
    this.dataStorage.sendRequest("GET", "/user/" + id)
      .catch(this.dataStorage.error)
      .then((response) => {
        this.selectedUser = response.data;
        this.selectedUser["createdAt"] = this.parser.parseDate(this.selectedUser["createdAt"]);
      })
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

  searchUser(searchText: string) {
    if (searchText != "" && searchText != null) {
      this.dataStorage.sendRequest("GET", "/users/search?text=" + searchText)
        .catch(this.dataStorage.error)
        .then((response) => {
          this.users = response.data;
        })
    }
    else this.getUsers();
  }

  filterByRole(role: string) {
    if (role != "" && role != null && role != "all") {
      this.dataStorage.sendRequest("GET", "/users/filter?role=" + role)
        .catch(this.dataStorage.error)
        .then((response) => {
          this.users = response.data;
        })
    }
    else this.getUsers();
  }

}
