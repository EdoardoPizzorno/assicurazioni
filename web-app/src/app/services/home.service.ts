import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  headQuarter: any = {
    lat: 44.5558401,
    lng: 7.7358973
  }

  constructor(private dataStorage: DataStorageService) { }

  getTest() {
    this.dataStorage.sendRequest("GET", "/test")
      .catch(this.dataStorage.error)
      .then((data) => {
        console.log(data)
      })
  }

}
