import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PeriziaService {

  perizie: any;
  operators: any[] = [];

  headQuarter: any = {
    coords: {
      lat: 44.5558401,
      lng: 7.7358973
    }
  }

  constructor(private dataStorage: DataStorageService, private router: Router) { }

  getPerizie(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", this.router.url)
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(async (response) => {
          this.perizie = response.data;
          await this.getOperators();
          resolve();
        });
    });
  }

  getOperators(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/operators").catch(this.dataStorage.error).then((response) => {
        this.operators = response.data;
        resolve(this.operators);
      });
    });
  }

  edit(perizia: any): Promise<void> {
    console.log(perizia)
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("PATCH", "/perizia/" + perizia._id, {perizia})
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(async (response) => {
          Swal.fire("Perizia modificata", "", "success");
          await this.getPerizie();
          resolve();
        });
    });
  }

}
