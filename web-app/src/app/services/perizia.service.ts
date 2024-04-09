import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PeriziaService {

  perizie: any;

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
            perizia["operator"] = this.userService.users.find((user: any) => user._id === perizia.operator).username;
          }
          console.log(this.perizie)
          resolve();
        });
    });
  }

}
