import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  loginError: boolean = false;

  constructor(private dataStorage: DataStorageService, private router: Router) { }

  checkLogin(email: string, password: string) {
    this.dataStorage.sendRequest('POST', '/login', { email, password })
      .then((response: any) => {
        if (response.status == 200) {
          let currentUser: any = {
            _id: response.data._id,
            user_picture: response.data.user_picture
          }
          localStorage.setItem("ASSICURAZIONI", JSON.stringify({ token: response.headers.authorization, currentUser: currentUser }));
          this.router.navigateByUrl('/dashboard');
        }
      })
      .catch((error: any) => {
        if (error.response.status == 401) {
          this.loginError = true;
        }
      });
  }

  checkToken() {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      if (parsedCache.token === "undefined") {
        localStorage.removeItem("ASSICURAZIONI");
      }
    }
  }

}
