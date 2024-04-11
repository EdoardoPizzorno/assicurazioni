import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { UserService } from './user.service';

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

  constructor(private dataStorage: DataStorageService, private userService: UserService) { }

  getPerizie(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/perizie")
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(async (response) => {
          this.perizie = response.data;
          for (let perizia of this.perizie) {
            const operator = this.userService.users.find((user: any) => user._id === perizia.operator);
            perizia["operator"] = operator ? operator.username : undefined;
          }
          resolve();
        });
    });
  }

  filterByOperator(operator: any) {
    this.perizie = this.perizie.filter((perizia: any) => perizia.operator === operator);
  }

  getOperators(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.perizie.forEach((perizia: any) => {
        if (!this.operators.includes(perizia.operator) && perizia.operator != undefined) {
          this.operators.push(perizia.operator);
        }
      });
      resolve(this.operators);
    });
  }

}
