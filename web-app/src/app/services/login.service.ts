import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { Router } from '@angular/router';
import { UtilsService } from './utils/utils.service';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  loginError: boolean = false;

  constructor(private dataStorage: DataStorageService, private router: Router, private utils: UtilsService) { }

  login(email: string, password: string) {
    this.dataStorage.sendRequest('POST', '/login', { email, password })
      .then((response: any) => {
        if (response.status == 200) {
          let currentUser: any = {
            _id: response.data._id,
            user_picture: response.data.user_picture,
            username: response.data.username
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

  async checkToken() {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      if (parsedCache.token === "undefined") {
        localStorage.removeItem("ASSICURAZIONI");
      }
    }
  }

  async sendMail(email: string) {
    return await this.dataStorage.sendRequest('POST', '/forgot-password', { email });
  }

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
    let userId = this.utils.getUserFromCache();
    if (!userId || userId == null) {
      await this.router.navigateByUrl('/login');
      window.location.reload();
    }
    else {
      userId = userId._id;
      return await this.dataStorage.sendRequest('POST', '/change-password', { userId, oldPassword, newPassword, confirmPassword });
    }

  }

  async logout() {
    localStorage.removeItem("ASSICURAZIONI");
    await this.router.navigateByUrl('/login');
  }

}
