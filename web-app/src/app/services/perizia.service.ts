import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';

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
          this.perizie.forEach((perizia: any) => {
            perizia.operator = this.operators.filter((operator: any) => { return operator._id == perizia.operator })[0] || { "username": "Utente eliminato" };
          });
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

}
