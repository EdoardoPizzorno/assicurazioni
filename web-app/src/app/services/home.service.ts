import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { DecimalPipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  perizie: any;

  headQuarter: any = {
    lat: 44.5558401,
    lng: 7.7358973
  }

  constructor(private dataStorage: DataStorageService, private decimalPipe: DecimalPipe) { }

  getPerizie() {
    this.dataStorage.sendRequest("GET", "/perizie")
      .catch(this.dataStorage.error)
      .then((response) => {
        this.perizie = response.data;
        // 150000 becomes 150,000
        for (let perizia of this.perizie) {
          perizia.evaluation = this.decimalPipe.transform(perizia.evaluation, '1.0-3');
        }
      })
  }

}
