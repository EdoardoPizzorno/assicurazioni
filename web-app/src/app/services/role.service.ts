import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  roles: any[] = [];

  constructor(private dataStorage: DataStorageService) { }

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

  addRole() {
    Swal.fire({
      title: 'Aggiungi ruolo',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Add',
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const role = result.value;
        this.dataStorage.sendRequest("POST", "/role", { "name": role })
          .catch(this.dataStorage.error)
          .then(() => {
            this.getRoles();
          });
      }
    });
  }
}
