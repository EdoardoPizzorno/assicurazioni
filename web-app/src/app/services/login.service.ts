import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  email: string = "";
  password: string = "";

  constructor(private dataStorage: DataStorageService, private router: Router) { }

  checkLogin(email: string, password: string) {
    this.dataStorage.sendRequest('POST', '/login', { email, password })
      .then((response: any) => {
        if (response.status == 200) {
          this.router.navigateByUrl('/home');
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

}
