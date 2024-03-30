import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  email: string = "";
  password: string = "";
  loginError: boolean = false;

  constructor(private dataStorage: DataStorageService, private router: Router) { }

  checkLogin(email: string, password: string) {
    this.dataStorage.sendRequest('POST', '/login', { email, password })
      .then((response: any) => {
        if (response.status == 200) {
          this.router.navigateByUrl('/home');
        }
      })
      .catch((error: any) => {
        if (error.response.status == 401) {
          this.loginError = true;
        }
      });
  }

  checkToken() {
    let token = localStorage.getItem("ASSICURAZIONI_TOKEN");
    if (!token || token === "undefined") {
      window.location.href = "/login";
    }
    return true;
  }

}
