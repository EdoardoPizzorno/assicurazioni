import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { DecimalPipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  perizie: any;

  headQuarter: any = {
    coords: {
      lat: 44.5558401,
      lng: 7.7358973
    }
  }

  constructor(private dataStorage: DataStorageService, private decimalPipe: DecimalPipe) { }

  getPerizie(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/perizie")
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(response => {
          this.perizie = response.data;
          resolve();
        });
    });
  }

}
