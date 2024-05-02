import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  isLoading: boolean = false;
  roles: any;

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

  add() {
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
          .then(async () => {
            await this.getRoles();
          });
      }
    });
  }

  update(role: any) {
    this.dataStorage.sendRequest("PATCH", "/role/" + role._id, { role })
          .catch(this.dataStorage.error)
          .then(async (response: any) => {
            await Swal.fire('Ruolo modificato', '', 'success');
            await this.getRoles();
          });
  }

  delete(_id: any) {
    this.dataStorage.sendRequest("DELETE", "/role/" + _id)
      .catch(this.dataStorage.error)
      .then(async () => {
        await Swal.fire('Ruolo eliminato', '', 'success');
        await this.getRoles();
      });
  }

}
