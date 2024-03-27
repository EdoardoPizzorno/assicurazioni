import { Injectable } from '@angular/core';
import { MAPS_API_KEY } from './env';
import { DataStorageService } from './data-storage.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  test: any;

  constructor(private dataStorage: DataStorageService) { }

  getTest() {
    this.dataStorage.sendRequest('GET', '/test')
      .then((response: any) => {
        this.test = response.data;
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

}
