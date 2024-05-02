import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { Router } from '@angular/router';
import { UtilsService } from './utils/utils.service';
import Swal from 'sweetalert2';

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
      .then(async (response: any) => {
        console.log(response)
        if (response.status == 200) {
          const user = response.data;
          let currentUser: any = {
            _id: user._id,
            user_picture: user.user_picture,
            username: user.username
          }
          const token = response.headers.authorization;
          localStorage.setItem("ASSICURAZIONI", JSON.stringify({ token: token, currentUser: currentUser }));

          let role: any = await this.dataStorage.sendRequest('GET', '/role/' + user.role);
          console.log(role.data.canAccessToWebApp)
          if (role.data.canAccessToWebApp == true) {
            this.router.navigateByUrl('/dashboard');
          }
          else {
            localStorage.removeItem("ASSICURAZIONI");
            Swal.fire({
              icon: 'error',
              title: 'Non hai i permessi per accedere a questa applicazione'
            });
          }

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
